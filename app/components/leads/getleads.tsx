"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

// Define the Leads type locally instead of importing it
interface Leads {
  _id: string
  name: string
  email: string
  phone: string
  location: string
}

// Create a simple toast implementation
const useToast = () => {
  const showToast = (props: { title: string; description: string; duration: number }) => {
    console.log(`Toast: ${props.title} - ${props.description}`)
    // You can implement a real toast notification here
  }

  return { toast: showToast }
}

const LeadsTable = () => {
  const [leads, setLeads] = useState<Leads[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/leads", { cache: "no-store" })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setLeads(data)
      } catch (e) {
        console.log(e)
        toast({
          title: "Error!",
          description: "Failed to fetch leads.",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [toast])

  // Implement deleteLead function directly instead of importing it
  const deleteLead = async (id: string) => {
    const response = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete lead")
    }

    return await response.json()
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id)
      setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== id))
      toast({
        title: "Success!",
        description: "Lead deleted successfully.",
        duration: 3000,
      })
    } catch (e) {
      console.log(e)
      toast({
        title: "Error!",
        description: "Failed to delete lead.",
        duration: 3000,
      })
    } finally {
      router.refresh()
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const searchTerm = search.toLowerCase()
    return (
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.phone.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => router.push("/dashboard/leads/new")}>Create Lead</Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableCaption>A list of your leads.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.location}</TableCell>
                  <TableCell className="text-right">
                    <LeadActions id={lead._id} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

interface LeadActionsProps {
  id: string
  onDelete: (id: string) => void
}

const LeadActions: React.FC<LeadActionsProps> = ({ id, onDelete }) => {
  const router = useRouter()
  // Remove the unused state

  const handleEdit = (id: string) => {
    router.push(`/dashboard/leads/edit/${id}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleEdit(id)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onDelete(id)
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LeadsTable
