"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiGlobe,
  FiMail,
  FiArrowLeft,
  FiUser,
  FiCheckCircle,
  FiCircle,
} from "react-icons/fi"
import Image from "next/image"
import Link from "next/link"
import { Official } from "@/hooks/query-options"
import { BillWithSponsorship } from "@/types/queries"
import { truncateDescription } from "../roadmap/roadmap"

const BILL_TYPE_COLORS: Record<string, [string, string]> = {
  "hr": ["text-blue-600", "dark:text-blue-400"],
  "s": ["text-red-600", "dark:text-red-400"],
  "hjres": ["text-purple-600", "dark:text-purple-400"],
  "sjres": ["text-pink-600", "dark:text-pink-400"],
  "hconres": ["text-green-600", "dark:text-green-400"],
  "sconres": ["text-orange-600", "dark:text-orange-400"],
  "hres": ["text-cyan-600", "dark:text-cyan-400"],
  "sres": ["text-yellow-600", "dark:text-yellow-400"]
}

const BILL_TYPE_BG_COLORS: Record<string, [string, string]> = {
  "hr": ["bg-blue-600", "dark:bg-blue-400"],
  "s": ["bg-red-600", "dark:bg-red-400"],
  "hjres": ["bg-purple-600", "dark:bg-purple-400"],
  "sjres": ["bg-pink-600", "dark:bg-pink-400"],
  "hconres": ["bg-green-600", "dark:bg-green-400"],
  "sconres": ["bg-orange-600", "dark:bg-orange-400"],
  "hres": ["bg-cyan-600", "dark:bg-cyan-400"],
  "sres": ["bg-yellow-600", "dark:bg-yellow-400"]
}

const BILL_TYPE_NAMES: Record<string, string> = {
  "hr": "House Bill",
  "s": "Senate Bill",
  "hjres": "House Joint Resolution",
  "sjres": "Senate Joint Resolution",
  "hconres": "House Concurrent Resolution",
  "sconres": "Senate Concurrent Resolution",
  "hres": "House Resolution",
  "sres": "Senate Resolution"
}

export default function DirectoryMemberDetail({member, sponsoredBills}: {member: Official, sponsoredBills: BillWithSponsorship[]}) {
  
  const [isFollowing, setIsFollowing] = useState(false)
  const getPartyColor = (party: string) => {
    if (party === "Democratic") return "bg-blue-500 dark:bg-blue-600"
    if (party === "Republican") return "bg-red-500 dark:bg-red-600"
    return "bg-gray-500 dark:bg-gray-600"
  }
  const getPartyTextColor = (party: string) => {
    if (party === "Democratic") return "text-blue-600 dark:text-blue-400"
    if (party === "Republican") return "text-red-600 dark:text-red-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)
  }

  const yearsInOffice = new Date().getFullYear() - member.first_term_start
  const age = member.birth_year ? new Date().getFullYear() - Number.parseInt(member.birth_year) : "Unknown"

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <Link href="/directory">
            <Button variant="ghost" className="gap-2 -ml-2">
              <FiArrowLeft className="w-4 h-4" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Profile Card */}
        <Card className="overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-80 aspect-square md:aspect-auto">
                <Image
                  src={member.image_url || "/placeholder.svg"}
                  alt={`Portrait of ${member.full_name}`}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Party Badge */}
                <div
                  className={`absolute top-4 right-4 ${getPartyColor(
                    member.party,
                  )} text-white px-4 py-2 rounded-full text-sm font-bold`}
                >
                  {member.party}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 p-6 md:p-8 space-y-6">
                {/* Header with Name and Follow Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{member.honorific}</div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{member.full_name}</h1>
                    <p className={`text-lg font-bold ${getPartyTextColor(member.party)}`}>
                      {member.party} • {member.chamber}
                    </p>
                  </div>

                  <Button
                    onClick={handleFollowToggle}
                    className={`gap-2 ${
                      isFollowing ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700" : ""
                    }`}
                    variant={isFollowing ? "default" : "outline"}
                  >
                    {isFollowing ? (
                      <>
                        <FiCheckCircle className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <FiCircle className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Badge */}
                {member.current_member && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Current Member
                  </Badge>
                )}

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Bioguide ID</div>
                    <div className="text-lg font-normal text-foreground">{member.bioguide_id}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Birth Year</div>
                    <div className="text-lg font-normal text-foreground">
                      {member.birth_year} (Age {age})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Years in Office</div>
                    <div className="text-lg font-normal text-foreground">{yearsInOffice} year{yearsInOffice === 1 ? "" : "s"}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">State</div>
                    <div className="text-lg font-normal text-foreground">
                      {member.state} ({member.state_code})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FiMail className="w-6 h-6" />
              Contact Information
            </h2>

            <div className="space-y-4">
              {/* Office Address */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <FiMapPin className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Office Address</div>
                  <div className="text-foreground">{member.office_address}</div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <FiPhone className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Phone Number</div>
                  <a href={`tel:${member.phone_number}`} className="text-foreground hover:underline">
                    {member.phone_number}
                  </a>
                </div>
              </div>

              {/* Official Website */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <FiGlobe className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                <div>
                  <div className="text-sm font-bold text-muted-foreground mb-1">Official Website</div>
                  {member.official_website ?
                  <a
                    href={member.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {member.official_website}
                  </a>
                  : null}
                </div>
              </div>

              {/* District (if applicable) */}
              {member.district && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                  <FiUser className="w-5 h-5 mt-1 shrink-0 text-foreground" />
                  <div>
                    <div className="text-sm font-bold text-muted-foreground mb-1">District</div>
                    <div className="text-foreground">District {member.district}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Term Information Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FiCalendar className="w-6 h-6" />
              Term Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Term Start */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm font-bold text-muted-foreground mb-2">First Term Started</div>
                <div className="text-3xl font-normal text-foreground">{member.first_term_start}</div>
              </div>

              {/* Current Term Start */}
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm font-bold text-muted-foreground mb-2">Current Term Started</div>
                <div className="text-3xl font-normal text-foreground">{member.current_term_start}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(sponsoredBills && sponsoredBills.length > 0) ? 
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FiMail className="w-6 h-6" />
                Bills Sponsored
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {sponsoredBills.map(bill => {
                  return (
                    <div key={bill.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                      <a
                        href={bill?.congress_gov_url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${BILL_TYPE_COLORS[bill.bill_type][0]} ${BILL_TYPE_COLORS[bill.bill_type][1]} hover:underline`}
                      >
                        <span>{truncateDescription(bill.title, 40)} {bill.sponsored_date ? `(${new Date(bill.sponsored_date).getFullYear().toString()})` : ""}</span>
                      </a>
                    </div>
                  )
                })}
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bill Types</h3>
                <table className="w-full">
                  <tbody>
                    {Object.entries(BILL_TYPE_NAMES).map(([type, name]) => (
                      <tr key={type}>
                        <td className="py-1 pr-3">
                          <div className={`w-4 h-4 ${BILL_TYPE_BG_COLORS[type][0]} ${BILL_TYPE_BG_COLORS[type][1]}`} />
                        </td>
                        <td className="py-1 text-sm">{name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        : null}
      </div>
    </div>
  )
}
