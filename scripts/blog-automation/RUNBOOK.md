# Blog automation runbook (t813)

The ongoing newsletter -> blog-post pipeline for the Amy Tangerine Journal. This
documents an AGENT-RUN flow (an operator or a Claude session drives it), not
manual JC file edits. Nothing here deploys: every path ends at an uncommitted
change a human reviews and pushes.

## Format decision (2026-07-08)

Ongoing posts use the SAME store shape as the migrated legacy corpus, so the site
serves exactly one content shape:

- `content/blog/posts/<slug>.json` -- full record (metadata + sanitized `body` HTML)
- `content/blog/_posts.json` -- index of metadata only (no body), date descending

An ongoing post is distinguished from a migrated one by empty `legacyPath` /
`legacyFile`. The legacy corpus was NOT converted to MDX (per the t811 inherited
note: migration serves JSON+HTML fine); matching that shape avoids a two-format
split. If a future authoring format is chosen, revisit here first.

Body HTML vocabulary matches the corpus: `<p> <h2> <h3> <a> <img> <figure> <ul>
<ol> <li> <em> <strong> <blockquote> <iframe>`. No inline styles, classes, divs,
or scripts (enforced by the draft prompt, spot-check on review).

## The flow

### 1. Ingest (`ingest.py`)
Drop the sent newsletter into `inbox/` as `.html` (Kajabi "view in browser" save)
or `.txt`/`.md` (pasted text). Then:

    python3 ingest.py <file>            # or: --list to see the inbox

Produces `work/<id>/` with `source.txt` (what the model reads), a cleaned
`source.html` when the input was HTML, and `meta.json`.

Kajabi has no email API (verified in the 2026-06 AT email analytics work), so
`--from-kajabi` is a documented stub. If AT email moves to Klaviyo (t773 / Shape
E), implement the live pull against the Klaviyo Campaigns API and rename the flag.
Until then the manual drop is the supported ingest.

### 2. Draft in Amy's voice (`draft.py`)
This is the agent step. It fills `prompts/amy-voice-post.md` with the live tag
vocabulary, today's date, and the source text.

    python3 draft.py <work-id>              # shells out to `claude -p` if on PATH
    python3 draft.py <work-id> --print      # print the prompt for a manual/agent run
    python3 draft.py <work-id> --reply reply.json   # ingest a pasted JSON reply

The model returns a strict JSON object (title, slug, tags, excerpt, body_html,
notes). draft.py validates it and writes store-shaped `work/<id>/draft.json`.
Always read the `notes` field: it flags dropped promos, image-host dependence,
and judgment calls.

### 3. Human review
Open `work/<id>/draft.json`. Check voice, that no facts/products/dates were
invented, that images point at real current URLs, and the `notes`. Edit the file
directly if needed. THIS IS THE APPROVAL GATE.

### 4. Publish-prep (`publish-prep.py`)
Writes the approved draft into the live store (uncommitted):

    python3 publish-prep.py publish <work-id>

Then a human reviews the diff and deploys:

    git -C ~/at-site add content/blog && git -C ~/at-site diff --staged
    # npm run dev to preview, then a HUMAN commits + pushes (Vercel auto-deploys)

### Edit an existing post
    python3 publish-prep.py edit <slug> --out post.json   # check out
    #   ...edit post.json...
    python3 publish-prep.py edit <slug> --in post.json    # check back in

### Housekeeping
    python3 publish-prep.py retract <slug>       # ongoing posts only (refuses legacy)
    python3 publish-prep.py rebuild-index        # after a legacy extract.py re-run

## Guardrails

- No deploy in the loop. Scripts stop at an uncommitted change; a human pushes.
- `retract` refuses to touch migrated legacy posts (legacyFile set).
- `rebuild-index` recovers `_posts.json` if the one-time migration `extract.py`
  is ever re-run (that would drop ongoing posts from the INDEX; their
  `posts/*.json` files survive).

## What remains (JC / Amy gates)

- Real ingest stays manual until/unless AT email moves to Klaviyo.
- Every post passes the human review gate before publish; Amy walks the first few
  live posts before this runs unattended.
- `draft.py` needs the `claude` CLI on PATH for the automatic path; otherwise use
  `--print` + `--reply` (an agent session does this natively).
