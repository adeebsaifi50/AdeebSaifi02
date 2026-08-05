/* ==========================================
   FEATURES HUB INTERACTIVE LOGIC (LEVEL 2, 3, 4)
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize multi-tab logic
    initHubTabs();

    // 2. Initialize App Sandbox (Level 2)
    initAppSandbox();

    // 3. Initialize AI Playgrounds (Level 3)
    initAiPlaygrounds();

    // 4. Initialize Startup & Subscription Deck (Level 4)
    initStartupDeck();
});

/* ==========================================
   1. MULTI-TAB NAVIGATION
   ========================================== */
function initHubTabs() {
    const tabs = document.querySelectorAll(".hub-tab-btn");
    const panels = document.querySelectorAll(".hub-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            panels.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            const controlPanelId = tab.getAttribute("aria-controls");
            const activePanel = document.getElementById(controlPanelId);
            if (activePanel) {
                activePanel.classList.add("active");
            }
        });
    });
}

/* ==========================================
   2. APP SANDBOX INTERACTIVE TRIGGERS (LEVEL 2)
   ========================================== */
function initAppSandbox() {
    // Sandbox Auth & Role Selector
    const authForm = document.getElementById("sandbox-auth-form");
    const unlockedSection = document.getElementById("auth-unlocked-section");
    const authEmail = document.getElementById("sandbox-auth-email");
    const displayName = document.getElementById("auth-display-name");
    const displayEmail = document.getElementById("auth-display-email");
    const logoutBtn = document.getElementById("auth-logout-btn");
    const roleSelector = document.getElementById("sandbox-role-selector");
    const roleAlert = document.getElementById("role-feature-alert");
    const sandboxConsole = document.getElementById("sandbox-comment-logs");

    function logConsole(message, isSystem = false) {
        if (!sandboxConsole) return;
        const time = new Date().toLocaleTimeString();
        const prefix = isSystem ? `<span style="color:#3b82f6;">[SYSTEM]</span>` : `<span style="color:#10b981;">[USER]</span>`;
        sandboxConsole.innerHTML += `<div style="margin-bottom:0.4rem;">${prefix} <span style="color:#6b7280;">${time}</span> - ${sanitizeInput(message)}</div>`;
        sandboxConsole.scrollTop = sandboxConsole.scrollHeight;
    }

    if (authForm && unlockedSection) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailValue = authEmail.value || "john@stripe.com";
            const namePart = emailValue.split("@")[0];
            const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

            displayName.innerText = formattedName;
            displayEmail.innerText = emailValue;

            authForm.style.display = "none";
            unlockedSection.style.display = "block";
            logConsole(`Authenticated successfully as ${formattedName} (${emailValue})`, true);
        });

        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                authForm.style.display = "block";
                unlockedSection.style.display = "none";
                logConsole("Terminated secure dashboard session.", true);
            });
        }
    }

    if (roleSelector && roleAlert) {
        roleSelector.addEventListener("change", () => {
            const role = roleSelector.value;
            if (role === "guest") {
                roleAlert.className = "role-alert-box";
                roleAlert.style.background = "rgba(255, 255, 255, 0.04)";
                roleAlert.style.borderColor = "var(--border-color)";
                roleAlert.style.color = "var(--text-secondary)";
                roleAlert.innerHTML = `<strong>Guest Mode:</strong> You have read-only privileges. Change role to unlock sandbox interactions.`;
            } else if (role === "member") {
                roleAlert.style.background = "var(--color-primary-glow)";
                roleAlert.style.borderColor = "var(--color-primary)";
                roleAlert.style.color = "var(--text-primary)";
                roleAlert.innerHTML = `<strong>Member Mode:</strong> You can comment on articles, bookmark entries, and like showcases!`;
            } else if (role === "admin") {
                roleAlert.style.background = "var(--color-secondary-glow)";
                roleAlert.style.borderColor = "var(--color-secondary)";
                roleAlert.style.color = "var(--text-primary)";
                roleAlert.innerHTML = `<strong>Admin Mode:</strong> Full core parameters unlocked! Logging pipelines and server analytics simulation loaded.`;
            }
            logConsole(`Assigned system role level to: ${role.toUpperCase()}`, true);
        });
    }

    // Likes & Bookmarks State Machine
    const likeBtn = document.getElementById("btn-mock-like");
    const bookmarkBtn = document.getElementById("btn-mock-bookmark");
    const likeCountSpan = document.getElementById("count-mock-likes");
    let hasLiked = false;
    let hasBookmarked = false;

    if (likeBtn && likeCountSpan) {
        likeBtn.addEventListener("click", () => {
            const role = roleSelector ? roleSelector.value : "guest";
            if (role === "guest") {
                alert("Permission denied. Guest accounts cannot perform write actions.");
                return;
            }
            let count = parseInt(likeCountSpan.innerText);
            if (!hasLiked) {
                count++;
                hasLiked = true;
                likeBtn.style.background = "var(--color-primary-glow)";
                logConsole("Dispatched card highlight like command.");
            } else {
                count--;
                hasLiked = false;
                likeBtn.style.background = "var(--bg-accent)";
                logConsole("Withdrew showcase highlight like.");
            }
            likeCountSpan.innerText = count;
        });
    }

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener("click", () => {
            const role = roleSelector ? roleSelector.value : "guest";
            if (role === "guest") {
                alert("Permission denied. Guest accounts cannot perform write actions.");
                return;
            }
            if (!hasBookmarked) {
                hasBookmarked = true;
                bookmarkBtn.style.background = "var(--color-accent-glow)";
                logConsole("Bookmarked sub-millisecond framework showcase.");
            } else {
                hasBookmarked = false;
                bookmarkBtn.style.background = "var(--bg-accent)";
                logConsole("Removed sub-millisecond showcase bookmark.");
            }
        });
    }

    // Interactive Comments Form
    const commentForm = document.getElementById("sandbox-comment-form");
    const commentInput = document.getElementById("sandbox-comment-text");

    if (commentForm && commentInput) {
        commentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const role = roleSelector ? roleSelector.value : "guest";
            if (role === "guest") {
                alert("Permission denied. Guest accounts cannot submit content.");
                return;
            }
            const commentVal = commentInput.value.trim();
            if (commentVal) {
                logConsole(commentVal, false);
                commentInput.value = "";
            }
        });
    }

    // Client-side Canvas Image Compressor
    const dropzone = document.getElementById("compressor-dropzone");
    const fileInput = document.getElementById("compressor-file-input");
    const resultsDiv = document.getElementById("compressor-results");
    const sizeOrig = document.getElementById("compressor-size-orig");
    const sizeComp = document.getElementById("compressor-size-comp");
    const downloadBtn = document.getElementById("compressor-download-btn");
    let compressedBlobUrl = null;

    if (dropzone && fileInput) {
        dropzone.addEventListener("click", () => fileInput.click());

        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                compressImage(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                compressImage(fileInput.files[0]);
            }
        });
    }

    function compressImage(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        const origKB = (file.size / 1024).toFixed(1);
        if (sizeOrig) sizeOrig.innerText = `${origKB} KB`;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Target maximum size of 800px
                let width = img.width;
                let height = img.height;
                const maxDim = 800;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Export image at medium compression quality
                canvas.toBlob((blob) => {
                    const compKB = (blob.size / 1024).toFixed(1);
                    if (sizeComp) sizeComp.innerText = `${compKB} KB`;

                    if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
                    compressedBlobUrl = URL.createObjectURL(blob);

                    if (downloadBtn) {
                        downloadBtn.href = compressedBlobUrl;
                        downloadBtn.download = `compressed_${file.name}`;
                    }

                    if (resultsDiv) resultsDiv.style.display = "block";
                    logConsole(`Compressed original image (${origKB} KB) to (${compKB} KB) successfully.`, true);
                }, "image/jpeg", 0.6);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

/* ==========================================
   3. AI PLAYGROUNDS WORKFLOWS (LEVEL 3)
   ========================================== */
function initAiPlaygrounds() {
    // AI Chat Bot
    const chatForm = document.getElementById("ai-chat-form");
    const chatInput = document.getElementById("ai-chat-input");
    const chatHistory = document.getElementById("ai-chat-history");

    if (chatForm && chatInput && chatHistory) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            // Render User bubble
            chatHistory.innerHTML += `<div style="margin-bottom:0.75rem; text-align:right;"><span style="background:var(--color-primary-glow); padding:0.5rem 1rem; border-radius:12px; display:inline-block; max-width:80%; color:var(--text-primary); text-align:left;">${sanitizeInput(text)}</span></div>`;
            chatInput.value = "";
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Simulated model answers
            setTimeout(() => {
                let answer = "I have scanned the architecture parameters. To target 100 on Lighthouse: optimize image assets, implement service worker cache caches, and utilize critical rendering inline pathways.";
                const lowerText = text.toLowerCase();

                if (lowerText.includes("travel") || lowerText.includes("kyoto") || lowerText.includes("london")) {
                    answer = "Kyoto recommendations loaded: Travel along Arashiyama bamboo trails in early morning hours, pairing natural visuals with responsive portfolio grid assets.";
                } else if (lowerText.includes("stripe") || lowerText.includes("linear") || lowerText.includes("design")) {
                    answer = "Premium designs rely on glassmorphism with exact border alphas (typically white at 0.08 alpha) combined with coordinate-based mouse hover radial gradients.";
                } else if (lowerText.includes("summar")) {
                    answer = "Summary of Adeeb's elite portfolio: Built completely in frameworkless modular JS, deploying clean manifest structures, targeting 100 on audits.";
                }

                chatHistory.innerHTML += `<div style="margin-bottom:0.75rem;"><span style="background:var(--bg-accent-hover); padding:0.5rem 1rem; border-radius:12px; display:inline-block; max-width:80%; color:#10b981; border:1px solid var(--border-color);">${answer}</span></div>`;
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }, 800);
        });
    }

    // AI Travel Planner Trigger
    const travelBtn = document.getElementById("ai-travel-btn");
    const travelDest = document.getElementById("ai-travel-dest");
    const travelOutput = document.getElementById("ai-travel-output");

    if (travelBtn && travelDest && travelOutput) {
        travelBtn.addEventListener("click", () => {
            const dest = travelDest.value.trim() || "Kyoto";
            travelOutput.style.display = "block";
            travelOutput.innerHTML = `<span style="color:#6b7280;">Computing neural travel itinerary for: ${dest}...</span>`;

            setTimeout(() => {
                travelOutput.innerHTML = `
                    <h4 style="color:var(--color-secondary); margin-bottom:0.5rem;">🎒 3-Day Expeditions: ${dest}</h4>
                    <p style="margin-bottom:0.4rem; font-size:0.8rem;"><strong>Day 1:</strong> Architecture study, capturing sunset angles at tallest cityscape towers.</p>
                    <p style="margin-bottom:0.4rem; font-size:0.8rem;"><strong>Day 2:</strong> Trekking local nature paths, mapping coordinate nodes for custom SVG routing.</p>
                    <p style="margin-bottom:0; font-size:0.8rem;"><strong>Day 3:</strong> Writing high-end design reviews at coffee hubs, syncing blog drafts to offline storage.</p>
                `;
            }, 700);
        });
    }

    // AI Instant Canvas Vector Generator
    const canvas = document.getElementById("ai-image-canvas");
    const canvasBtn = document.getElementById("ai-image-btn");
    const canvasPrompt = document.getElementById("ai-image-prompt");

    if (canvas && canvasBtn && canvasPrompt) {
        const ctx = canvas.getContext("2d");

        // Initial placeholder drawing
        drawInitialCanvas();

        function drawInitialCanvas() {
            ctx.fillStyle = "#0c0c0f";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "11px monospace";
            ctx.fillStyle = "#4b5563";
            ctx.textAlign = "center";
            ctx.fillText("Ready to synthesize custom neon vectors...", canvas.width / 2, canvas.height / 2);
        }

        canvasBtn.addEventListener("click", () => {
            const prompt = canvasPrompt.value.trim() || "neon waves";
            ctx.fillStyle = "#020204";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw abstract generative art based on prompt
            ctx.lineWidth = 2;
            const isCyberpunk = prompt.toLowerCase().includes("cyberpunk") || prompt.toLowerCase().includes("neon");

            for (let i = 0; i < 15; i++) {
                ctx.beginPath();
                ctx.strokeStyle = isCyberpunk
                    ? `hsl(${260 + i * 10}, 80%, 60%)`
                    : `hsl(${200 + i * 10}, 70%, 50%)`;

                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.bezierCurveTo(
                    Math.random() * canvas.width, Math.random() * canvas.height,
                    Math.random() * canvas.width, Math.random() * canvas.height,
                    Math.random() * canvas.width, Math.random() * canvas.height
                );
                ctx.stroke();
            }

            // Draw caption watermark
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.font = "10px monospace";
            ctx.textAlign = "right";
            ctx.fillText(`AI Art: ${prompt}`, canvas.width - 10, canvas.height - 10);
        });
    }
}

/* ==========================================
   4. STARTUP DECK & PAYMENTS (LEVEL 4)
   ========================================== */
function initStartupDeck() {
    // Pricing Toggle Monthly / Annual
    const durationToggle = document.getElementById("billing-duration-toggle");
    const pricingVals = document.querySelectorAll(".pricing-val");

    if (durationToggle) {
        durationToggle.addEventListener("change", () => {
            const isYearly = durationToggle.checked;
            pricingVals.forEach(span => {
                const monthly = span.getAttribute("data-monthly");
                const yearly = span.getAttribute("data-yearly");

                // Animate change
                span.style.opacity = "0";
                setTimeout(() => {
                    span.innerText = isYearly ? yearly : monthly;
                    span.style.opacity = "1";
                }, 150);
            });
        });
    }

    // Stripe Secure Checkout Mock Overlay Trigger
    const checkoutModal = document.getElementById("stripe-checkout-modal");
    const checkoutClose = document.getElementById("checkout-modal-close");
    const checkoutTriggers = document.querySelectorAll(".checkout-trigger");
    const checkoutPlanName = document.getElementById("checkout-plan-name");
    const checkoutPlanPrice = document.getElementById("checkout-plan-price");
    const billingForm = document.getElementById("checkout-billing-form");
    const checkoutSuccess = document.getElementById("checkout-success-msg");

    if (checkoutModal) {
        checkoutTriggers.forEach(btn => {
            btn.addEventListener("click", () => {
                const plan = btn.getAttribute("data-plan");
                const isYearly = durationToggle ? durationToggle.checked : false;

                let price = "$19/mo";
                if (plan === "Starter") price = isYearly ? "$15/mo (Billed annually)" : "$19/mo";
                if (plan === "Professional") price = isYearly ? "$39/mo (Billed annually)" : "$49/mo";
                if (plan === "Ultimate") price = isYearly ? "$99/mo (Billed annually)" : "$129/mo";

                checkoutPlanName.innerText = plan;
                checkoutPlanPrice.innerText = price;
                checkoutSuccess.style.display = "none";
                billingForm.style.display = "block";
                checkoutModal.classList.add("show");
            });
        });

        if (checkoutClose) {
            checkoutClose.addEventListener("click", () => {
                checkoutModal.classList.remove("show");
            });
        }

        checkoutModal.addEventListener("click", (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove("show");
            }
        });

        if (billingForm) {
            billingForm.addEventListener("submit", (e) => {
                e.preventDefault();
                billingForm.style.display = "none";
                if (checkoutSuccess) checkoutSuccess.style.display = "block";

                setTimeout(() => {
                    checkoutModal.classList.remove("show");
                }, 2500);
            });
        }
    }

    // API Token Generator & Gateway simulation
    const apiTokenBtn = document.getElementById("api-token-btn");
    const apiTokenDisplay = document.getElementById("api-token-display");
    const apiSimulateBtn = document.getElementById("api-simulate-btn");
    const apiResponseConsole = document.getElementById("api-response-console");

    let generatedKey = "";

    if (apiTokenBtn && apiTokenDisplay) {
        apiTokenBtn.addEventListener("click", () => {
            const arr = new Uint8Array(16);
            window.crypto.getRandomValues(arr);
            generatedKey = "sk_live_" + Array.from(arr, dec => dec.toString(16).padStart(2, "0")).join("");
            apiTokenDisplay.value = generatedKey;

            if (apiResponseConsole) {
                apiResponseConsole.innerHTML = `<div>[GATEWAY] API credential generated successfully. Authorization token saved to memory.</div>`;
            }
        });
    }

    if (apiSimulateBtn && apiResponseConsole) {
        apiSimulateBtn.addEventListener("click", () => {
            if (!generatedKey) {
                alert("Please generate an sk_live authorization key first.");
                return;
            }

            apiResponseConsole.innerHTML += `<div>[GATEWAY] GET /v1/portfolio/analytics - Authorization: Bearer sk_live_••••••</div>`;
            apiResponseConsole.innerHTML += `<div>[GATEWAY] Dispatching gateway router check...</div>`;
            apiResponseConsole.scrollTop = apiResponseConsole.scrollHeight;

            setTimeout(() => {
                const responsePayload = {
                    status: 200,
                    success: true,
                    data: {
                        latency: "12ms",
                        region: "iad1-vercel-core",
                        user_session: {
                            is_pwa_installed: window.matchMedia("(display-mode: standalone)").matches,
                            active_theme: document.documentElement.getAttribute("data-theme") || "dark"
                        },
                        lighthouse: {
                            performance: 100,
                            accessibility: 100,
                            best_practices: 100,
                            seo: 100
                        }
                    }
                };

                apiResponseConsole.innerHTML += `<div style="color:#10b981; margin-top:0.5rem;">[RESPONSE] <pre style="font-family:var(--font-mono); font-size:0.75rem; margin-top:0.25rem;">${JSON.stringify(responsePayload, null, 2)}</pre></div>`;
                apiResponseConsole.scrollTop = apiResponseConsole.scrollHeight;
            }, 600);
        });
    }

    // Live Active Users counter simulation
    const usersCounter = document.getElementById("analytics-active-users");
    if (usersCounter) {
        setInterval(() => {
            let val = parseInt(usersCounter.innerText);
            const delta = Math.random() > 0.5 ? 1 : -1;
            val += delta;
            usersCounter.innerText = val;
        }, 3000);
    }
}

// Global script input sanitization helper
function sanitizeInput(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
