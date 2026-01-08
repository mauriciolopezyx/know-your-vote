import { redirect } from "next/navigation"
import { LessonCard } from "@/hooks/query-options"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLessonContent } from "@/lib/server-queries"
import Lesson, { Sublesson } from "@/components/roadmap/lesson/lesson"

function createSublessons(cards: LessonCard[]): Sublesson[] {
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

export default async function LessonPage({ params }: { params: {id: string} }) {

  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login")
  }
  
  const [lesson] = await Promise.all([
    getLessonContent(Number(id))
  ])

  const sublessons: Sublesson[] = createSublessons(lesson.cards)

  return (
    <Lesson
      lesson={lesson}
      sublessons={sublessons}
    />
  )
}
