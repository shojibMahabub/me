import { defineCollection, z, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Helper: wrap a flat JSON singleton into { [id]: ...content } so Astro's
// file() loader treats it as one entry, while the on-disk file stays
// flat and editor-friendly for Decap CMS.
const singleton = (id: string) => (text: string) => {
    const data = JSON.parse(text);
    return { [id]: data };
};

// =====================================================================
// Shared fragments
// =====================================================================
const seoSchema = z.object({
    description: z.string().optional(),
    ogImage: z.string().optional(),
});

const linkSchema = z.object({
    label: z.string(),
    href: z.string(),
});

const statSchema = z.object({
    value: z.string(),
    label: z.string(),
});

const ctaSchema = z.object({
    label: z.string(),
    href: z.string(),
    style: z.enum(['primary', 'ghost']).default('primary'),
});

// =====================================================================
// Site singleton: nav, footer, SEO defaults, contact (obfuscated)
// =====================================================================
const site = defineCollection({
    loader: file('src/content/site/site.json', { parser: singleton('site') }),
    schema: z.object({
        title: z.string(),
        tagline: z.string(),
        brand: z.object({
            mark: z.string(),
            text: z.string(),
        }),
        navLinks: z.array(
            linkSchema.extend({
                cta: z.boolean().default(false),
            })
        ),
        footer: z.object({
            left: z.string(),
            right: z.string(),
        }),
        seo: seoSchema,
        contact: z.object({
            emailUserB64: z.string().describe('base64 of email local-part'),
            emailDomainB64: z.string().describe('base64 of email domain'),
            linkedin: z.string().url(),
            github: z.string().url(),
            location: z.string(),
            phoneNote: z.string().default('Phone shared on request, over the channels above.'),
        }),
    }),
});

// =====================================================================
// Home page singleton: every chapter is editable
// =====================================================================
const home = defineCollection({
    loader: file('src/content/home/home.json', { parser: singleton('home') }),
    schema: z.object({
        hero: z.object({
            eyebrow: z.string(),
            titleHtml: z.string().describe('Allowed: <br>, <span class="accent">'),
            sub: z.string(),
            ctas: z.array(ctaSchema).max(3),
            stats: z.array(statSchema).max(6),
            scrollLabel: z.string().default('scroll'),
        }),
        origin: z.object({
            chapterNum: z.string(),
            title: z.string(),
            body: z.array(z.string()),
        }),
        journey: z.object({
            chapterNum: z.string(),
            title: z.string(),
            items: z.array(
                z.object({
                    year: z.string(),
                    title: z.string(),
                    description: z.string(),
                    isNow: z.boolean().default(false),
                })
            ),
        }),
        featured: z.object({
            chapterNum: z.string(),
            title: z.string(),
            seeAllHref: z.string().default('/projects/'),
            projectSlugs: z.array(reference('projects')).min(1).max(4),
        }),
        skills: z.object({
            chapterNum: z.string(),
            title: z.string(),
            desc: z.string(),
        }),
        reel: z.object({
            chapterNum: z.string(),
            title: z.string(),
            desc: z.string(),
            videoSlugs: z.array(reference('videos')).min(1),
        }),
        writing: z.object({
            chapterNum: z.string(),
            title: z.string(),
            seeAllHref: z.string().default('/blog/'),
            postSlugs: z.array(reference('blog')).min(1).max(4),
        }),
        contact: z.object({
            chapterNum: z.string(),
            title: z.string(),
            desc: z.string(),
            actions: z.array(
                z.object({
                    kicker: z.string(),
                    title: z.string(),
                    sub: z.string(),
                    cta: z.string(),
                    kind: z.enum(['email', 'link']),
                    href: z.string().optional(),
                })
            ),
        }),
    }),
});

// =====================================================================
// About singleton
// =====================================================================
const about = defineCollection({
    loader: file('src/content/about/about.json', { parser: singleton('about') }),
    schema: z.object({
        eyebrow: z.string(),
        titleHtml: z.string(),
        sub: z.string(),
        cards: z.array(
            z.discriminatedUnion('kind', [
                z.object({
                    kind: z.literal('list'),
                    title: z.string(),
                    wide: z.boolean().default(false),
                    items: z.array(z.string()),
                }),
                z.object({
                    kind: z.literal('text'),
                    title: z.string(),
                    wide: z.boolean().default(false),
                    body: z.string(),
                }),
                z.object({
                    kind: z.literal('stats'),
                    title: z.string(),
                    wide: z.boolean().default(false),
                    items: z.array(statSchema),
                }),
                z.object({
                    kind: z.literal('cta'),
                    title: z.string(),
                    wide: z.boolean().default(false),
                    body: z.string(),
                    cta: ctaSchema,
                }),
            ])
        ),
    }),
});

// =====================================================================
// Skills singleton (array of groups)
// =====================================================================
const skills = defineCollection({
    loader: file('src/content/skills/skills.json', { parser: singleton('skills') }),
    schema: z.object({
        groups: z.array(
            z.object({
                group: z.string(),
                primary: z.array(z.string()),
                secondary: z.array(z.string()),
            })
        ),
    }),
});

// =====================================================================
// Projects collection (MDX case studies)
// =====================================================================
const projects = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        summary: z.string(),
        role: z.string(),
        year: z.string(),
        categories: z.array(z.enum(['banking', 'cloud', 'data', 'security'])),
        tags: z.array(z.string()),
        impact: z.string(),
        featured: z.boolean().default(false),
        heroEyebrow: z.string().optional(),
        heroSub: z.string().optional(),
        team: z.string().optional(),
        timeline: z.string().optional(),
        stack: z.string().optional(),
        video: z.object({
            src: z.string().url(),
            pattern: z.enum(['poster-pattern-1', 'poster-pattern-2', 'poster-pattern-3', 'poster-pattern-4']),
            caption: z.string().default('Short walkthrough.'),
            playLabel: z.string().default('Play walkthrough'),
        }).optional(),
        related: z.array(reference('projects')).default([]),
        order: z.number().default(100),
        draft: z.boolean().default(false),
    }),
});

// =====================================================================
// Blog collection (MDX posts)
// =====================================================================
const blog = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        excerpt: z.string(),
        date: z.coerce.date(),
        readTime: z.string(),
        category: z.string(),
        draft: z.boolean().default(false),
    }),
});

// =====================================================================
// Videos collection (JSON)
// =====================================================================
const videos = defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/videos' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        duration: z.string(),
        pattern: z.enum(['poster-pattern-1', 'poster-pattern-2', 'poster-pattern-3', 'poster-pattern-4']),
        src: z.string().url(),
        href: z.string().optional(),
    }),
});

export const collections = { site, home, about, skills, projects, blog, videos };
