import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }

  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Authorization error: Missing email or password.");
            throw new Error("Email and password are required.");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.error(`Authorization error: No user found for email ${credentials.email}`);
            throw new Error("No user found with this email.");
          }

          if (!user.password) {
            console.error(`Authorization error: User ${credentials.email} has no password set.`);
            throw new Error("This account does not have a password set.");
          }

          const isCorrectPassword = await compare(credentials.password, user.password);

          if (!isCorrectPassword) {
            console.error(`Authorization error: Incorrect password for email ${credentials.email}`);
            throw new Error("Incorrect password.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Unexpected authorization error:", (error as Error).message);
          throw new Error("Invalid credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
  },
  debug: true, // Enable debug mode for detailed logs
};