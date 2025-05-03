"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Employee {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface AddEmployeeFormProps {
  employee?: Employee
}

const AddEmployeeForm = ({ employee }: AddEmployeeFormProps) => {
  const [firstName, setFirstName] = useState(employee?.firstName || "")
  const [lastName, setLastName] = useState(employee?.lastName || "")
  const [email, setEmail] = useState(employee?.email || "")
  const [phone, setPhone] = useState(employee?.phone || "")
  const router = useRouter()
  const [isEditing] = useState(!!employee)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newEmployee = {
      firstName,
      lastName,
      email,
      phone,
    }

    try {
      const res = await fetch("/api/employees", {
        method: employee?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee?.id ? { ...newEmployee, id: employee.id } : newEmployee),
      })

      if (res.ok) {
        router.push("/")
        router.refresh()
      } else {
        console.error("Failed to save employee")
      }
    } catch (error) {
      console.error("Error saving employee:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
          First Name:
        </label>
        <input
          type="text"
          id="firstName"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
          Last Name:
        </label>
        <input
          type="text"
          id="lastName"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
          Email:
        </label>
        <input
          type="email"
          id="email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
          Phone:
        </label>
        <input
          type="tel"
          id="phone"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {isEditing ? "Update Employee" : "Add Employee"}
        </button>
      </div>
    </form>
  )
}

export default AddEmployeeForm
