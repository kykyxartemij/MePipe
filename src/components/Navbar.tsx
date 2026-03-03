import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: "1.25rem" }}>
        MePipe
      </Link>
      <Link href="/upload">Upload</Link>
    </nav>
  );
}
