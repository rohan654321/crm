// Define your types here
export interface Leads {
    _id: string
    name: string
    email: string
    phone: string
    location: string
    // Add any other properties your leads have
  }
  
  export interface Employee {
    id: string
    name: string
    email: string
    role: string
    departmentId: string
    targetAmount?: number
    // Add any other properties your employees have
  }
  
  export interface Department {
    id: string
    name: string
    // Add any other properties your departments have
  }
  