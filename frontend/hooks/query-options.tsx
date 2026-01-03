"use client"

import { queryOptions } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

// access the queryKey by .queryKey of any options object, rather than making a new file with string to key mappings

export type AssessmentQuestion = {
  id: number
  question_text: string
  domain: string
  question_order: number
  created_at: string
}
export const createAssessmentQueryOptions = () => {
    return queryOptions({
        queryKey: ["assessment_questions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("assessment_questions")
                .select("*")
                .order("question_order", { ascending: true })

            if (error) {
                throw new Error(error.message)
            }

            return data as AssessmentQuestion[]
        },
        staleTime: 60 * 1000 * 60 * 12,
        gcTime: 60 * 1000 * 60 * 24
    })
}

export const createAssessmentCheckQueryOptions = (userId: string) => {
    return queryOptions({
        queryKey: ["completed_assessment", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_assessments")
                .select("id")
                .eq("user_id", userId)
                .single()

            if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
                throw new Error(error.message)
            }

            return !!data
        }
    })
}


export const createLessonContentQueryOptions = (lessonId: number) => {
    return queryOptions({
        queryKey: ["lesson_content", lessonId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("lesson_cards")
                .select(`*, card_citations (*)`)
                .eq("lesson_id", lessonId)
                .order("card_order")

            if (error) {
                throw new Error(error.message)
            }

            return data
        },
        staleTime: 60 * 1000 * 60 * 12,
        gcTime: 60 * 1000 * 60 * 24
    })
}

export const createLessonQuizQueryOptions = (lessonId: number) => {
    return queryOptions({
        queryKey: ["lesson_quiz", lessonId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("lesson_quiz_questions")
                .select('*')
                .eq("lesson_id", lessonId)
                .order("question_order")

            if (error) {
                throw new Error(error.message)
            }

            return data
        },
        staleTime: 60 * 1000 * 60 * 12,
        gcTime: 60 * 1000 * 60 * 24
    })
}

export type LessonRoadmap = {
  core: LessonWithProgress[]
  targeted: LessonWithProgress[]
  optional: LessonWithProgress[]
}
export type LessonWithProgress = {
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
  quiz_attempts: number | null
  completed_at: string | null
}
export const createLessonRoadmapQueryOptions = (userId: string) =>{
    return queryOptions({
        queryKey: ["user_roadmap", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_lesson_assignments")
                .select(`
                assignment_reason,
                assigned_at,
                lessons (
                    id,
                    title,
                    description,
                    lesson_order,
                    tier,
                    target_domains
                ),
                user_lesson_progress (
                    status,
                    current_card_index,
                    quiz_score,
                    quiz_attempts,
                    completed_at
                )
                `)
                .eq("user_id", userId)
                .order("lessons(lesson_order)", { ascending: true })

            if (error) {
                throw new Error(error.message)
            }

            const roadmap: LessonRoadmap = {
                core: [],
                targeted: [],
                optional: []
            }

            data?.forEach((assignment: any) => {
                const lesson = assignment.lessons
                const progress = assignment.user_lesson_progress?.[0] || {}
                const lessonWithProgress: LessonWithProgress = {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    lesson_order: lesson.lesson_order,
                    tier: lesson.tier,
                    target_domains: lesson.target_domains || [],
                    assignment_reason: assignment.assignment_reason,
                    assigned_at: assignment.assigned_at,
                    status: progress.status || 'not_started',
                    current_card_index: progress.current_card_index || null,
                    quiz_score: progress.quiz_score || null,
                    quiz_attempts: progress.quiz_attempts || null,
                    completed_at: progress.completed_at || null
                }

                if (lesson.tier === "core") {
                    roadmap.core.push(lessonWithProgress)
                } else if (lesson.tier === "targeted") {
                    roadmap.targeted.push(lessonWithProgress)
                } else if (lesson.tier === "optional") {
                    roadmap.optional.push(lessonWithProgress)
                }
            })

            return roadmap
        }
    })
}

export const createLessonRoadmapCheckQueryOptions = (userId: string) => {
    return queryOptions({
        queryKey: ["completed_roadmap", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_lesson_assignments")
                .select("lesson_id, user_lesson_progress(status)")
                .eq("user_id", userId)
                .in("assignment_reason", ['core', 'gap_targeted'])

            if (error) {
                throw new Error(error.message)
            }

            if (!data || data.length === 0) {
                return false
            }

            // Check if all required lessons have status = 'completed'
            return data.every((assignment: any) => {
                const progress = assignment.user_lesson_progress?.[0]
                return progress?.status === "completed"
            })
        }
    })
}