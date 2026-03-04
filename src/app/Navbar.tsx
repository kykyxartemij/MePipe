"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import * as ArtIcon from "@/components/ui/ArtIcon";
import SearchField from "../components/SearchField";

function NavbarInner() {
  const searchParams = useSearchParams();
  const freeText = searchParams.get("freeText") ?? "";

  return (
    <nav className="navbar">
      {/* Left — logo */}
      <Link href="/" className="navbar-logo">
        MePipe
      </Link>

      {/* Center — search */}
      <div className="navbar-search">
        <SearchField initialQuery={freeText} />
      </div>

      {/* Right — upload */}
      <Link href="/upload" className="navbar-upload" title="Upload">
        <ArtIcon.ArtIcon name="Upload" size={22} />
      </Link>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense>
      <NavbarInner />
    </Suspense>
  );
}
