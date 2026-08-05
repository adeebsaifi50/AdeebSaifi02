/* ==========================================
   PHOTO GALLERY & FULL LIGHTBOX SYSTEM
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initGallery();
});

function initGallery() {
    const galleryGrid = document.getElementById("gallery-masonry-grid");
    const filterContainer = document.getElementById("gallery-filters");
    const lightbox = document.getElementById("premium-lightbox");

    if (!galleryGrid) return;

    // Premium realistic mock photogallery data. Keeping support for index.html backwards compatibility as well.
    const photos = [
        { id: "street-delhi", title: "Delhi Neon Hustle", category: "street", file: "street-delhi", desc: "Rich night shadows casting a glow on old Delhi bazaars." },
        { id: "nature-fuji", title: "Mount Fuji Dawn", category: "nature", file: "nature-fuji", desc: "Cherry blossom petals overlooking the legendary snowcapped peak." },
        { id: "architecture-london", title: "Westminster Sunset", category: "architecture", file: "architecture-london", desc: "Deep golden hour rays reflecting off the majestic Big Ben." },
        { id: "travel-dubai", title: "Desert Waves", category: "travel", file: "travel-dubai", desc: "Endless golden sand ridges rippled under the Arabian sun." },
        { id: "street-tokyo", title: "Shibuya Rain Glow", category: "street", file: "street-tokyo", desc: "Dazzling neon signs washing reflecting puddles on Shibuya crossing." },
        { id: "architecture-paris", title: "Eiffel symmetry", category: "architecture", file: "architecture-paris", desc: "A symmetrical view of modern metallic brilliance rising high." },
        { id: "nature-swiss", title: "Alps Serenity", category: "nature", file: "nature-swiss", desc: "Magnificent towering peaks wrapping around standard blue alpine lakes." },
        { id: "travel-kyoto", title: "Bamboo Path Whispers", category: "travel", file: "travel-kyoto", desc: "Sunlight slicing through towering green bamboo forests." }
    ];

    // Render Filters
    const categories = ["all", ...new Set(photos.map(p => p.category))];
    if (filterContainer) {
        filterContainer.innerHTML = categories.map(cat => `
            <button class="filter-chip ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
                ${cat.toUpperCase()}
            </button>
        `).join("");

        // Filter trigger
        const chips = filterContainer.querySelectorAll(".filter-chip");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                const filter = chip.getAttribute("data-filter");
                filterGallery(filter);
            });
        });
    }

    // Render Gallery Items
    function renderGallery(items) {
        galleryGrid.innerHTML = items.map(item => `
            <div class="gallery-card card reveal reveal-scale" data-category="${item.category}">
                <div class="gallery-image-wrapper">
                    <!-- Lazy loading with low-quality-placeholder placeholder style -->
                    <div class="lazy-loader-spinner"></div>
                    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'></svg>"
                         data-src="https://picsum.photos/600/450?random=${item.id}"
                         alt="${item.title}"
                         class="gallery-image lazy" />
                </div>
                <div class="gallery-card-info">
                    <span class="gallery-card-badge">${item.category}</span>
                    <h3 class="gallery-card-title">${item.title}</h3>
                    <p class="gallery-card-desc">${item.desc}</p>
                </div>
            </div>
        `).join("");

        // Initialize lazy loading & animation registers
        lazyLoadImages();

        // Re-trigger scroll reveal for newly added cards
        const reveals = galleryGrid.querySelectorAll(".reveal");
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(el => revealObserver.observe(el));

        // Click to open lightbox
        const cards = galleryGrid.querySelectorAll(".gallery-card");
        cards.forEach((card, idx) => {
            card.addEventListener("click", () => {
                openLightbox(items, idx);
            });
        });
    }

    function filterGallery(category) {
        const filtered = category === "all" ? photos : photos.filter(p => p.category === category);
        // Animate grid collapse, then re-render
        galleryGrid.style.opacity = "0";
        galleryGrid.style.transform = "scale(0.98)";

        setTimeout(() => {
            renderGallery(filtered);
            galleryGrid.style.opacity = "1";
            galleryGrid.style.transform = "scale(1)";
        }, 200);
    }

    // Lazy load logic
    function lazyLoadImages() {
        const lazyImages = galleryGrid.querySelectorAll(".gallery-image.lazy");

        if ("IntersectionObserver" in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.remove("lazy");
                        image.onload = () => {
                            // Hide spinner
                            const spinner = image.previousElementSibling;
                            if (spinner) spinner.style.display = "none";
                        };
                        imageObserver.unobserve(image);
                    }
                });
            });
            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove("lazy");
            });
        }
    }

    // Lightbox triggers
    let currentLightboxIndex = 0;
    let currentLightboxList = [];

    function openLightbox(list, index) {
        if (!lightbox) return;
        currentLightboxList = list;
        currentLightboxIndex = index;
        updateLightboxContent();
        lightbox.classList.add("show");
    }

    function updateLightboxContent() {
        const img = lightbox.querySelector(".lightbox-img");
        const title = lightbox.querySelector(".lightbox-title");
        const desc = lightbox.querySelector(".lightbox-desc");
        const counter = lightbox.querySelector(".lightbox-counter");

        const item = currentLightboxList[currentLightboxIndex];
        if (!item) return;

        img.src = `https://picsum.photos/1200/900?random=${item.id}`;
        title.innerText = item.title;
        desc.innerText = item.desc;
        counter.innerText = `${currentLightboxIndex + 1} / ${currentLightboxList.length}`;
    }

    // Lightbox Controls Setup
    if (lightbox) {
        const closeBtn = lightbox.querySelector(".lightbox-close");
        const prevBtn = lightbox.querySelector(".lightbox-prev");
        const nextBtn = lightbox.querySelector(".lightbox-next");

        if (closeBtn) closeBtn.addEventListener("click", () => lightbox.classList.remove("show"));

        if (prevBtn) prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxList.length) % currentLightboxList.length;
            updateLightboxContent();
        });

        if (nextBtn) nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxList.length;
            updateLightboxContent();
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) lightbox.classList.remove("show");
        });

        // Keyboard arrows navigation
        document.addEventListener("keydown", (e) => {
            if (!lightbox.classList.contains("show")) return;
            if (e.key === "ArrowLeft") prevBtn.click();
            if (e.key === "ArrowRight") nextBtn.click();
            if (e.key === "Escape") lightbox.classList.remove("show");
        });
    }

    // Initial load
    renderGallery(photos);
}
