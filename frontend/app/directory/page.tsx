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
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { createDirectoryQueryOptions, type OfficialFilters } from "@/hooks/query-options"
import Link from "next/link"
import { useDebounce } from "@/hooks/general"

export default function CongressionalDirectory() {
    const [currentPage, setCurrentPage] = useState(1)

    // dropdown filters
    const [selectedParty, setSelectedParty] = useState<"all" | "Democratic" | "Republican" | "Independent">("all")
    const [selectedChamber, setSelectedChamber] = useState<"all" | "Senate" | "House of Representatives">("all")
    const [birthYearFilter, setBirthYearFilter] = useState<"exact" | "before" | "after">("exact")
    const [firstTermFilter, setFirstTermFilter] = useState<"exact" | "before" | "after">("exact")
    const [currentTermFilter, setCurrentTermFilter] = useState<"exact" | "before" | "after">("exact")

    // text filters
    const [selectedState, setSelectedState] = useState<string>("")
    const [selectedDistrict, setSelectedDistrict] = useState<string>("")
    const [birthYear, setBirthYear] = useState<string>("")
    const [firstTermYear, setFirstTermYear] = useState<string>("")
    const [currentTermYear, setCurrentTermYear] = useState<string>("")
    const [search, setSearch] = useState<string>("")

    const debouncedSelectedState = useDebounce(selectedState)
    const debouncedSelectedDistrict = useDebounce(selectedDistrict)
    const debouncedBirthYear = useDebounce(birthYear)
    const debouncedFirstTermYear = useDebounce(firstTermYear)
    const debouncedcurrentTermYear = useDebounce(currentTermYear)
    const debouncedSearch = useDebounce(search)

    // Build filters object
    const filters: OfficialFilters = {
        page: currentPage,
        limit: 50,
        chamber: selectedChamber,
        state: debouncedSelectedState,
        party: selectedParty,
        district: debouncedSelectedDistrict,
        birthYear: debouncedBirthYear,
        birthYearFilter,
        firstTermYear: debouncedFirstTermYear,
        firstTermFilter,
        currentTermYear: debouncedcurrentTermYear,
        currentTermFilter,
        name: debouncedSearch
    }

    // Fetch data with React Query
    const { data, isLoading, error } = useQuery(createDirectoryQueryOptions(filters))

    // Reset to page 1 when filters change
    const handleFilterChange = (callback: () => void) => {
        callback()
        setCurrentPage(1)
    }

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

    if (error) {
        return (
            <div className="min-h-screen bg-background p-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive text-lg">Error loading congressional directory</p>
                    <p className="text-muted-foreground mt-2">{error.message}</p>
                </div>
            </div>
        )
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
            <div className="flex flex-row gap-x-2 flex-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-transparent">
                        <FiFilter className="w-4 h-4" />
                        Filters
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 max-h-[600] overflow-y-auto" align="start">
                        <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Party Filter */}
                        <div className="p-3 space-y-2">
                        <Label htmlFor="party-filter">Political Party</Label>
                        <Select 
                            value={selectedParty} 
                            onValueChange={(value) => handleFilterChange(() => setSelectedParty(value as any))}
                        >
                            <SelectTrigger id="party-filter">
                            <SelectValue placeholder="All Parties" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Parties</SelectItem>
                            <SelectItem value="Democratic">Democratic</SelectItem>
                            <SelectItem value="Republican">Republican</SelectItem>
                            <SelectItem value="Independent">Independent</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>

                        <DropdownMenuSeparator />

                        {/* Chamber Filter */}
                        <div className="p-3 space-y-2">
                        <Label htmlFor="chamber-filter">Chamber</Label>
                        <Select 
                            value={selectedChamber} 
                            onValueChange={(value) => handleFilterChange(() => setSelectedChamber(value as any))}
                        >
                            <SelectTrigger id="chamber-filter">
                            <SelectValue placeholder="All Chambers" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Chambers</SelectItem>
                            <SelectItem value="Senate">Senate</SelectItem>
                            <SelectItem value="House of Representatives">House of Representatives</SelectItem>
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
                            onChange={(e) => handleFilterChange(() => setSelectedState(e.target.value))}
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
                            onChange={(e) => handleFilterChange(() => setSelectedDistrict(e.target.value))}
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
                            onChange={(e) => handleFilterChange(() => setBirthYear(e.target.value))}
                            className="flex-1"
                            />
                            <Select 
                            value={birthYearFilter} 
                            onValueChange={(value) => handleFilterChange(() => setBirthYearFilter(value as any))}
                            >
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
                            onChange={(e) => handleFilterChange(() => setFirstTermYear(e.target.value))}
                            className="flex-1"
                            />
                            <Select 
                            value={firstTermFilter} 
                            onValueChange={(value) => handleFilterChange(() => setFirstTermFilter(value as any))}
                            >
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
                            onChange={(e) => handleFilterChange(() => setCurrentTermYear(e.target.value))}
                            className="flex-1"
                            />
                            <Select 
                            value={currentTermFilter} 
                            onValueChange={(value) => handleFilterChange(() => setCurrentTermFilter(value as any))}
                            >
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
                <Input
                    name="password"
                    placeholder="Search by name..."
                    type="text"
                    className="max-w-[300]"
                    value={search}
                    onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                />
            </div>

            <div className="text-sm text-muted-foreground">
                {isLoading ? (
                    "Loading..."
                ) : (
                    `Showing ${data?.officials.length || 0} of ${data?.total || 0} members`
                )}
            </div>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        )}

        {/* Member Cards Grid */}
        {!isLoading && data && (
            <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
                {data.officials.map((official) => (
                <Link
                    key={official.id}
                    href={`/directory/member/${official.bioguide_id}`}
                >
                    <Card
                        key={official.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                            // TODO: Navigate to detail page
                            console.log("Clicked official:", official.bioguide_id)
                        }}
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
                                {official.party} • {official.chamber === "Senate" ? "Senate" : "House"}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <FiMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>
                                {official.state}
                                {official.district && ` - District ${official.district}`}
                                </span>
                            </div>

                            {/* Phone */}
                            {official.phone_number && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FiPhone className="w-4 h-4 shrink-0" />
                                    <span className="font-normal">{official.phone_number}</span>
                                </div>
                            )}

                            {/* Term Info */}
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <FiCalendar className="w-4 h-4 mt-0.5 shrink-0" />
                                <span className="font-light">
                                    First Term: <span className="font-normal">{official.first_term_start}</span>
                                </span>
                            </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
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
            </>
        )}
        </div>
    </div>
    )
}