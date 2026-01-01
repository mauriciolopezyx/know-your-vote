import { Button } from "@/components/ui/button"
import { signOutAction } from "../actions/auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Link from "next/link"

export default async function Account() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  // if their session exists, access their id with session.user.id


  return (
    <div className="bg-muted grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <p>Welcome to KnowYourVote</p>
      {session ? <Button onClick={signOutAction} size="lg">Logout</Button> : <p>Not signed in yet</p>}
      {session ? <Link href="reset-password" className="underline">Reset your password</Link> : null}
      {session ? <p>{session.user.id}</p> : null}
  
      <table className="border-black border border-spacing-1 border-separate">
        <thead className="border-black border">
          <tr>
            <th className="border border-black" rowSpan={2}>Heading</th>
            <th className="border border-black">Students</th>
            <th  className="border border-black" colSpan={3}>Details</th>
          </tr>
          <tr>
            <th className="border border-black px-10">Id</th>
            <th className="border border-black px-4">Name</th>
            <th className="border border-black px-8">Department</th>
            <th className="border border-black px-8">Roll Number</th>
          </tr>
        </thead>
        <tbody className="text-center">
          <tr>
            <th className="border border-black px-4" rowSpan={4}>Student List</th>
            <td className="border border-black">1</td>
            <td className="border border-black">Victor</td>
            <td className="border border-black">Computer Science</td>
            <td className="border border-black">12345</td>
          </tr>
          <tr>
            <td className="border border-black">1</td>
            <td className="border border-black">Victor</td>
            <td className="border border-black">Computer Science</td>
            <td className="border border-black">12345</td>
          </tr>
          <tr>
            <td className="border border-black">1</td>
            <td className="border border-black">Victor</td>
            <td className="border border-black">Computer Science</td>
            <td className="border border-black">12345</td>
          </tr>
          <tr>
            <td className="border border-black">1</td>
            <td className="border border-black">Victor</td>
            <td className="border border-black">Computer Science</td>
            <td className="border border-black">12345</td>
          </tr>
        </tbody>
      </table>

    </div>
  )
}