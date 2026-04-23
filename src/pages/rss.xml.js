import rss from '@astrojs/rss';
import { getCollection, getEntry } from 'astro:content';

export async function GET(context) {
    const siteEntry = await getEntry('site', 'site');
    const site = siteEntry.data;

    const posts = (await getCollection('blog', (p) => !p.data.draft))
        .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

    return rss({
        title: `${site.title} · Writing`,
        description: site.seo.description ?? site.tagline,
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.excerpt,
            pubDate: post.data.date,
            link: `/blog/${post.id}/`,
            categories: [post.data.category],
        })),
        customData: '<language>en-gb</language>',
    });
}
