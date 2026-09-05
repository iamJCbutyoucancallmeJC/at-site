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
 * Figures (9/5, JC: the AT log needed visual examples of the choices): a
 * small row of images under the summary, a comp beside the shipped thing.
 *
 * Hand notes (JC 9/5): the note IS his handwriting, photographed from the printed
 * page and set in the margin as if written there. No box, no typed tag, no pen
 * legend. A typed `note` is the interim form until the photo exists.
 */

export const CHANGELOG_SCHEMA_VERSION = 1;

export type ChangelogOption = { key: string; title: string; blurb: string; picked?: string };
export type ChangelogLink = { label: string; href: string };
export type ChangelogFigure = { src: string; alt: string; caption?: string };
export type ChangelogHand = { src: string; transcript: string; width?: number; height?: number };

export type ChangelogEntry = {
  date: string; // YYYY-MM-DD
  title: string; // serif italic, the voice of the site
  summary: string; // two lines at most
  important?: boolean; // bigger title; opens the options when a note is present
  note?: string; // JC's typed note (interim until the handwriting is photographed)
  hand?: ChangelogHand; // JC's actual handwriting, photographed: the note itself, in the margin
  options?: ChangelogOption[]; // what else was on the table
  links?: ChangelogLink[]; // what the entry shaped (jccangilla: the essays)
  figures?: ChangelogFigure[]; // visual examples: a comp, a before, the shipped thing
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

/** A JSON import is typed loosely; this is the one cast a page needs. */
export function asChangelog(json: unknown): ChangelogData {
  return json as ChangelogData;
}

export function tag(date: string): string {
  const [, m, d] = date.split('-');
  return `JC, ${Number(m)}/${Number(d)}`;
}

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
          const open = Boolean(e.important && (e.note || e.hand));
          return (
            <li key={`${e.date}-${i}`} className={e.important ? 'log-entry important' : 'log-entry'}>
              <div className="log-main">
                <div className="log-date">{e.date}</div>
                <h2 className="log-title">{e.title}</h2>
                <p className="log-summary">{e.summary}</p>
                {e.figures && e.figures.length ? (
                  <div className="log-figures">
                    {e.figures.map((f) => (
                      <figure key={f.src} className="log-figure">
                        {/* Plain <img>: small, static, one per figure; no optimizer needed. */}
                        <img src={f.src} alt={f.alt} loading="lazy" />
                        {f.caption ? <figcaption>{f.caption}</figcaption> : null}
                      </figure>
                    ))}
                  </div>
                ) : null}
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
              {e.hand ? (
                <aside className="log-note log-note-hand">
                  {/* The note is the handwriting: a crop of JC's pen on the printed page, ink lifted
                      onto the page. The transcript lives in alt text only. */}
                  <img src={e.hand.src} alt={e.hand.transcript} width={e.hand.width} height={e.hand.height} loading="lazy" />
                  <div className="who">{tag(e.date)}</div>
                </aside>
              ) : e.note ? (
                <aside className="log-note">
                  {e.note}
                  <div className="who">{tag(e.date)}</div>
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
