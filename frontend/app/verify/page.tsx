"use client"

import { useSearchParams } from "next/navigation"

export default function Verify() {

    const searchParams = useSearchParams()
    const situation = Number(searchParams.get("s"))
    const chosenText = (situation === 1) ? "Check your inbox in order to verify your email address!" : "Check your inbox in order to reset your password"

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
            <p>{chosenText}</p>
            </div>
        </div>
    )
}