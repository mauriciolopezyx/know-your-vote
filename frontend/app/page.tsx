import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function Home() {

  // if their session exists, access their id with session.user.id
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // TODO:

  return (
    <p className="font-light">This is home page</p>
  )
}