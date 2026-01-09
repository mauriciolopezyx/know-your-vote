import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getAssessment, hasCompletedAssessment, isPromiseFulfilled } from "@/lib/server-queries"
import Assessment from "@/components/assessment/assessment"

export default async function AssessmentPage() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login")
  }

  const promises: Promise<any>[] = [getAssessment(), hasCompletedAssessment(session.user.id)]
  const results = await Promise.allSettled(promises)

  if (!results.every(isPromiseFulfilled)) {
    return (
      <div className="min-h-screen bg-muted p-6 md:p-8 flex justify-center items-center">
        <p>Failed to retrieve assessment: Does not exist</p>
      </div>
    )
  }

  if (results[1].value === true) {
    redirect("/roadmap")
  }

  return (
    <Assessment
      assessment={results[0].value}
    />
  )
}