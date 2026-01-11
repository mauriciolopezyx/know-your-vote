"use client"

import { FaBook, FaArrowLeft } from "react-icons/fa"
import { Card as UI_Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lesson } from "@/types/queries"
import { getStatusConfig, getTierColor, getTierBadgeColor, formatDomain } from "@/components/roadmap/roadmap"
import { StartLesson } from "@/actions/db"

export function getActionButton(status: string): string {
  switch (status) {
    case "completed":
      return "Review"
    case "in_progress":
      return "Continue"
    case "not_started":
      return "Start"
    default:
      return "Start"
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

interface RoadmapLessonDetailProps {
  data: Lesson
  onBack?: () => void
}

export default function RoadmapLessonDetail({ data, onBack }: RoadmapLessonDetailProps) {

  const statusConfig = getStatusConfig(data.status)
  const tierColor = getTierColor(data.tier)
  const tierBadgeColor = getTierBadgeColor(data.tier)
  const actionButtonText = getActionButton(data.status)

  const handleStartLesson = async () => {
    StartLesson({ lessonId: data.id })
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="cursor-pointer mb-6 flex items-center gap-2"
          onClick={onBack}
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Roadmap
        </Button>

        <UI_Card className={`p-8 border-2 ${tierColor} shadow-xl`}>
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${tierBadgeColor}`}>
                {data.tier}
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${statusConfig.color}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{data.title}</h1>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="font-light text-base leading-relaxed">{data.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Lesson Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaBook className="w-4 h-4" />
                  <span>
                    <strong>{data.sublessons}</strong> Sublessons
                  </span>
                </div>
                {data.quiz_score !== null && (
                  <div>
                    <span>
                      Quiz Score: <strong>{data.quiz_score}</strong> (Attempts: {data.quiz_attempts})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Timeline</h3>
              <div className="space-y-2">
                <div>
                  <span>Assigned:</span> <strong>{formatDate(data.assigned_at)}</strong>
                </div>
                {data.completed_at && (
                  <div>
                    <span>Completed:</span> <strong>{formatDate(data.completed_at)}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">Target Domains</h3>
            <div className="flex flex-wrap gap-2">
              {data.target_domains.map((domain, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white dark:bg-gray-600 border-2 border-gray-300 rounded-full text-sm font-medium shadow-sm"
                >
                  {formatDomain(domain)}
                </span>
              ))}
            </div>
          </div>
            
          <Button variant="ghost" onClick={handleStartLesson}>
            <div className="flex flex-row justify-center items-center flex-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white hover:text-white font-bold py-3 text-xl rounded-lg shadow-md transition-colors">
              <span>{actionButtonText} Lesson</span>
            </div>
          </Button>
        </UI_Card>
      </div>
    </div>
  )
}
