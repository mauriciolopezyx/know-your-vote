"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createRandomString } from "@/utils/better-auth"

type FormData = {
    email: string,
    password: string
}

// these are for server actions only, we need interactivity so we'll use auth-cleint

export async function signUpAction(formData: FormData) {
    await auth.api.signUpEmail({
        body: {
            name: createRandomString(15),
            email: formData.email,
            password: formData.password
        }
    })
    redirect("/")
}

export async function signInAction(formData: FormData) {
    await auth.api.signInEmail({
        body: {
            email: formData.email,
            password: formData.password
        }
    })
    redirect("/")
}

export async function signOutAction() {
    await auth.api.signOut({
        headers: await headers()
    })
    redirect("/")
}