import { createClient } from "./supabase-server"
import { LessonRoadmap, Lesson, LessonContent, AssessmentQuestion, LessonQuizQuestion, BillWithSponsorship, CongressSponsoredBill, CongressBillDetail } from "@/types/queries"
import { Official } from "@/hooks/query-options"

export function isPromiseFulfilled<T>(res: PromiseSettledResult<T>): res is PromiseFulfilledResult<T> {
  return res.status === "fulfilled"
}

export async function getLessonQuiz(lessonId: number): Promise<LessonQuizQuestion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("lesson_quiz_questions")
        .select('*')
        .eq("lesson_id", lessonId)
        .order("question_order")

    if (error) {
        throw new Error(error.message)
    }

    return data as LessonQuizQuestion[]
}

export async function getAssessment(): Promise<AssessmentQuestion[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .order("question_order", { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data as AssessmentQuestion[]
}

export async function getLessonContent(lessonId: number): Promise<LessonContent> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("lesson_cards")
        .select(`*, card_citations (*), lessons (id, title, description, lesson_order)`)
        .eq("lesson_id", lessonId)
        .order("card_order")

    if (error) {
        throw new Error(error.message)
    }

    const lessonData = data && data.length > 0 ? data[0].lessons : null

    const response = {
        lesson: lessonData,
        cards: data?.map(card => {
            const { lessons, ...cardData } = card
            return cardData
        }) || []
    }

    return response as LessonContent
}

export async function hasCompletedAssessment(userId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("user_assessments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return !!data
}

export async function getUserLessonRoadmap(userId: string): Promise<LessonRoadmap> {
    const supabase = await createClient()
    const { data: assignments, error: assignmentError } = await supabase
        .from("user_lesson_assignments")
        .select(`
            assignment_reason,
            assigned_at,
            lesson_id,
            lessons (
            id,
            title,
            description,
            lesson_order,
            tier,
            target_domains,
            lesson_cards (
                card_type
            )
            )
        `)
        .eq("user_id", userId)
        .order("lessons(lesson_order)", { ascending: true })

    if (assignmentError) {
        throw new Error(assignmentError.message)
    }

    const { data: progressRecords, error: progressError } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, status, quiz_score, quiz_attempts, completed_at")
        .eq("user_id", userId)

    if (progressError) {
        throw new Error(progressError.message)
    }

    const progressMap = new Map(
        progressRecords?.map(p => [p.lesson_id, p]) || []
    )

    const roadmap: LessonRoadmap = {
        core: [],
        targeted: [],
        optional: []
    }

    assignments?.forEach((assignment: any) => {
        const lesson = assignment.lessons
        const progress = progressMap.get(assignment.lesson_id)

        if (!progress) return

        const sublessons = lesson.lesson_cards?.filter(
            (card: any) => card.card_type === "text"
        ).length || 0

        const lessonWithProgress: Lesson = {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            lesson_order: lesson.lesson_order,
            tier: lesson.tier,
            target_domains: lesson.target_domains || [],
            assignment_reason: assignment.assignment_reason,
            assigned_at: assignment.assigned_at,
            status: progress.status || "not_started",
            quiz_score: progress.quiz_score || null,
            quiz_attempts: progress.quiz_attempts || null,
            completed_at: progress.completed_at || null,
            sublessons: sublessons
        }

        if (lesson.tier === "core") {
            roadmap.core.push(lessonWithProgress)
        } else if (lesson.tier === "targeted") {
            roadmap.targeted.push(lessonWithProgress)
        } else if (lesson.tier === "optional") {
            roadmap.optional.push(lessonWithProgress)
        }
    })

    return roadmap
}

export async function getCongressionalMemberInfo(bioguideId: string): Promise<Official> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("federal_officials")
        .select("*")
        .eq("bioguide_id", bioguideId)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as Official
}

//

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY!

export async function getOfficialSponsoredBills(bioguideId: string): Promise<BillWithSponsorship[]> {
    const supabase = await createClient()
    const { data: existingBills, error: existingError } = await supabase
        .from("bill_sponsorships")
        .select(`
            sponsored_date,
            is_primary_sponsor,
            bills!inner (
            id,
            congress,
            bill_type,
            bill_number,
            title,
            summary,
            latest_action_date,
            latest_action_text,
            introduced_date,
            congress_api_url,
            congress_gov_url,
            created_at,
            updated_at
            )
        `)
        .eq("bioguide_id", bioguideId)
        .eq("is_primary_sponsor", true)
        .order("bills(introduced_date)", { ascending: false })

    if (existingError) {
        throw new Error(existingError.message)
    }

    if (existingBills && existingBills.length > 0) {
        const typedExistingBills: any = existingBills
        const mostRecentUpdate = new Date(typedExistingBills[0].bills.updated_at)
        const daysSinceUpdate = (Date.now() - mostRecentUpdate.getTime()) / (1000 * 60 * 60 * 24)

        if (daysSinceUpdate <= 30) {
            return typedExistingBills.map((item: any) => ({
            ...item.bills,
            sponsored_date: item.sponsored_date,
            is_primary_sponsor: item.is_primary_sponsor
            }))
        }
    }

    // Fetch fresh data from Congress.gov API
    const sponsoredBills = await fetchSponsoredBillsFromAPI(bioguideId)

    if (sponsoredBills.length === 0) {
        return []
    }

    // Fetch detailed info for each bill and store in database
    const billsToReturn: BillWithSponsorship[] = []

    for (const sponsoredBill of sponsoredBills) {
        try {
            const billDetail = await fetchBillDetail(sponsoredBill.url)
            
            if (!billDetail) continue

            // Upsert bill into database
            const { data: insertedBill, error: billError } = await supabase
            .from("bills")
            .upsert({
                congress: billDetail.congress,
                bill_type: billDetail.type.toLowerCase(),
                bill_number: billDetail.number,
                title: billDetail.title,
                summary: billDetail.summaries?.[0]?.text || null,
                latest_action_date: billDetail.latestAction?.actionDate || null,
                latest_action_text: billDetail.latestAction?.text || null,
                introduced_date: billDetail.introducedDate || null,
                congress_api_url: sponsoredBill.url,
                congress_gov_url: `https://www.congress.gov/bill/${billDetail.congress}th-congress/${
                billDetail.type === "S" ? "senate-bill" : "house-bill"
                }/${billDetail.number}`,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "congress,bill_type,bill_number",
                ignoreDuplicates: false
            })
            .select()
            .single()

            if (billError) {
            console.error(`Error upserting bill ${billDetail.congress}-${billDetail.type}-${billDetail.number}:`, billError)
            continue
            }

            // Create sponsorship record
            const { error: sponsorshipError } = await supabase
            .from("bill_sponsorships")
            .upsert({
                bill_id: insertedBill.id,
                bioguide_id: bioguideId,
                is_primary_sponsor: true,
                sponsored_date: billDetail.introducedDate || null
            }, {
                onConflict: "bill_id,bioguide_id",
                ignoreDuplicates: true
            })

            if (sponsorshipError) {
            console.error(`Error creating sponsorship:`, sponsorshipError)
            }

            billsToReturn.push({
            ...insertedBill,
            sponsored_date: billDetail.introducedDate || null,
            is_primary_sponsor: true
            })

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
            console.error(`Error processing bill:`, error)
            continue
        }
    }

    return billsToReturn
}

async function fetchSponsoredBillsFromAPI(bioguideId: string): Promise<CongressSponsoredBill[]> {
    const url = `https://api.congress.gov/v3/member/${bioguideId}/sponsored-legislation?api_key=${CONGRESS_API_KEY}&format=json&limit=250`
  
    try {
        const response = await fetch(url, { next: { revalidate: 0 } })

        if (!response.ok) {
            throw new Error(`Congress API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.sponsoredLegislation || []
    } catch (error) {
        console.error(`Error fetching sponsored bills for ${bioguideId}:`, error)
        return []
    }
}

async function fetchBillDetail(billUrl: string): Promise<CongressBillDetail | null> {
    const urlWithKey = `${billUrl}${billUrl.includes("?") ? "&" : "?"}api_key=${CONGRESS_API_KEY}&format=json`

    try {
        const response = await fetch(urlWithKey, { next: { revalidate: 0 } })

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.bill
    } catch (error) {
        console.error(`Error fetching bill detail from ${billUrl}:`, error)
        return null
    }
}