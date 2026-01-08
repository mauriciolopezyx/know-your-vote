import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface CongressMember {
  bioguideId: string
  name: string
  state: string
  district?: number | null
  partyName: string
  depiction?: {
    imageUrl: string
    attribution: string
  }
  terms: {
    item: Array<{
      chamber: string
      startYear: number
    }>
  }
  url: string
}

interface DetailedMember {
  bioguideId: string
  firstName: string
  lastName: string
  middleName?: string
  directOrderName: string
  honorificName?: string
  state: string
  district?: number
  partyHistory: Array<{
    partyName: string
    startYear: number
  }>
  terms: Array<{
    chamber: string
    startYear: number
    endYear?: number
    stateCode: string
  }>
  addressInformation?: {
    officeAddress: string
    phoneNumber: string
  }
  officialWebsiteUrl?: string
  depiction?: {
    imageUrl: string
    attribution: string
  }
  birthYear?: string
  currentMember: boolean
  updateDate: string
}

async function fetchAllMembers(): Promise<CongressMember[]> {
  const members: CongressMember[] = []
  let offset = 0
  const limit = 250
  let hasMore = true

  console.log("Fetching all current members from Congress.gov API...")

  while (hasMore) {
    const url = `https://api.congress.gov/v3/member/congress/119?api_key=${CONGRESS_API_KEY}&format=json&offset=${offset}&limit=${limit}&currentMember=true`
    
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      members.push(...data.members)

      console.log(`Fetched ${members.length} of ${data.pagination.count} members...`)

      if (data.pagination.next) {
        offset += limit
      } else {
        hasMore = false
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error fetching members at offset ${offset}:`, error)
      throw error
    }
  }

  return members
}

async function fetchDetailedMember(bioguideId: string): Promise<DetailedMember | null> {
  const url = `https://api.congress.gov/v3/member/${bioguideId}?api_key=${CONGRESS_API_KEY}&format=json`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`Failed to fetch details for ${bioguideId}: ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data.member
  } catch (error) {
    console.error(`Error fetching details for ${bioguideId}:`, error)
    return null
  }
}

function transformMemberData(basic: CongressMember, detailed: DetailedMember | null) {
  const currentTerm = basic.terms.item[0]
  const chamber = currentTerm.chamber
  
  const allTerms = detailed?.terms || []
  const firstTermStart = allTerms.length > 0 
    ? Math.min(...allTerms.map(t => t.startYear))
    : currentTerm.startYear

  return {
    bioguide_id: basic.bioguideId,
    first_name: detailed?.firstName || basic.name.split(", ")[1]?.split(" ")[0] || "",
    last_name: detailed?.lastName || basic.name.split(", ")[0] || "",
    middle_name: detailed?.middleName || null,
    full_name: detailed?.directOrderName || basic.name,
    honorific: detailed?.honorificName || null,
    chamber: chamber,
    state: basic.state,
    state_code: detailed?.terms[0]?.stateCode || basic.state.substring(0, 2).toUpperCase(),
    district: basic.district || null,
    party: basic.partyName,
    office_address: detailed?.addressInformation?.officeAddress || null,
    phone_number: detailed?.addressInformation?.phoneNumber || null,
    official_website: detailed?.officialWebsiteUrl || null,
    image_url: basic.depiction?.imageUrl || null,
    image_attribution: basic.depiction?.attribution || null,
    birth_year: detailed?.birthYear || null,
    current_member: detailed?.currentMember ?? true,
    first_term_start: firstTermStart,
    current_term_start: currentTerm.startYear,
    congress_api_updated_at: detailed?.updateDate || new Date().toISOString()
  }
}

async function seedDatabase() {
  console.log("Starting federal officials seeding process...")

  const allMembers = await fetchAllMembers()
  
  const houseSenateMembers = allMembers.filter(member => {
    const chamber = member.terms.item[0].chamber
    return chamber === "House of Representatives" || chamber === "Senate"
  })

  console.log(`\nFiltered to ${houseSenateMembers.length} House and Senate members`)
  console.log(`Senate: ${houseSenateMembers.filter(m => m.terms.item[0].chamber === "Senate").length}`)
  console.log(`House: ${houseSenateMembers.filter(m => m.terms.item[0].chamber === "House of Representatives").length}`)

  const officialsToInsert = []

  console.log("\nFetching detailed information for each member...")
  for (let i = 0; i < houseSenateMembers.length; i++) {
    const member = houseSenateMembers[i]
    console.log(`[${i + 1}/${houseSenateMembers.length}] Fetching ${member.name}...`)
    
    const detailed = await fetchDetailedMember(member.bioguideId)
    const transformed = transformMemberData(member, detailed)
    officialsToInsert.push(transformed)

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log("\nInserting officials into database...")
  const { data, error } = await supabase
    .from("federal_officials")
    .upsert(officialsToInsert, {
      onConflict: "bioguide_id",
      ignoreDuplicates: false
    })

  if (error) {
    console.error("Error inserting officials:", error)
    throw error
  }

  const senators = officialsToInsert.filter(o => o.chamber === "Senate").length
  const representatives = officialsToInsert.filter(o => o.chamber === "House of Representatives").length
  
  console.log(`\nSummary:`)
  console.log(`- Senators: ${senators}`)
  console.log(`- Representatives: ${representatives}`)
  console.log(`- Total: ${officialsToInsert.length}`)
}

seedDatabase()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    process.exit(1)
  })