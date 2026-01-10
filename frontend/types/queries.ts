export type AssessmentQuestion = {
  id: number
  question_text: string
  domain: string
  question_order: number
  created_at: string
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

//

export type Bill = {
  id: string
  congress: number
  bill_type: "hr" | "s" | "hjres" | "sjres" | "hconres" | "sconres" | "hres" | "sres",
  bill_number: number
  title: string
  summary: string | null
  latest_action_date: string | null
  latest_action_text: string | null
  introduced_date: string | null
  congress_api_url: string | null
  congress_gov_url: string | null
  created_at: string
  updated_at: string
}

export type BillWithSponsorship = Bill & {
  sponsored_date: string | null
  is_primary_sponsor: boolean
}
export type CongressSponsoredBill = {
  congress: number
  number: number
  type: string
  url: string
  title: string
  latestAction?: {
    actionDate: string
    text: string
  }
}
export type CongressBillDetail = {
  congress: number
  number: number
  type: string
  title: string
  introducedDate: string
  latestAction?: {
    actionDate: string
    text: string
  }
  summaries?: Array<{
    text: string
    updateDate: string
  }>
  sponsors?: Array<{
    bioguideId: string
  }>
}