import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getAssessment, hasCompletedAssessment } from "@/lib/server-queries"
import Assessment from "@/components/assessment/assessment"

export default async function AssessmentPage() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login")
  }

  const [hasCompleted, assessment] = await Promise.all([
    hasCompletedAssessment(session.user.id),
    getAssessment()
  ])

  if (hasCompleted) {
    redirect("/roadmap")
  }

  return (
    <Assessment
      assessment={assessment}
    />
  )
}