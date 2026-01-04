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
        refetchOnWindowFocus: false,
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
                .select("*")
                .eq("user_id", userId)
                .single()

            if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
                throw new Error(error.message)
            }

            return !!data
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000 * 5,
        gcTime: 60 * 1000 * 10
    })
}

export type Citation = {
    id: number,
    card_id: number,
    created_at: string,
    citation_text: string,
    source_name: string,
    source_url: string
}
export type LessonCard = {
    card_citations: Citation[],
    card_order: number,
    card_type: string,
    content: string,
    created_at: string,
    id: number,
    lesson_id: number,
    title: string
}
export type LessonContent = {
    lesson: Pick<Lesson, "id" | "title" | "description" | "lesson_order">,
    cards: LessonCard[]
}
export const createLessonContentQueryOptions = (lessonId: number) => {
    return queryOptions({
        queryKey: ["lesson_content", lessonId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("lesson_cards")
                .select(`*, card_citations (*), lessons (id, title, description, lesson_order)`)
                .eq("lesson_id", lessonId)
                .order("card_order")

            if (error) {
                throw new Error(error.message)
            }

            const lessonData = data && data.length > 0 ? data[0].lessons : null

            const response = {
                lesson: lessonData,
                cards: data?.map(card => {
                    const { lessons, ...cardData } = card
                    return cardData
                }) || []
            }

            return response as LessonContent
        },
        refetchOnWindowFocus: false,
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
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000 * 60 * 12,
        gcTime: 60 * 1000 * 60 * 24
    })
}

export type LessonRoadmap = {
  core: Lesson[],
  targeted: Lesson[],
  optional: Lesson[]
}
export type Lesson = {
  id: number,
  title: string,
  description: string,
  lesson_order: number,
  tier: string,
  target_domains: string[],
  assignment_reason: string,
  assigned_at: string,
  status: string,
  quiz_score: number | null,
  quiz_attempts: number | null,
  completed_at: string | null,
  sublessons: number
}
export const createLessonRoadmapQueryOptions = (userId: string) =>{
    return queryOptions({
        queryKey: ["user_roadmap", userId],
        queryFn: async () => {
            const { data: assignments, error: assignmentError } = await supabase
                .from('user_lesson_assignments')
                .select(`
                assignment_reason,
                assigned_at,
                lesson_id,
                lessons (
                    id,
                    title,
                    description,
                    lesson_order,
                    tier,
                    target_domains,
                    lesson_cards (
                    card_type
                    )
                )
                `)
                .eq('user_id', userId)
                .order('lessons(lesson_order)', { ascending: true })
            
            if (assignmentError) {
                throw new Error(assignmentError.message)
            }

            // Then, get all progress records for this user
            const { data: progressRecords, error: progressError } = await supabase
                .from('user_lesson_progress')
                .select('lesson_id, status, quiz_score, quiz_attempts, completed_at')
                .eq('user_id', userId)

            if (progressError) {
                throw new Error(progressError.message)
            }

            // Create a map of lesson_id -> progress for quick lookup
            const progressMap = new Map(
                progressRecords?.map(p => [p.lesson_id, p]) || []
            )

            // Organize lessons by tier
            const roadmap: LessonRoadmap = {
                core: [],
                targeted: [],
                optional: []
            }

            assignments?.forEach((assignment: any) => {
                const lesson = assignment.lessons
                const progress = progressMap.get(assignment.lesson_id)
                if (!progress) return
                // Count text cards as sublessons
                const sublessons = lesson.lesson_cards?.filter(
                    (card: any) => card.card_type === 'text'
                ).length || 0

                const lessonWithProgress: Lesson = {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    lesson_order: lesson.lesson_order,
                    tier: lesson.tier,
                    target_domains: lesson.target_domains || [],
                    assignment_reason: assignment.assignment_reason,
                    assigned_at: assignment.assigned_at,
                    status: progress.status || 'not_started',
                    quiz_score: progress.quiz_score || null,
                    quiz_attempts: progress.quiz_attempts || null,
                    completed_at: progress.completed_at || null,
                    sublessons: sublessons
                }

                if (lesson.tier === 'core') {
                    roadmap.core.push(lessonWithProgress)
                } else if (lesson.tier === 'targeted') {
                    roadmap.targeted.push(lessonWithProgress)
                } else if (lesson.tier === 'optional') {
                    roadmap.optional.push(lessonWithProgress)
                }
            })

            return roadmap
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000 * 15,
        gcTime: 60 * 1000 * 30
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
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000 * 5,
        gcTime: 60 * 1000 * 10
    })
}