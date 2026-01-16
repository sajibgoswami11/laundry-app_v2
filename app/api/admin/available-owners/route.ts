import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Find users with role SHOP_OWNER who do not have a shop
        const availableOwners = await prisma.user.findMany({
            where: {
                role: "SHOP_OWNER",
                shop: null, // This works for one-to-one relationship
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        return NextResponse.json(availableOwners);
    } catch (error) {
        console.error("Error fetching available owners:", error);
        return NextResponse.json(
            { error: "Failed to fetch available owners" },
            { status: 500 }
        );
    }
}
