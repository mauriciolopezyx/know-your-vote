"use client"

import { queryOptions } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase-client"

// access the queryKey by .queryKey of any options object, rather than making a new file with string to key mappings

export type AssessmentQuestion = {
  id: number
  question_text: string
  domain: string
  question_order: number
  created_at: string
}
// export const createAssessmentQueryOptions = () => {
//     return queryOptions({
//         queryKey: ["assessment_questions"],
//         queryFn: async () => {
//             const { data, error } = await supabase
//                 .from("assessment_questions")
//                 .select("*")
//                 .order("question_order", { ascending: true })

//             if (error) {
//                 throw new Error(error.message)
//             }

//             return data as AssessmentQuestion[]
//         },
//         refetchOnWindowFocus: false,
//         staleTime: 60 * 1000 * 60 * 12,
//         gcTime: 60 * 1000 * 60 * 24
//     })
// }

// export const createAssessmentCheckQueryOptions = (userId: string) => {
//     return queryOptions({
//         queryKey: ["completed_assessment", userId],
//         queryFn: async () => {
//             const { data, error } = await supabase
//                 .from("user_assessments")
//                 .select("id")
//                 .maybeSingle()

//             if (error) {
//                 throw new Error(error.message)
//             }

//             return !!data
//         },
//         refetchOnWindowFocus: false,
//         staleTime: 60 * 1000 * 5,
//         gcTime: 60 * 1000 * 10
//     })
// }

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
// export const createLessonContentQueryOptions = (lessonId: number) => {
//     return queryOptions({
//         queryKey: ["lesson_content", lessonId],
//         queryFn: async () => {
//             const { data, error } = await supabase
//                 .from("lesson_cards")
//                 .select(`*, card_citations (*), lessons (id, title, description, lesson_order)`)
//                 .eq("lesson_id", lessonId)
//                 .order("card_order")

//             if (error) {
//                 throw new Error(error.message)
//             }

//             const lessonData = data && data.length > 0 ? data[0].lessons : null

//             const response = {
//                 lesson: lessonData,
//                 cards: data?.map(card => {
//                     const { lessons, ...cardData } = card
//                     return cardData
//                 }) || []
//             }

//             return response as LessonContent
//         },
//         refetchOnWindowFocus: false,
//         staleTime: 60 * 1000 * 60 * 12,
//         gcTime: 60 * 1000 * 60 * 24
//     })
// }

export type LessonQuizQuestion = {
    correct_answer: "A" | "B" | "C" | "D",
    created_at: string,
    explanation: string,
    id: number,
    lesson_id: number,
    option_a: string,
    option_b: string,
    option_c: string,
    option_d: string,
    question_order: number,
    question_text: string
}
// export const createLessonQuizQueryOptions = (lessonId: number) => {
//     return queryOptions({
//         queryKey: ["lesson_quiz", lessonId],
//         queryFn: async () => {
//             const { data, error } = await supabase
//                 .from("lesson_quiz_questions")
//                 .select('*')
//                 .eq("lesson_id", lessonId)
//                 .order("question_order")

//             if (error) {
//                 throw new Error(error.message)
//             }

//             console.log("quiz content rec:", data)

//             return data as LessonQuizQuestion[]
//         },
//         refetchOnWindowFocus: false,
//         staleTime: 60 * 1000 * 60 * 12,
//         gcTime: 60 * 1000 * 60 * 24
//     })
// }

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
  status: "not_started" | "in_progress" | "completed",
  quiz_score: number | null,
  quiz_attempts: number | null,
  completed_at: string | null,
  sublessons: number
}
// export const createLessonRoadmapQueryOptions = (userId: string) =>{
//     return queryOptions({
//         queryKey: ["user_roadmap", userId],
//         queryFn: async () => {
//             console.log("remounted")
//             const { data: assignments, error: assignmentError } = await supabase
//                 .from('user_lesson_assignments')
//                 .select(`
//                 assignment_reason,
//                 assigned_at,
//                 lesson_id,
//                 lessons (
//                     id,
//                     title,
//                     description,
//                     lesson_order,
//                     tier,
//                     target_domains,
//                     lesson_cards (
//                     card_type
//                     )
//                 )
//                 `)
//                 .eq('user_id', userId)
//                 .order('lessons(lesson_order)', { ascending: true })
            
//             if (assignmentError) {
//                 throw new Error(assignmentError.message)
//             }

//             const { data: progressRecords, error: progressError } = await supabase
//                 .from('user_lesson_progress')
//                 .select('lesson_id, status, quiz_score, quiz_attempts, completed_at')
//                 .eq('user_id', userId)

//             if (progressError) {
//                 throw new Error(progressError.message)
//             }

//             const progressMap = new Map(
//                 progressRecords?.map(p => [p.lesson_id, p]) || []
//             )

//             const roadmap: LessonRoadmap = {
//                 core: [],
//                 targeted: [],
//                 optional: []
//             }

//             assignments?.forEach((assignment: any) => {
//                 const lesson = assignment.lessons
//                 const progress = progressMap.get(assignment.lesson_id)
//                 if (!progress) return
//                 const sublessons = lesson.lesson_cards?.filter(
//                     (card: any) => card.card_type === 'text'
//                 ).length || 0

//                 const lessonWithProgress: Lesson = {
//                     id: lesson.id,
//                     title: lesson.title,
//                     description: lesson.description,
//                     lesson_order: lesson.lesson_order,
//                     tier: lesson.tier,
//                     target_domains: lesson.target_domains || [],
//                     assignment_reason: assignment.assignment_reason,
//                     assigned_at: assignment.assigned_at,
//                     status: progress.status || "not_started",
//                     quiz_score: progress.quiz_score || null,
//                     quiz_attempts: progress.quiz_attempts || null,
//                     completed_at: progress.completed_at || null,
//                     sublessons: sublessons
//                 }

//                 if (lesson.tier === 'core') {
//                     roadmap.core.push(lessonWithProgress)
//                 } else if (lesson.tier === 'targeted') {
//                     roadmap.targeted.push(lessonWithProgress)
//                 } else if (lesson.tier === 'optional') {
//                     roadmap.optional.push(lessonWithProgress)
//                 }
//             })

//             return roadmap
//         },
//         refetchOnWindowFocus: false,
//         refetchOnMount: "always",
//         staleTime: 60 * 1000 * 15,
//         gcTime: 60 * 1000 * 30
//     })
// }

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

export type Official = {
  id: string
  bioguide_id: string
  first_name: string
  last_name: string
  middle_name: string | null
  full_name: string
  honorific: string | null
  chamber: string
  state: string
  state_code: string
  district: number | null
  party: string
  office_address: string | null
  phone_number: string | null
  official_website: string | null
  image_url: string | null
  image_attribution: string | null
  birth_year: string | null
  current_member: boolean
  first_term_start: number
  current_term_start: number
  congress_api_updated_at: string
  created_at: string
  updated_at: string
}
export type ApiResponse = {
  officials: Official[]
  total: number
  page: number
  totalPages: number
}
export type OfficialFilters = {
  page?: number
  limit?: number
  chamber?: "Senate" | "House of Representatives" | "all"
  state?: string
  party?: "Democratic" | "Republican" | "Independent" | "all"
  district?: string
  birthYear?: string
  birthYearFilter?: "exact" | "before" | "after"
  firstTermYear?: string
  firstTermFilter?: "exact" | "before" | "after"
  currentTermYear?: string
  currentTermFilter?: "exact" | "before" | "after"
  name?: string
}
export const createDirectoryQueryOptions = (filters: OfficialFilters) => {
    return queryOptions({
        queryKey: ["directory", filters],
        queryFn: async () => {
            const {
                page = 1,
                limit = 50,
                chamber,
                state,
                party,
                district,
                birthYear,
                birthYearFilter = "exact",
                firstTermYear,
                firstTermFilter = "exact",
                currentTermYear,
                currentTermFilter = "exact",
                name=""
            } = filters

            const from = (page - 1) * limit
            const to = from + limit - 1

            let query = supabase
                .from("federal_officials")
                .select("*", { count: "exact" })
                .eq("current_member", true)
                .order("last_name", { ascending: true })
                .range(from, to)

            if (name) {
                query = query.ilike("full_name", `%${name}%`)
            }
            // Apply filters
            if (chamber && chamber != "all") {
                query = query.eq("chamber", chamber)
            }

            if (state && state.trim() !== "") {
                // Search by state name OR state code
                const stateUpper = state.trim().toUpperCase()
                query = query.or(`state.ilike.%${state}%,state_code.eq.${stateUpper}`)
            }

            if (party && party != "all") {
                query = query.eq("party", party)
            }

            if (district && district.trim() !== "") {
                const districtNum = parseInt(district)
                if (!isNaN(districtNum)) {
                query = query.eq("district", districtNum)
                }
            }

            // Birth year filter
            if (birthYear && birthYear.trim() !== "") {
                const year = birthYear.trim()
                switch (birthYearFilter) {
                case "exact":
                    query = query.eq("birth_year", year)
                    break
                case "before":
                    query = query.lt("birth_year", year)
                    break
                case "after":
                    query = query.gt("birth_year", year)
                    break
                }
            }

            // First term start filter
            if (firstTermYear && firstTermYear.trim() !== "") {
                const year = parseInt(firstTermYear)
                if (!isNaN(year)) {
                switch (firstTermFilter) {
                    case "exact":
                    query = query.eq("first_term_start", year)
                    break
                    case "before":
                    query = query.lt("first_term_start", year)
                    break
                    case "after":
                    query = query.gt("first_term_start", year)
                    break
                }
                }
            }

            // Current term start filter
            if (currentTermYear && currentTermYear.trim() !== "") {
                const year = parseInt(currentTermYear)
                if (!isNaN(year)) {
                switch (currentTermFilter) {
                    case "exact":
                    query = query.eq("current_term_start", year)
                    break
                    case "before":
                    query = query.lt("current_term_start", year)
                    break
                    case "after":
                    query = query.gt("current_term_start", year)
                    break
                }
                }
            }

            const { data, error, count } = await query

            if (error) {
                throw new Error(error.message)
            }

            return {
                officials: data || [],
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            }
        },
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000 * 60 * 5,
        gcTime: 60 * 1000 * 60 * 10
    })
}