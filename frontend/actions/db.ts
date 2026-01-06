"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type UpdateLessonFormData = {
  lessonId: number
  stage: 1 // sets a lesson as in progress
} | {
    lessonId: number,
    stage: 2 | 3, // 2 = passed, 3 = failed
    quiz_score: number
}

// IF USING SUPABASE AUTH
// Setting eq() calls with userId is redundant, supabase handles it under the hood
// Just make sure to have proper RLS policies on relevant tables

// Since we're not using supabase auth, no real workaround besides accepting security risk (if querying with eq from client side)
// Eq checks on the server are fine, but fundamentally it's irrelevant if RLS policy is just true (which it has to be)

export async function updateLessonProgress(formData: UpdateLessonFormData) {
    const supabase = await createClient()
    const status = formData.stage != 2 ? "in_progress" : "completed"

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) throw new Error("Unauthorized")
    const userId = session.user.id

    const { data: existing, error } = await supabase
        .from("user_lesson_progress")
        .select("id, quiz_attempts")
        .eq("user_id", userId)
        .eq("lesson_id", formData.lessonId)
        .maybeSingle()
    
    console.log("REC existing?:", existing, "with new status", status)

    if (error) {
        throw new Error(error.message)
    }

    if (existing) {
        await supabase
            .from("user_lesson_progress")
            .update({
                status,
                updated_at: new Date().toISOString(),
                ...(formData.stage === 2 && {
                    completed_at: new Date().toISOString()
                }),
                ...(formData.stage != 1 && {
                    quiz_attempts: existing.quiz_attempts + 1,
                    quiz_score: formData.quiz_score
                })
            })
            .eq("id", existing.id)
    } else {
        await supabase.from("user_lesson_progress").insert({
            user_id: userId,
            lesson_id: formData.lessonId,
            status,
            quiz_attempts: formData.stage === 1 ? 0 : 1,
            ...(formData.stage != 1 && {
                quiz_score: formData.quiz_score
            }),
            ...(formData.stage === 2 && {
                completed_at: new Date().toISOString()
            })
        })
    }

    redirect(`/roadmap/lesson/${formData.lessonId}`)
}
