/**
 * Metropolis Directive - Fictional Quest, Achievement, & Token Systems (js/missions.js)
 *
 * Manages client-side missions, scattered city tokens, secret areas discoveries,
 * exploration percentage tracking, and achievements unlocked.
 * Restores state instantly using LocalStorage.
 */

class MissionSystem {
    constructor(engine) {
        this.engine = engine;

        // Collectible city tokens coordinates list
        this.tokens = [
            { id: 1, x: 850, y: 350, r: 8, collected: false },
            { id: 2, x: 1200, y: 250, r: 8, collected: false },
            { id: 3, x: 300, y: 700, r: 8, collected: false },
            { id: 4, x: 1050, y: 900, r: 8, collected: false },
            { id: 5, x: 2850, y: 1250, r: 8, collected: false },
            { id: 6, x: 3780, y: 3100, r: 8, collected: false },
            { id: 7, x: 2500, y: 2200, r: 8, collected: false },
            { id: 8, x: 3100, y: 150, r: 8, collected: false },
            { id: 9, x: 150, y: 2350, r: 8, collected: false },
            { id: 10, x: 1450, y: 3450, r: 8, collected: false }
        ];

        // Core interactive districts and secret areas coordinates list
        this.districts = [
            { name: 'WEST CORE PLATFORM', x1: 0, y1: 0, x2: 1400, y2: 1200, discovered: false },
            { name: 'SOUTH LABS SECTOR', x1: 0, y1: 2800, x2: 1400, y2: 4000, discovered: false },
            { name: 'NORTHEAST TERMINAL', x1: 2600, y1: 0, x2: 4000, y2: 1200, discovered: false },
            { name: 'SANDY COAST BEACH', x1: 2600, y1: 2800, x2: 4000, y2: 4000, discovered: false },
            { name: 'EASTERN LIVING BLOCK', x1: 2600, y1: 1200, x2: 4000, y2: 2800, discovered: false }
        ];

        // Secret fictional locations list
        this.secrets = [
            { id: 'secret_tunnel', name: '🕳️ Hidden Subway Tunnel', cx: 2000, cy: 1600, r: 60, discovered: false, xp: 200 },
            { id: 'secret_island', name: '🏝️ Hidden Island Reserve', cx: 2100, cy: 3700, r: 70, discovered: false, xp: 250 },
            { id: 'secret_lab', name: '🧪 Secret Cybernetics Lab', cx: 900, cy: 2100, r: 50, discovered: false, xp: 300 }
        ];

        // 9 original fictional missions
        this.missions = [
            {
                id: 'm1',
                title: '⚡ Ignite Metropolis',
                desc: 'Boot up system updates and explore the core plaza.',
                targetX: 800,
                targetY: 450,
                radius: 80,
                reward: 100,
                completed: false
            },
            {
                id: 'm2',
                title: '✈️ Inspect Airport Runway',
                desc: 'Drive to the airport hangar in the Northeast platform.',
                targetX: 3100,
                targetY: 150,
                radius: 120,
                reward: 150,
                completed: false
            },
            {
                id: 'm3',
                title: '🛍️ Discover Shopping Mall',
                desc: 'Visit Nexon Labs Mall to check store displays.',
                targetX: 1100,
                targetY: 200,
                radius: 100,
                reward: 120,
                completed: false
            },
            {
                id: 'm4',
                title: '🏥 Emergency Drill at Hospital',
                desc: 'Reach Neo Hospital gates to coordinate medical services.',
                targetX: 200,
                targetY: 2150,
                radius: 100,
                reward: 180,
                completed: false
            },
            {
                id: 'm5',
                title: '🚓 Police Station Patrol',
                desc: 'Conduct security sweep around police command quarters.',
                targetX: 1000,
                targetY: 3500,
                radius: 90,
                reward: 110,
                completed: false
            },
            {
                id: 'm6',
                title: '📚 Library Information Core',
                desc: 'Access server archives inside the central library.',
                targetX: 1100,
                targetY: 3550,
                radius: 80,
                reward: 130,
                completed: false
            },
            {
                id: 'm7',
                title: '🏖️ Relax at Sandy Beach',
                desc: 'Take coordinates down to the eastern coastal sands.',
                targetX: 3750,
                targetY: 3000,
                radius: 150,
                reward: 150,
                completed: false
            },
            {
                id: 'm8',
                title: '🏛️ Museum Artifact Core',
                desc: 'Visit Marine Research HQ Museum displays.',
                targetX: 3100,
                targetY: 220,
                radius: 100,
                reward: 140,
                completed: false
            },
            {
                id: 'm9',
                title: '🏔️ Summit Exploration',
                desc: 'Scale coordinates to the snowy mountain peaks.',
                targetX: 200,
                targetY: 50,
                radius: 100,
                reward: 200,
                completed: false
            }
        ];

        // Fictional achievement checklist
        this.achievements = [
            { id: 'ach_first_step', name: '🏆 First Steps', desc: 'Visit your first interactive location.', unlocked: false },
            { id: 'ach_city_explorer', name: '🏆 City Explorer', desc: 'Discover 5 major city sectors.', unlocked: false },
            { id: 'ach_treasure_hunter', name: '🏆 Treasure Hunter', desc: 'Collect 5 local City Tokens.', unlocked: false },
            { id: 'ach_secret_finder', name: '🏆 Secret Finder', desc: 'Uncover a hidden laboratory or island.', unlocked: false },
            { id: 'ach_night_explorer', name: '🏆 Night Explorer', desc: 'Simulate travel operations at solar midnight.', unlocked: false },
            { id: 'ach_weather_chaser', name: '🏆 Weather Chaser', desc: 'Experience alternative meteorology states.', unlocked: false }
        ];

        this.currentMissionIndex = 0;
        this.cityTokensBalance = 0;
        this.explorationProgress = 0;

        this.loadSaveState();
    }

    loadSaveState() {
        try {
            const savedTokens = localStorage.getItem('metropolis_collected_tokens');
            const savedMissions = localStorage.getItem('metropolis_completed_missions');
            const savedSecrets = localStorage.getItem('metropolis_discovered_secrets');
            const savedAchievements = localStorage.getItem('metropolis_unlocked_achievements');
            const savedBalance = localStorage.getItem('metropolis_tokens_balance');

            if (savedTokens) {
                const ids = JSON.parse(savedTokens);
                this.tokens.forEach(t => t.collected = ids.includes(t.id));
            }
            if (savedMissions) {
                const ids = JSON.parse(savedMissions);
                this.missions.forEach(m => m.completed = ids.includes(m.id));
            }
            if (savedSecrets) {
                const ids = JSON.parse(savedSecrets);
                this.secrets.forEach(s => s.discovered = ids.includes(s.id));
            }
            if (savedAchievements) {
                const ids = JSON.parse(savedAchievements);
                this.achievements.forEach(a => a.unlocked = ids.includes(npc => npc.id)); // Fix fallback JSON parser matches
                this.achievements.forEach(a => a.unlocked = ids.includes(a.id));
            }
            if (savedBalance) {
                this.cityTokensBalance = parseInt(savedBalance) || 0;
            }

            // Target next uncompleted mission
            this.findNextActiveMission();
            this.calculateExploration();
        } catch (err) {
            console.warn('Missions state loading failed:', err);
        }
    }

    saveState() {
        try {
            const collectedIds = this.tokens.filter(t => t.collected).map(t => t.id);
            const completedIds = this.missions.filter(m => m.completed).map(m => m.id);
            const discoveredSecretsIds = this.secrets.filter(s => s.discovered).map(s => s.id);
            const unlockedAchIds = this.achievements.filter(a => a.unlocked).map(a => a.id);

            localStorage.setItem('metropolis_collected_tokens', JSON.stringify(collectedIds));
            localStorage.setItem('metropolis_completed_missions', JSON.stringify(completedIds));
            localStorage.setItem('metropolis_discovered_secrets', JSON.stringify(discoveredSecretsIds));
            localStorage.setItem('metropolis_unlocked_achievements', JSON.stringify(unlockedAchIds));
            localStorage.setItem('metropolis_tokens_balance', this.cityTokensBalance.toString());
        } catch (err) {
            console.warn('Missions state write failed:', err);
        }
    }

    findNextActiveMission() {
        const next = this.missions.findIndex(m => !m.completed);
        this.currentMissionIndex = next !== -1 ? next : 0;
    }

    getCurrentMission() {
        if (this.missions.every(m => m.completed)) {
            return { title: '🏆 Metropolis 100% Secure', desc: 'All local missions completed!', targetX: 0, targetY: 0, completed: true };
        }
        return this.missions[this.currentMissionIndex];
    }

    calculateExploration() {
        const totalItems = this.tokens.length + this.missions.length + this.secrets.length + this.districts.length;
        const finishedItems =
            this.tokens.filter(t => t.collected).length +
            this.missions.filter(m => m.completed).length +
            this.secrets.filter(s => s.discovered).length +
            this.districts.filter(d => d.discovered).length;

        this.explorationProgress = Math.floor((finishedItems / totalItems) * 100);
    }

    update(playerX, playerY) {
        // 1. Proximity checks for active mission
        const active = this.getCurrentMission();
        if (active && !active.completed) {
            const distToMission = Math.hypot(playerX - active.targetX, playerY - active.targetY);
            if (distToMission < active.radius) {
                // Complete mission!
                active.completed = true;
                this.cityTokensBalance += active.reward;
                this.triggerNotification('MISSION COMPLETE', `${active.title}\n+${active.reward} City Tokens!`);
                this.checkAchievements();
                this.findNextActiveMission();
                this.calculateExploration();
                this.saveState();
            }
        }

        // 2. Token collection overlaps
        this.tokens.forEach(token => {
            if (!token.collected) {
                const distToToken = Math.hypot(playerX - token.x, playerY - token.y);
                if (distToToken < token.r + 12) {
                    token.collected = true;
                    this.cityTokensBalance += 50;
                    this.triggerNotification('TOKEN COLLECTED', `City Token Secured!\n+50 City Tokens!`);

                    try {
                        // Web Audio Synth Chime Sound
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
                        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.3);
                    } catch (e) {}

                    this.checkAchievements();
                    this.calculateExploration();
                    this.saveState();
                }
            }
        });

        // 3. Secrets discovery overlaps
        this.secrets.forEach(sec => {
            if (!sec.discovered) {
                const distToSecret = Math.hypot(playerX - sec.cx, playerY - sec.cy);
                if (distToSecret < sec.r) {
                    sec.discovered = true;
                    this.cityTokensBalance += sec.xp;
                    this.triggerNotification('SECRET DISCOVERED', `${sec.name}\n+${sec.xp} City Tokens!`);
                    this.checkAchievements();
                    this.calculateExploration();
                    this.saveState();
                }
            }
        });

        // 4. District Discovery triggers
        this.districts.forEach(dist => {
            if (!dist.discovered) {
                if (playerX >= dist.x1 && playerX <= dist.x2 && playerY >= dist.y1 && playerY <= dist.y2) {
                    dist.discovered = true;
                    this.triggerNotification('SECTOR DISCOVERED', `${dist.name} explored.`);
                    this.checkAchievements();
                    this.calculateExploration();
                    this.saveState();
                }
            }
        });
    }

    checkAchievements() {
        let saved = false;

        // "First Steps" achievement
        const firstStep = this.achievements.find(a => a.id === 'ach_first_step');
        if (firstStep && !firstStep.unlocked) {
            const hasLocation = this.districts.some(d => d.discovered);
            if (hasLocation) {
                firstStep.unlocked = true;
                this.triggerNotification('🏆 ACHIEVEMENT UNLOCKED', `${firstStep.name}\n${firstStep.desc}`);
                saved = true;
            }
        }

        // "City Explorer"
        const cityExplorer = this.achievements.find(a => a.id === 'ach_city_explorer');
        if (cityExplorer && !cityExplorer.unlocked) {
            const discoveredCount = this.districts.filter(d => d.discovered).length;
            if (discoveredCount >= 5) {
                cityExplorer.unlocked = true;
                this.triggerNotification('🏆 ACHIEVEMENT UNLOCKED', `${cityExplorer.name}\n${cityExplorer.desc}`);
                saved = true;
            }
        }

        // "Treasure Hunter"
        const hunter = this.achievements.find(a => a.id === 'ach_treasure_hunter');
        if (hunter && !hunter.unlocked) {
            const collectedCount = this.tokens.filter(t => t.collected).length;
            if (collectedCount >= 5) {
                hunter.unlocked = true;
                this.triggerNotification('🏆 ACHIEVEMENT UNLOCKED', `${hunter.name}\n${hunter.desc}`);
                saved = true;
            }
        }

        // "Secret Finder"
        const secretFinder = this.achievements.find(a => a.id === 'ach_secret_finder');
        if (secretFinder && !secretFinder.unlocked) {
            const hasSecret = this.secrets.some(s => s.discovered);
            if (hasSecret) {
                secretFinder.unlocked = true;
                this.triggerNotification('🏆 ACHIEVEMENT UNLOCKED', `${secretFinder.name}\n${secretFinder.desc}`);
                saved = true;
            }
        }

        // "Night Explorer"
        const nightExp = this.achievements.find(a => a.id === 'ach_night_explorer');
        if (nightExp && !nightExp.unlocked && this.engine && this.engine.dayNight) {
            const cycle = this.engine.dayNight;
            if (cycle.isNight && Math.floor(cycle.timeInHours) === 0) { // midnight hour
                nightExp.unlocked = true;
                this.triggerNotification('🏆 ACHIEVEMENT UNLOCKED', `${nightExp.name}\n${nightExp.desc}`);
                saved = true;
            }
        }

        // "Weather Chaser"
        const weatherChaser = this.achievements.find(a => a.id === 'ach_weather_chaser');
        if (weatherChaser && !weatherChaser.unlocked) {
            // Evaluated when player toggles distinct weather formats
            if (this.tokens.filter(t => t.collected).length >= 1) { // generic fallback unlocking trigger
                // We will unlock manually when weather button click registers
            }
        }

        if (saved) {
            this.saveState();
        }
    }

    triggerNotification(title, text) {
        // Create pure cinematic DOM slide notification
        const notification = document.createElement('div');
        notification.className = 'city-notification-banner';
        notification.innerHTML = `
            <div class="notification-pulse">⚡</div>
            <div class="notification-body">
                <span class="notification-title">${title}</span>
                <span class="notification-text">${text}</span>
            </div>
        `;
        document.body.appendChild(notification);

        // Slide sound synthetics
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } catch (e) {}

        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    // Render 2D Vector collectible tokens
    draw(ctx) {
        // Active pulsing token circles
        const scale = Math.sin(Date.now() / 150) * 2;

        ctx.save();
        this.tokens.forEach(token => {
            if (!token.collected) {
                // Neon shadow
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 10;

                ctx.fillStyle = '#fbbf24'; // Glowing Gold
                ctx.beginPath();
                ctx.arc(token.x, token.y, token.r + scale, 0, Math.PI * 2);
                ctx.fill();

                // Outer neon boundary ring
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(token.x, token.y, token.r + scale + 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        ctx.restore();
    }
}

window.MissionSystem = MissionSystem;
