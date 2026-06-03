# /japan + /events Tokyo imagery

Real Tokyo Tangerine Takeover photos supplied by Amy (2026-06-03), processed
from `~/Downloads/tangerinetokyotakeover/TangerineTokyoTakeover1-9`.

Processing applied: EXIF orientation baked into pixels, long edge resized to
1600px, converted to WebP q82. Photo #9 was rotated 90° CW to upright.

## Files

| File | Source | Content | Used on |
|---|---|---|---|
| `hero.webp` | #1 | Amy holding the trip card | /japan hero |
| `tokyo-01.webp` | #1 | Amy holding the trip card | /events strip |
| `tokyo-02.webp` | #2 | Stationery shop interior | /japan gallery |
| `tokyo-03.webp` | #3 | Group at Rainbowholic cafe | /events strip + /japan gallery |
| `tokyo-04.webp` | #4 | Sticker wall | /events strip + /japan gallery |
| `tokyo-05.webp` | #5 | Group indoors | /japan gallery |
| `tokyo-06.webp` | #6 | Amy + cherry blossoms | /japan gallery |
| `tokyo-07.webp` | #7 | Group with the Hobonichi bear | /japan gallery |
| `tokyo-08.webp` | #8 | Mother / EarthBound plush finds | /japan gallery |
| `tokyo-09.webp` | #9 | Full group at Hobonichi HQ | /japan gallery |

## To swap a photo

Replace the file in place (keep the filename) and redeploy. Both pages
reference these as plain constants (no build-time fs checks — those caused a
deploy-only hydration crash, since fixed). The `/japan` gallery order and
`/events` trio are defined in those page files.

Originals retained in `~/Downloads/tangerinetokyotakeover/` (not committed).
