import { redirect } from "next/navigation"
import { LessonCard } from "@/hooks/query-options"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLessonContent, isPromiseFulfilled } from "@/lib/server-queries"
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
  
  const promises: Promise<any>[] = [getLessonContent(Number(id))]
  const results = await Promise.allSettled(promises)

  if (!results.every(isPromiseFulfilled)) {
    return (
      <div className="min-h-screen bg-muted p-6 md:p-8 flex justify-center items-center">
        <p>Failed to retrieve lesson: Does not exist</p>
      </div>
    )
  }

  const sublessons: Sublesson[] = createSublessons(results[0].value.cards)

  return (
    <Lesson
      lesson={results[0].value}
      sublessons={sublessons}
    />
  )
}
