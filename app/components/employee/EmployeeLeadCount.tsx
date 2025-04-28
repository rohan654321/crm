"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"

interface EmployeeLeadCountProps {
  employeeId: string
}

const EmployeeLeadCount: React.FC<EmployeeLeadCountProps> = ({ employeeId }) => {
  const [leadCount, setLeadCount] = useState<number | null>(null)
  const [leadTarget, setLeadTarget] = useState<number | null>(null)
  const [remainingTarget, setRemainingTarget] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate fetching data from an API
      // Replace this with your actual API endpoint
      const leadCountResponse = await fetch(`/api/employee/${employeeId}/lead-count`)
      const leadTargetResponse = await fetch(`/api/employee/${employeeId}/lead-target`)

      if (!leadCountResponse.ok || !leadTargetResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const leadCountData = await leadCountResponse.json()
      const leadTargetData = await leadTargetResponse.json()

      setLeadCount(leadCountData.count)
      setLeadTarget(leadTargetData.target)

      // Calculate remaining target
      if (leadTargetData.target !== null) {
        setRemainingTarget(leadTargetData.target - leadCountData.count)
      } else {
        setRemainingTarget(null)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    fetchData()

    // Set up an interval to refresh data every minute
    const intervalId = setInterval(fetchData, 60000)

    return () => clearInterval(intervalId)
  }, [employeeId, fetchData])

  if (isLoading) {
    return <p>Loading lead data...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Lead Performance</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Tracking progress towards the lead generation target.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Leads Generated</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {leadCount !== null ? leadCount : "N/A"}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Lead Target</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {leadTarget !== null ? leadTarget : "N/A"}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Progress</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <p className="text-sm font-medium text-gray-700">
                {remainingTarget !== null
                  ? remainingTarget > 0
                    ? `${remainingTarget} more leads needed to reach target`
                    : "Target achieved! 🎉"
                  : "Calculating..."}
              </p>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default EmployeeLeadCount
