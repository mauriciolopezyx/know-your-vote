import React, { Suspense } from "react"

export default function VerifyLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <Suspense>
            {children}
        </Suspense>
    )
}