"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { createAssessmentQuestionQueryOptions } from "@/hooks/query-options"
import { useQuery } from "@tanstack/react-query"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

export default function AssessmentPage() {

  const {data:assessment, isPending:assessmentLoading, error:assessmentError} = useQuery(createAssessmentQuestionQueryOptions())

  if (assessmentLoading) {
    return (
      <p>Assessment loading</p>
    )
  }

  if (assessmentError) {
    return (
      <p>Error loading assessment: {assessmentError?.message}</p>
    )
  }
  
  console.log("test:", assessment)

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-500">Assessment</h1>
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <Progress value={40} className="w-full max-w-2xl [&>div]:bg-red-500" />
          <Button size="lg" className="bg-blue-500 text-white text-xl hover:bg-blue-600">Submit</Button>
        </div>

        <div className="mb-6 flex items-start gap-4">
          <span className="text-4xl font-bold text-blue-500">3</span>
          <p className="pt-2 text-lg text-foreground">
            What are the key differences between supervised and unsupervised learning in machine learning?
          </p>
        </div>
        
        <div className="mb-2 text-xl">
          <Textarea
            placeholder="Enter your response here..."
            className="resize-none w-full border-2 border-blue-500 p-4 text-lg font-light focus-visible:ring-blue-500 text-left"
          />
        </div>

        <div className="flex flex-row justify-between items-center mb-12">
            <p className="text-sm font-light text-muted-foreground">25-500 characters</p>
            <p className="text-sm font-light text-muted-foreground">121 characters</p>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 transition-colors hover:bg-blue-50"
            aria-label="Previous question"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 transition-colors hover:bg-blue-50"
            aria-label="Next question"
          >
            <FiChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}