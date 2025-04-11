import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";
import { UserRole } from "@prisma/client";

// Debugging environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("NEXTAUTH_SECRET is not set in the environment variables.");
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in the environment variables.");
}

// Debugging Prisma connection
(async () => {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully.");
  } catch (error) {
    console.error("Failed to connect to Prisma:", error);
  }
})();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Authorization failed: Missing email or password");
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          console.error(`Authorization failed: User not found for email ${credentials.email}`);
          console.error("Ensure the user exists in the database and the email is correct.");
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.error("Authorization failed: Invalid password");
          console.error("Ensure the password is hashed correctly in the database.");
          throw new Error("Invalid password");
        }

        console.log(`Authorization successful for user ${user.email}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };