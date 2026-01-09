import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLessonQuiz, isPromiseFulfilled } from "@/lib/server-queries"
import LessonQuiz from "@/components/roadmap/lesson/quiz/lesson-quiz"

export default async function LessonQuizPage({ params }: { params: {id: string} }) {
    const { id } = await params
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    const promises = [getLessonQuiz(Number(id))]
    const results = await Promise.allSettled(promises)

    if (!results.every(isPromiseFulfilled)) {
        return (
            <div className="min-h-screen bg-muted p-6 md:p-8 flex justify-center items-center">
                <p>Failed to retrieve lesson quiz: Does not exist</p>
            </div>
        )
    }

    return (
        <LessonQuiz
            quiz={results[0].value}
        />
    )
}