import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLessonQuiz } from "@/lib/server-queries"
import LessonQuiz from "@/components/roadmap/lesson/quiz/lesson-quiz"

export default async function LessonQuizPage({ params }: { params: {id: string} }) {
    const { id } = await params
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    const [quiz] = await Promise.all([
        getLessonQuiz(Number(id))
    ])

    return (
        <LessonQuiz
            quiz={quiz}
        />
    )
}