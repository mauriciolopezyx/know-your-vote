import { Button } from "@/components/ui/button"
import { signOutAction } from "../../actions/auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AccountPage() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>

        <div className="bg-muted border border-gray-200 dark:border-none rounded-lg p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground font-bold mb-2">Email Address</label>
              <div className="bg-background rounded-md p-3">{session.user.email}</div>
            </div>
          </div>
        </div>

        <div className="bg-muted border border-gray-200 dark:border-none rounded-lg p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Account Actions</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="reset-password" className="flex-1">
                <button
                    className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Reset your password"
                >
                Reset Password
                </button>
            </Link>

            <button
              onClick={signOutAction}
              className="cursor-pointer flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Logout of your account"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
