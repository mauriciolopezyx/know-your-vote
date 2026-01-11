import { auth } from "@/lib/auth"
import { hasCompletedAssessment, getUserLessonRoadmap, isPromiseFulfilled } from "@/lib/server-queries"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Roadmap from "@/components/roadmap/roadmap"
import { LessonRoadmap } from "@/types/queries"

export default async function RoadmapPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    const promises: Promise<any>[] = [getUserLessonRoadmap(session.user.id), hasCompletedAssessment(session.user.id)]
    const results = await Promise.allSettled(promises)

    if (!results.every(isPromiseFulfilled)) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-8 flex justify-center items-center">
                <p>Failed to retrieve roadmap: Does not exist</p>
            </div>
        )
    }

    return (
        <Roadmap 
            roadmap={results[0].value}
            hasCompletedAssessment={results[1].value}
        />
    )
}