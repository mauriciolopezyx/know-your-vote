"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { LessonQuizQuestion } from "@/types/queries"

type StartLessonFormData = {
  lessonId: number
}

// IF USING SUPABASE AUTH
// Setting eq() calls with userId is redundant, supabase handles it under the hood
// Just make sure to have proper RLS policies on relevant tables

// Since we're not using supabase auth, no real workaround besides accepting security risk (if querying with eq from client side)
// Eq checks on the server are fine, but fundamentally it's irrelevant if RLS policy is just true (which it has to be)

export async function StartLesson(formData: StartLessonFormData) {
    const supabase = await createClient()
    const status = "in_progress"

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error("Unauthorized")
    const userId = session.user.id

    const { data: existing, error } = await supabase
        .from("user_lesson_progress")
        .select("id, status")
        .eq("user_id", userId)
        .eq("lesson_id", formData.lessonId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    if (existing) {
        if (existing.status === "completed") {
            redirect(`/roadmap/lesson/${formData.lessonId}`)
        }
        await supabase
            .from("user_lesson_progress")
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq("id", existing.id)
    } else {
        await supabase.from("user_lesson_progress").insert({
            user_id: userId,
            lesson_id: formData.lessonId,
            status,
            quiz_attempts: 0
        })
    }

    redirect(`/roadmap/lesson/${formData.lessonId}`)
}


type SubmitLessonQuizFormData = {
    lessonId: number,
    answers: Record<number, "A" | "B" | "C" | "D">
}
export async function SubmitLessonQuiz(formData: SubmitLessonQuizFormData) {
    
    const supabase = await createClient()
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error("Unauthorized")
    const userId = session.user.id

    const { data:quizQuestions, error:quizError }: {data: null | LessonQuizQuestion[], error: any} = await supabase
        .from("lesson_quiz_questions")
        .select('*')
        .eq("lesson_id", formData.lessonId)
        .order("question_order")

    if (quizError || !quizQuestions) {
        throw new Error(quizError.message)
    }

    const numCorrect = quizQuestions.reduce((accumulator, answer) => answer.correct_answer === formData.answers[answer.id] ? accumulator + 1 : accumulator, 0)
    const passedQuiz = numCorrect >= quizQuestions.length - 1

    const { data:existing, error:progressError } = await supabase
        .from("user_lesson_progress")
        .select("id, quiz_attempts")
        .eq("user_id", userId)
        .eq("lesson_id", formData.lessonId)
        .maybeSingle()

    if (progressError) {
        throw new Error(progressError.message)
    }

    if (existing) {
        await supabase
            .from("user_lesson_progress")
            .update({
                status: passedQuiz ? "completed" : "in_progress",
                updated_at: new Date().toISOString(),
                quiz_attempts: existing.quiz_attempts + 1,
                quiz_score: numCorrect,
                ...(passedQuiz && {
                    completed_at: new Date().toISOString()
                })
            })
            .eq("id", existing.id)
    } else {
        await supabase.from("user_lesson_progress").insert({
            user_id: userId,
            lesson_id: formData.lessonId,
            status: passedQuiz ? "completed" : "in_progress",
            quiz_attempts: 1,
            quiz_score: numCorrect,
            ...(passedQuiz && {
                completed_at: new Date().toISOString()
            })
        })
    }

    return { passed: passedQuiz }
}