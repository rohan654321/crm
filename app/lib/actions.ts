// ./app/lib/actions.ts

// Define the shape of the employee update data
interface EmployeeUpdateData {
    name?: string;
    role?: string;
    department?: string;
    email?: string;
    // Add any other optional fields your app supports
  }
  
  // Delete a lead by ID
  export async function deleteLead(id: string) {
    const response = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
    });
  
    if (!response.ok) {
      throw new Error("Failed to delete lead");
    }
  
    return await response.json();
  }
  
  // Update an employee with given ID and data
  export async function updateEmployee(id: string, data: EmployeeUpdateData) {
    const response = await fetch(`/api/updateEmployee/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error("Failed to update employee");
    }
  
    return await response.json();
  }
  