/* ==========================================
   INTERACTIVE TRAVEL MAP COMPONENT (SVG-BASED)
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initTravelMap();
});

function initTravelMap() {
    const mapContainer = document.getElementById("travel-map-container");
    if (!mapContainer) return;

    // A beautiful SVG representation of a simple global map projection
    // We add pins on traveler hotspots: Tokyo, London, New York, Paris, Dubai, Delhi.
    const visitedLocations = [
        { name: "New York, USA", x: 260, y: 150, desc: "Explored Central Park, Times Square, and Brooklyn Bridge!" },
        { name: "London, UK", x: 470, y: 110, desc: "Historic architecture, high tea, and magnificent museums." },
        { name: "Paris, France", x: 490, y: 125, desc: "Captured beautiful art galleries, Eiffel Tower lights, and croissants!" },
        { name: "Dubai, UAE", x: 610, y: 190, desc: "Scaling tall skyscrapers and wandering mysterious desert dunes." },
        { name: "New Delhi, India", x: 680, y: 200, desc: "My beautiful hometown! Teeming with rich culture, historical forts, and amazing street food." },
        { name: "Tokyo, Japan", x: 810, y: 170, desc: "Synthesizing cyber-punk neon lights with tranquil ancient temples." }
    ];

    // Render SVG
    let svgContent = `
        <svg viewBox="0 0 1000 500" class="travel-world-svg" style="width:100%; height:auto; display:block;">
            <!-- Simple Stylized Continents representation -->
            <path d="M120 180 C 150 120, 250 110, 320 130 C 350 150, 310 250, 280 290 C 250 330, 290 420, 240 450 C 200 420, 180 340, 150 300 Z" class="map-continent" />
            <path d="M420 150 C 460 80, 580 80, 680 120 C 720 140, 850 100, 920 160 C 950 250, 840 320, 780 360 C 700 420, 620 450, 580 380 C 520 300, 480 240, 420 180 Z" class="map-continent" />
            <path d="M450 280 C 520 280, 580 330, 600 410 C 580 440, 500 450, 480 410 Z" class="map-continent" />
            <path d="M800 350 C 850 330, 900 380, 880 440 C 830 450, 810 400, 800 350 Z" class="map-continent" />

            <!-- Map Decorative Grid Lines -->
            <line x1="50" y1="250" x2="950" y2="250" stroke="rgba(255,255,255,0.05)" stroke-dasharray="5,5" />
            <line x1="500" y1="50" x2="500" y2="450" stroke="rgba(255,255,255,0.05)" stroke-dasharray="5,5" />

            <!-- Connection lines between consecutive visited paths -->
            <path d="M 260 150 Q 365 100 470 110 T 490 125 T 610 190 T 680 200 T 810 170" fill="none" class="map-route-line" />
    `;

    // Append pins
    visitedLocations.forEach((loc, index) => {
        svgContent += `
            <g class="map-pin-group" data-name="${loc.name}" data-desc="${loc.desc}">
                <!-- Outer ripple -->
                <circle cx="${loc.x}" cy="${loc.y}" r="12" class="map-pin-ripple" />
                <!-- Core pin -->
                <circle cx="${loc.x}" cy="${loc.y}" r="6" class="map-pin-core" />
            </g>
        `;
    });

    svgContent += `</svg>`;
    mapContainer.innerHTML = svgContent;

    // Interactive tooltip creation
    const tooltip = document.createElement("div");
    tooltip.className = "map-tooltip";
    tooltip.style.cssText = `
        position: absolute;
        background: var(--bg-surface-solid);
        border: 1px solid var(--color-primary);
        border-radius: 12px;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        color: var(--text-primary);
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.25s ease;
        box-shadow: var(--glass-shadow);
        z-index: 100;
        max-width: 250px;
    `;
    mapContainer.appendChild(tooltip);

    // Interaction handlers
    const pins = mapContainer.querySelectorAll(".map-pin-group");
    pins.forEach(pin => {
        pin.addEventListener("mouseenter", (e) => {
            const name = pin.getAttribute("data-name");
            const desc = pin.getAttribute("data-desc");

            tooltip.innerHTML = `
                <div style="font-weight:700; color:var(--color-primary); margin-bottom:0.25rem;">📍 ${name}</div>
                <div style="color:var(--text-secondary); line-height:1.4;">${desc}</div>
            `;
            tooltip.style.opacity = "1";
            tooltip.style.transform = "translateY(0)";
        });

        pin.addEventListener("mousemove", (e) => {
            const rect = mapContainer.getBoundingClientRect();
            const x = e.clientX - rect.left + 15;
            const y = e.clientY - rect.top - 60;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        pin.addEventListener("mouseleave", () => {
            tooltip.style.opacity = "0";
            tooltip.style.transform = "translateY(10px)";
        });
    });
}
