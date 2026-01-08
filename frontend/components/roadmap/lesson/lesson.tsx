"use client"

import { useState } from "react"
import { FaChevronLeft, FaChevronRight, FaBook, FaLightbulb, FaExternalLinkAlt } from "react-icons/fa"
import { Card as UI_Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LessonContent } from "@/hooks/query-options"
import { LessonCard } from "@/hooks/query-options"
import Link from "next/link"
import { useParams } from "next/navigation"

export type Sublesson = {
  textCard: LessonCard
  keyConceptCard?: LessonCard
  sublessonNumber: number
}

function renderContent(content: string) {
  return content.split("\n\n").map((paragraph, index) => {
    const lines = paragraph.split("\n")
    if (lines.length > 1 && lines[0].startsWith("•")) {
      return (
        <ul key={index} className="space-y-2 ml-4">
          {lines.map((line, lineIndex) => {
          const cleanLine = line.replace(/^•\s*/, "")
          const parts = cleanLine.split("**")
          return (
            <li key={lineIndex} className="flex gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>
                {parts.map((part, partIndex) =>
                partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part,
                )}
              </span>
            </li>
          )
          })}
        </ul>
      )
    }

    const parts = paragraph.split("**")
    return (
      <p key={index} className="leading-relaxed">
      {parts.map((part, partIndex) => (partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part))}
      </p>
    )
  })
}

export default function Lesson({lesson, sublessons}: {lesson: LessonContent, sublessons: Sublesson[]}) {

  const params = useParams<{ id: string }>()
  const [currentSublesson, setCurrentSublesson] = useState(0)
  const sublesson: Sublesson = sublessons[currentSublesson]
  const totalSublessons = sublessons.length
  const allCitations = [...sublesson.textCard.card_citations, ...(sublesson.keyConceptCard?.card_citations || [])]

  const goToPrevious = () => {
    if (currentSublesson > 0) {
      setCurrentSublesson(currentSublesson - 1)
    }
  }
  const goToNext = () => {
    if (currentSublesson < totalSublessons - 1) {
      setCurrentSublesson(currentSublesson + 1)
    }
  }

  return (
    <div className="min-h-screen bg-muted from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <FaBook className="text-xl" />
            <span className="text-sm font-medium uppercase tracking-wide">Lesson {lesson.lesson.lesson_order}</span>
          </div>
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{lesson.lesson.title}</h1>
            {currentSublesson === totalSublessons - 1 ? (
              <Link href={`/roadmap/lesson/${params.id}/quiz`}>
                <div className="shadow-md rounded-full py-2 px-5 text-x text-white bg-red-500 hover:bg-red-600 transition-colors">
                  <span>Start Quiz</span>
                </div>
              </Link>
            ): null}
          </div>
          <p className="font-light leading-relaxed">{lesson.lesson.description}</p>
        </div>

        <div className="relative">
          <div className="absolute left-[-30] top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10">
            <Button
              onClick={goToPrevious}
              disabled={currentSublesson === 0}
              variant="outline"
              size="icon"
              className="cursor-pointer h-12 w-12 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-blue-500"
              aria-label="Previous sublesson"
            >
                <FaChevronLeft className="text-blue-500" />
            </Button>
          </div>

          <div className="absolute right-[-30] top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10">
            <Button
              onClick={goToNext}
              disabled={currentSublesson === totalSublessons - 1}
              variant="outline"
              size="icon"
              className="cursor-pointer h-12 w-12 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-blue-500"
              aria-label="Next sublesson"
            >
                <FaChevronRight className="text-blue-500" />
            </Button>
          </div>

          <div className="space-y-6">
            <UI_Card className="p-6 md:p-8 shadow-lg border-l-4 border-l-blue-500">
              <h2 className="text-2xl font-bold">{sublesson.textCard.title}</h2>
              <div className="font-light space-y-4">{renderContent(sublesson.textCard.content)}</div>
            </UI_Card>

            {sublesson.keyConceptCard && (
              <UI_Card className="p-6 md:p-8 border-2 border-blue-500 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                <FaLightbulb className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold">Key Concept: {sublesson.keyConceptCard.title}</h3>
              </div>
              <div className="font-light space-y-4">{renderContent(sublesson.keyConceptCard.content)}</div>
              </UI_Card>
            )}

            {allCitations.length > 0 && (
              <UI_Card className="p-4 md:p-6 border border-gray-200">
              <h4 className="text-sm font-bold uppercase tracking-wide mb-3">Sources & Citations</h4>
              <div className="space-y-2">
                {allCitations.map((citation) => (
                <div key={citation.id} className="flex items-start gap-2 text-sm">
                    <FaExternalLinkAlt className="text-blue-500 mt-1 shrink-0" />
                    <div>
                    <a
                        href={citation.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 font-medium hover:underline"
                    >
                        {citation.source_name}
                    </a>
                    <p className="font-light mt-1">{citation.citation_text}</p>
                    </div>
                </div>
                ))}
              </div>
              </UI_Card>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md border">
            <span className="font-light text-sm">
              Sublesson <span className="font-bold">{sublesson.sublessonNumber}</span> of <span className="font-bold">{totalSublessons}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
