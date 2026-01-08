import { auth } from "@/lib/auth"
import { hasCompletedAssessment, getUserLessonRoadmap } from "@/lib/server-queries"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Roadmap from "@/components/roadmap/roadmap"

export default async function RoadmapPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    const [hasCompleted, roadmap] = await Promise.all([
        hasCompletedAssessment(session.user.id),
        getUserLessonRoadmap(session.user.id)
    ])

    return (
        <Roadmap 
            roadmap={roadmap}
            hasCompletedAssessment={hasCompleted}
        />
    )
}