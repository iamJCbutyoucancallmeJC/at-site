# /japan + /events Tokyo imagery

Placeholder assets for the Tokyo Tangerine Takeover surfaces (feature f001).

## Current (placeholders)

`tokyo-01.webp` … `tokyo-06.webp` — pulled from the legacy Squarespace
"Tokyo Workshops" blog post (vault: `Website Redesign/Archive/squarespace-legacy-2026-05-29`).
Real Amy craft-workshop photos, used as gallery placeholders until Amy supplies
the March 2026 trip photos. Swap the files in place (keep the same filenames) and
no code change is needed.

## Drop-in slots (swap real files here, keep filenames)

| Filename | Where it renders | Notes |
|---|---|---|
| `tokyo-takeover-logo.png` | /japan hero + /events Tokyo entry | The "Tangerine Tokyo Takeover — the sweetest trip ever!" brand logo (Tokyo-tower mark). NOT yet in repo; hero falls back to a styled text treatment until this file exists. |
| `hero.webp` | /japan hero background | Optional single strong Tokyo photo behind the headline. Falls back to brand-color block if absent. |
| `tokyo-01.webp` … `tokyo-06.webp` | /japan gallery + /events | The gallery reads the first 4–6 in order. |

All consuming code degrades gracefully if a file is missing — the page never
breaks on an absent image, so this is safe to ship to the PDF before Amy's
photos arrive.
