"use client"

export type DomainEvaluation = {
    domain: string,
    score: number,
    gaps_identified: string[],
    priority: number
}
export type AssessmentResponse = {
    assessment_id: string,
    classification: string,
    confidence_score: number,
    reasoning: string,
    domain_evaluations: DomainEvaluation[]
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FaCheckCircle, FaExclamationTriangle, FaBook, FaVoteYea, FaLandmark, FaNewspaper } from "react-icons/fa"
import Link from "next/link"
import { Button } from "./ui/button"

const getDomainIcon = (domain: string) => {
  switch (domain) {
    case "government_structure":
      return <FaLandmark className="w-5 h-5" />
    case "elections":
      return <FaVoteYea className="w-5 h-5" />
    case "lawmaking":
      return <FaBook className="w-5 h-5" />
    case "media_literacy":
      return <FaNewspaper className="w-5 h-5" />
    default:
      return <FaBook className="w-5 h-5" />
  }
}

const formatDomainName = (domain: string) => {
  return domain
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const formatGapName = (gap: string) => {
  return gap
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const getScoreColor = (score: number) => {
  if (score >= 0.7) return "text-blue-500"
  if (score >= 0.5) return "text-red-500"
  return "text-red-500"
}

const getScoreBgColor = (score: number) => {
  if (score >= 0.7) return "bg-blue-500"
  if (score >= 0.5) return "bg-red-500"
  return "bg-red-500"
}

const getPriorityBadge = (priority: number) => {
  if (priority === 1) return <Badge variant="destructive">High Priority</Badge>
  if (priority === 2) return <Badge variant="secondary">Medium Priority</Badge>
  return <Badge variant="outline">Low Priority</Badge>
}

export default function AssessmentResult({data}: {data: AssessmentResponse}) {
  return (
    <div className="flex flex-row justify-center items-center min-h-screen bg-muted p-4 md:p-8 mx-auto space-y-6">
        <div className="max-w-5xl">
          <Card>
              <CardHeader>
                <div className="flex flex-row justify-between items-center">
                  <CardTitle className="text-2xl md:text-3xl font-bold">Assessment Results</CardTitle>
                  <Button variant="outline" className="p-3">
                    <Link href="/roadmap" className="text-2xl text-blue-400">Go To Roadmap</Link>
                  </Button>
                </div>
                <CardDescription>Your civic knowledge evaluation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                          <p className="text-sm text-muted-foreground mb-1">Classification</p>
                          <p className="text-xl font-bold capitalize">{data.classification}</p>
                      </div>
                      <div className="flex-1 md:max-w-md">
                          <div className="space-y-2">
                          <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">Confidence Score</p>
                              <p className="text-lg font-bold">{Math.round(data.confidence_score * 100)}%</p>
                          </div>
                          <div
                              className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
                              role="progressbar"
                              aria-valuenow={data.confidence_score * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Confidence score"
                          >
                              <div
                              className="bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${data.confidence_score * 100}%` }}
                              />
                          </div>
                          </div>
                      </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-2">
                          <FaCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                          <p className="text-sm font-bold mb-1 text-blue-900">Analysis</p>
                          <p className="text-sm font-light text-blue-800">{data.reasoning}</p>
                          </div>
                      </div>
                      </div>
                  </div>
              </CardContent>
          </Card>

          <div>
              <h2 className="text-xl font-bold my-4">Domain Performance</h2>
              <div className="grid gap-4 md:grid-cols-2">
                  {data.domain_evaluations.map((domain) => (
                      <Card key={domain.domain} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`${getScoreColor(domain.score)}`}>{getDomainIcon(domain.domain)}</div>
                              <CardTitle className="text-lg">{formatDomainName(domain.domain)}</CardTitle>
                            </div>
                            {getPriorityBadge(domain.priority)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">Score</p>
                              <p className={`text-2xl font-bold ${getScoreColor(domain.score)}`}>
                              {Math.round(domain.score * 100)}%
                              </p>
                            </div>
                            <div
                              className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
                              role="progressbar"
                              aria-valuenow={domain.score * 100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Score for ${formatDomainName(domain.domain)}`}
                            >
                              <div
                              className={`${getScoreBgColor(domain.score)} h-full rounded-full transition-all`}
                              style={{ width: `${domain.score * 100}%` }}
                              />
                            </div>
                          </div>

                          {domain.gaps_identified.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4 text-red-500" />
                              <p className="text-sm font-normal">Identified Gaps</p>
                            </div>
                            <ul className="space-y-1" role="list">
                              {domain.gaps_identified.map((gap, index) => (
                                <li key={index} className="text-sm font-light text-muted-foreground pl-6 relative">
                                <span className="absolute left-0">•</span>
                                {formatGapName(gap)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          )}
                        </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
        </div>
    </div>
  )
}