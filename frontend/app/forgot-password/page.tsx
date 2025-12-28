"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/custom-form/input-element"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useState } from "react"

const formSchema = z.object({
    email: z.string().min(5, {
        message: "Email must be at least 5 characters"
    })
})

/* ------------------------------- */

export default function ForgotPassword() {

  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "http://localhost:3000/reset-password?forgot=true",
    }, {
      onRequest: (ctx) => {
        setLoading(true)
      },
      onSuccess: (ctx) => {
        setLoading(false)
        toast.message("Successfully sent verification email!")
        router.replace("/verify")
      },
      onError: (ctx) => {
        setLoading(false)
        toast.error(ctx.error.message)
      },
    })
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center mt-4">
              <CardTitle className="text-xl">Forgot Password</CardTitle>
              <CardDescription>Enter your email to receive a verification link to reset your password:</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    </div>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <div className="w-full relative">
                          <InputElement
                            name="email"
                            placeholder=""
                            type="email"
                            isOptional={false}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading === true}>
                        {loading ? <Loader2 className="size-4 animate-spin"/> : "Confirm"}
                      </Button>
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