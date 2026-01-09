import { createClient } from "./supabase-server"
import { LessonRoadmap, Lesson, LessonContent, AssessmentQuestion, LessonQuizQuestion, Official } from "@/hooks/query-options"

export function isPromiseFulfilled<T>(res: PromiseSettledResult<T>): res is PromiseFulfilledResult<T> {
  return res.status === "fulfilled"
}

export async function getLessonQuiz(lessonId: number): Promise<LessonQuizQuestion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("lesson_quiz_questions")
        .select('*')
        .eq("lesson_id", lessonId)
        .order("question_order")

    if (error) {
        throw new Error(error.message)
    }

    return data as LessonQuizQuestion[]
}

export async function getAssessment(): Promise<AssessmentQuestion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .order("question_order", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data as AssessmentQuestion[]
}

export async function getLessonContent(lessonId: number): Promise<LessonContent> {
    const supabase = await createClient()
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
}

export async function hasCompletedAssessment(userId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("user_assessments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return !!data
}

export async function getUserLessonRoadmap(userId: string): Promise<LessonRoadmap> {
    const supabase = await createClient()
    const { data: assignments, error: assignmentError } = await supabase
        .from("user_lesson_assignments")
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
        .eq("user_id", userId)
        .order("lessons(lesson_order)", { ascending: true })

    if (assignmentError) {
        throw new Error(assignmentError.message)
    }

    const { data: progressRecords, error: progressError } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, status, quiz_score, quiz_attempts, completed_at")
        .eq("user_id", userId)

    if (progressError) {
        throw new Error(progressError.message)
    }

    const progressMap = new Map(
        progressRecords?.map(p => [p.lesson_id, p]) || []
    )

    const roadmap: LessonRoadmap = {
        core: [],
        targeted: [],
        optional: []
    }

    assignments?.forEach((assignment: any) => {
        const lesson = assignment.lessons
        const progress = progressMap.get(assignment.lesson_id)

        if (!progress) return

        const sublessons = lesson.lesson_cards?.filter(
            (card: any) => card.card_type === "text"
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
            status: progress.status || "not_started",
            quiz_score: progress.quiz_score || null,
            quiz_attempts: progress.quiz_attempts || null,
            completed_at: progress.completed_at || null,
            sublessons: sublessons
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

export async function getCongressionalMemberInfo(bioguideId: string): Promise<Official> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("federal_officials")
        .select("*")
        .eq("bioguide_id", bioguideId)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as Official
}