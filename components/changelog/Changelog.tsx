// GENERATED COPY. Do not edit here.
// Source: Claudesidian vault, zz_System/Scripts/changelog-shared/Changelog.tsx
// Propagate with: python3 zz_System/Scripts/changelog-sync.py

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The design changelog: how a site got the way it is, with the maker's
 * reasons in the margin (JC 9/3: "changelogs help me show my work").
 *
 * ONE markup for every site in the jccangilla.com network. The static
 * renderer (zz_System/Scripts/changelog-render.py) mirrors this exactly, so
 * a change here is a change there. Pattern locked on mymorningquestions.com
 * 2026-09-03 (JC printed and annotated the page; the layout stood).
 *
 * Layout: the entry in the main two thirds, the note in the right third.
 * Reverse chronological. Summaries hold to two lines so the page can be
 * glanced; "considered options" (never "the choice") opens in place for the
 * one reader in a hundred who wants the alternatives. Notes appear on roughly
 * one entry in three, never all: JC's own language, moving toward neutral
 * analytical explanation at his cadence. Do not polish notes ahead of him.
 *
 * v2 (after the 9/5 rollout): `hand` notes, JC's actual handwriting
 * photographed into the margin, two pens as two registers (pink = felt,
 * blue = thought), with a typed transcript beneath for legibility.
 */

export const CHANGELOG_SCHEMA_VERSION = 1;

export type ChangelogOption = { key: string; title: string; blurb: string; picked?: string };
export type ChangelogLink = { label: string; href: string };
export type ChangelogHand = { src: string; transcript: string; pen: 'pink' | 'blue' };
export type ChangelogRegister = 'felt' | 'thought';

export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string; // serif italic, the voice of the site
  summary: string; // two lines at most
  important?: boolean; // bigger title; opens the options when a note is present
  note?: string; // JC's typed note, in his hand
  register?: ChangelogRegister; // the pen-as-register trial (JC 9/3)
  hand?: ChangelogHand; // v2: the photographed handwriting
  options?: ChangelogOption[]; // what else was on the table
  links?: ChangelogLink[]; // what the entry shaped (jccangilla: the essays)
  draft?: boolean; // seeded from git, not yet pruned: never rendered
};

export type ChangelogSite = {
  name: string;
  url: string;
  home?: string; // masthead link target, default "/"
  compsHref?: string; // where the comps live, if the site has a lab page
  compsLabel?: string; // default "see the comps"
  noindex?: boolean; // the page wrapper reads this for its robots metadata
};

export type ChangelogData = { version: number; site: ChangelogSite; entries: ChangelogEntry[] };

/** JSON imports type `register` as string; this is the one cast a page needs. */
export function asChangelog(json: unknown): ChangelogData {
  return json as ChangelogData;
}

export function tag(date: string): string {
  const [, m, d] = date.split('-');
  return `JC, ${Number(m)}/${Number(d)}`;
}

const PEN_REGISTER: Record<ChangelogHand['pen'], ChangelogRegister> = { pink: 'felt', blue: 'thought' };

/** Drafts out, newest first; ties keep file order (the sort is stable). */
export function publishedEntries(data: ChangelogData): ChangelogEntry[] {
  return data.entries
    .filter((e) => !e.draft)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return href.startsWith('/') ? <Link href={href}>{children}</Link> : <a href={href}>{children}</a>;
}

type Props = {
  data: ChangelogData;
  /** The root element: `main` when the changelog is the page, `section` inside a site's own main. */
  as?: 'main' | 'section' | 'div';
  /** The site-name + "changelog" masthead. Off when the site's own header carries the page. */
  masthead?: boolean;
  intro?: ReactNode;
  className?: string;
};

export function Changelog({ data, as = 'main', masthead = true, intro, className }: Props) {
  const Root = as;
  const entries = publishedEntries(data);
  const home = data.site.home ?? '/';

  return (
    <Root className={className ? `log ${className}` : 'log'}>
      {masthead ? (
        <div className="log-masthead">
          <span className="site">
            <A href={home}>{data.site.name}</A>
          </span>
          <span className="date">changelog</span>
        </div>
      ) : null}

      <p className="log-intro">
        {intro ?? (
          <>
            How this site got the way it is, newest first. The entry says what changed;
            beside a few, a note says why, in the maker&rsquo;s hand. &ldquo;Considered
            options&rdquo; opens what else was on the table.
          </>
        )}
      </p>

      <ol className="log-list">
        {entries.map((e, i) => {
          const hasNote = Boolean(e.note || e.hand);
          const open = Boolean(e.important && hasNote);
          const register = e.register ?? (e.hand ? PEN_REGISTER[e.hand.pen] : undefined);
          return (
            <li key={`${e.date}-${i}`} className={e.important ? 'log-entry important' : 'log-entry'}>
              <div className="log-main">
                <div className="log-date">{e.date}</div>
                <h2 className="log-title">{e.title}</h2>
                <p className="log-summary">{e.summary}</p>
                {e.links && e.links.length ? (
                  <div className="log-links">
                    {e.links.map((l, j) => (
                      <span key={l.href}>
                        {j > 0 ? ' · ' : ''}
                        <A href={l.href}>{l.label}</A>
                      </span>
                    ))}
                  </div>
                ) : null}
                {e.options && e.options.length ? (
                  <details className="log-choice" open={open}>
                    <summary>considered options</summary>
                    <ul>
                      {e.options.map((o) => (
                        <li key={o.key} className={o.picked ? 'picked' : undefined}>
                          <span className="log-opt-key">{o.key}</span>
                          <span className="log-opt-title">{o.title}</span>
                          {o.picked ? <span className="log-pick">{o.picked}</span> : null}
                          <div className="log-opt-blurb">{o.blurb}</div>
                        </li>
                      ))}
                    </ul>
                    {data.site.compsHref ? (
                      <div className="log-choice-link">
                        <A href={data.site.compsHref}>{data.site.compsLabel ?? 'see the comps'}</A>
                      </div>
                    ) : null}
                  </details>
                ) : null}
              </div>
              {hasNote ? (
                <aside className="log-note">
                  {e.hand ? (
                    <figure className="log-hand">
                      {/* Plain <img>: a cropped photo of paper, cleaned but not redrawn. */}
                      <img src={e.hand.src} alt={e.hand.transcript} />
                      <figcaption className="log-hand-text">{e.hand.transcript}</figcaption>
                    </figure>
                  ) : null}
                  {e.note}
                  <div className="who">
                    {tag(e.date)}
                    {register ? ` · ${register}` : ''}
                  </div>
                </aside>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Root>
  );
}

export default Changelog;
