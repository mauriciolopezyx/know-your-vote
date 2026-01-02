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
export const createAssessmentQuestionQueryOptions = () => {
    return queryOptions({
        queryKey: ["assessment_questions"],
        queryFn: async () => {
            const { data, error } = await supabase
            .from("assessment_questions")
            .select("*")
            .order('question_order', { ascending: true })

            if (error) {
                throw new Error(error.message)
            }

            return data as AssessmentQuestion[]
        },
        staleTime: 60 * 1000 * 60 * 12,
        gcTime: 60 * 1000 * 60 * 24
    })
}