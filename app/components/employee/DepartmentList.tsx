"use client"

import { useState, useEffect } from "react"
import { Building, Target, Users, CheckCircle } from "lucide-react"
import CircularProgress from "@/app/components/ui/CircularProgress"

interface Lead {
  id: string
  status: string
  createdAt: string
}

interface Employee {
  id: string
  name: string
  leads: Lead[]
  targetAmount?: number
}

interface Department {
  id: string
  name: string
  target: number | null
  totalLeads: number
  soldLeads: number
  employees?: Employee[]
}

interface DepartmentListProps {
  employeeId: string
}

const DepartmentList = ({ employeeId }: DepartmentListProps) => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [error, setError] = useState<string | null>(null)
  const [employeeTarget, setEmployeeTarget] = useState<number | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        if (!response.ok) throw new Error("Failed to fetch department data")
        const data: Department[] = await response.json()

        const filteredDepartment = data.find((dept) => dept.employees?.some((emp) => emp.id === employeeId))

        setDepartments(filteredDepartment ? [filteredDepartment] : [])

        // Find the employee and get their target amount
        if (filteredDepartment && filteredDepartment.employees) {
          const employee = filteredDepartment.employees.find((emp) => emp.id === employeeId)
          if (employee && employee.targetAmount) {
            setEmployeeTarget(employee.targetAmount)
          }
        }
      } catch (err) {
        setError((err as Error).message)
      }
    }

    // Also fetch the employee directly to get their target amount
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/api/employee-target?employeeId=${employeeId}`)
        if (response.ok) {
          const employee = await response.json()
          if (employee && employee.targetAmount) {
            setEmployeeTarget(employee.targetAmount)
          }
        }
      } catch (err) {
        console.error("Error fetching employee target:", err)
      }
    }

    fetchDepartments()
    fetchEmployee()
  }, [employeeId])

  return (
    <div className="space-y-6 p-4 md:p-8">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">{error}</div>}

      {departments.length === 0 && !error ? (
        <div className="text-gray-500 text-center p-4">Loading...</div>
      ) : (
        departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Department Name */}
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-center border-b pb-2 flex items-center justify-center gap-2">
              <Building className="text-green-600" size={24} /> {dept.name}
            </h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 py-6 place-items-center">
              {/* Target */}
              <div className="flex flex-col items-center">
                <CircularProgress
                  value={employeeTarget ? 100 : 0}
                  text={employeeTarget ? `${employeeTarget}` : "N/A"}
                />
                <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-gray-600">
                  <Target size={16} className="text-blue-500" /> Your Target
                </div>
              </div>

              {/* Total Leads */}
              <div className="flex flex-col items-center">
                <CircularProgress value={100} text={`${dept.totalLeads}`} />
                <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-gray-600">
                  <Users size={16} className="text-yellow-500" /> Total Leads
                </div>
              </div>

              {/* Sold Leads */}
              <div className="flex flex-col items-center">
                <CircularProgress value={100} text={`${dept.soldLeads}`} />
                <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500" /> Sold Leads
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default DepartmentList
