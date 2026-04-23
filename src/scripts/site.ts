// =====================================================================
// Client-side entry point. Imports Bootstrap JS (uses data-bs-*
// attributes across Nav, offcanvas, modal) and wires up portfolio
// specific behaviour: sticky nav state, scroll-reveal, video modal,
// contact reveal + copy.
// =====================================================================

import { Modal } from 'bootstrap';

// Expose on window for debugging (dev only)
declare global {
    interface Window {
        bootstrap?: { Modal: typeof Modal };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupStickyNav();
    setupRevealOnScroll();
    setupVideoModal();
    setupContactReveal();
});

// ---------- Nav scrolled border ----------
function setupStickyNav() {
    const nav = document.querySelector<HTMLElement>('[data-nav]');
    if (!nav) return;
    const onScroll = () => {
        if (window.scrollY > 12) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------- Reveal on scroll ----------
function setupRevealOnScroll() {
    const targets = document.querySelectorAll<HTMLElement>(
        '.hero-copy, .chapter-head, .chapter-body, .timeline-item, .feat-card, .skill-group, ' +
            '.reel-card, .post-card, .post-row, .proj-card, .about-card, .case-section, .case-head, ' +
            '.case-video, .post-head, .post-body, .end-card'
    );
    if (!('IntersectionObserver' in window)) {
        targets.forEach((t) => t.classList.add('is-visible'));
        return;
    }
    targets.forEach((t) => t.classList.add('reveal'));
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => io.observe(t));
}

// ---------- Video modal ----------
function setupVideoModal() {
    const modalEl = document.querySelector<HTMLElement>('[data-video-modal]');
    const frame = modalEl?.querySelector<HTMLElement>('[data-video-frame]');
    if (!modalEl || !frame) return;

    const modal = Modal.getOrCreateInstance(modalEl);

    document.querySelectorAll<HTMLElement>('[data-video-open]').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const src = trigger.getAttribute('data-video-open');
            if (!src) return;
            const glue = src.includes('?') ? '&' : '?';
            frame.innerHTML = `<iframe src="${src}${glue}autoplay=1&rel=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
            modal.show();
        });
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
        frame.innerHTML = '';
    });
}

// ---------- Contact reveal + copy ----------
function setupContactReveal() {
    const toast = document.querySelector<HTMLElement>('[data-contact-toast]');

    document.querySelectorAll<HTMLButtonElement>('[data-contact-reveal="email"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const user = decodeBase64(btn.getAttribute('data-user'));
            const domain = decodeBase64(btn.getAttribute('data-domain'));
            if (!user || !domain) return;
            const email = `${user}@${domain}`;

            const sub = btn.querySelector<HTMLElement>('.contact-action-sub');
            const cta = btn.querySelector<HTMLElement>('.contact-action-cta');
            if (sub) sub.textContent = email;
            if (cta) cta.textContent = 'Opening mail…';
            btn.classList.add('is-revealed');

            copyToClipboard(email).then((ok) => {
                showToast(toast, ok ? 'Email copied · opening mail client' : 'Opening mail client');
                setTimeout(() => {
                    window.location.href = `mailto:${email}`;
                }, 250);
                setTimeout(() => {
                    if (cta) cta.textContent = 'Copied ✓';
                }, 600);
            });
        });
    });
}

function showToast(toast: HTMLElement | null, message: string) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function decodeBase64(value: string | null) {
    if (!value) return '';
    try {
        return atob(value.trim());
    } catch {
        return '';
    }
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

export {};
