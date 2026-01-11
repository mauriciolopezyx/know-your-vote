"use client"

import { FaCheck, FaHammer, FaBook } from "react-icons/fa"
import { Card as UI_Card } from "@/components/ui/card"
import { useState, type JSX } from "react" // Import JSX to fix the undeclared variable error
import { FaLock } from "react-icons/fa"
import Link from "next/link"
import RoadmapLessonDetail from "@/components/roadmap/roadmap-lesson-detail"
import { Lesson, LessonRoadmap } from "@/types/queries"
import { Button } from "../ui/button"
import { FiArrowLeft } from "react-icons/fi"

export function getTierColor(tier: string): string {
  switch (tier) {
    case "core":
      return "border-blue-400 bg-blue-50 dark:bg-muted"
    case "targeted":
      return "border-purple-400 bg-purple-50 dark:bg-muted"
    case "optional":
      return "border-green-400 bg-green-50 dark:bg-muted"
    default:
      return "border-gray-400 bg-gray-50 dark:bg-muted"
  }
}

export function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case "core":
      return "bg-blue-400 text-white"
    case "targeted":
      return "bg-purple-400 text-white"
    case "optional":
      return "bg-green-400 text-white"
    default:
      return "bg-gray-400 text-white"
  }
}

export function getStatusConfig(status: string): { color: string; icon: JSX.Element; label: string } {
  switch (status) {
    case "completed":
      return {
        color: "bg-green-400 text-white",
        icon: <FaCheck className="w-3 h-3" />,
        label: "Complete",
      }
    case "in_progress":
      return {
        color: "bg-orange-400 text-white",
        icon: <FaHammer className="w-3 h-3" />,
        label: "In Progress",
      }
    case "not_started":
      return {
        color: "bg-gray-400 text-white",
        icon: <FaBook className="w-3 h-3" />,
        label: "Not Started",
      }
    default:
      return {
        color: "bg-gray-400 text-white",
        icon: <FaBook className="w-3 h-3" />,
        label: "Unknown",
      }
  }
}

export function truncateDescription(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

export function formatDomain(domain: string): string {
  return domain
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function Roadmap({roadmap, hasCompletedAssessment}: {roadmap: LessonRoadmap, hasCompletedAssessment: boolean}) {

  const [lessonDetail, setLessonDetail] = useState<Lesson | null>(null)

  if (lessonDetail) {
    return <RoadmapLessonDetail data={lessonDetail} onBack={() => { setLessonDetail(null) }}/>
  }

  if (!hasCompletedAssessment) {
    return (
      <div className="bg-background min-h-svh flex flex-col gap-y-4 justify-center items-center">
        <FaLock className="size-16"/>
        <p>Please complete the assessment in order to view your personalized roadmap!</p>
        <Link href="/assessment" className="px-2">
          <Button variant="outline" className="cursor-pointer gap-2 -ml-2">
            <FiArrowLeft className="w-4 h-4" />
            Go to Assessment
          </Button>
        </Link>
      </div>
    )
  }

  const allLessons = [...roadmap.core, ...roadmap.targeted, ...roadmap.optional].sort(
    (a, b) => a.lesson_order - b.lesson_order,
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Learning Roadmap</h1>
          <p className="text-muted-foreground">Track your progress through personally assigned lessons</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLessons.map((lesson: Lesson) => {
            const statusConfig = getStatusConfig(lesson.status)
            const tierColor = getTierColor(lesson.tier)
            const tierBadgeColor = getTierBadgeColor(lesson.tier)

            return (
              <UI_Card
                key={lesson.id}
                className={`p-6 border-2 ${tierColor} shadow-md hover:shadow-xl transition-shadow cursor-pointer`}
                onClick={() => { setLessonDetail(lesson) }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tierBadgeColor}`}>
                      {lesson.tier}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 leading-tight">{lesson.title}</h2>

                  <p className="font-light text-sm leading-relaxed mb-4 grow">
                    {truncateDescription(lesson.description)}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FaBook className="w-4 h-4" />
                      <span className="font-medium">{lesson.sublessons} Sublessons</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {lesson.target_domains.map((domain, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 rounded-full text-xs font-medium"
                      >
                        {formatDomain(domain)}
                      </span>
                    ))}
                  </div>
                </div>
              </UI_Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
