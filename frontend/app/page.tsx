import { Button } from "@/components/ui/button"
import { signOutAction } from "./actions/auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Link from "next/link"

export default async function Home() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  // if their session exists, access their id with session.user.id

  return (
     <div className="bg-muted grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <p>Welcome to KnowYourVote</p>
      {session ? <Button onClick={signOutAction} size="lg">Logout</Button> : <p>Not signed in yet</p>}
      {session ? <Link href="reset-password" className="underline">Reset your password</Link> : null}
    </div>
  )
}