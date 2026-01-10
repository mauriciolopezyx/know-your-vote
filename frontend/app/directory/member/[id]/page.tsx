import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getCongressionalMemberInfo, getOfficialSponsoredBills, isPromiseFulfilled } from "@/lib/server-queries"
import DirectoryMemberDetail from "@/components/directory/directory-member-detail"

export default async function DirectoryMemberPage({ params }: { params: {id: string} }) {

  const { id:bioguideId } = await params
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login")
  }
  
  const promises: Promise<any>[] = [getCongressionalMemberInfo(bioguideId), getOfficialSponsoredBills(bioguideId)]
  const results = await Promise.allSettled(promises)

  if (!results.every(isPromiseFulfilled)) {
    return (
      <div className="min-h-screen bg-muted p-6 md:p-8 flex justify-center items-center">
        <p>Failed to retrieve congressional member: Does not exist</p>
        {results.map(res => {
          return (
            <p>{res.status}</p>
          )
        })}
      </div>
    )
  }

  return (
    <DirectoryMemberDetail
      member={results[0].value}
      sponsoredBills={results[1].value}
    />
  )
}
