# 🚀 Engineer Portfolio Template

A modern, accessible, and SEO-optimized portfolio architecture for software and systems engineers. 

[**Live Demo**](#) | [**Deploy to Netlify**](#) | [**Report Bug**](#)

---

## 🛠 The Stack

This template is engineered for speed, type safety, and low maintenance.

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Astro 5.x** | Content-first architecture with zero-bundle JS by default. Uses Zod for strict schema validation. |
| **Styling** | **Bootstrap 5.3** | Utilizing SCSS variables for a custom "Paper & Ink" aesthetic while maintaining a robust grid system. |
| **CMS** | **Decap CMS 3** | Git-backed content management. No database required; your data lives in your repo. |
| **Content** | **MDX & JSON** | Allows embedding interactive components (charts, terminals, alerts) directly into case studies. |
| **Deployment** | **Netlify** | Native support for Identity (Auth) and Git Gateway to power the CMS workflow. |

---

## 📁 Repository Architecture

```text
site/
  ├── src/
  │   ├── content/             # The "Database" (JSON and MDX files)
  │   │   ├── projects/        # Deep-dive case studies (MDX)
  │   │   ├── blog/            # Technical writing (MDX)
  │   │   ├── skills/          # Categorized technical competencies
  │   │   └── home/            # Section-by-section homepage content
  │   ├── content.config.ts    # Zod schemas (Type-safety for your content)
  │   ├── layouts/             # Reusable page wrappers
  │   └── styles/              # Custom SCSS (Bootstrap overrides)
  ├── public/
  │   └── admin/               # Decap CMS configuration and UI
  ├── astro.config.mjs         # SSG & Integration settings
  └── netlify.toml             # CI/CD and Header configurations
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
# Clone the template
git clone https://github.com/your-username/your-portfolio.git
cd site

# Install dependencies
npm install

# Start local development
npm run dev
```
Your site will be live at `http://localhost:4321`.

### 2. Configure the CMS
To edit content locally via the CMS:
1. Run `npx decap-server` in a separate terminal.
2. Visit `http://localhost:4321/admin/`.
3. Set `local_backend: true` in `public/admin/config.yml`.

### 3. Build for Production
```bash
npm run build
```

---

## 📝 Managing Content

This template treats your career as a series of **Collections**. You don't need to touch code to update your resume:

* **Site Settings:** Manage your global SEO, social links, and obfuscated contact info.
* **Case Studies:** Detailed project breakdowns. Use the `featured` flag to highlight your best work (e.g., SRE tools, distributed systems, or AI agents) on the homepage.
* **The "Story":** The homepage is broken into "chapters" (Origin, Journey, Skills, etc.), allowing you to build a narrative rather than just a list of jobs.

> **Note:** Every time you hit "Publish" in the `/admin` dashboard, a new commit (or Pull Request) is generated in your GitHub history, triggering an automatic redeploy.

---

## 🎨 Customization

### Branding
The visual identity is controlled via `src/styles/theme.scss`. You can easily override the primary design tokens:
* `$paper`: The background/canvas color.
* `$ink`: The primary text color.
* `$vermillion`: The accent color used for CTAs and highlights.

### Schemas
Modify `src/content.config.ts` to add new fields to your projects or blog posts. Astro will automatically regenerate TypeScript types, ensuring your components never break due to missing data.

---

## 📈 Performance & Accessibility
* **95+ Lighthouse Scores:** Optimized images and minimal client-side JS.
* **A11y:** Includes skip-links, ARIA labels, and supports `prefers-reduced-motion`.
* **SEO:** Automatic JSON-LD, OpenGraph tags, and RSS feed generation.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---