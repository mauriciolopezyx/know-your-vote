import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    // no need to specify server url since it's the same
})

export const signInWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google"
    })
}

export type Session = typeof authClient.$Infer.Session