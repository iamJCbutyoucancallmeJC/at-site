// Neon Postgres for class state (saved answers, the question box). Database
// `at_classes` in the shared Neon project (created 2026-10-07). Server-only.
// Absent DATABASE_URL = the feature degrades: pages render, saving fails loudly.

import "server-only"
import { neon } from "@neondatabase/serverless"

const URL = process.env.DATABASE_URL ?? ""

export function dbConfigured(): boolean {
  return URL.startsWith("postgres")
}

export function db() {
  if (!dbConfigured()) throw new Error("DATABASE_URL missing")
  return neon(URL)
}
