"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Navbar from "@/components/navbar"

// Dynamically import the ProcessingAnimation component with no SSR
const ProcessingAnimation = dynamic(() => import("@/components/processing-animation"), { ssr: false })

export default function DocumentUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("document", file);
  
      try {
        const response = await fetch("http://localhost:3001/api/upload-document", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          setIsProcessing(false);
          router.push("/rule-validation");
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex-1">
      <div className="flex flex-col flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-banking-red to-banking-orange py-20 text-white">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center opacity-10"></div>
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Banking Regulatory Compliance Platform
              </h1>
              <p className="mb-8 text-lg sm:text-xl">
                Streamline your regulatory compliance process with AI-powered document analysis and transaction
                monitoring
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-white text-banking-red hover:bg-gray-100"
                  onClick={() => {
                    const element = document.getElementById("upload-section")
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div id="upload-section" className="py-16 flex-1">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <div className="mb-10 text-center">
                <h2 className="mb-4 text-3xl font-bold text-banking-red">Start Your Compliance Process</h2>
                <p className="text-lg text-muted-foreground">
                  Upload your regulatory documents to begin the automated compliance process
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex items-center justify-center">
                  {isProcessing ? (
                    <ProcessingAnimation />
                  ) : (
                    <div className="relative h-64 w-64 rounded-full bg-gray-100 p-8">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="h-20 w-20 text-banking-red opacity-20" />
                      </div>
                      <div className="absolute inset-0 animate-spin-slow [animation-duration:15s]">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute left-1/2 top-0 h-4 w-1 -translate-x-1/2 rounded-full bg-banking-red opacity-20"
                            style={{
                              transform: `translateX(-50%) rotate(${i * 30}deg)`,
                              transformOrigin: "bottom center",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <Card className="border-2 border-dashed p-6">
                    <CardContent className="p-0">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="document" className="text-lg font-medium">
                            Upload Regulatory Document
                          </Label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                id="document"
                                type="file"
                                accept=".pdf,.docx,.doc,.txt"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                              />
                            </div>
                          </div>
                          {file && (
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" /> {file.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-lg font-medium">
                            Document Description (Optional)
                          </Label>
                          <Input id="description" placeholder="Enter a brief description of the document" />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-banking-red hover:bg-banking-darkRed text-white"
                          disabled={!file || isProcessing}
                          size="lg"
                        >
                          {isProcessing ? "Processing..." : "Process Document"}
                          {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-2xl font-bold text-banking-red">Supported Document Types</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-banking-red/10 text-banking-red">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="mb-1 font-medium">PDF Documents</h4>
                  <p className="text-sm text-muted-foreground">Standard PDF files (.pdf)</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-banking-orange/10 text-banking-orange">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="mb-1 font-medium">Word Documents</h4>
                  <p className="text-sm text-muted-foreground">Microsoft Word files (.docx, .doc)</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-banking-red/10 text-banking-red">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h4 className="mb-1 font-medium">Text Files</h4>
                  <p className="text-sm text-muted-foreground">Plain text files (.txt)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

