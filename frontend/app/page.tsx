"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FiFilter, FiChevronLeft, FiChevronRight, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi"
import Image from "next/image"

type Official = {
  id: string
  bioguide_id: string
  first_name: string
  last_name: string
  middle_name: string
  full_name: string
  honorific: string
  chamber: string
  state: string
  state_code: string
  district: number | null
  party: string
  office_address: string
  phone_number: string
  official_website: string
  image_url: string
  image_attribution: string
  birth_year: string
  current_member: boolean
  first_term_start: number
  current_term_start: number
  congress_api_updated_at: string
  created_at: string
  updated_at: string
}

type ApiResponse = {
  officials: Official[]
  total: number
  page: number
  totalPages: number
}

// Mock data for demonstration
const mockData: ApiResponse = {
  officials: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      bioguide_id: "W000817",
      first_name: "Elizabeth",
      last_name: "Warren",
      middle_name: "A.",
      full_name: "Elizabeth A. Warren",
      honorific: "Ms.",
      chamber: "Senate",
      state: "Massachusetts",
      state_code: "MA",
      district: null,
      party: "Democratic",
      office_address: "309 Hart Senate Office Building",
      phone_number: "(202) 224-4543",
      official_website: "https://www.warren.senate.gov",
      image_url: "https://www.congress.gov/img/member/w000817_200.jpg",
      image_attribution: "Official U.S. Senate Photo",
      birth_year: "1949",
      current_member: true,
      first_term_start: 2013,
      current_term_start: 2025,
      congress_api_updated_at: "2025-01-08T10:30:00Z",
      created_at: "2025-01-08T15:20:00Z",
      updated_at: "2025-01-08T15:20:00Z",
    },
    {
      id: "660e8400-e29b-41d4-a716-446655440001",
      bioguide_id: "J000295",
      first_name: "David",
      last_name: "Joyce",
      middle_name: "P.",
      full_name: "David P. Joyce",
      honorific: "Mr.",
      chamber: "House of Representatives",
      state: "Ohio",
      state_code: "OH",
      district: 14,
      party: "Republican",
      office_address: "1124 Longworth House Office Building",
      phone_number: "(202) 225-5731",
      official_website: "https://joyce.house.gov",
      image_url: "https://www.congress.gov/img/member/j000295_200.jpg",
      image_attribution: "Image courtesy of the Member",
      birth_year: "1957",
      current_member: true,
      first_term_start: 2013,
      current_term_start: 2025,
      congress_api_updated_at: "2025-01-08T10:15:00Z",
      created_at: "2025-01-08T15:20:00Z",
      updated_at: "2025-01-08T15:20:00Z",
    },
  ],
  total: 537,
  page: 1,
  totalPages: 11,
}

export default function CongressionalDirectory() {
  const [data] = useState<ApiResponse>(mockData)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states
  const [selectedParty, setSelectedParty] = useState<string>("")
  const [selectedChamber, setSelectedChamber] = useState<string>("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")

  // Year filter states
  const [birthYear, setBirthYear] = useState<string>("")
  const [birthYearFilter, setBirthYearFilter] = useState<string>("exact")
  const [firstTermYear, setFirstTermYear] = useState<string>("")
  const [firstTermFilter, setFirstTermFilter] = useState<string>("exact")
  const [currentTermYear, setCurrentTermYear] = useState<string>("")
  const [currentTermFilter, setCurrentTermFilter] = useState<string>("exact")

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Congressional Directory</h1>
          <p className="text-muted-foreground">Browse members of the U.S. House of Representatives and Senate</p>
        </div>

        {/* Filters and Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Filter Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <FiFilter className="w-4 h-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-[600px] overflow-y-auto" align="start">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Party Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="party-filter">Political Party</Label>
                <Select value={selectedParty} onValueChange={setSelectedParty}>
                  <SelectTrigger id="party-filter">
                    <SelectValue placeholder="All Parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    <SelectItem value="democratic">Democratic</SelectItem>
                    <SelectItem value="republican">Republican</SelectItem>
                    <SelectItem value="independent">Independent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              {/* Chamber Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="chamber-filter">Chamber</Label>
                <Select value={selectedChamber} onValueChange={setSelectedChamber}>
                  <SelectTrigger id="chamber-filter">
                    <SelectValue placeholder="All Chambers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chambers</SelectItem>
                    <SelectItem value="senate">Senate</SelectItem>
                    <SelectItem value="house">House of Representatives</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              {/* State Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="state-filter">State</Label>
                <Input
                  id="state-filter"
                  placeholder="Enter state name or code"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                />
              </div>

              <DropdownMenuSeparator />

              {/* District Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="district-filter">District</Label>
                <Input
                  id="district-filter"
                  type="number"
                  placeholder="Enter district number"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                />
              </div>

              <DropdownMenuSeparator />

              {/* Birth Year Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="birth-year">Birth Year</Label>
                <div className="flex gap-2">
                  <Input
                    id="birth-year"
                    type="number"
                    placeholder="Year"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={birthYearFilter} onValueChange={setBirthYearFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact">Exact</SelectItem>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* First Term Start Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="first-term">First Term Start</Label>
                <div className="flex gap-2">
                  <Input
                    id="first-term"
                    type="number"
                    placeholder="Year"
                    value={firstTermYear}
                    onChange={(e) => setFirstTermYear(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={firstTermFilter} onValueChange={setFirstTermFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact">Exact</SelectItem>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Current Term Start Filter */}
              <div className="p-3 space-y-2">
                <Label htmlFor="current-term">Current Term Start</Label>
                <div className="flex gap-2">
                  <Input
                    id="current-term"
                    type="number"
                    placeholder="Year"
                    value={currentTermYear}
                    onChange={(e) => setCurrentTermYear(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={currentTermFilter} onValueChange={setCurrentTermFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact">Exact</SelectItem>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {data.officials.length} of {data.total} members
          </div>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-6 mb-8">
          {data.officials.map((official) => (
            <Card
              key={official.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {}}
            >
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="relative w-full aspect-square">
                  <Image
                    src={official.image_url || "/placeholder.svg"}
                    alt={`Portrait of ${official.full_name}`}
                    fill
                    className="object-cover"
                  />
                  {/* Party Badge */}
                  <div
                    className={`absolute top-3 right-3 ${getPartyColor(
                      official.party,
                    )} text-white px-3 py-1 rounded-full text-sm font-bold`}
                  >
                    {official.party.charAt(0)}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4 space-y-3">
                  {/* Name and Title */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{official.full_name}</h3>
                    <p className={`text-sm font-bold ${getPartyTextColor(official.party)}`}>
                      {official.party} • {official.chamber}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {official.state}
                      {official.district && ` - District ${official.district}`}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FiPhone className="w-4 h-4 flex-shrink-0" />
                    <span>{official.phone_number}</span>
                  </div>

                  {/* Term Info */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <FiCalendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      First Term: {official.first_term_start} • Current: {official.current_term_start}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {data.totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gap-1"
              aria-label="Previous page"
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, data.totalPages))].map((_, idx) => {
                const pageNum = idx + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(data.totalPages, prev + 1))}
              disabled={currentPage === data.totalPages}
              className="gap-1"
              aria-label="Next page"
            >
              Next
              <FiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
