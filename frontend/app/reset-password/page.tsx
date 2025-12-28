"use client"

import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import InputElement from "@/components/custom-form/input-element"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { LuEye, LuEyeClosed } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
    old: z.string(),
    new: z.string().min(8, {
        message: "New password must be at least 8 characters"
    })
})

/* ------------------------------- */

export default function ResetPassword() {

  const { data:session, isPending:sessionLoading } = authClient.useSession()
  const searchParams = useSearchParams()
  
  if (sessionLoading || !window) {
    return (
      <Loader2 className="size-4 animate-spin"/>
    )
  }

  const token = new URLSearchParams(window.location.search).get("token")
  const fromForgotPassword = searchParams.get("forgot") === "true"

  if (fromForgotPassword && !token) {
    return (
      <div>
        <p>Token is missing, please close this tab and retry the verification process</p>
      </div>
    )
  }
  if (fromForgotPassword && session) {
    return (
      <div>
        <p>You're already authenticated</p>
      </div>
    )
  }
  if (!session && !fromForgotPassword) {
    return (
      <div>
        <p>Unauthorized</p>
      </div>
    ) 
  }

  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)

  const conditionalTitle = !fromForgotPassword ? "Enter your current and newly chosen password:" : "Create your new password below:"

  const [showOldPassword, setShowOldPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  function toggleOldVisibility() {
    setShowOldPassword(prev => !prev)
  }
  function toggleNewVisibility() {
    setShowNewPassword(prev => !prev)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      old: "",
      new: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token && fromForgotPassword) return
    if (fromForgotPassword) {
      await authClient.resetPassword({
        newPassword: values.new,
        token: token as string
      }, {
        onRequest: (ctx) => {
          setLoading(true)
        },
        onSuccess: (ctx) => {
          setLoading(false)
          router.replace("/login")
          toast.success("Successfully reset your password! Please log in")
        },
        onError: (ctx) => {
          setLoading(false)
          toast.error(ctx.error.message)
        },
      })
      return
    }
    await authClient.changePassword({
      newPassword: values.new,
      currentPassword: values.old,
      revokeOtherSessions: true,
    }, {
      onRequest: (ctx) => {
        setLoading(true)
      },
      onSuccess: (ctx) => {
        setLoading(false)
        router.replace("/")
        toast.success("Successfully reset your password!")
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
              <CardTitle className="text-xl">Reset Password</CardTitle>
              <CardDescription>{conditionalTitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="grid gap-6">
                      { !fromForgotPassword ? <div className="grid gap-3">
                        <Label htmlFor="old">Old Password</Label>
                        <InputElement
                          name="old"
                          placeholder=""
                          type={showOldPassword ? "text" : "password"}
                          isOptional={false}
                          customElement={!showOldPassword ? <LuEye className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleOldVisibility} />
                          : <LuEyeClosed className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleOldVisibility} />}
                        />
                      </div> : null }
                      <div className="grid gap-3">
                        <Label htmlFor="new">New Password</Label>
                        <InputElement
                          name="new"
                          placeholder=""
                          type={showNewPassword ? "text" : "password"}
                          isOptional={false}
                          customElement={!showNewPassword ? <LuEye className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleNewVisibility} />
                          : <LuEyeClosed className="absolute right-5 top-3/10 cursor-pointer" onClick={toggleNewVisibility} />}
                        />
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
