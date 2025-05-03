"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        setIsLoading(true)

        // Fetch job with company information
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select(`
            *,
            company:company_id (
              id,
              name,
              logo_url,
              location
            )
          `)
          .eq("id", params.id)
          .single()

        if (jobError) throw jobError
        if (!jobData) throw new Error("求人が見つかりませんでした")

        setJob(jobData)
        setCompany(jobData.company)
      } catch (err) {
        console.error("Error fetching job details:", err)
        setError(err instanceof Error ? err.message : "求人情報の取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [params.id])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-500 mb-4" />
        <p className="text-lg font-medium text-gray-700">求人情報を読み込み中...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-700">{error}</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>
    )
  }

  // Not found state
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-yellow-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">求人が見つかりませんでした</h3>
          <p className="text-yellow-700">お探しの求人は存在しないか、削除された可能性があります。</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            求人一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600">
            <ArrowLeft size={16} />
            <span>求人一覧に戻る</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={company?.logo_url || "/placeholder.svg?height=64&width=64&query=company logo"}
                alt={`${company?.name}のロゴ`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">{company?.name}</h3>
              <p className="text-sm text-gray-500">{company?.location}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-2">求人詳細</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
