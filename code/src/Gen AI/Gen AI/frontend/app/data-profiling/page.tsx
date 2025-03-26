"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, AlertCircle, CheckCircle, AlertTriangle, ArrowLeft, Download, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import Navbar from "@/components/navbar"

export default function DataProfilingPage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profilingResults, setProfilingResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const router = useRouter();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("csv", file);

    try {
      const response = await fetch("http://localhost:3001/api/upload-data", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setProfilingResults(data.results);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setIsProcessing(false);
    }
  };

  const filteredResults = profilingResults.filter((result) => {
    const matchesSearch =
      searchTerm === "" ||
      result["Identifier Value"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result["Identifier Type"]?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "all" ||
      (riskFilter === "high-risk" && result.status === "high-risk") ||
      (riskFilter === "medium-risk" && result.status === "medium-risk") ||
      (riskFilter === "compliant" && result.status === "compliant");
    const matchesCategory = categoryFilter === "all" || result["Accounting Intent"] === categoryFilter;
    return matchesSearch && matchesRisk && matchesCategory;
  });

  const categories = Array.from(new Set(profilingResults.map((result) => result["Accounting Intent"])));
  const totalTransactions = profilingResults.length;
  const highRiskCount = profilingResults.filter((r) => r.status === "high-risk").length;
  const mediumRiskCount = profilingResults.filter((r) => r.status === "medium-risk").length;
  const compliantCount = profilingResults.filter((r) => r.status === "compliant").length;

  const highRiskPercentage = totalTransactions ? (highRiskCount / totalTransactions) * 100 : 0;
  const mediumRiskPercentage = totalTransactions ? (mediumRiskCount / totalTransactions) * 100 : 0;
  const compliantPercentage = totalTransactions ? (compliantCount / totalTransactions) * 100 : 0;

  return (
    <div className="flex-1">
      <div className="container py-10 flex-1">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-3xl font-bold text-banking-red">Data Profiling</h1>

          {!profilingResults.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload Transaction Data</CardTitle>
                <CardDescription>Upload your customer transaction data (CSV) for compliance profiling.</CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-banking-red" />
                    <p className="text-center text-sm text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="csv-file">Transaction Data (CSV)</Label>
                        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                        {file && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/rule-validation")}>
                  Back
                </Button>
                <Button
                  className="bg-banking-red hover:bg-banking-darkRed text-white"
                  onClick={handleSubmit}
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? "Processing..." : "Process Data"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Risk Summary</CardTitle>
                  <CardDescription>Overview of compliance risks in the transaction data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">High Risk</span>
                        <span className="text-sm text-muted-foreground">{highRiskCount} transactions</span>
                      </div>
                      <Progress value={highRiskPercentage} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                      <p className="text-xs text-muted-foreground">{highRiskPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Medium Risk</span>
                        <span className="text-sm text-muted-foreground">{mediumRiskCount} transactions</span>
                      </div>
                      <Progress value={mediumRiskPercentage} className="h-2 bg-muted" indicatorClassName="bg-amber-500" />
                      <p className="text-xs text-muted-foreground">{mediumRiskPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compliant</span>
                        <span className="text-sm text-muted-foreground">{compliantCount} transactions</span>
                      </div>
                      <Progress value={compliantPercentage} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                      <p className="text-xs text-muted-foreground">{compliantPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Data Profiling Results</CardTitle>
                  <CardDescription>Detailed analysis based on validated rules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by identifier..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={riskFilter} onValueChange={setRiskFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by risk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Risk Levels</SelectItem>
                          <SelectItem value="high-risk">High Risk</SelectItem>
                          <SelectItem value="medium-risk">Medium Risk</SelectItem>
                          <SelectItem value="compliant">Compliant</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by intent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Intents</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identifier Type</TableHead>
                        <TableHead>Identifier Value</TableHead>
                        <TableHead>Amortized Cost</TableHead>
                        <TableHead>Market Value</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{result["Identifier Type"]}</TableCell>
                          <TableCell>{result["Identifier Value"]}</TableCell>
                          <TableCell>{result["Amortized Cost (USD Equivalent)"]}</TableCell>
                          <TableCell>{result["Market Value (USD Equivalent)"]}</TableCell>
                          <TableCell>{result["Accounting Intent"]}</TableCell>
                          <TableCell>{(result.riskScore * 100).toFixed(0)}%</TableCell>
                          <TableCell>
                            <Badge
                              variant={result.status === "high-risk" ? "destructive" : result.status === "medium-risk" ? "default" : "outline"}
                              className={result.status === "high-risk" ? "bg-red-500" : result.status === "medium-risk" ? "bg-amber-500" : "bg-green-500 text-white"}
                            >
                              {result.status === "high-risk" ? "High Risk" : result.status === "medium-risk" ? "Medium Risk" : "Compliant"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.issues.length > 0 ? (
                              <ul className="list-disc pl-4 text-xs">
                                {result.issues.map((issue, i) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-muted-foreground">No issues</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/rule-validation")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Rules
                  </Button>
                  <Button className="bg-banking-orange hover:bg-orange-600 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}