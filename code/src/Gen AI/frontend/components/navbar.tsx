import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#D02027] text-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/document-upload" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Banking Compliance Platform</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/document-upload" className="text-sm font-medium hover:underline">
              Document Upload
            </Link>
            <Link href="/rule-validation" className="text-sm font-medium hover:underline">
              Rule Validation
            </Link>
            <Link href="/data-profiling" className="text-sm font-medium hover:underline">
              Data Profiling
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-[#b01c22]">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button
            variant="outline"
            className="bg-white text-[#D02027] hover:bg-gray-100 hover:text-[#D02027] border-white"
          >
            Sign On
          </Button>
        </div>
      </div>
    </header>
  )
}

