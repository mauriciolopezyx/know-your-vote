"use client"

import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import ThemeDropdown from "./theme-dropdown"
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuItem, 
    DropdownMenuContent
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { IoMdPerson } from "react-icons/io"
import { BiSolidWrench } from "react-icons/bi"
import { BiSolidDoorOpen } from "react-icons/bi"

export default function TopBar() {

    const { data:session, isPending:sessionLoading } = authClient.useSession()

    return (
        <header className="flex flex-row justify-between items-center py-4 px-10 bg-blue-500 text-white">
            <nav className="flex flex-row items-center gap-x-8">
                <Link href="/" className="text-xl font-bold">KnowYourVote</Link>
                <ul className="flex flex-row gap-x-5 font-normal">
                    <Link href="/">Home</Link>
                    <Link href="/assessment">Assessment</Link>
                    <Link href="/roadmap">Roadmap</Link>
                    <Link href="/">News</Link>
                    <Link href="/account">Account</Link>
                </ul>
            </nav>
            <div className="flex flex-row gap-x-4">
                <ThemeDropdown />
                <DropdownMenu>
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
                </DropdownMenu>
            </div>
        </header>
    )
}