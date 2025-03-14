"use client"

import LeadFilter from "@/app/components/employee/LeadFilter"
import { DollarSign } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import * as XLSX from "xlsx"

interface Lead {
  // amount: ReactNode
  id: string
  name: string
  email: string
  status: string
  createdAt: string
  city: string
  message: string
  designation: string
  phone: string
  company: string
  callBackTime: string
  soldAmount?: number;
}

interface EmployeeLeadsProps {
  employeeId: string
}

const EmployeeLeads: React.FC<EmployeeLeadsProps> = ({ employeeId }) => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState<string | null>(null)
  const [toDate, setToDate] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({});


  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch(`/api/employee-leads?employeeId=${employeeId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch leads")
        }
        const data = await res.json()
        setLeads(data)
        setFilteredLeads(data)
        setLoading(false)
      } catch (err) {
        setError((err as Error).message)
        setLoading(false)
      }
    }
    fetchLeads()
  }, [employeeId])

  useEffect(() => {
    let updatedLeads = leads

    if (selectedStatus) {
      updatedLeads = updatedLeads.filter((lead) => lead.status.toLowerCase() === selectedStatus.toLowerCase())
    }

    if (fromDate) {
      updatedLeads = updatedLeads.filter((lead) => new Date(lead.createdAt) >= new Date(fromDate))
    }

    if (toDate) {
      updatedLeads = updatedLeads.filter((lead) => new Date(lead.createdAt) <= new Date(toDate))
    }

    setFilteredLeads(updatedLeads)
  }, [selectedStatus, fromDate, toDate, leads])

  const totalLeads = filteredLeads.length
  const hotLeads = filteredLeads.filter((lead) => lead.status.toLowerCase() === "hot").length
  const soldLeads = filteredLeads.filter((lead) => lead.status.toLowerCase() === "sold").length
  const target = 50
  const remainingTarget = target > soldLeads ? target - soldLeads : 0

  const handleWeekFilter = () => {
    const today = new Date()
    const firstDayOfWeek = new Date(today)
    firstDayOfWeek.setDate(today.getDate() - today.getDay())
    const lastDayOfWeek = new Date(firstDayOfWeek)
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)

    setFromDate(firstDayOfWeek.toISOString().split("T")[0])
    setToDate(lastDayOfWeek.toISOString().split("T")[0])
  }

  const handleExportToExcel = () => {
    if (filteredLeads.length === 0) {
      alert("No leads available to export.")
      return
    }


    const worksheet = XLSX.utils.json_to_sheet(filteredLeads)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")

    XLSX.writeFile(workbook, "leads.xlsx")
  }

  const handleImportLeads = async (file: File) => {
    try {
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: file,
      })

      if (response.ok) {
        // Refresh leads after import
        const res = await fetch(`/api/employee-leads?employeeId=${employeeId}`)
        if (res.ok) {
          const data = await res.json()
          setLeads(data)
          setFilteredLeads(data)
        }
      } else {
        alert("Error importing leads")
      }
    } catch (error) {
      console.error("Error importing leads:", error)
      alert("Error importing leads")
    }
  }
  const handleUpdateLead = async () => {
    if (!selectedLead) return;
  
    // Debugging: Log the formData before sending
    console.log("FormData being sent:", formData);
  
    try {
      const response = await fetch(`/api/editlead`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Make sure status is included
      });
  
      const text = await response.text();
      const responseData = text ? JSON.parse(text) : {};
  
      if (!response.ok) {
        console.error("Server Error Response:", responseData);
        throw new Error("Failed to update lead");
      }
  
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === responseData.id ? responseData : lead))
      );
  
      setFilteredLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === responseData.id ? responseData : lead))
      );
  
      setSelectedLead(null);
      alert("Lead Updated Successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Error updating lead");
    }
  };
  
  
  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData(lead);
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  
  
  

  return (
    <div className="p-10 mt-10 bg-white shadow-lg rounded-lg">
      <div className="grid grid-cols-5 gap-4 mt-4 p-20">
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="text-lg font-bold">{totalLeads}</p>
          <p className="text-sm text-gray-500">Total Leads</p>
        </div>
        <div className="text-center p-4 bg-yellow-100 rounded-lg">
          <p className="text-lg font-bold">{hotLeads}</p>
          <p className="text-sm text-gray-500">Hot Leads</p>
        </div>
        <div className="text-center p-4 bg-green-100 rounded-lg">
          <p className="text-lg font-bold">{soldLeads}</p>
          <p className="text-sm text-gray-500">Sold Leads</p>
        </div>
        <div className="text-center p-4 bg-blue-100 rounded-lg">
          <p className="text-lg font-bold">{target}</p>
          <p className="text-sm text-gray-500">Target</p>
        </div>
        <div className="text-center p-4 bg-red-100 rounded-lg">
          <p className="text-lg font-bold">{remainingTarget}</p>
          <p className="text-sm text-gray-500">Remaining Target</p>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Employee Leads</h2>

      <LeadFilter
        selectedStatus={selectedStatus}
        fromDate={fromDate}
        toDate={toDate}
        employeeId={employeeId}
        onStatusChange={setSelectedStatus}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onWeekFilter={handleWeekFilter}
        onExport={handleExportToExcel}
        onFileImport={handleImportLeads}
      />

      <div className="mt-6">
        {loading ? (
          <p>Loading leads...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredLeads.length === 0 ? (
          <p className="text-gray-500">No leads found.</p>
        ) : (
<div className="overflow-x-auto">
  <table className="min-w-full bg-white">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Email
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Company
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Contact
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          City
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Note
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Call Back Time
        </th>
        {/* <th className="px-6 py-3 text-left text-xs font-medium test-gray-500 uppercase tracking-wider">Designaction</th> */}
        {/* Conditionally Render Amount Header */}
        {/* {filteredLeads.some((lead) => lead.soldAmount) && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
          </th>
        )} */}
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking">
          Action
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredLeads.map((lead) => (
        <tr key={lead.id}>
          <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
          <td className="px-6 py-4 whitespace-nowrap">{lead.email}</td>
          <td className="px-6 py-4 whitespace-nowrap">{lead.company}</td>
          <td className="px-6 py-4 whitespace-nowrap">{lead.phone}</td>
          <td className="px-6 py-4 whitespace-nowrap">{lead.city}</td>
          <td className="px-6 py-4 whitespace-nowrap">{lead.message}</td>
          <td className="px-6 py-4 whitespace-nowrap">{lead.status}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            {new Date(lead.callBackTime).toLocaleString("en-IN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </td>
          {/* <td className="px-6 py-4 whitespace-nowrap">{lead.designation}</td> */}
          {/* Conditionally Render Amount Column */}
          {lead.soldAmount && (
            <td className="px-6 py-4 whitespace-nowrap">{lead.soldAmount
            }</td>
          )}
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              onClick={() => handleEditClick(lead)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Edit
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        )}
        {selectedLead && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl shadow-lg overflow-y-auto max-h-[90vh]">
      <h2 className="text-xl font-semibold mb-4 text-center">Edit Lead</h2>

      <div className="space-y-3 overflow-y-auto max-h-[60vh] p-2">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Company</label>
          <input
            type="text"
            name="company"
            value={formData.company || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contact</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Note</label>
          <textarea
            name="message"
            value={formData.message || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          >
            <option value="HOT">HOT</option>
            <option value="WARM">WARM</option>
            <option value="COLD">COLD</option>
            <option value="SOLD">SOLD</option>
            <option value="CALL_BACK">CALL BACK</option>
          </select>
        </div>

        {formData.status === "SOLD" && (
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="number"
              name="soldAmount"
              placeholder="Sold Amount"
              className="w-full p-2 pl-10 border rounded"
              onChange={handleFormChange}
              value={formData.soldAmount}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Call Back Time</label>
          <input
            type="datetime-local"
            name="callBackTime"
            value={formData.callBackTime || ""}
            onChange={handleFormChange}
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={() => setSelectedLead(null)} className="px-4 py-2 bg-gray-400 text-white rounded-lg w-1/3">
          Cancel
        </button>
        <button onClick={handleUpdateLead} className="px-4 py-2 bg-green-500 text-white rounded-lg w-1/3">
          Save
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  )
}

export default EmployeeLeads