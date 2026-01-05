import { mutationOptions } from "@tanstack/react-query"
import { FLASK_SERVER } from "@/lib/flask"
import { Session } from "@/lib/auth-client"

export const createAssessmentMutationOptions = (canSubmit: boolean, session: any & Session, responses: string[], onSuccessHandler?: (result: any) => any) => {
    return mutationOptions({
        mutationFn: async () => {
            if (!canSubmit || !session) return
            const formattedResponses = responses.map((res, i) => {
                return {"question_id": i+1, "response_text": res}
            })
            const response = await fetch(`${FLASK_SERVER}/assess`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                "user_id": session.user.id,
                "responses": formattedResponses
                })
            })
            if (!response.ok) {
                const payload = await response.text()
                throw new Error(payload)
            }
            return await response.json()
        },
        onSuccess: (res) => {
            if (onSuccessHandler) {
                onSuccessHandler(res)
            }
        }
    })
}