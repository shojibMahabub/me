/* =====================================================================
   preview.js
   Registers live-preview templates for every Decap CMS collection so
   editors see a styled rendition of the entry as they type, not just a
   raw JSON dump. Written in plain ES5-ish JS (no JSX / bundler) because
   Decap loads this directly in the admin shell.
   ===================================================================== */

(function () {
    if (typeof window === 'undefined' || !window.CMS) {
        // Script may load before decap-cms.js on very slow connections.
        // In that case, retry once DOMContentLoaded fires.
        document.addEventListener('DOMContentLoaded', register);
        return;
    }
    register();

    function register() {
        var CMS = window.CMS;
        if (!CMS) return;

        // Load our preview stylesheet into Decap's sandboxed iframe.
        CMS.registerPreviewStyle('/admin/preview.css');
        // Pull in the display fonts too so typography matches the live site.
        CMS.registerPreviewStyle(
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
        );

        CMS.registerPreviewTemplate('site',     sitePreview);
        CMS.registerPreviewTemplate('home',     homePreview);
        CMS.registerPreviewTemplate('about',    aboutPreview);
        CMS.registerPreviewTemplate('skills',   skillsPreview);
        CMS.registerPreviewTemplate('projects', projectPreview);
        CMS.registerPreviewTemplate('blog',     blogPreview);
        CMS.registerPreviewTemplate('videos',   videoPreview);
    }

    // ---------- helpers --------------------------------------------------

    var h = window.h || null; // set below once React is available

    function $h() {
        // Decap exposes React via `window.React` inside the preview iframe
        // AND passes a React.createElement alias through props; `h` is the
        // most convenient wrapper. We rebind every call in case React loads
        // after this script.
        h = window.h || (window.React && window.React.createElement);
        return h.apply(null, arguments);
    }

    function toJS(val) {
        // Entry data comes in as an Immutable.js Map/List — .toJS() flattens
        // it into plain JS so we can traverse it ergonomically.
        if (val && typeof val.toJS === 'function') return val.toJS();
        return val;
    }

    function get(entry, path) {
        var data = toJS(entry.get('data'));
        if (!data) return undefined;
        var parts = Array.isArray(path) ? path : String(path).split('.');
        var cur = data;
        for (var i = 0; i < parts.length; i++) {
            if (cur == null) return undefined;
            cur = cur[parts[i]];
        }
        return cur;
    }

    function empty(label) {
        return $h('span', { className: 'cms-empty' }, '— ' + label + ' —');
    }

    function section(title, body) {
        return $h(
            'section',
            { className: 'cms-section' },
            $h('h2', null, title),
            body
        );
    }

    function shell(children, opts) {
        var cls = 'cms-preview-shell';
        if (opts && opts.dark) cls += ' is-dark';
        return $h('div', { className: cls }, children);
    }

    // Decap's MarkdownWidget returns rich HTML. We render it via the props
    // callback `widgetFor('body')` — no need to parse markdown ourselves.
    function renderBody(widgetFor) {
        if (!widgetFor) return null;
        return $h('div', { className: 'cms-body' }, widgetFor('body'));
    }

    // ---------- site -----------------------------------------------------

    function sitePreview(props) {
        var entry = props.entry;
        var title   = get(entry, 'title');
        var tagline = get(entry, 'tagline');
        var brand   = get(entry, 'brand') || {};
        var navLinks = get(entry, 'navLinks') || [];
        var footer   = get(entry, 'footer') || {};
        var seo      = get(entry, 'seo') || {};
        var contact  = get(entry, 'contact') || {};

        return shell([
            $h('div', { className: 'cms-eyebrow', key: 'eb' }, 'Site settings'),
            $h('h1', { key: 't' }, title || 'Untitled site'),
            $h('p', { className: 'cms-muted', key: 'tag' }, tagline || ''),
            $h('div', { className: 'cms-section', key: 'brand' }, [
                $h('h2', { key: 'h' }, 'Brand'),
                $h('p', { key: 'p' }, [
                    $h('span', { className: 'cms-pill primary', key: 'm' }, brand.mark || '–'),
                    ' ',
                    $h('strong', { key: 'n' }, brand.text || '')
                ])
            ]),
            section(
                'Navigation',
                navLinks.length
                    ? $h('div', { className: 'cms-pill-row' },
                        navLinks.map(function (link, i) {
                            return $h('span', {
                                className: 'cms-pill' + (link.cta ? ' primary' : ''),
                                key: i
                            }, (link.label || '') + '  →  ' + (link.href || ''));
                        })
                    )
                    : empty('no nav links yet')
            ),
            section('Footer', $h('p', { className: 'cms-muted' },
                (footer.left || '–') + '    ·    ' + (footer.right || '–')
            )),
            section('SEO defaults', [
                $h('p', { key: 'd' }, seo.description || empty('no description')),
                seo.ogImage ? $h('p', { className: 'cms-muted', key: 'i' }, 'OG image: ' + seo.ogImage) : null
            ]),
            section('Contact', [
                $h('p', { key: 'loc' }, 'Location: ' + (contact.location || '–')),
                $h('p', { key: 'li'  }, 'LinkedIn: ' + (contact.linkedin || '–')),
                $h('p', { key: 'gh'  }, 'GitHub: '   + (contact.github   || '–')),
                $h('p', { className: 'cms-muted', key: 'n' }, contact.phoneNote || '')
            ])
        ]);
    }

    // ---------- home -----------------------------------------------------

    function homePreview(props) {
        var entry = props.entry;
        var hero     = get(entry, 'hero')     || {};
        var origin   = get(entry, 'origin')   || {};
        var journey  = get(entry, 'journey')  || {};
        var featured = get(entry, 'featured') || {};
        var skills   = get(entry, 'skills')   || {};
        var reel     = get(entry, 'reel')     || {};
        var writing  = get(entry, 'writing')  || {};
        var contact  = get(entry, 'contact')  || {};

        return shell([
            heroBlock(hero),
            chapterBlock(origin,   { body: true }),
            chapterBlock(journey,  { timeline: true }),
            chapterBlock(featured, { listLabel: 'Featured projects', items: featured.projectSlugs }),
            chapterBlock(skills,   { desc: true }),
            chapterBlock(reel,     { listLabel: 'Videos', items: reel.videoSlugs }),
            chapterBlock(writing,  { listLabel: 'Posts', items: writing.postSlugs }),
            endCardBlock(contact)
        ]);
    }

    function heroBlock(hero) {
        var ctas  = hero.ctas  || [];
        var stats = hero.stats || [];
        return $h('section', { className: 'cms-section', key: 'hero' }, [
            $h('div', { className: 'cms-eyebrow', key: 'e' }, hero.eyebrow || 'Hero'),
            $h('h1', {
                key: 't',
                className: 'cms-hero-title',
                dangerouslySetInnerHTML: { __html: hero.titleHtml || 'Your headline goes here' }
            }),
            $h('p', { className: 'cms-hero-sub', key: 's' }, hero.sub || ''),
            ctas.length ? $h('div', { className: 'cms-ctas', key: 'c' },
                ctas.map(function (c, i) {
                    return $h('span', {
                        className: 'cms-cta ' + (c.style || 'primary'),
                        key: i
                    }, c.label || '–');
                })
            ) : null,
            stats.length ? $h('div', { className: 'cms-stats', key: 'st' },
                stats.map(function (s, i) {
                    return $h('div', { key: i }, [
                        $h('span', { className: 'v', key: 'v' }, s.value || '–'),
                        $h('span', { className: 'l', key: 'l' }, s.label || '')
                    ]);
                })
            ) : null
        ]);
    }

    function chapterBlock(ch, opts) {
        opts = opts || {};
        return $h('section', { className: 'cms-section', key: ch.title || Math.random() }, [
            ch.chapterNum ? $h('span', { className: 'cms-chapter-num', key: 'n' }, ch.chapterNum) : null,
            $h('h2', { key: 'h' }, ch.title || '(untitled chapter)'),
            ch.desc ? $h('p', { className: 'cms-muted', key: 'd' }, ch.desc) : null,
            opts.body && ch.body && ch.body.length
                ? ch.body.map(function (p, i) { return $h('p', { key: i }, p); })
                : null,
            opts.timeline && ch.items && ch.items.length
                ? $h('ol', { className: 'cms-timeline', key: 'tl' },
                    ch.items.map(function (item, i) {
                        return $h('li', { key: i, className: item.isNow ? 'is-now' : '' }, [
                            $h('span', { className: 'year', key: 'y' }, item.year || ''),
                            $h('h3', { key: 't' }, item.title || ''),
                            $h('p',  { className: 'cms-muted', key: 'p' }, item.description || '')
                        ]);
                    })
                )
                : null,
            opts.listLabel && opts.items && opts.items.length
                ? $h('div', { className: 'cms-pill-row', key: 'pl' },
                    opts.items.map(function (slug, i) {
                        return $h('span', { className: 'cms-pill mono', key: i }, String(slug));
                    })
                )
                : null
        ]);
    }

    function endCardBlock(c) {
        var actions = c.actions || [];
        return $h('section', { className: 'cms-end-card', key: 'end' }, [
            c.chapterNum ? $h('span', { className: 'cms-chapter-num', key: 'n' }, c.chapterNum) : null,
            $h('h2', { key: 'h' }, c.title || 'Contact'),
            $h('p', { className: 'cms-muted', key: 'd' }, c.desc || ''),
            actions.map(function (a, i) {
                return $h('div', { className: 'row', key: i }, [
                    $h('div', { key: 'l' }, [
                        $h('div', { className: 'kicker', key: 'k' }, a.kicker || ''),
                        $h('div', { className: 'title',  key: 't' }, a.title  || ''),
                        $h('div', { className: 'sub',    key: 's' }, a.sub    || '')
                    ]),
                    $h('span', { className: 'cta', key: 'c' }, a.cta || '')
                ]);
            })
        ]);
    }

    // ---------- about ----------------------------------------------------

    function aboutPreview(props) {
        var entry = props.entry;
        var eyebrow   = get(entry, 'eyebrow');
        var titleHtml = get(entry, 'titleHtml');
        var sub       = get(entry, 'sub');
        var cards     = get(entry, 'cards') || [];

        return shell([
            $h('div', { className: 'cms-eyebrow', key: 'e' }, eyebrow || ''),
            $h('h1', {
                key: 't',
                dangerouslySetInnerHTML: { __html: titleHtml || 'About' }
            }),
            $h('p', { className: 'cms-muted', key: 's' }, sub || ''),
            cards.length
                ? cards.map(function (card, i) {
                    var dark = card.kind === 'cta';
                    return $h('div', { className: 'cms-card' + (dark ? ' dark' : ''), key: i }, [
                        $h('h3', { key: 'h' }, card.title || '(untitled card)'),
                        card.kind === 'list' && card.items
                            ? $h('ul', { key: 'l' }, card.items.map(function (it, j) {
                                return $h('li', { key: j }, it);
                            }))
                            : null,
                        card.kind === 'text' ? $h('p', { key: 'b' }, card.body || '') : null,
                        card.kind === 'stats' && card.items
                            ? $h('div', { className: 'cms-stats', key: 's' },
                                card.items.map(function (st, j) {
                                    return $h('div', { key: j }, [
                                        $h('span', { className: 'v', key: 'v' }, st.value),
                                        $h('span', { className: 'l', key: 'l' }, st.label)
                                    ]);
                                })
                            )
                            : null,
                        card.kind === 'cta'
                            ? [
                                $h('p', { key: 'b' }, card.body || ''),
                                card.cta ? $h('span', {
                                    key: 'c',
                                    className: 'cms-cta primary'
                                }, card.cta.label || 'CTA') : null
                            ]
                            : null
                    ]);
                })
                : empty('no cards yet')
        ]);
    }

    // ---------- skills ---------------------------------------------------

    function skillsPreview(props) {
        var groups = get(props.entry, 'groups') || [];
        return shell([
            $h('h1', { key: 't' }, 'Skills'),
            groups.length
                ? groups.map(function (g, i) {
                    return $h('div', { className: 'cms-card', key: i }, [
                        $h('h3', { key: 'h' }, g.group || '(unnamed group)'),
                        g.primary && g.primary.length
                            ? $h('div', { className: 'cms-pill-row', key: 'p' },
                                g.primary.map(function (c, j) {
                                    return $h('span', { className: 'cms-pill primary', key: j }, c);
                                })
                            )
                            : null,
                        g.secondary && g.secondary.length
                            ? $h('div', { className: 'cms-pill-row', key: 's' },
                                g.secondary.map(function (c, j) {
                                    return $h('span', { className: 'cms-pill mono', key: j }, c);
                                })
                            )
                            : null
                    ]);
                })
                : empty('no skill groups yet')
        ]);
    }

    // ---------- projects -------------------------------------------------

    function projectPreview(props) {
        var entry = props.entry;
        var d = toJS(entry.get('data')) || {};
        return shell([
            $h('span', { className: 'cms-chapter-num', key: 'n' }, d.year || '—'),
            $h('h1', { key: 't' }, d.title || 'Untitled project'),
            $h('p', { className: 'cms-hero-sub', key: 's' }, d.summary || ''),
            $h('div', { className: 'cms-pill-row', key: 'meta' }, [
                d.role   ? $h('span', { className: 'cms-pill mono', key: 'r' }, 'Role: ' + d.role) : null,
                d.team   ? $h('span', { className: 'cms-pill mono', key: 't' }, 'Team: ' + d.team) : null,
                d.stack  ? $h('span', { className: 'cms-pill mono', key: 's' }, 'Stack: ' + d.stack) : null,
                d.timeline ? $h('span', { className: 'cms-pill mono', key: 'tl' }, d.timeline) : null
            ]),
            d.impact ? $h('p', { key: 'i' }, $h('strong', null, d.impact)) : null,
            d.categories && d.categories.length
                ? $h('div', { className: 'cms-pill-row', key: 'cat' },
                    d.categories.map(function (c, i) {
                        return $h('span', { className: 'cms-pill', key: i }, c);
                    })
                )
                : null,
            d.tags && d.tags.length
                ? $h('div', { className: 'cms-pill-row', key: 'tg' },
                    d.tags.map(function (t, i) {
                        return $h('span', { className: 'cms-pill mono', key: i }, t);
                    })
                )
                : null,
            d.video && d.video.pattern
                ? $h('div', { className: 'cms-poster ' + d.video.pattern, key: 'v' })
                : null,
            renderBody(props.widgetFor)
        ]);
    }

    // ---------- blog -----------------------------------------------------

    function blogPreview(props) {
        var entry = props.entry;
        var d = toJS(entry.get('data')) || {};
        var date = d.date ? new Date(d.date) : null;
        var dateStr = date && !isNaN(date) ? date.toLocaleDateString('en-GB', {
            year: 'numeric', month: 'short', day: '2-digit'
        }) : '';
        return shell([
            $h('div', { className: 'cms-eyebrow', key: 'e' }, [
                d.category || 'Writing',
                dateStr ? '  ·  ' + dateStr : '',
                d.readTime ? '  ·  ' + d.readTime : ''
            ].join('')),
            $h('h1', { key: 't' }, d.title || 'Untitled post'),
            $h('p', { className: 'cms-hero-sub', key: 's' }, d.excerpt || ''),
            d.draft ? $h('div', {
                key: 'dr',
                className: 'cms-pill mono',
                style: { display: 'inline-block', marginBottom: '0.75rem' }
            }, 'DRAFT · will not publish') : null,
            renderBody(props.widgetFor)
        ]);
    }

    // ---------- videos ---------------------------------------------------

    function videoPreview(props) {
        var d = toJS(props.entry.get('data')) || {};
        return shell([
            $h('div', { className: 'cms-eyebrow', key: 'e' }, 'Video · ' + (d.duration || '0:00')),
            $h('h1', { key: 't' }, d.title || 'Untitled video'),
            $h('p', { className: 'cms-hero-sub', key: 's' }, d.description || ''),
            d.pattern ? $h('div', { className: 'cms-poster ' + d.pattern, key: 'p' }) : null,
            $h('p', { className: 'cms-muted', key: 'src' }, d.src
                ? 'Embed: ' + d.src
                : empty('no embed URL')),
            d.href ? $h('p', { className: 'cms-muted', key: 'h' }, 'Case study: ' + d.href) : null
        ]);
    }
})();
