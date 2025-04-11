import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH method: Update order status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id } = params;

    // Find the order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Update the order with the new times
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        pickupTime: body.pickupTime,
        deliveryTime: body.deliveryTime,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return PATCH(request, { params });
}
