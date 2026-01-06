"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { createAssessmentQueryOptions, createAssessmentCheckQueryOptions } from "@/hooks/query-options"
import { useMutation, useQuery } from "@tanstack/react-query"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { AssessmentResponse } from "@/components/assessment-result"
import AssessmentResult from "@/components/assessment-result"
import Link from "next/link"
import { createAssessmentMutationOptions } from "@/hooks/mutation-options"

export default function AssessmentPage() {

  const { data:session } = authClient.useSession()
  const { data:hasCompletedAssessment, isPending:hasCompletedAssessmentLoading } = useQuery(createAssessmentCheckQueryOptions(session?.user.id ?? ""))
  const {data:assessment, isPending:assessmentLoading, error:assessmentError} = useQuery(createAssessmentQueryOptions())
  const [responses, setResponses] = useState<string[]>(new Array(6).fill(""))
  const [question, setQuestion] = useState<number>(-1)
  const [assessmentResponse, setAssessmentResponse] = useState<AssessmentResponse | null>(null)

  const responsesFilled = responses.filter(res => res.trim().length >= 25).length
  const canSubmit = assessment ? responsesFilled === assessment.length : false
  const {isPending:assessmentResponseLoading, mutate:submitAssessment} = useMutation(createAssessmentMutationOptions(canSubmit, session, responses, (result: any) => {setAssessmentResponse(result)}))

  if (assessmentLoading || hasCompletedAssessmentLoading) {
    return (
      <div className="bg-muted min-h-svh flex flex-row justify-center items-center">
        <Loader2 className="size-16 animate-spin"/>
      </div>
    )
  }

  if (hasCompletedAssessment) {
    return (
      <div className="bg-muted min-h-svh flex flex-col gap-y-4 justify-center items-center">
        <p>You have already completed the assessment!</p>

        <Link href="/roadmap">
          <div className="shadow-md rounded-full py-2 px-5 text-x text-white bg-blue-500 hover:bg-blue-600 transition-colors">
            <span>Go To Roadmap</span>
          </div>
        </Link>
      </div>
    )
  }

  if (assessmentError) {
    return (
      <p>Error loading assessment: {assessmentError?.message}</p>
    )
  }

  if (assessmentResponse) {
    return <AssessmentResult data={assessmentResponse} />
  }

  if (assessmentResponseLoading) {
    return (
      <div className="bg-muted min-h-svh flex flex-col justify-center items-center">
        <Loader2 className="size-32 animate-spin"/>
        <p className="text-xl mt-5">Assessment submitted! Awaiting results...</p>
        <p className="text-sm mt-5">Results may take up to 1-2 minutes</p>
        <div className="mt-25"></div>
      </div>
    )
  }

  if (question === -1) {
    return (
      <div className="min-h-screen bg-muted p-6 md:p-8">
        <Button size="lg" className="bg-blue-500 text-white text-xl hover:bg-blue-600" onClick={() => {setQuestion(0)}}>Begin Assessment</Button>
      </div>
    )
  }

  const onQuestionToggle = (increment: number) => {
    if (increment > 0 && question >= assessment.length - 1) return
    if (increment < 0 && question <= 0) return
    setQuestion(prev => prev + increment)
  }

  const onAssessmentSubmit = () => {
    submitAssessment()
  }

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-500">Assessment</h1>
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <Progress value={(responsesFilled / 6) * 100} className="w-full max-w-2xl [&>div]:bg-red-500" />
          {canSubmit ? <Button size="lg" className="bg-blue-500 text-white text-xl hover:bg-blue-600" onClick={onAssessmentSubmit}>Submit</Button> : null}
        </div>

        <div className="mb-6 flex items-start gap-4">
          <span className="text-4xl font-bold text-blue-500">{question + 1}</span>
          <p className="pt-2 text-lg text-foreground">{assessment[question].question_text}</p>
        </div>
        
        <div className="mb-2 text-xl">
          <Textarea
            value={responses[question]}
            onChange={e => { setResponses(prev => prev.map((value, i) => i === question ? e.target.value.slice(0, 500) : value)) }}
            placeholder="Enter your response here..."
            className="resize-none w-full border-2 border-blue-500 p-4 text-lg font-light focus-visible:ring-blue-500 text-left"
          />
        </div>

        <div className="flex flex-row justify-between items-center mb-12">
            <p className="text-sm font-light text-muted-foreground">25-500 characters</p>
            <p className="text-sm font-light text-muted-foreground">{responses[question].length} characters</p>
        </div>

        <div className="flex items-center justify-center gap-8">
          <Button
            disabled={question === 0}
            variant="ghost"
            className="cursor-pointer flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 transition-colors hover:bg-blue-50"
            aria-label="Previous question"
            onClick={() => {onQuestionToggle(-1)}}
          >
            <FiChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            disabled={question === assessment.length - 1}
            variant="ghost"
            className="cursor-pointer flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 transition-colors hover:bg-blue-50"
            aria-label="Next question"
            onClick={() => {onQuestionToggle(1)}}
          >
            <FiChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}