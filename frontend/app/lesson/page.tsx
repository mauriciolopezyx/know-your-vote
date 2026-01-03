"use client"

import { useState } from "react"
import { FaChevronLeft, FaChevronRight, FaBook, FaLightbulb, FaExternalLinkAlt } from "react-icons/fa"
import { Card as UI_Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Sample data structure
const sampleData = {
  lesson: {
    id: 1,
    title: "How the US Government is Structured",
    description:
      "Learn about the three branches of government, separation of powers, and the system of checks and balances that prevents any one branch from becoming too powerful.",
    lesson_order: 1,
    tier: "core",
    target_domains: ["government_structure"],
    estimated_minutes: 15,
  },
  cards: [
    {
      id: 1,
      lesson_id: 1,
      card_order: 1,
      card_type: "text",
      title: "Why Government Structure Matters",
      content:
        "The United States government was designed with a specific structure to prevent tyranny and protect individual liberty. The Founders feared concentrating too much power in any single person or institution, so they created a system where power is divided and balanced. Understanding this structure helps you know who makes decisions that affect your life—and how you can influence those decisions.",
      diagram_url: null,
      citations: [],
    },
    {
      id: 2,
      lesson_id: 1,
      card_order: 2,
      card_type: "key_concept",
      title: "The Three Branches",
      content:
        "The federal government is divided into three separate branches:\n\n• **Legislative Branch (Congress)**: Makes federal laws. Consists of the Senate and House of Representatives.\n\n• **Executive Branch (President)**: Enforces and implements laws. Includes the President, Vice President, and federal agencies.\n\n• **Judicial Branch (Courts)**: Interprets laws and determines if they align with the Constitution. The Supreme Court is the highest court.",
      diagram_url: null,
      citations: [
        {
          id: 1,
          card_id: 2,
          source_name: "PBS LearningMedia",
          source_url: "https://www.pbslearningmedia.org/resource/branches-of-government/social-studies/",
          citation_text: "Overview of the three branches of the federal government and their roles",
        },
      ],
    },
    {
      id: 3,
      lesson_id: 1,
      card_order: 3,
      card_type: "text",
      title: "Separation of Powers",
      content:
        "Each branch has distinct powers that the others cannot exercise. Congress writes laws, but cannot enforce them. The President enforces laws, but cannot write them. Courts interpret laws, but cannot create or enforce them. This separation ensures that no single branch can act alone to create, enforce, and judge laws—preventing abuse of power.",
      diagram_url: null,
      citations: [
        {
          id: 2,
          card_id: 3,
          source_name: "National Constitution Center",
          source_url: "https://constitutioncenter.org/the-constitution/articles/article-i",
          citation_text: "Constitutional basis for separation of powers across the three branches",
        },
      ],
    },
    {
      id: 5,
      lesson_id: 1,
      card_order: 5,
      card_type: "text",
      title: "What This Means for Citizens",
      content:
        "Understanding government structure helps you know where to direct your advocacy. Want to change a law? Contact your representatives in Congress. Concerned about how a law is being enforced? The executive agencies are responsible. Think a law violates your constitutional rights? The courts can review it. This structure also means change often happens slowly—which can be frustrating, but also prevents hasty decisions that could harm rights and freedoms.",
      diagram_url: null,
      citations: [],
    },
    {
      id: 6,
      lesson_id: 1,
      card_order: 6,
      card_type: "key_concept",
      title: "Example: How a Presidential Action Can Be Checked",
      content:
        "In 2017, President Trump issued an executive order restricting travel from several countries. Federal courts (Judicial Branch) reviewed the order and initially blocked parts of it, ruling it may violate the Constitution. Congress (Legislative Branch) could have passed legislation to explicitly authorize or prohibit such actions. This shows all three branches working as designed—the President acted, courts reviewed, and Congress had the power to legislate if needed.",
      diagram_url: null,
      citations: [
        {
          id: 4,
          card_id: 6,
          source_name: "PBS NewsHour",
          source_url: "https://www.pbs.org/newshour/politics/understanding-the-travel-ban-supreme-court-case",
          citation_text: "Coverage of judicial review of executive orders",
        },
      ],
    },
  ],
}

type Card = {
  id: number
  lesson_id: number
  card_order: number
  card_type: string
  title: string
  content: string
  diagram_url: string | null
  citations: Array<{
    id: number
    card_id: number
    source_name: string
    source_url: string
    citation_text: string
  }>
}

type Sublesson = {
  textCard: Card
  keyConceptCard?: Card
  sublessonNumber: number
}

function createSublessons(cards: Card[]): Sublesson[] {
  const sublessons: Sublesson[] = []
  let sublessonNumber = 1

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]

    if (card.card_type === "text") {
      const nextCard = cards[i + 1]
      const keyConceptCard = nextCard && nextCard.card_type === "key_concept" ? nextCard : undefined

      sublessons.push({
        textCard: card,
        keyConceptCard,
        sublessonNumber,
      })

      sublessonNumber++

      if (keyConceptCard) {
        i++
      }
    }
  }

  return sublessons
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

export default function LessonViewer() {
  const sublessons = createSublessons(sampleData.cards)
  const [currentSublesson, setCurrentSublesson] = useState(0)

  const sublesson = sublessons[currentSublesson]
  const totalSublessons = sublessons.length

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

  const allCitations = [...sublesson.textCard.citations, ...(sublesson.keyConceptCard?.citations || [])]

  return (
    <div className="min-h-screen bg-muted from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <FaBook className="text-xl" />
            <span className="text-sm font-medium uppercase tracking-wide">Lesson {sampleData.lesson.lesson_order}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{sampleData.lesson.title}</h1>
          <p className="font-light leading-relaxed">{sampleData.lesson.description}</p>
        </div>

        {/* Main Content Area */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute left-[-30] top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10">
            <Button
              onClick={goToPrevious}
              disabled={currentSublesson === 0}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-blue-500"
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
              className="h-12 w-12 rounded-full shadow-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-blue-500"
              aria-label="Next sublesson"
            >
              <FaChevronRight className="text-blue-500" />
            </Button>
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            {/* Text Card */}
            <UI_Card className="p-6 md:p-8 shadow-lg border-l-4 border-l-blue-500">
              <h2 className="text-2xl font-bold">{sublesson.textCard.title}</h2>
              <div className="font-light space-y-4">{renderContent(sublesson.textCard.content)}</div>
            </UI_Card>

            {/* Key Concept Card */}
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

            {/* Citations */}
            {allCitations.length > 0 && (
              <UI_Card className="p-4 md:p-6 border border-gray-200">
                <h4 className="text-sm font-bold uppercase tracking-wide mb-3">Sources & Citations</h4>
                <div className="space-y-2">
                  {allCitations.map((citation) => (
                    <div key={citation.id} className="flex items-start gap-2 text-sm">
                      <FaExternalLinkAlt className="text-blue-500 mt-1 flex-shrink-0" />
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

        {/* Progress Indicator */}
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
