# mahabub-portfolio

Story-driven portfolio for **Mahabub Elahi**, built on Astro 5 + Bootstrap 5.3
and backed by Decap CMS. Every piece of visible content is editable through
`/admin`, each publish becomes a pull request on GitHub, and the site is
continuously deployed on Netlify.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Static site generator | **Astro 5.x** (TypeScript) | Content collections + Zod schemas, near-zero JS to the client, MDX for case studies and posts. |
| CSS | **Bootstrap 5.3** + custom Sass | Layout / nav / modal / grid come from Bootstrap; design tokens (paper, ink, vermillion) override Bootstrap's SCSS variables. |
| Content rich body | **MDX** | Lets editors drop components into posts and case studies. |
| CMS | **Decap CMS 3** (Git-backed) | Lives at `/admin`. Every save is a commit or a pull request. No separate database. |
| Auth | **Netlify Identity + Git Gateway** | Invite-only editors without running a backend. |
| Hosting | **Netlify** | Static output + redirects + headers via `netlify.toml`. |
| Feed / SEO | **@astrojs/rss + @astrojs/sitemap** | `/rss.xml` for writing, `/sitemap-index.xml` for SEO. |

---

## Repo shape

```
site/
  astro.config.mjs
  netlify.toml              # used when site/ IS the repo root
  package.json
  tsconfig.json
  public/
    admin/                  # Decap CMS UI (index.html + config.yml)
    favicon.svg
    images/uploads/         # media uploaded via Decap
  src/
    content.config.ts       # Zod schemas for every collection
    content/
      site/site.json        # singleton: nav, footer, SEO, contact (obfuscated)
      home/home.json        # singleton: 7 chapters of the home page
      about/about.json      # singleton: about cards
      skills/skills.json    # singleton: skill groups
      projects/*.mdx        # case studies
      blog/*.mdx            # posts
      videos/*.json         # video reel entries
    layouts/                # BaseLayout, CaseLayout, PostLayout
    components/             # Nav, Hero, Timeline, ProjectCard, ...
    pages/                  # index.astro, projects/, blog/, about.astro, rss.xml.js
    styles/                 # theme.scss (Bootstrap tokens) + components.scss
    scripts/site.ts         # nav sticky, reveal-on-scroll, video modal, contact reveal

../netlify.toml             # used when the whole workspace is the repo root
```

---

## Local development

### Prerequisites

- Node **20.19+** (22 works too — tested on 22.x)
- `npm` 9 or newer

### Install + run

```bash
cd site
npm install
npm run dev          # http://localhost:4321
```

### Build

```bash
npm run build        # runs astro check + astro build
npm run preview      # preview the built output locally
```

---

## Content editing via `/admin`

In production, go to `https://<your-site>/admin/`, log in with your
Netlify Identity account, and edit any collection. Every publish runs
through the editorial workflow:

1. **Draft** — visible only to you.
2. **In review** — saved to a branch and a PR is opened against `main`.
3. **Ready** — merged. Netlify sees the push and redeploys.

The PR is your version history. `git log` is your audit trail.

### Running the admin locally

Decap ships a `decap-server` you can point the admin at for offline edits:

```bash
# In one terminal:
npx decap-server
# In another, with the dev server running, edit public/admin/config.yml:
#   local_backend: true
# and visit http://localhost:4321/admin/
```

---

## Content model (what's editable)

Everything. In detail:

| Collection | Where | What it drives |
|---|---|---|
| **Site settings** | `src/content/site/site.json` | Nav links, footer text, SEO defaults, obfuscated contact data. |
| **Home page** | `src/content/home/home.json` | All seven chapters: hero, origin, journey, featured projects, skills, video reel, writing, contact. |
| **About** | `src/content/about/about.json` | Page heading + card grid (list / text / stats / cta cards). |
| **Skills** | `src/content/skills/skills.json` | Grouped skill chips for the home page + future about pages. |
| **Projects** | `src/content/projects/*.mdx` | Case studies. Featured flag controls home-page inclusion. |
| **Blog** | `src/content/blog/*.mdx` | Posts. `draft: true` hides from site and feeds. |
| **Videos** | `src/content/videos/*.json` | Video reel entries. Decap generates new JSON per video. |

Schemas live in `src/content.config.ts`. Build **fails** if Decap saves
something that doesn't match the schema — a deliberate safety net.

---

## Adding a new collection

1. Define a Zod schema in `src/content.config.ts` and export it in
   `collections`.
2. Add a matching entry to `public/admin/config.yml` (mirror every field,
   including `required` flags and default values).
3. Pull entries where you need them with `getCollection(...)` or
   `getEntry(...)` and render.
4. Run `npx astro sync` to regenerate types so TypeScript knows about it.

---

## Deploying to Netlify

See [`DEPLOY.md`](./DEPLOY.md) at the workspace root for the exact
click-by-click setup: repo connection, Identity, Git Gateway,
`NODE_VERSION=20`, and the first editor invite.

---

## Accessibility + SEO notes

- Every page has a skip-link to `#main`.
- All interactive non-link controls are `<button>` with proper
  `aria-label`s.
- `IntersectionObserver` reveal animations are disabled under
  `prefers-reduced-motion: reduce`.
- Canonical + Open Graph + Twitter card meta are driven from
  `site.seo` and overridable per page.
- Sitemap + RSS are generated at build time.
