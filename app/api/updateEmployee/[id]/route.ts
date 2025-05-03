import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;  // Destructure the 'id' from params
    const body = await request.json();  // Parse the request body

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      name: body.name,
      email: body.email,
    };

    // Add optional fields if provided
    if (body.role) {
      updateData.role = body.role;
    }

    // Handle department connection if provided
    if (body.department) {
      updateData.department = {
        connect: {
          id: body.department,
        },
      };
    }

    // Update the employee
    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("Error updating employee:", error);

    // Handle "not found" error
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    // Handle other errors
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
