import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, departmentId, targetAmount } = await req.json()

    // Basic validation
    if (!name || !email || !password || !role || !departmentId) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Check for duplicate email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    })

    if (existingEmployee) {
      return NextResponse.json({ message: "An employee with this email already exists." }, { status: 409 })
    }

    // Validate department
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return NextResponse.json({ message: "Invalid department ID" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new employee with optional targetAmount
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department: {
          connect: { id: departmentId },
        },
        targetAmount: targetAmount ? Number.parseFloat(targetAmount) : null,
      },
    })

    return NextResponse.json(
      {
        message: "Employee added successfully",
        employee: newEmployee,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error adding employee:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
