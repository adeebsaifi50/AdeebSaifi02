/**
 * Metropolis Directive - NPC Behavioral Engine (js/npc.js)
 *
 * Implements a lightweight, performant client-side NPC simulation.
 * Features 8 specialized sub-types (Citizens, Cyclists, Joggers, etc.),
 * state machine activities, walking/cycling procedural animation sways,
 * zone-restricted sidewalk boundary rules, and distance culling.
 */

class NPCManager {
    constructor(world) {
        this.world = world;
        this.npcs = [];
        this.maxNpcs = 50;

        // Fictional citizen models configurations
        this.npcProfiles = [
            { type: 'citizen', color: '#a78bfa', size: 6, speed: 1.0, label: 'Citizen' },
            { type: 'jogger', color: '#f472b6', size: 6, speed: 1.8, label: 'Jogger' },
            { type: 'cyclist', color: '#60a5fa', size: 7, speed: 2.5, label: 'Cyclist' },
            { type: 'shopper', color: '#fbbf24', size: 6, speed: 0.9, label: 'Shopper' },
            { type: 'beach_visitor', color: '#fb7185', size: 6, speed: 0.7, label: 'Beach Visitor' },
            { type: 'park_visitor', color: '#34d399', size: 6, speed: 0.8, label: 'Park Visitor' },
            { type: 'airport_visitor', color: '#38bdf8', size: 6, speed: 1.1, label: 'Airport Visitor' },
            { type: 'cafe_visitor', color: '#f43f5e', size: 6, speed: 0.5, label: 'Cafe Visitor' }
        ];

        // Define spawning zones corresponding to landmarks
        this.zones = [
            { name: 'park', cx: 1000, cy: 800, r: 250 },
            { name: 'beach', cx: 3750, cy: 3000, r: 200 },
            { name: 'mall', cx: 1100, cy: 200, r: 150 },
            { name: 'airport', cx: 3100, cy: 150, r: 200 },
            { name: 'cafe', cx: 2900, cy: 1200, r: 100 },
            { name: 'sidewalks', cx: 1000, cy: 1500, r: 1000 } // General roam area
        ];

        this.spawnNpcs();
    }

    spawnNpcs() {
        for (let i = 0; i < this.maxNpcs; i++) {
            // Distribute across zones
            const zone = this.zones[i % this.zones.length];
            const profile = this.npcProfiles[i % this.npcProfiles.length];

            // Radial offsets
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * zone.r;
            const nx = zone.cx + Math.cos(angle) * dist;
            const ny = zone.cy + Math.sin(angle) * dist;

            this.npcs.push({
                x: nx,
                y: ny,
                originX: nx,
                originY: ny,
                targetX: nx,
                targetY: ny,
                angle: Math.random() * Math.PI * 2,
                size: profile.size,
                speed: profile.speed,
                color: profile.color,
                type: profile.type,
                label: profile.label,
                zone: zone.name,

                // Behavior state: walking, standing, sitting, looking
                state: Math.random() > 0.4 ? 'walking' : 'standing',
                stateTimer: Math.random() * 5000 + 2000,
                swayCycle: Math.random() * 100,
                isActive: true
            });
        }
    }

    update(dt, playerX, playerY) {
        this.npcs.forEach(npc => {
            // 1. Distance culling (Performance System)
            const distToPlayer = Math.hypot(npc.x - playerX, npc.y - playerY);
            if (distToPlayer > 1000) {
                npc.isActive = false;
                return;
            }
            npc.isActive = true;

            // 2. Behavior state machine timer
            npc.stateTimer -= dt;
            if (npc.stateTimer <= 0) {
                npc.stateTimer = Math.random() * 6000 + 3000;
                npc.state = Math.random() > 0.4 ? 'walking' : 'standing';

                // Assign new walk target within roam bounds of its zone
                if (npc.state === 'walking') {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * 200;
                    npc.targetX = npc.originX + Math.cos(angle) * r;
                    npc.targetY = npc.originY + Math.sin(angle) * r;

                    // Ensure target is within safe world boundaries
                    npc.targetX = Math.max(50, Math.min(3950, npc.targetX));
                    npc.targetY = Math.max(50, Math.min(3950, npc.targetY));
                }
            }

            // 3. Movement logic with simple wall collision prevention
            if (npc.state === 'walking') {
                const dx = npc.targetX - npc.x;
                const dy = npc.targetY - npc.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 5) {
                    npc.angle = Math.atan2(dy, dx);

                    const stepX = npc.x + Math.cos(npc.angle) * npc.speed;
                    const stepY = npc.y + Math.sin(npc.angle) * npc.speed;

                    // Walk if path is valid (no buildings or ocean water)
                    if (!this.world.checkCollision(stepX, stepY, npc.size)) {
                        npc.x = stepX;
                        npc.y = stepY;
                    } else {
                        // Collided, trigger standing state early to assign a new route
                        npc.state = 'standing';
                        npc.stateTimer = 500;
                    }
                    npc.swayCycle += npc.speed * 0.15;
                } else {
                    npc.state = 'standing';
                }
            } else {
                // Standing idle head sways
                npc.swayCycle += 0.03;
            }
        });
    }

    draw(ctx, renderGlow) {
        this.npcs.forEach(npc => {
            if (!npc.isActive) return;

            ctx.save();
            ctx.translate(npc.x, npc.y);
            ctx.rotate(npc.angle);

            // Subtle body drop shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.arc(1, 1, npc.size, 0, Math.PI * 2);
            ctx.fill();

            // Render visual profiles
            ctx.fillStyle = npc.color;
            ctx.beginPath();
            ctx.arc(0, 0, npc.size, 0, Math.PI * 2);
            ctx.fill();

            // Procedural animation details (lightweight leg/hand sways)
            if (npc.type === 'cyclist') {
                // Draw simple bike line outline
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-npc.size - 2, 0);
                ctx.lineTo(npc.size + 2, 0);
                ctx.stroke();

                // Rotating moving wheel indicators
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(-npc.size - 2, 0, 3, 0, Math.PI * 2);
                ctx.arc(npc.size + 2, 0, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (npc.type === 'jogger' || npc.state === 'walking') {
                // Procedural leg sways drawn using sines
                const sway = Math.sin(npc.swayCycle) * 3;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(sway - 1, -npc.size + 1, 2, 3);
                ctx.fillRect(-sway - 1, npc.size - 4, 2, 3);
            } else {
                // Standing idle look around
                const idleLook = Math.sin(npc.swayCycle) * 1.5;
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(npc.size / 2, idleLook, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }
}

window.NPCManager = NPCManager;
