'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function ConnectMarketplacePage() {
  const router = useRouter()
  const params = useParams()
  const marketplace = params.marketplace as string;


  useEffect(() => {
    if (marketplace) {
      // In a real application, you would handle the OAuth callback here,
      // exchange the authorization code for an access token, and store it.
      console.log(`Successfully connected to ${marketplace}.`)
      console.log('Redirecting back to integrations page...')

      // For this example, we'll just redirect back to the integrations page
      // with a query parameter to indicate success.
      setTimeout(() => {
        router.push('/integrations?connected=' + marketplace)
      }, 2000)
    }
  }, [marketplace, router])

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-gray-900">
          Connecting to {marketplace}...
        </h1>
        <p className="mt-2 text-gray-500">
          Please wait while we redirect you.
        </p>
      </div>
    </DashboardLayout>
  )
}
