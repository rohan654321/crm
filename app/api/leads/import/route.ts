import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function POST(request: NextRequest) {
  try {
    const leads = await request.json().catch(() => null);

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ message: "Invalid or empty data" }, { status: 400 });
    }

    const formattedLeads = leads.map((lead) => {
      if (!lead || typeof lead !== "object") {
        throw new Error("Invalid lead data received");
      }

      const {
        name,
        email,
        company,
        phone,
        city,
        designaction,
        message,
        status,
        callBackTime,
        employeeId,
      } = lead;

      const validStatus: LeadStatus = Object.values(LeadStatus).includes(status)
        ? (status as LeadStatus)
        : LeadStatus.COLD;

      return {
        name: name ?? null,
        email: email ?? null,
        company: company ?? null,
        phone: phone ? String(phone) : null, // 🛠️ Fix: convert number to string
        city: city ?? null,
        designaction: designaction ?? null,
        message: message ?? null,
        status: validStatus,
        callBackTime: callBackTime ? new Date(callBackTime) : null,
        employeeId: employeeId ?? null,
      };
    });

    const result = await prisma.lead.createMany({
      data: formattedLeads,
    });

    return NextResponse.json(
      {
        message: "Leads imported successfully",
        count: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error importing leads:", (error as Error).message);
    return NextResponse.json(
      { message: "Error importing leads", error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
