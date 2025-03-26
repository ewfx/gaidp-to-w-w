"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, CheckCircle, AlertTriangle, Info, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for rules
const mockRules = [
  {
    id: 1,
    title: "Customer Identification Program",
    description:
      "Financial institutions must implement a Customer Identification Program (CIP) to verify the identity of individuals seeking to open an account.",
    category: "KYC",
    confidence: 0.95,
    status: "validated",
  },
  {
    id: 2,
    title: "Suspicious Activity Reporting",
    description:
      "Financial institutions must file a Suspicious Activity Report (SAR) for transactions that might signal criminal activity like money laundering or fraud.",
    category: "AML",
    confidence: 0.92,
    status: "pending",
  },
  {
    id: 3,
    title: "Currency Transaction Reporting",
    description:
      "Financial institutions must report currency transactions over $10,000 conducted by, or on behalf of, one person, as well as multiple transactions that aggregate to over $10,000 in a single day.",
    category: "Reporting",
    confidence: 0.88,
    status: "validated",
  },
  {
    id: 4,
    title: "Beneficial Ownership Identification",
    description:
      "Financial institutions must identify and verify the identity of beneficial owners of legal entity customers.",
    category: "KYC",
    confidence: 0.85,
    status: "pending",
  },
  {
    id: 5,
    title: "Risk-Based Customer Due Diligence",
    description:
      "Financial institutions must conduct customer due diligence (CDD) on a risk basis, with enhanced due diligence for higher-risk customers.",
    category: "KYC",
    confidence: 0.91,
    status: "pending",
  },
]

export default function RulesPage() {
  const [rules, setRules] = useState(mockRules)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const router = useRouter()

  // Get unique categories
  const categories = Array.from(new Set(rules.map((rule) => rule.category)))

  // Filter rules based on search and filters
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchTerm === "" ||
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(rule.category)

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(rule.status)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Toggle rule validation status
  const toggleRuleStatus = (id: number) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === id ? { ...rule, status: rule.status === "validated" ? "pending" : "validated" } : rule,
      ),
    )
  }

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Continue to data profiling
  const handleContinue = () => {
    router.push("/data-profiling")
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-banking-red">Rule Validation</h1>

        <Card>
          <CardHeader>
            <CardTitle>Extracted Regulatory Rules</CardTitle>
            <CardDescription>Review and validate the rules extracted from your regulatory documents.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Tabs defaultValue="categories" className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="categories">Category</TabsTrigger>
                    <TabsTrigger value="status">Status</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="categories"
                    className="absolute z-10 mt-1 w-[200px] rounded-md border bg-background p-4 shadow-md"
                  >
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="status"
                    className="absolute z-10 mt-1 w-[200px] rounded-md border bg-background p-4 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-validated"
                          checked={selectedStatuses.includes("validated")}
                          onCheckedChange={() => handleStatusChange("validated")}
                        />
                        <Label htmlFor="status-validated">Validated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-pending"
                          checked={selectedStatuses.includes("pending")}
                          onCheckedChange={() => handleStatusChange("pending")}
                        />
                        <Label htmlFor="status-pending">Pending</Label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Info className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No rules found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                filteredRules.map((rule) => (
                  <div key={rule.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium">{rule.title}</h3>
                          <Badge
                            variant={
                              rule.category === "KYC"
                                ? "default"
                                : rule.category === "AML"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {rule.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <Button
                        variant={rule.status === "validated" ? "default" : "outline"}
                        size="sm"
                        className={rule.status === "validated" ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() => toggleRuleStatus(rule.id)}
                      >
                        {rule.status === "validated" ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Validated
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            Validate
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span>Confidence: {(rule.confidence * 100).toFixed(0)}%</span>
                      <div className="ml-2 h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${
                            rule.confidence > 0.9
                              ? "bg-green-500"
                              : rule.confidence > 0.8
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${rule.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button className="bg-banking-red hover:bg-banking-darkRed text-white" onClick={handleContinue}>
              Continue to Data Profiling
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

