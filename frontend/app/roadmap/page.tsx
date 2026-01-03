"use client"

import { FaCheck, FaHammer, FaBook } from "react-icons/fa"
import { Card as UI_Card } from "@/components/ui/card"
import type { JSX } from "react" // Import JSX to fix the undeclared variable error

// Sample lesson data based on user's JSON structure
const lessonData = {
  core: [
    {
      id: 1,
      title: "How the US Government is Structured",
      description:
        "Learn about the three branches of government, separation of powers, and the system of checks and balances that prevents any one branch from becoming too powerful.",
      lesson_order: 1,
      tier: "core",
      target_domains: ["government_structure"],
      assignment_reason: "core",
      assigned_at: "2026-01-02T10:30:00Z",
      status: "completed",
      current_card_index: 6,
      quiz_score: 5,
      quiz_attempts: 1,
      completed_at: "2026-01-02T11:15:00Z",
      sublessons: 3,
    },
    {
      id: 2,
      title: "What Elections Actually Decide",
      description:
        "Understand what different elections determine, from local school boards to the presidency, and why each level of government matters to your daily life.",
      lesson_order: 2,
      tier: "core",
      target_domains: ["elections", "government_structure"],
      assignment_reason: "core",
      assigned_at: "2026-01-02T10:30:00Z",
      status: "in_progress",
      current_card_index: 3,
      quiz_score: null,
      quiz_attempts: 0,
      completed_at: null,
      sublessons: 4,
    },
    {
      id: 3,
      title: "How Laws Are Made",
      description:
        "Follow the journey of how an idea becomes federal law, including the roles of committees, debates, votes, and presidential action.",
      lesson_order: 3,
      tier: "core",
      target_domains: ["lawmaking"],
      assignment_reason: "core",
      assigned_at: "2026-01-02T10:30:00Z",
      status: "not_started",
      current_card_index: null,
      quiz_score: null,
      quiz_attempts: 0,
      completed_at: null,
      sublessons: 5,
    },
  ],
  targeted: [
    {
      id: 4,
      title: "Federal vs State vs Local Power",
      description:
        "Learn how power is divided between different levels of government, what each level controls, and what happens when they conflict.",
      lesson_order: 4,
      tier: "targeted",
      target_domains: ["government_structure"],
      assignment_reason: "gap_targeted",
      assigned_at: "2026-01-02T10:30:00Z",
      status: "not_started",
      current_card_index: null,
      quiz_score: null,
      quiz_attempts: 0,
      completed_at: null,
      sublessons: 4,
    },
    {
      id: 6,
      title: "How to Read Political News Critically",
      description:
        "Develop skills to identify bias, evaluate sources, distinguish news from opinion, and spot misinformation.",
      lesson_order: 6,
      tier: "targeted",
      target_domains: ["media_literacy"],
      assignment_reason: "gap_targeted",
      assigned_at: "2026-01-02T10:30:00Z",
      status: "not_started",
      current_card_index: null,
      quiz_score: null,
      quiz_attempts: 0,
      completed_at: null,
      sublessons: 3,
    },
  ],
  optional: [],
}

type Lesson = {
  id: number
  title: string
  description: string
  lesson_order: number
  tier: string
  target_domains: string[]
  assignment_reason: string
  assigned_at: string
  status: string
  current_card_index: number | null
  quiz_score: number | null
  quiz_attempts: number
  completed_at: string | null
  sublessons: number
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "core":
      return "border-blue-400 bg-blue-50"
    case "targeted":
      return "border-purple-400 bg-purple-50"
    case "optional":
      return "border-green-400 bg-green-50"
    default:
      return "border-gray-400 bg-gray-50"
  }
}

function getTierBadgeColor(tier: string): string {
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

function getStatusConfig(status: string): { color: string; icon: JSX.Element; label: string } {
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

function truncateDescription(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

function formatDomain(domain: string): string {
  return domain
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function LessonRoadmap() {
  const allLessons = [...lessonData.core, ...lessonData.targeted, ...lessonData.optional].sort(
    (a, b) => a.lesson_order - b.lesson_order,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Learning Roadmap</h1>
          <p className="text-gray-600 text-lg">Track your progress through all assigned lessons</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allLessons.map((lesson) => {
            const statusConfig = getStatusConfig(lesson.status)
            const tierColor = getTierColor(lesson.tier)
            const tierBadgeColor = getTierBadgeColor(lesson.tier)

            return (
              <UI_Card
                key={lesson.id}
                className={`p-6 border-2 ${tierColor} shadow-md hover:shadow-xl transition-shadow cursor-pointer`}
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

                  <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{lesson.title}</h2>

                  <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                    {truncateDescription(lesson.description)}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaBook className="w-4 h-4" />
                      <span className="font-medium">{lesson.sublessons} Sublessons</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {lesson.target_domains.map((domain, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 font-medium"
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
