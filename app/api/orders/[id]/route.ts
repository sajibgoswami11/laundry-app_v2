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
    const { id } = await params;
    const { status, pickupTime, deliveryTime } = body;

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { shop: true },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Verify ownership/permissions
    const isCustomer = order.userId === session.user.id;
    const isShopOwner = order.shop.ownerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isCustomer && !isShopOwner && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (pickupTime) updateData.pickupTime = new Date(pickupTime);
    if (deliveryTime) updateData.deliveryTime = new Date(deliveryTime);

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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
