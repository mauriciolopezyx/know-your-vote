// import { mutationOptions } from "@tanstack/react-query"
// import { FLASK_SERVER } from "@/lib/flask"

// export const createAssessmentMutationOptions = () => {
//     return mutationOptions({
//         mutationFn: async () => {
//             const response = await fetch(`${FLASK_SERVER}/assess`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             })
//             if (!response.ok) {
//                 const payload = await response.text()
//                 throw new Error(payload)
//             }
//             return response
//         }
//     })
// }