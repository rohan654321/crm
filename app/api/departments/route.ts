import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
  try {const departments = await prisma.department.findMany({
    include: {
      target: true,
      employees: {
        include: {
          leads: true,
        },
      },
    },
  });
  console.log(departments)
  
  const formattedDepartments = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    target: dept.target ? dept.target.amount : null,
    totalLeads: dept.employees.reduce((sum, emp) => sum + emp.leads.length, 0),
    soldLeads: dept.employees.reduce(
      (sum, emp) =>
        sum + emp.leads.filter((lead) => lead.status.toUpperCase() === "SOLD").length,
      0
    ),
    employees: dept.employees.map((emp) => ({
      ...emp,
      email: Array.isArray(emp.email) ? emp.email[0] : emp.email, // Ensure email is a string
    })),
  }));
  
  return NextResponse.json(formattedDepartments, { status: 200 });
  
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
