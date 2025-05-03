// app/api/employee-target/route.ts
import { NextResponse } from 'next/server'
import {prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        targetAmount: true,
      },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      targetAmount: employee.targetAmount || 0,
    })
  } catch (error) {
    console.error('Error fetching employee target:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}