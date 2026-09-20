/* ==========================================
   HUMAN SIMULATION ENGINE — FROM BIRTH TO DEATH
   ========================================== */

// --- ERA CONFIGURATIONS ---
const HISTORICAL_ERAS = {
    ancient: {
        name: "Ancient World (~2000 BCE)",
        techLevel: "Bronze Age Agricultural",
        shelter: "Mudbrick / Thatched Hut",
        clothing: "Woven Linen & Animal Hides",
        tools: "Bronze Chisels & Hand Sickles",
        foodSource: "Subsistence Farming & Foraging",
        medicine: "Herbal Poultices & Ritual Healing",
        risks: "Infant Mortality, Crop Failure, Dysentery",
        currencySymbol: "🌾",
        careers: [
            { id: "farmer", title: "Subsistence Farmer", income: 5, energyCost: 20 },
            { id: "hunter", title: "Tribal Hunter", income: 7, energyCost: 25 },
            { id: "artisan", title: "Potter / Toolmaker", income: 10, energyCost: 15 },
            { id: "priest", title: "Temple Scribe / Healer", income: 15, energyCost: 10 }
        ]
    },
    medieval: {
        name: "Medieval Period (~1200 CE)",
        techLevel: "Feudal Agrarian",
        shelter: "Timber Frame / Stone Cottage",
        clothing: "Woolen Tunic & Leather Boots",
        tools: "Iron Plow & Watermill",
        foodSource: "Manorial Grain & Livestock",
        medicine: "Humoral Theory & Herbalists",
        risks: "Plague Outbreaks, Famine, Heavy Taxation",
        currencySymbol: "🪙",
        careers: [
            { id: "serf", title: "Peasant Farmer", income: 8, energyCost: 22 },
            { id: "blacksmith", title: "Village Blacksmith", income: 18, energyCost: 20 },
            { id: "merchant", title: "Trade Guild Merchant", income: 30, energyCost: 12 },
            { id: "scholar", title: "Monastic Scholar", income: 25, energyCost: 10 }
        ]
    },
    early_modern: {
        name: "Early Modern Era (~1650 CE)",
        techLevel: "Mercantile & Printing Age",
        shelter: "Brick Townhouse / Farmstead",
        clothing: "Tailored Cloth & Linen Shirts",
        tools: "Printing Press & Navigational Compass",
        foodSource: "Market Square Agriculture",
        medicine: "Early Apothecaries & Surgery",
        risks: "Smallpox, Maritime Hazards, Warfare",
        currencySymbol: "🪙",
        careers: [
            { id: "apprentice", title: "Craft Apprentice", income: 12, energyCost: 18 },
            { id: "printer", title: "Type Printmaster", income: 28, energyCost: 14 },
            { id: "navigator", title: "Merchant Navigator", income: 45, energyCost: 20 },
            { id: "physician", title: "Town Physician", income: 50, energyCost: 12 }
        ]
    },
    industrial: {
        name: "Industrial Era (~1880 CE)",
        techLevel: "Steam Engine & Manufacturing",
        shelter: "Urban Tenement / Brick Terrace",
        clothing: "Mass-Produced Cotton & Wool",
        tools: "Steam Engine & Telegraph",
        foodSource: "Railroad Distributed Foods",
        medicine: "Germ Theory & Antiseptics",
        risks: "Industrial Hazards, Smog Pollution, Cholera",
        currencySymbol: "$",
        careers: [
            { id: "factory_worker", title: "Textile Mill Worker", income: 20, energyCost: 25 },
            { id: "locomotive", title: "Train Engineer", income: 40, energyCost: 18 },
            { id: "telegrapher", title: "Telegraph Operator", income: 45, energyCost: 10 },
            { id: "manager", title: "Factory Superintendent", income: 80, energyCost: 12 }
        ]
    },
    modern: {
        name: "Modern Era (~1970 CE)",
        techLevel: "Electrical & Early Computing",
        shelter: "Suburban Home / Apartment",
        clothing: "Synthetic Fabrics & Denim",
        tools: "Automobile & Mainframe Computer",
        foodSource: "Supermarkets & Refrigeration",
        medicine: "Antibiotics & Mass Immunization",
        risks: "Cardiovascular Disease, Stress",
        currencySymbol: "$",
        careers: [
            { id: "assembly", title: "Automotive Assembly", income: 50, energyCost: 18 },
            { id: "clerk", title: "Corporate Clerk", income: 60, energyCost: 12 },
            { id: "teacher", title: "High School Teacher", income: 75, energyCost: 14 },
            { id: "programmer", title: "Mainframe Programmer", income: 110, energyCost: 10 }
        ]
    },
    present: {
        name: "Present Day (2026 CE)",
        techLevel: "Information & Networked AI",
        shelter: "Modern Energy-Efficient Home",
        clothing: "Smart & Breathable Apparel",
        tools: "Smartphones, Laptops & Cloud AI",
        foodSource: "Globalized Grocery & Organic Grid",
        medicine: "Precision Genomes & Advanced Surgery",
        risks: "Sedentary Burnout, Mental Fatigue",
        currencySymbol: "$",
        careers: [
            { id: "retail", title: "Service Associate", income: 65, energyCost: 15 },
            { id: "freelancer", title: "Digital Specialist", income: 90, energyCost: 12 },
            { id: "engineer", title: "Software Engineer", income: 150, energyCost: 10 },
            { id: "executive", title: "Product Director", income: 220, energyCost: 14 }
        ]
    },
    future: {
        name: "Hypothetical Future (~2100 CE)",
        techLevel: "Post-Scarcity Cybernetic",
        shelter: "Bioclimatic Arcology Tower",
        clothing: "Self-Cleaning Nanofiber Wear",
        tools: "Neural Links & Autonomous Robotics",
        foodSource: "Cellular Agriculture & Nutrient Labs",
        medicine: "Nanobot Regeneration & Longevity Therapy",
        risks: "Existential Cyber Risks, Orbital Hazards",
        currencySymbol: "💎",
        careers: [
            { id: "eco_restorer", title: "Biosphere Restorer", income: 120, energyCost: 10 },
            { id: "cyber_architect", title: "Virtual Systems Architect", income: 200, energyCost: 8 },
            { id: "neural_engineer", title: "Neural Link Specialist", income: 300, energyCost: 8 },
            { id: "deep_space", title: "Orbital Habitat Operator", income: 450, energyCost: 12 }
        ]
    }
};

// --- LIFE STAGE CONFIGURATIONS ---
const LIFE_STAGES = [
    { name: "BABY", minAge: 0, maxAge: 2, notice: "Baby Stage: Needs feeding, sleep, protection, and caregivers." },
    { name: "EARLY CHILDHOOD", minAge: 3, maxAge: 5, notice: "Early Childhood: Developing language, motor skills, and curiosity." },
    { name: "CHILDHOOD", minAge: 6, maxAge: 12, notice: "Childhood: Focus on education, social play, family, and skill building." },
    { name: "TEENAGE", minAge: 13, maxAge: 19, notice: "Teenage: Advanced learning, social identity, peer connections, and skill choices." },
    { name: "YOUNG ADULT", minAge: 20, maxAge: 30, notice: "Young Adult: Career entry, higher education, relationships, and independent living." },
    { name: "ADULT", minAge: 31, maxAge: 50, notice: "Adult: Work productivity, family support, wealth building, and major life decisions." },
    { name: "MIDDLE AGE", minAge: 51, maxAge: 65, notice: "Middle Age: Leadership roles, mentorship, health upkeep, and family transitions." },
    { name: "OLD AGE", minAge: 66, maxAge: 85, notice: "Old Age: Reduced physical energy, health management, retirement, and life reflection." },
    { name: "DEATH", minAge: 86, maxAge: 120, notice: "Life Cycle Complete: Generating full life chronicle." }
];

// --- HUMAN EVOLUTION & CIVILIZATION ARCHITECTURE MATRIX ---
const HUMANITY_EVOLUTION_FOUNDATION = {
    pillars: [
        {
            title: "Early Hominins & Bipedalism",
            period: "~7.0 to 4.0 Million Years Ago",
            evidence: "Sahelanthropus tchadensis, Ardipithecus ramidus, Australopithecus afarensis ('Lucy')",
            summary: "Habitual bipedalism freed the upper limbs, allowing carrying, tool manipulation, and thermoregulation energy efficiency in woodland/savannah transitions."
        },
        {
            title: "Lithic Tool Technologies",
            period: "~3.3 to 1.7 Million Years Ago",
            evidence: "Lomekwi 3, Oldowan flake stone tools, Acheulean handaxes",
            summary: "Tool use enabled access to high-protein meat and bone marrow, fueling brain encephalization and metabolic shifts in Homo habilis and Homo erectus."
        },
        {
            title: "Pyrotechnology & Control of Fire",
            period: "~1.5 Million to 400,000 Years Ago",
            evidence: "Wonderwerk Cave, Chesowanja burned clay, Schöningen spears",
            summary: "Controlled fire externalized digestion (cooking hypothesis), expanded caloric intake, offered nocturnal protection, and fostered social bonding."
        },
        {
            title: "Symbolic Language & Social Cooperation",
            period: "~300,000 to 70,000 Years Ago",
            evidence: "Jebel Irhoud Homo sapiens, Blombos Cave ochre engravings, beads",
            summary: "Complex vocal anatomy and symbolic culture allowed shared mythologies, cooperative hunting, inter-group trading, and rapid cultural adaptation."
        }
    ],
    civilizationHierarchy: [
        { level: "HUMAN", scale: "Individual Agent", scope: "Biological Needs, Cognitive State, Personal Skills" },
        { level: "FAMILY", scale: "Kinship Unit", scope: "Caregiving, Kin Selection, Shared Shelter & Subsistence" },
        { level: "COMMUNITY", scale: "Band / Tribe (~150 Dunbar Limit)", scope: "Mutual Protection, Cooperative Labor, Oral Traditions" },
        { level: "SETTLEMENT", scale: "Agrarian Village / Town", scope: "Domestication, Granaries, Division of Labor, Property" },
        { level: "CITY", scale: "Urban Metropolis", scope: "Specialization, Written Laws, Monumental Architecture, Governance" },
        { level: "CIVILIZATION", scale: "Macro Regional Network", scope: "Trade Routes, Technological Innovation, Planetary Infrastructure" }
    ]
};

// --- CORE SIMULATION STATE ---
class HumanSimulation {
    constructor() {
        this.resetState("present");
    }

    resetState(eraKey = "present") {
        this.name = "Alex Vance";
        this.eraKey = eraKey;
        this.era = HISTORICAL_ERAS[eraKey];
        this.evolutionMatrix = HUMANITY_EVOLUTION_FOUNDATION;

        this.ageYears = 0;
        this.ageMonths = 2;
        this.isAlive = true;
        this.isPaused = false;
        this.simSpeed = 1; // 1x, 2x, 5x
        this.timeOfDay = 0; // 0: Morning, 1: Afternoon, 2: Evening, 3: Night

        // Dynamic Status System (0 to 100)
        this.status = {
            health: 100,
            hunger: 90, // Satiety level
            thirst: 95, // Hydration level
            energy: 85,
            sleep: 90,
            happiness: 80,
            knowledge: 5,
            social: 85,
            safety: 95,
            nutrition: 85,
            physical: 80,
            money: 0
        };

        this.currentJob = null;
        this.family = [
            { name: "Elena Vance", relation: "Mother", relationshipScore: 95 },
            { name: "Marcus Vance", relation: "Father", relationshipScore: 90 }
        ];

        this.timeline = [];
        this.eventsLog = [];
        this.achievements = 0;
        this.currentActivity = "Resting peacefully in crib";

        this.addTimelineEvent("Birth", `Born into the ${this.era.name}.`);
        this.addLogEntry(`Birth: ${this.name} born into ${this.era.name}. Simulation initialized.`);
    }

    getLifeStage() {
        for (let stage of LIFE_STAGES) {
            if (this.ageYears >= stage.minAge && this.ageYears <= stage.maxAge) {
                return stage;
            }
        }
        return LIFE_STAGES[LIFE_STAGES.length - 1]; // Death stage default
    }

    addTimelineEvent(title, description) {
        const stage = this.getLifeStage();
        this.timeline.unshift({
            time: `Age ${this.ageYears}y ${this.ageMonths}m (${stage.name})`,
            title: title,
            desc: description
        });
        this.achievements++;
    }

    addLogEntry(message, type = "info") {
        this.eventsLog.unshift({
            time: `[Year ${String(this.ageYears).padStart(2, '0')}]`,
            text: message,
            type: type
        });
        if (this.eventsLog.length > 50) this.eventsLog.pop();
    }

    // --- SIMULATION TICK LOOP ---
    tick() {
        if (!this.isAlive || this.isPaused) return;

        // Advance time of day
        this.timeOfDay = (this.timeOfDay + 1) % 4;
        if (this.timeOfDay === 0) {
            // Advance month on new morning
            this.ageMonths++;
            if (this.ageMonths >= 12) {
                this.ageMonths = 0;
                this.ageYears++;
                this.onBirthday();
            }
        }

        // --- NATURAL METABOLIC DECAY & INTERACTION SYSTEM ---
        const stage = this.getLifeStage();

        // Decay rates based on life stage
        let hungerDecay = 2.5;
        let thirstDecay = 3.0;
        let energyDecay = 1.8;

        if (stage.name === "OLD AGE") {
            energyDecay = 2.8;
            this.status.physical = Math.max(0, this.status.physical - 0.2);
        }

        this.status.hunger = Math.max(0, this.status.hunger - hungerDecay);
        this.status.thirst = Math.max(0, this.status.thirst - thirstDecay);
        this.status.energy = Math.max(0, this.status.energy - energyDecay);

        // --- NEED INTERACTION LOGIC ---
        // Poor sleep -> Energy drops faster
        if (this.status.sleep < 40) {
            this.status.energy = Math.max(0, this.status.energy - 2);
        }

        // Low hunger / thirst -> Health drops
        if (this.status.hunger < 20 || this.status.thirst < 20) {
            this.status.health = Math.max(0, this.status.health - 3);
            this.addLogEntry(`Warning: Malnutrition or dehydration affecting health!`, "warn");
        }

        // Social isolation -> Happiness drops
        if (this.status.social < 30) {
            this.status.happiness = Math.max(0, this.status.happiness - 1.5);
        }

        // High health recovery if basic needs met
        if (this.status.hunger > 60 && this.status.thirst > 60 && this.status.energy > 40 && this.status.health < 100) {
            this.status.health = Math.min(100, this.status.health + 1.0);
        }

        // --- CAREER AUTOMATIC INCOME & ENERGY COST ---
        if (this.currentJob && this.timeOfDay === 1) { // Work during Afternoon
            this.status.money += this.currentJob.income;
            this.status.energy = Math.max(0, this.status.energy - this.currentJob.energyCost);
            this.addLogEntry(`Worked as ${this.currentJob.title}. Earned ${this.era.currencySymbol}${this.currentJob.income}.`);
        }

        // --- CHECK DEATH CONDITIONS ---
        if (this.status.health <= 0 || this.ageYears >= 95) {
            this.triggerDeath();
        }

        // Trigger Random Environmental Survival Events occasionally
        if (Math.random() < 0.05) {
            this.triggerRandomEvent();
        }
    }

    onBirthday() {
        this.addLogEntry(`Happy Birthday! ${this.name} reached Age ${this.ageYears}.`);
        const stage = this.getLifeStage();

        if (this.ageYears === 3) {
            this.addTimelineEvent("Early Childhood", "Began speaking full sentences and exploring environment.");
        } else if (this.ageYears === 6) {
            this.addTimelineEvent("Primary Education", "Entered formal learning and social playgroups.");
        } else if (this.ageYears === 13) {
            this.addTimelineEvent("Teenage Milestone", "Entered adolescence; developed individual interests.");
        } else if (this.ageYears === 20) {
            this.addTimelineEvent("Adulthood Reach", "Attained legal independence and career readiness.");
        } else if (this.ageYears === 66) {
            this.addTimelineEvent("Retirement & Seniority", "Entered Old Age; reduced heavy physical labor.");
        }
    }

    performActivity(actType) {
        if (!this.isAlive) return;

        const stage = this.getLifeStage();

        switch (actType) {
            case "eat":
                this.status.hunger = Math.min(100, this.status.hunger + 35);
                this.status.nutrition = Math.min(100, this.status.nutrition + 15);
                this.status.energy = Math.min(100, this.status.energy + 10);
                this.currentActivity = "Eating a nutritious meal";
                this.addLogEntry(`Ate a hearty meal. Satiety restored.`);
                break;

            case "drink":
                this.status.thirst = Math.min(100, this.status.thirst + 45);
                this.currentActivity = "Drinking fresh water";
                this.addLogEntry(`Hydrated with fresh water.`);
                break;

            case "sleep":
                this.status.energy = Math.min(100, this.status.energy + 50);
                this.status.sleep = Math.min(100, this.status.sleep + 40);
                this.status.health = Math.min(100, this.status.health + 5);
                this.currentActivity = "Resting deeply";
                this.addLogEntry(`Slept peacefully, restoring physical energy.`);
                break;

            case "learn":
                if (stage.name === "BABY") {
                    this.addLogEntry(`Baby listening to caregiver sounds.`, "warn");
                    return;
                }
                this.status.knowledge = Math.min(100, this.status.knowledge + 6);
                this.status.energy = Math.max(0, this.status.energy - 10);
                this.currentActivity = "Studying and acquiring knowledge";
                this.addLogEntry(`Studied educational concepts. Knowledge increased to ${Math.round(this.status.knowledge)}%.`);
                break;

            case "work":
                if (this.ageYears < 13) {
                    this.addLogEntry(`Too young for formal work occupations!`, "warn");
                    return;
                }
                if (!this.currentJob) {
                    this.addLogEntry(`Please select an occupation first!`, "warn");
                    return;
                }
                this.status.money += this.currentJob.income;
                this.status.energy = Math.max(0, this.status.energy - this.currentJob.energyCost);
                this.currentActivity = `Working as ${this.currentJob.title}`;
                this.addLogEntry(`Completed shift as ${this.currentJob.title}. Earned ${this.era.currencySymbol}${this.currentJob.income}.`);
                break;

            case "exercise":
                if (this.status.energy < 20) {
                    this.addLogEntry(`Too exhausted to exercise! Sleep first.`, "warn");
                    return;
                }
                this.status.physical = Math.min(100, this.status.physical + 12);
                this.status.health = Math.min(100, this.status.health + 4);
                this.status.energy = Math.max(0, this.status.energy - 18);
                this.currentActivity = "Exercising and physical conditioning";
                this.addLogEntry(`Exercised, strengthening physical condition.`);
                break;

            case "socialize":
                this.status.social = Math.min(100, this.status.social + 25);
                this.status.happiness = Math.min(100, this.status.happiness + 15);
                this.currentActivity = "Socializing with friends & family";
                this.addLogEntry(`Spent quality time socializing with community.`);
                break;

            case "explore":
                this.status.happiness = Math.min(100, this.status.happiness + 12);
                this.status.knowledge = Math.min(100, this.status.knowledge + 3);
                this.status.energy = Math.max(0, this.status.energy - 12);
                this.currentActivity = "Exploring surrounding environment";
                this.addLogEntry(`Explored surrounding environment.`);
                break;
        }
    }

    triggerRandomEvent() {
        const events = [
            { title: "Bountiful Season", desc: "Local food supplies are rich and abundant.", health: 5, happiness: 10 },
            { title: "Mild Illness", desc: "Caught a seasonal cold.", health: -10, energy: -15 },
            { title: "Community Gathering", desc: "Attended a festive local event.", social: 20, happiness: 15 },
            { title: "Resource Scarcity", desc: "Temporary inflation / shortage of goods.", money: -10 }
        ];

        const ev = events[Math.floor(Math.random() * events.length)];
        if (ev.health) this.status.health = Math.max(0, Math.min(100, this.status.health + ev.health));
        if (ev.happiness) this.status.happiness = Math.max(0, Math.min(100, this.status.happiness + ev.happiness));
        if (ev.energy) this.status.energy = Math.max(0, Math.min(100, this.status.energy + ev.energy));
        if (ev.social) this.status.social = Math.max(0, Math.min(100, this.status.social + ev.social));

        this.addLogEntry(`EVENT: ${ev.title} — ${ev.desc}`, "event");
    }

    triggerDeath() {
        this.isAlive = false;
        this.addTimelineEvent("Decease", `Passed away at Age ${this.ageYears}.`);
        this.addLogEntry(`DEATH: ${this.name} passed away at Age ${this.ageYears}. Life chronicle finalized.`, "warn");

        // Show Life Report Modal
        const modal = document.getElementById("life-report-modal");
        if (modal) {
            const narrativeEl = document.getElementById("report-narrative-text");
            if (narrativeEl) {
                narrativeEl.innerText = `${this.name} was born in the ${this.era.name}. They experienced ${this.achievements} life milestones, worked as ${this.currentJob ? this.currentJob.title : "a dedicated community member"}, accumulated ${this.era.currencySymbol}${this.status.money}, and passed away at Age ${this.ageYears} after a memorable lifetime.`;
            }
            document.getElementById("rep-stat-age").innerText = `${this.ageYears} Years`;
            document.getElementById("rep-stat-era").innerText = this.era.name;
            document.getElementById("rep-stat-wealth").innerText = `${this.era.currencySymbol}${this.status.money}`;
            document.getElementById("rep-stat-knowledge").innerText = `${Math.round(this.status.knowledge)}%`;
            document.getElementById("rep-stat-career").innerText = this.currentJob ? this.currentJob.title : "None";
            document.getElementById("rep-stat-achievements").innerText = `${this.achievements} Milestones`;

            const reportTimelineEl = document.getElementById("report-timeline-items");
            if (reportTimelineEl) {
                reportTimelineEl.innerHTML = this.timeline.map(t => `
                    <div style="background: rgba(255,255,255,0.03); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:0.7rem; color:var(--color-primary); font-weight:bold;">${t.time}</span>
                        <strong style="display:block; font-size:0.85rem;">${t.title}</strong>
                        <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">${t.desc}</p>
                    </div>
                `).join("");
            }

            modal.classList.add("show");
        }
    }
}

// Instantiate global simulation state engine
window.humanEngine = new HumanSimulation();

// --- DOM UI CONTROLLERS & RENDERING ---
document.addEventListener("DOMContentLoaded", () => {
    const engine = window.humanEngine;

    // Canvas Initialization
    const canvas = document.getElementById("human-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    // UI Elements
    const eraSelector = document.getElementById("era-selector");
    const btnPause = document.getElementById("btn-pause");
    const btnSpeed1 = document.getElementById("btn-speed-1");
    const btnSpeed2 = document.getElementById("btn-speed-2");
    const btnSpeed5 = document.getElementById("btn-speed-5");
    const btnRestart = document.getElementById("btn-restart");
    const btnOpenEvolution = document.getElementById("btn-open-evolution");
    const btnCloseEvolution = document.getElementById("btn-close-evolution");
    const evolutionModal = document.getElementById("evolution-modal");

    const btnCloseReport = document.getElementById("btn-close-report");
    const btnRestartFromReport = document.getElementById("btn-restart-from-report");
    const reportModal = document.getElementById("life-report-modal");

    const careerDropdown = document.getElementById("career-dropdown");
    const careerWrapper = document.getElementById("career-select-wrapper");

    // Era Change
    if (eraSelector) {
        eraSelector.addEventListener("change", (e) => {
            engine.resetState(e.target.value);
            updateCareerDropdown();
            renderUI();
        });
    }

    // Speed Controls
    if (btnPause) {
        btnPause.addEventListener("click", () => {
            engine.isPaused = !engine.isPaused;
            btnPause.classList.toggle("active", engine.isPaused);
            btnPause.innerText = engine.isPaused ? "▶" : "⏸";
        });
    }

    if (btnSpeed1) {
        btnSpeed1.addEventListener("click", () => {
            engine.simSpeed = 1;
            setActiveSpeedBtn(btnSpeed1);
        });
    }

    if (btnSpeed2) {
        btnSpeed2.addEventListener("click", () => {
            engine.simSpeed = 2;
            setActiveSpeedBtn(btnSpeed2);
        });
    }

    if (btnSpeed5) {
        btnSpeed5.addEventListener("click", () => {
            engine.simSpeed = 5;
            setActiveSpeedBtn(btnSpeed5);
        });
    }

    function setActiveSpeedBtn(activeBtn) {
        [btnSpeed1, btnSpeed2, btnSpeed5].forEach(b => {
            if (b) b.classList.remove("active");
        });
        if (activeBtn) activeBtn.classList.add("active");
    }

    // Restart
    if (btnRestart) {
        btnRestart.addEventListener("click", () => {
            engine.resetState(eraSelector ? eraSelector.value : "present");
            updateCareerDropdown();
            renderUI();
        });
    }

    // Evolution Modal
    if (btnOpenEvolution && evolutionModal) {
        btnOpenEvolution.addEventListener("click", () => evolutionModal.classList.add("show"));
    }
    if (btnCloseEvolution && evolutionModal) {
        btnCloseEvolution.addEventListener("click", () => evolutionModal.classList.remove("show"));
    }

    // Report Modal
    if (btnCloseReport && reportModal) {
        btnCloseReport.addEventListener("click", () => reportModal.classList.remove("show"));
    }
    if (btnRestartFromReport && reportModal) {
        btnRestartFromReport.addEventListener("click", () => {
            reportModal.classList.remove("show");
            engine.resetState(eraSelector ? eraSelector.value : "present");
            updateCareerDropdown();
            renderUI();
        });
    }

    // Actions Buttons
    const actBtns = document.querySelectorAll(".act-btn");
    actBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const act = btn.getAttribute("data-act");
            engine.performActivity(act);
            renderUI();
        });
    });

    // Career Selector
    function updateCareerDropdown() {
        if (!careerDropdown) return;
        const careers = engine.era.careers;
        careerDropdown.innerHTML = `<option value="">-- Select Occupation --</option>` + careers.map(c => `
            <option value="${c.id}">${c.title} (Income: ${engine.era.currencySymbol}${c.income}/shift)</option>
        `).join("");
    }

    if (careerDropdown) {
        careerDropdown.addEventListener("change", (e) => {
            const selectedId = e.target.value;
            const found = engine.era.careers.find(c => c.id === selectedId);
            if (found) {
                engine.currentJob = found;
                engine.addLogEntry(`Selected Occupation: ${found.title}`);
                engine.addTimelineEvent("Career Chosen", `Employed as ${found.title}.`);
            } else {
                engine.currentJob = null;
            }
            renderUI();
        });
    }

    // Clear Logger
    const btnClearLogs = document.getElementById("btn-clear-logs");
    if (btnClearLogs) {
        btnClearLogs.addEventListener("click", () => {
            engine.eventsLog = [];
            renderUI();
        });
    }

    // Main Render UI Loop
    function renderUI() {
        const stage = engine.getLifeStage();

        // Header Strip
        document.getElementById("hdr-char-name").innerText = engine.name;
        document.getElementById("hdr-life-stage").innerText = stage.name;
        document.getElementById("hdr-char-age").innerText = `${engine.ageYears} Years, ${engine.ageMonths} Months`;

        const timeLabels = ["🌅 MORNING", "☀️ AFTERNOON", "🌆 EVENING", "🌙 NIGHT"];
        document.getElementById("hdr-time-of-day").innerText = timeLabels[engine.timeOfDay];
        document.getElementById("hdr-active-job").innerText = engine.currentJob ? engine.currentJob.title : "Unemployed / Dependent";
        document.getElementById("hdr-era-tech").innerText = engine.era.techLevel;

        // Status Meters
        updateMeter("health", engine.status.health);
        updateMeter("hunger", engine.status.hunger);
        updateMeter("thirst", engine.status.thirst);
        updateMeter("energy", engine.status.energy);
        updateMeter("sleep", engine.status.sleep);
        updateMeter("happiness", engine.status.happiness);
        updateMeter("knowledge", engine.status.knowledge);
        updateMeter("social", engine.status.social);
        updateMeter("safety", engine.status.safety);
        updateMeter("nutrition", engine.status.nutrition);
        updateMeter("physical", engine.status.physical);

        document.getElementById("val-money").innerText = `${engine.era.currencySymbol}${engine.status.money}`;
        document.getElementById("fill-money").style.width = `${Math.min(100, engine.status.money / 10)}%`;

        // Family List
        const famContainer = document.getElementById("family-list-container");
        if (famContainer) {
            famContainer.innerHTML = engine.family.map(f => `
                <div class="family-item">
                    <div>
                        <strong>${f.name}</strong>
                        <div class="fam-rel">${f.relation}</div>
                    </div>
                    <span style="color:#10b981; font-weight:bold;">${f.relationshipScore}% Bond</span>
                </div>
            `).join("");
        }

        // Viewport Overlays
        document.getElementById("hud-activity-text").innerText = `ACTIVE: ${engine.currentActivity}`;
        document.getElementById("hud-stage-limits").innerText = stage.notice;
        document.getElementById("hud-era-info").innerText = `ERA: ${engine.era.name} — ${engine.era.techLevel}`;

        // Stage Notice
        document.getElementById("stage-notice-box").innerHTML = `<strong>${stage.name} Stage Notice:</strong> ${stage.notice}`;

        // Career Selection Visibility
        if (careerWrapper) {
            careerWrapper.style.display = engine.ageYears >= 13 ? "block" : "none";
        }

        // Survival Status
        document.getElementById("surv-shelter").innerText = engine.era.shelter;
        document.getElementById("surv-clothing").innerText = engine.era.clothing;
        document.getElementById("surv-tools").innerText = engine.era.tools;
        document.getElementById("surv-food").innerText = engine.era.foodSource;
        document.getElementById("surv-medicine").innerText = engine.era.medicine;
        document.getElementById("surv-risks").innerText = engine.era.risks;

        // Timeline List
        const timelineList = document.getElementById("life-timeline-list");
        if (timelineList) {
            timelineList.innerHTML = engine.timeline.map(t => `
                <div class="tl-item">
                    <div class="tl-node"></div>
                    <div class="tl-content">
                        <span class="tl-time">${t.time}</span>
                        <h5 class="tl-title">${t.title}</h5>
                        <p class="tl-desc">${t.desc}</p>
                    </div>
                </div>
            `).join("");
        }

        // Logger Feed
        const logFeed = document.getElementById("human-logger-feed");
        if (logFeed) {
            logFeed.innerHTML = engine.eventsLog.map(l => `
                <div class="log-entry ${l.type}"><span class="log-time">${l.time}</span> ${l.text}</div>
            `).join("");
        }

        // Canvas Rendering
        drawHumanCanvas();
    }

    function updateMeter(id, value) {
        const valSpan = document.getElementById(`val-${id}`);
        const fillBar = document.getElementById(`fill-${id}`);
        if (valSpan) valSpan.innerText = `${Math.round(value)}%`;
        if (fillBar) fillBar.style.width = `${Math.max(0, Math.min(100, value))}%`;
    }

    function drawHumanCanvas() {
        if (!ctx || !canvas) return;

        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Environment Background Aesthetics
        ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Draw Floor Platform
        ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
        ctx.fillRect(0, 320, canvas.width, 100);
        ctx.strokeStyle = "#8b5cf6";
        ctx.strokeRect(0, 320, canvas.width, 1);

        // Draw Animated Human Character Avatar based on Life Stage
        const stage = engine.getLifeStage();
        const centerX = canvas.width / 2;
        const centerY = 280;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Character Aura Glow
        const auraGrad = ctx.createRadialGradient(0, -30, 10, 0, -30, 60);
        auraGrad.addColorStop(0, "rgba(139, 92, 246, 0.4)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, -30, 60, 0, Math.PI * 2);
        ctx.fill();

        // Size scaling per life stage
        let scale = 1.0;
        if (stage.name === "BABY") scale = 0.4;
        else if (stage.name === "EARLY CHILDHOOD") scale = 0.6;
        else if (stage.name === "CHILDHOOD") scale = 0.8;
        else if (stage.name === "TEENAGE") scale = 0.95;
        else if (stage.name === "OLD AGE") scale = 0.9;

        ctx.scale(scale, scale);

        // Character Body Art
        ctx.fillStyle = "#ec4899"; // Outfit
        ctx.beginPath();
        ctx.arc(0, -20, 22, 0, Math.PI * 2); // Head
        ctx.fill();

        ctx.fillStyle = "#a855f7"; // Torso
        ctx.fillRect(-15, 0, 30, 40);

        ctx.strokeStyle = "#38bdf8"; // Limbs
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 40); ctx.lineTo(-10, 70); // Left Leg
        ctx.moveTo(10, 40); ctx.lineTo(10, 70);   // Right Leg
        ctx.stroke();

        ctx.restore();

        // Era Text Watermark
        ctx.font = "12px JetBrains Mono";
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.textAlign = "right";
        ctx.fillText(`${engine.era.name}`, canvas.width - 20, 30);
    }

    // Initialize UI
    updateCareerDropdown();
    renderUI();

    // Simulation Clock Loop
    setInterval(() => {
        if (!engine.isPaused && engine.isAlive) {
            for (let i = 0; i < engine.simSpeed; i++) {
                engine.tick();
            }
            renderUI();
        }
    }, 1200);
});
