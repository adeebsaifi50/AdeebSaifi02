/* ==========================================
   BLOG SYSTEM WITH REAL-TIME SEARCH & FILTERS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initBlog();
});

function initBlog() {
    const blogGrid = document.getElementById("blog-grid");
    const searchInput = document.getElementById("blog-search");
    const blogFilters = document.getElementById("blog-filters");

    if (!blogGrid) return;

    // Premium high-fidelity blog posts data
    const posts = [
        {
            id: 1,
            title: "Designing the Future: Synthesizing Apple, Stripe, and Linear",
            category: "design",
            readTime: "6 min read",
            date: "May 24, 2026",
            summary: "An exploration of glassmorphism, elegant border lines, micro-animations, and how we can achieve premium digital product feel without bloated frameworks.",
            desc: "The digital product design standard has shifted towards sheer fluidity. Learn how we utilize CSS custom properties, subtle radial gradient lighting, and responsive typography to capture modern design excellence."
        },
        {
            id: 2,
            title: "Performance Engineering: Targeting 100 on Lighthouse",
            category: "engineering",
            readTime: "8 min read",
            date: "April 12, 2026",
            summary: "A deep dive into sub-millisecond styling, lazy loading mechanics, optimized resource caching using Service Workers, and writing clean native JS.",
            desc: "Frameworks introduce massive bundles. This article proves how returning to pure semantic HTML, vanilla CSS grid architecture, and selective lazy image rendering guarantees maximum performance and absolute accessibility."
        },
        {
            id: 3,
            title: "A Minimalist's Travel Journey Across Japan",
            category: "travel",
            readTime: "5 min read",
            date: "March 18, 2026",
            summary: "How traveling light with just a single mirrorless camera transformed my design perspective and inspired new workflows in interactive card spacing.",
            desc: "Kyoto bamboo groves and Tokyo's pixelated rain streets exhibit a masterclass in space, contrast, and balance. Let us reflect on how physical minimalist architectural concepts transfer into UI design."
        },
        {
            id: 4,
            title: "Mastering Accessibility: Building for Every Screen Reader",
            category: "accessibility",
            readTime: "7 min read",
            date: "Feb 05, 2026",
            summary: "Ensuring proper contrast, strict ARIA labeling, custom keyboard navigational shortcuts, and why semantic HTML remains the ultimate foundation.",
            desc: "Web inclusion is not a checklist item; it is a fundamental developer standard. Explore modern tactics for creating customized keyboard focus rings and handling focus states gracefully."
        },
        {
            id: 5,
            title: "Unlocking SEO Dominance: Schema Structured Data Guide",
            category: "seo",
            readTime: "4 min read",
            date: "Jan 15, 2026",
            summary: "How semantic metadata, properly formulated JSON-LD files, Open Graph tags, and robots configurations boost page rank dramatically.",
            desc: "Search engine algorithms crave structured meaning. By providing crystal-clear schemas and perfect meta tags, your site stands out perfectly on search result card snippets."
        }
    ];

    // Render Filter Chips
    const categories = ["all", ...new Set(posts.map(p => p.category))];
    if (blogFilters) {
        blogFilters.innerHTML = categories.map(cat => `
            <button class="filter-chip ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
                ${cat.toUpperCase()}
            </button>
        `).join("");

        // Chip click events
        const chips = blogFilters.querySelectorAll(".filter-chip");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                filterPosts();
            });
        });
    }

    // Render blog cards helper
    function renderPosts(filteredPosts) {
        if (filteredPosts.length === 0) {
            blogGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted); font-family: var(--font-sans);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>No articles match your search</h3>
                    <p>Try searching different terms or clearing the selected filters.</p>
                </div>
            `;
            return;
        }

        blogGrid.innerHTML = filteredPosts.map(post => `
            <article class="blog-card card reveal reveal-up" data-category="${post.category}">
                <div class="blog-card-meta">
                    <span class="blog-card-badge">${post.category}</span>
                    <span class="blog-card-date">${post.date}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-summary">${post.summary}</p>
                <div class="blog-card-footer">
                    <span class="blog-card-time">${post.readTime}</span>
                    <button class="blog-read-btn btn btn-secondary" onclick="openFullArticle(${post.id})">
                        Read Article ↗
                    </button>
                </div>
            </article>
        `).join("");

        // Setup scroll reveal on fresh items
        const reveals = blogGrid.querySelectorAll(".reveal");
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(el => revealObserver.observe(el));
    }

    // Dynamic Filter & Search Logic
    function filterPosts() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const activeChip = blogFilters ? blogFilters.querySelector(".filter-chip.active") : null;
        const activeCategory = activeChip ? activeChip.getAttribute("data-filter") : "all";

        const filtered = posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                                  post.summary.toLowerCase().includes(searchTerm) ||
                                  post.desc.toLowerCase().includes(searchTerm);

            const matchesCategory = activeCategory === "all" || post.category === activeCategory;

            return matchesSearch && matchesCategory;
        });

        renderPosts(filtered);
    }

    // Bind Search Input
    if (searchInput) {
        searchInput.addEventListener("input", filterPosts);
    }

    // Initial render
    renderPosts(posts);

    // Expose Article modal trigger to window
    window.openFullArticle = (id) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;

        // Create Fullscreen beautiful readable Modal
        const modal = document.createElement("div");
        modal.id = "blog-fullscreen-modal";
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: var(--bg-base);
            z-index: 10000;
            overflow-y: auto;
            padding: 6rem 2rem 4rem 2rem;
            animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        modal.innerHTML = `
            <div class="container" style="max-width: 750px;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="document.getElementById('blog-fullscreen-modal').remove()">
                    ← Back to Articles
                </button>

                <div style="display:flex; gap:1rem; align-items:center; margin-bottom: 1.5rem;">
                    <span class="blog-card-badge" style="background: var(--color-primary-glow); color: var(--color-primary); padding: 0.4rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.8rem;">
                        ${post.category.toUpperCase()}
                    </span>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">${post.date} • ${post.readTime}</span>
                </div>

                <h1 style="font-size: 3rem; font-weight: 850; margin-bottom: 2rem; line-height: 1.15; letter-spacing: -0.03em;">
                    ${post.title}
                </h1>

                <p style="font-size: 1.35rem; color: var(--text-primary); line-height: 1.6; font-weight: 500; margin-bottom: 2.5rem; border-left: 4px solid var(--color-primary); padding-left: 1.5rem; font-style: italic;">
                    "${post.summary}"
                </p>

                <div style="font-size: 1.15rem; color: var(--text-secondary); line-height: 1.8;">
                    <p style="margin-bottom: 1.5rem;">${post.desc}</p>
                    <p style="margin-bottom: 1.5rem;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed varius mi. Nunc scelerisque magna ac elementum tempor. Proin hendrerit finibus arcu, quis rhoncus diam pretium ut. In pellentesque rhoncus ligula vel tempor. Sed a finibus risus, sit amet interdum nulla. Phasellus imperdiet pellentesque dictum. Ut varius est ac ex interdum, et facilisis ante varius.</p>
                    <p style="margin-bottom: 1.5rem;">Donec scelerisque libero a ante tincidunt, at iaculis nulla hendrerit. Phasellus at nisl non velit viverra luctus et vitae mi. Morbi eu egestas odio. Curabitur vel felis eget nibh condimentum dictum elementum nec leo. Sed vestibulum eleifend sem.</p>
                    <h2 style="font-size: 1.8rem; margin: 2.5rem 0 1rem 0; color: var(--text-primary)">Synthesizing Advanced Framework aesthetics</h2>
                    <p style="margin-bottom: 1.5rem;">Cras vulputate odio in justo bibendum convallis. Suspendisse eu scelerisque lorem. Sed volutpat est sed leo tincidunt, eu semper lectus imperdiet. Morbi eget pulvinar nunc. Sed accumsan pulvinar erat eget elementum. Duis vel est sodales, tristique est id, pellentesque est.</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        // Lock body scroll
        modal.addEventListener("remove", () => {
            document.body.style.overflow = "";
        });
    };
}
