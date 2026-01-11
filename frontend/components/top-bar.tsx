import Link from "next/link"
import ThemeDropdown from "./theme-dropdown"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { hasCompletedAssessment, isPromiseFulfilled } from "@/lib/server-queries"
// import { authClient } from "@/lib/auth-client"
// import { 
//     DropdownMenu, 
//     DropdownMenuTrigger, 
//     DropdownMenuItem, 
//     DropdownMenuContent
// } from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"
// import { Loader2 } from "lucide-react"
// import { IoMdPerson } from "react-icons/io"
// import { BiSolidWrench } from "react-icons/bi"
// import { BiSolidDoorOpen } from "react-icons/bi"

export default async function TopBar() {

    // const { data:session, isPending:sessionLoading } = authClient.useSession()

    const session = await auth.api.getSession({
        headers: await headers()
    })

    const promises: Promise<any>[] | boolean = session ? [hasCompletedAssessment(session.user.id)] : []
    const results = session ? await Promise.allSettled(promises) : []

    if (results.length === 0 || !results.every(isPromiseFulfilled)) {
        return (
            <header className="flex flex-row justify-between items-center py-4 px-10 bg-blue-500 text-white">
                <nav className="flex flex-row items-center gap-x-8">
                    <Link href="/" className="text-xl font-bold">KnowYourVote</Link>
                    <ul className="flex flex-row gap-x-5 font-normal">
                        {session ? <Link href="/assessment">Assessment</Link> : null}
                        {session ? <Link href="/roadmap">Roadmap</Link> : null}
                        {session ? <Link href="/directory">Directory</Link>  : null}
                        {session ? <Link href="/account">Account</Link> : null}
                    </ul>
                </nav>
                <div className="flex flex-row gap-x-4">
                    <ThemeDropdown />
                </div>
            </header>
        )
    }

    return (
        <header className="flex flex-row justify-between items-center py-4 px-10 bg-blue-500 text-white">
            <nav className="flex flex-row items-center gap-x-8">
                <Link href="/" className="text-xl font-bold">KnowYourVote</Link>
                <ul className="flex flex-row gap-x-5 font-normal">
                    {results[0].value === false ? <Link href="/assessment">Assessment</Link> : null}
                    <Link href="/roadmap">Roadmap</Link>
                    <Link href="/directory">Directory</Link>
                    <Link href="/account">Account</Link>
                </ul>
            </nav>
            <div className="flex flex-row gap-x-4">
                <ThemeDropdown />
                {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <IoMdPerson className="rounded-full fill-black dark:fill-white"/>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {sessionLoading ? <Loader2 className="size-4 mx-auto my-8 animate-spin"/> :
                        session ?
                        <>
                            <DropdownMenuItem>
                                <Link href="/reset-password" className="flex flex-row gap-x-3 font-medium">
                                    <BiSolidWrench className="h-full fill-black dark:fill-white" />
                                    <span>Reset Password</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                        :
                        <>
                            <DropdownMenuItem>
                                <Link href="/login" className="flex flex-row gap-x-3 font-medium">
                                    <BiSolidDoorOpen className="h-full fill-black dark:fill-white" />
                                    <span>Login to continue</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                        }
                    </DropdownMenuContent>
                </DropdownMenu> */}
            </div>
        </header>
    )
}