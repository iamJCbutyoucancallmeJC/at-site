# Blog automation runbook (t813)

The ongoing newsletter -> Journal post pipeline for amytangerine.com/blog. This is
an AGENT-RUN flow: a Claude session (or JC at a shell) drives the scripts; no one
hand-edits post files. Every path ends at a commit on a branch that a person
merges. Nothing here pushes, merges, or deploys.

## Where the newsletter lives

Amy's weekly letter is a Klaviyo CAMPAIGN sent to the AT Newsletter list
(`RcAVAK`), usually Fridays (creativity-2026-09-25 went 9/25; play-2026-10-09 is
scheduled for 10/9). `ingest-klaviyo.py` reads it through the Campaigns API with
the Full Access key in `~/.klaviyo-at.json` (`full_key`), read-only: list
campaigns, read the campaign message, read its template HTML. It never creates,
sends, or schedules anything. TEST sends and sends to other lists (events, class
alumni) are skipped by `--latest`.

If a letter ever goes out some other way (a Kajabi paste, a forwarded copy), drop
the saved HTML or pasted text in `inbox/` and run `ingest.py <file>` instead; the
rest of the flow is identical.

## The store (format decision, 2026-07-08, confirmed 2026-10-07)

Ongoing posts use the SAME shape as the migrated legacy corpus, so the site serves
one content shape and the legacy corpus is never converted:

- `content/blog/posts/<slug>.json`: the full record (metadata + sanitized `body`
  HTML, plus a `source` block with provenance: campaign id, subject, send date,
  model, the model's notes, re-host report, edit history)
- `content/blog/_posts.json`: metadata index, date descending; a publish touches
  one entry, never re-sorts the file
- `content/blog/revisions/<slug>/<stamp>.json`: prior versions kept by
  `edit-post.py` (the site never reads these; git history is the second copy)

A post with `"draft": true` is in the store but `lib/blog.ts` (`getListablePosts`)
keeps it out of the feed, archive, tags, search, sitemap, featured and start-here.
It is still built at `/blog/<slug>` with `noindex` and a "Draft preview" banner,
which is the URL Amy reads. `approve.py` removes the flag.

Ongoing posts carry empty `legacyPath` / `legacyFile`; that is how `retract`
knows it may touch them and must not touch the legacy corpus.

Images: anything not on `cdn.shopify.com` or `amytangerine.com` (Klaviyo's CDN,
in practice) is re-hosted on Shopify Files the way the migration did, recorded in
`image-url-map.json`. `approve.py` refuses a post that still points at an
external host. The post body vocabulary matches the corpus: `<p> <h2> <h3> <a>
<figure> <img> <ul> <ol> <li> <em> <strong> <blockquote> <iframe>`; `draft.py`
warns on anything else.

## The model step

`llm.py` is the only place a model is called: `claude -p` on the Max login, no
API key anywhere (vault rule). Exact shape, copied from
`zz_System/Scripts/at-weekly-read.py`:

    claude -p "<assembled prompt>" --model sonnet --output-format json

run with every `CLAUDE*` env var scrubbed (so it also works when a Claude Code
session is the operator), cwd = this repo, 300 s timeout. A nonzero exit, a
non-JSON reply, `is_error`, or an empty `result` RAISES; it is never an empty
draft. `--model opus` is the heavier option when a draft reads flat.

The prompts live in `prompts/`: `amy-voice-post.md` (newsletter -> post; her
register from the corpus, the transform rules, the JSON contract) and
`amy-voice-edit.md` (one instruction, surgical edit). Edit them in git like code.

## The flow (one post, start to finish)

Work in a worktree on a branch; never on `~/at-site` main. All commands from the
repo root.

### 1. Ingest

    python3 scripts/blog-automation/ingest-klaviyo.py --list            # what has gone out
    python3 scripts/blog-automation/ingest-klaviyo.py --latest          # newest real newsletter send
    python3 scripts/blog-automation/ingest-klaviyo.py --campaign <id>   # a specific one
    #   --dry-run prints the cleaned source and writes nothing

Writes `inbox/<send-date>-<label>.md` (the committed record: front matter with
campaign id, subject, preview text, send date; then the stripped letter as
markdown with its image URLs) and `work/<id>/` (gitignored scratch: source.txt,
source.html, the raw template.html, meta.json).

Stripping: preheader, hidden blocks, tracking pixels, unsubscribe / preferences /
view-in-browser blocks, Klaviyo template tags (`{{ first_name|default:"friend" }}`
becomes "friend"), utm and click-tracking params, all inline styles and table
chrome. The greeting line, sign-off and logo image are left in the source; the
draft prompt drops them.

### 2. Draft

    python3 scripts/blog-automation/draft.py <work-id>

Assembles the prompt (voice rules, tag vocabulary, the three most recent ongoing
posts for continuity, today's date, the source), runs `claude -p`, validates the
JSON, re-hosts external images, and writes the post to the store as a DRAFT plus
`work/<id>/draft.json`, `prompt.txt`, `reply.json`. Read the NOTES line: the
model reports what it dropped and what is time-bound.

`--print` shows the prompt without calling anything; `--reply reply.json`
ingests a reply an agent session produced itself.

### 3. Preview

    npm run dev          # http://localhost:3000/blog/<slug>

or push the branch and deploy a Vercel preview from the worktree (`vercel deploy
--yes`, with `.vercel/` copied from `~/at-site`; a bare branch push does not
build a preview for this project). The draft renders at `/blog/<slug>` with the
banner and appears in no listing.

### 4. Amy's voice pass (D4 regate)

Amy reads the preview URL and says what to change, in her words. Apply each note
with the edit path, which keeps the prior version:

    python3 scripts/blog-automation/edit-post.py <slug> "make the second paragraph shorter and end on the question"

Repeat until she is happy. Her notes are the raw material for tightening
`prompts/amy-voice-post.md` over the first few posts.

### 5. JC approve

    python3 scripts/blog-automation/approve.py <slug>            # date = today
    python3 scripts/blog-automation/approve.py <slug> --date 2026-10-10

Sets the date, removes the draft flag, commits ONLY the two store files on the
current branch. Refuses if images are still external (`--allow-external` to
override knowingly) or if the post is not a draft.

### 6. Deploy

The deploy is the normal path for this repo: push the branch, open or update the
PR, merge to main; Vercel builds main. No script does this.

## Edit a published post

Same tool, any post:

    python3 scripts/blog-automation/edit-post.py <slug> "<instruction>"

The prior version lands in `content/blog/revisions/<slug>/`; commit the change
like any other content change. `publish-prep.py edit <slug> --out f.json` /
`--in f.json` is the manual alternative (also keeps the prior version).

## Housekeeping

    python3 scripts/blog-automation/rehost.py <slug> [--dry-run]     # re-host a post's external images
    python3 scripts/blog-automation/publish-prep.py retract <slug>   # remove an ongoing post (never legacy)
    python3 scripts/blog-automation/publish-prep.py rebuild-index    # after a legacy extract.py re-run
    python3 scripts/blog-automation/publish-prep.py publish <work-id> # a hand-edited draft.json -> store, as draft

## The regate: D4

Ratified in the Phase 2 plan (t1065, 2026-08-11): Amy voice-passes the first 3 to 5
posts through step 4 before anything publishes; after that the flow becomes
JC-approve-only (steps 1, 2, 5, 6, with step 4 on request). Until the fifth post
has cleared, no post skips Amy.

## Guardrails

- Read-only against Klaviyo. Never create, send, or schedule.
- Nothing pushes, merges, or deploys; `approve.py` commits on the current branch only.
- A model failure raises; the pipeline never writes an empty or partial post.
- `retract` refuses the migrated legacy corpus; `approve.py` refuses external images.
- The `_posts.json` index is edited one entry at a time; `rebuild-index` is the
  only thing that re-sorts it (recovery after a legacy `extract.py` re-run, which
  would drop ongoing posts from the index; their `posts/*.json` survive).

## First run (2026-10-07)

Ingested campaign `01M3AQ6QPS68P1M332AKYN8MKF` (creativity-2026-09-25, subject
"What happens when I drift away from making stuff", sent 2026-09-25), drafted as
`what-happens-when-i-drift-away-from-making-stuff` (draft, unlisted), one Klaviyo
image re-hosted, one edit applied through `edit-post.py`. It waits for Amy's
voice pass; `approve.py` has not been run on it.
