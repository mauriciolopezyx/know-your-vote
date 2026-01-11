import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Link from "next/link"

export default async function Home() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return (
      <div className="min-h-screen bg-background from-slate-50 to-white">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            On-ramp your Political Understanding
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed mb-10">
            Empower yourself with comprehensive lessons on government, elections, and civic engagement. Our adaptive
            learning platform helps you build essential knowledge through personalized pathways, guiding you to understand today's political landscape.
          </p>
          <Link href="/assessment" className="flex-1">
            <button
              className="cursor-pointer px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
              aria-label="Reset your password"
            >
            Start Learning
            </button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg border-2 border-blue-200 shadow-md dark:bg-muted">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Core Curriculum</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Essential lessons covering government structure, elections, and lawmaking processes that every citizen
                should understand.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg border-2 border-purple-200 shadow-md dark:bg-muted">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Targeted Learning</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Personalized lessons that fill knowledge gaps and strengthen areas where you need the most support.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg border-2 border-green-200 shadow-md dark:bg-muted">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold  mb-3">Track Progress</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Monitor your learning journey with detailed progress tracking and visual roadmaps of completed lessons.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold mb-2">Get Your Roadmap</h4>
              <p className="text-sm font-light text-muted-foreground">Receive a personalized learning path tailored to your needs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold mb-2">Learn at Your Pace</h4>
              <p className="text-sm font-light text-muted-foreground">Work through lessons with interactive content and quizzes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold mb-2">Track Success</h4>
              <p className="text-sm font-light text-muted-foreground">Monitor your progress and celebrate milestones</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold mb-2">Stay Informed</h4>
              <p className="text-sm font-light text-muted-foreground">Apply your knowledge to be an engaged, informed citizen</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col justify-center items-center">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Work In Progress</h1>
        </div>
      </div>
    </div>
  )
}