"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/custom-form/input-element"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { LuEye, LuEyeClosed } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { authClient, signInWithGoogle } from "@/lib/auth-client"

const formSchema = z.object({
    email: z.string().min(5, {
        message: "Email must be at least 5 characters"
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters"
    }),
})

/* ------------------------------- */

export default function Login() {

    // const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    
    const router = useRouter() 

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    function toggleVisibility() {
        setShowPassword(prev => !prev)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/"
        }, {
            onRequest: (ctx) => {
                setLoading(true)
            },
            onSuccess: (ctx) => {
                setLoading(false)
            },
            onError: (ctx) => {
                setLoading(false)
                toast.error(ctx.error.message)
            },
        })
    }

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="py-6">
                        <CardHeader className="text-center mt-4">
                            <CardTitle className="text-xl">Login</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className="grid gap-6">
                                        <div className="grid gap-6">
                                            <div className="grid gap-3">
                                                <Label htmlFor="email">Email</Label>
                                                <InputElement
                                                    name="email"
                                                    placeholder=""
                                                    type="email"
                                                    isOptional={false}
                                                    className="font-light"
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Link
                                                        href="/forgot-password"
                                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                                    >
                                                        Forgot your password?
                                                    </Link>
                                                </div>
                                                <InputElement
                                                    name="password"
                                                    placeholder=""
                                                    type={showPassword ? "text" : "password"}
                                                    isOptional={false}
                                                    customElement={
                                                        !showPassword ? 
                                                        <LuEye className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={toggleVisibility} />
                                                        : <LuEyeClosed className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={toggleVisibility} />
                                                    }
                                                    className="font-light"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={loading === true}>
                                                {loading ? <Loader2 className="size-4 animate-spin"/> : "Login"}
                                            </Button>
                                        </div>
                                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                            <span className="bg-card text-muted-foreground relative z-10 px-2">
                                                or
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path
                                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                    fill="currentColor"
                                                />
                                                </svg>
                                                Login with Google
                                            </Button>
                                        </div>
                                        <div className="text-center font-light text-sm">
                                            Don&apos;t have an account?{" "}
                                            <Link href="/register" className="underline font-normal underline-offset-4">
                                                Register
                                            </Link>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}