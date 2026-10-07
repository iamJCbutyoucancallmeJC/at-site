// Slug -> day content (server-only). One switch so the gated pages stay
// generic; a new class adds a content file and a line here.

import "server-only"
import type { ClassDay } from "@/content/classes/glimmers"
import { GLIMMERS_DAYS, GLIMMERS_CONTAINER, type ContainerCue } from "@/content/classes/glimmers"

const DAYS_BY_SLUG: Record<string, ClassDay[]> = {
  glimmers: GLIMMERS_DAYS,
}

export function getClassDays(slug: string): ClassDay[] {
  return DAYS_BY_SLUG[slug] ?? []
}

export function getClassDay(slug: string, n: number): ClassDay | null {
  return getClassDays(slug).find((d) => d.day === n) ?? null
}

// A file is servable only if some day of that class names it. This is the
// allow-list the files route checks before touching the filesystem.
export function isClassFile(slug: string, name: string): boolean {
  return getClassDays(slug).some((d) => d.files?.some((f) => f.name === name))
}

const CONTAINER_BY_SLUG: Record<string, { welcome: ContainerCue[]; walkthrough: ContainerCue[] }> = {
  glimmers: GLIMMERS_CONTAINER,
}

export function getContainerCues(slug: string, which: "welcome" | "walkthrough"): ContainerCue[] {
  return CONTAINER_BY_SLUG[slug]?.[which] ?? []
}
