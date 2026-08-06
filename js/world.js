/**
 * Metropolis Directive - World Module (js/world.js)
 *
 * Generates the vector representation of the sandbox city map (4000x4000 px).
 * Features roads, lanes, bridges, buildings, rivers, beaches, mountains,
 * airport runway, metro station tracks, foliage, and active traffic signals.
 */

class WorldMap {
    constructor() {
        this.width = 4000;
        this.height = 4000;

        // Colors
        this.colors = {
            grass: '#0b1f10',
            water: '#0a3a40',
            beach: '#c4a482',
            road: '#1a1a24',
            roadLine: '#ffffff',
            buildingOutline: '#9d4edd',
            mountain: '#2d3748',
            airportRunway: '#111827',
            metroTrack: '#475569',
            bridge: '#334155'
        };

        this.trafficLights = [];
        this.buildings = [];
        this.roads = [];
        this.bridges = [];
        this.scenery = []; // trees, rocks, street lights
        this.waterBody = null;
        this.airport = null;
        this.metro = null;

        this.initWorld();
    }

    initWorld() {
        // 1. Water River running vertically from north to south (x = 1800 to 2200) with curves
        this.waterBody = {
            points: [
                { x: 1900, y: 0 },
                { x: 2000, y: 800 },
                { x: 1800, y: 1600 },
                { x: 2100, y: 2400 },
                { x: 1950, y: 3200 },
                { x: 2300, y: 4000 }
            ],
            width: 320,
            beachWidth: 400,
            // Beach is at the far right coastline (x > 3600)
            beachLineX: 3600
        };

        // 2. Bridges crossing the river
        this.bridges = [
            { x: 1700, y: 1000, width: 600, height: 120, orientation: 'H' },
            { x: 1800, y: 2800, width: 600, height: 120, orientation: 'H' }
        ];

        // 3. Roads grid system (H = Horizontal, V = Vertical)
        this.roads = [
            // Major highways
            { x: 0, y: 400, width: 4000, height: 100, type: 'highway', dir: 'H' },
            { x: 0, y: 1800, width: 4000, height: 100, type: 'highway', dir: 'H' },
            { x: 0, y: 3200, width: 4000, height: 100, type: 'highway', dir: 'H' },
            { x: 600, y: 0, width: 100, height: 4000, type: 'highway', dir: 'V' },
            { x: 1400, y: 0, width: 100, height: 4000, type: 'highway', dir: 'V' },
            { x: 2700, y: 0, width: 100, height: 4000, type: 'highway', dir: 'V' },
            { x: 3400, y: 0, width: 100, height: 4000, type: 'highway', dir: 'V' },

            // Local streets
            { x: 0, y: 1000, width: 1700, height: 60, type: 'street', dir: 'H' },
            { x: 2300, y: 1000, width: 1300, height: 60, type: 'street', dir: 'H' },
            { x: 0, y: 2800, width: 1800, height: 60, type: 'street', dir: 'H' },
            { x: 2400, y: 2800, width: 1200, height: 60, type: 'street', dir: 'H' }
        ];

        // 4. Traffic Lights at major junctions
        this.roads.forEach(r1 => {
            if (r1.dir === 'H') {
                this.roads.forEach(r2 => {
                    if (r2.dir === 'V') {
                        // Check if they intersect
                        const intersectX = r2.x + r2.width / 2;
                        const intersectY = r1.y + r1.height / 2;

                        if (intersectX >= r1.x && intersectX <= r1.x + r1.width &&
                            intersectY >= r2.y && intersectY <= r2.y + r2.height) {

                            // Prevent spawning lights directly on water/bridges
                            if (intersectX < 1600 || intersectX > 2400) {
                                this.trafficLights.push({
                                    x: intersectX,
                                    y: intersectY,
                                    state: 'G', // G, Y, R
                                    timer: Math.random() * 5000 + 3000,
                                    duration: 6000,
                                    r1_id: r1,
                                    r2_id: r2
                                });
                            }
                        }
                    }
                });
            }
        });

        // 5. Buildings Blocks (avoiding roads, bridges, and water)
        const buildingLocations = [
            // Zone A (North West)
            { x: 100, y: 100, w: 200, h: 200, color: '#f72585', name: 'Cyberdine Corp' },
            { x: 350, y: 100, w: 150, h: 200, color: '#4cc9f0', name: 'Nexon Labs' },
            { x: 100, y: 600, w: 180, h: 150, color: '#9d4edd', name: 'SaaS Terminal' },
            { x: 320, y: 600, w: 220, h: 180, color: '#10b981', name: 'Grid Analytics' },
            { x: 100, y: 1200, w: 400, h: 400, color: '#3b82f6', name: 'Megablock Residential' },
            { x: 800, y: 100, w: 200, h: 250, color: '#f59e0b', name: 'Hyper Tower' },
            { x: 1100, y: 100, w: 200, h: 250, color: '#f72585', name: 'Omni Retail' },
            { x: 800, y: 600, w: 400, h: 300, color: '#4cc9f0', name: 'Tech Campus' },

            // Zone B (Central West)
            { x: 100, y: 2000, w: 350, h: 300, color: '#ec4899', name: 'Neo Hospital' },
            { x: 800, y: 2000, w: 220, h: 220, color: '#9d4edd', name: 'Synthesized Core' },
            { x: 1100, y: 2000, w: 200, h: 400, color: '#3b82f6', name: 'Apex Residence' },
            { x: 100, y: 2400, w: 400, h: 300, color: '#10b981', name: 'E-Waste Recycling' },

            // Zone C (South West)
            { x: 100, y: 3400, w: 400, h: 400, color: '#f72585', name: 'Power Matrix Grid' },
            { x: 800, y: 3400, w: 250, h: 300, color: '#f59e0b', name: 'Aviation Air Control' },
            { x: 1100, y: 3400, w: 250, h: 400, color: '#3b82f6', name: 'Southern Hub' },

            // Zone D (East Side)
            { x: 2900, y: 100, w: 400, h: 250, color: '#9d4edd', name: 'Marine Research HQ' },
            { x: 2900, y: 600, w: 200, h: 300, color: '#4cc9f0', name: 'Cloud Server Farms' },
            { x: 3150, y: 600, w: 180, h: 300, color: '#f72585', name: 'Quantum Core' },
            { x: 2900, y: 1200, w: 400, h: 400, color: '#10b981', name: 'Solis Plaza' },
            { x: 2900, y: 2000, w: 350, h: 350, color: '#3b82f6', name: 'High-Sec Vault' },
            { x: 2900, y: 2450, w: 350, h: 300, color: '#f59e0b', name: 'East Side Living' }
        ];

        this.buildings = buildingLocations;

        // 6. Airport layout on the North East plateau (x = 2900 to 3500, y = 100 to 500)
        this.airport = {
            runwayX: 2900,
            runwayY: 100,
            runwayW: 450,
            runwayH: 80,
            lights: [
                { x: 2900, y: 140, color: '#ef4444' },
                { x: 3000, y: 140, color: '#10b981' },
                { x: 3100, y: 140, color: '#ffffff' },
                { x: 3200, y: 140, color: '#ffffff' },
                { x: 3350, y: 140, color: '#10b981' }
            ],
            plane: {
                x: 3200,
                y: 135,
                angle: 0,
                speed: 0
            }
        };

        // 7. Metro System linking East and West (Horizontal Tracks at y = 1600)
        this.metro = {
            trackY: 1600,
            stationWest: { x: 400, y: 1600, name: 'WEST METRO' },
            stationEast: { x: 3200, y: 1600, name: 'EAST METRO' },
            train: {
                x: 400,
                dir: 1, // 1 for East, -1 for West
                speed: 6,
                cars: 4,
                length: 120
            }
        };

        // 8. Mountains / Rocky Cliffs in the North West corner (x < 500, y < 300) and Central East
        this.mountains = [
            { cx: 200, cy: 50, radius: 120 },
            { cx: 350, cy: 40, radius: 90 },
            { cx: 50, cy: 120, radius: 80 },
            { cx: 2500, cy: 2200, radius: 110 } // Middle center near river
        ];

        // 9. Scenery (Trees and streetlights)
        // Let's spawn hundreds of trees randomly (avoiding roads, water, buildings)
        for (let i = 0; i < 450; i++) {
            const rx = Math.random() * 3900 + 50;
            const ry = Math.random() * 3900 + 50;

            if (this.isValidPositionForTree(rx, ry)) {
                this.scenery.push({
                    type: 'tree',
                    x: rx,
                    y: ry,
                    size: Math.random() * 12 + 8,
                    sway: Math.random() * Math.PI
                });
            }
        }

        // Spawn Street Lights on roadsides
        this.roads.forEach(road => {
            if (road.dir === 'H') {
                for (let sx = road.x + 100; sx < road.x + road.width; sx += 300) {
                    if (sx < 1600 || sx > 2400) { // Keep away from main river spans
                        this.scenery.push({
                            type: 'streetlight',
                            x: sx,
                            y: road.y - 10,
                            glowing: true
                        });
                    }
                }
            }
        });
    }

    isValidPositionForTree(x, y) {
        // Prevent on water
        if (x > 1750 && x < 2250) return false;
        // Prevent on beach
        if (x > 3550) return false;

        // Prevent on roads
        for (let r of this.roads) {
            if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
                return false;
            }
        }
        // Prevent on buildings
        for (let b of this.buildings) {
            if (x >= b.x - 20 && x <= b.x + b.w + 20 && y >= b.y - 20 && y <= b.y + b.h + 20) {
                return false;
            }
        }
        // Prevent on airport
        if (x >= this.airport.runwayX - 50 && x <= this.airport.runwayX + this.airport.runwayW + 50 &&
            y >= this.airport.runwayY - 50 && y <= this.airport.runwayY + 120) {
            return false;
        }

        return true;
    }

    update(dt) {
        // Update traffic signal timers
        this.trafficLights.forEach(light => {
            light.timer -= dt;
            if (light.timer <= 0) {
                light.timer = light.duration;
                // Cycle: Green -> Yellow -> Red -> Green
                if (light.state === 'G') {
                    light.state = 'Y';
                    light.timer = 2000; // Yellow is 2 seconds
                } else if (light.state === 'Y') {
                    light.state = 'R';
                } else {
                    light.state = 'G';
                }
            }
        });

        // Move Metro Train automatically
        const metro = this.metro;
        metro.train.x += metro.train.speed * metro.train.dir;
        if (metro.train.x > metro.stationEast.x) {
            metro.train.dir = -1;
            // Delay or just bounce
        } else if (metro.train.x < metro.stationWest.x) {
            metro.train.dir = 1;
        }

        // Animate street lights, airport blinking indicators, tree sways
        this.scenery.forEach(item => {
            if (item.type === 'tree') {
                item.sway += 0.02;
            }
        });
    }

    // Checking collision boundaries for player coordinate checking
    checkCollision(x, y, radius) {
        // Out of world bounds
        if (x < radius || x > this.width - radius || y < radius || y > this.height - radius) {
            return true;
        }

        // Check mountains
        for (let m of this.mountains) {
            const dx = x - m.cx;
            const dy = y - m.cy;
            const dist = Math.hypot(dx, dy);
            if (dist < m.radius + radius - 15) {
                return true;
            }
        }

        // Check Buildings
        for (let b of this.buildings) {
            if (x >= b.x - radius && x <= b.x + b.w + radius &&
                y >= b.y - radius && y <= b.y + b.h + radius) {
                return true;
            }
        }

        // Check Deep River body (allow crossing bridges only)
        // Simplistic check: If inside river X coordinates, verify if on bridge
        const inRiver = x > 1750 && x < 2150;
        if (inRiver) {
            let onBridge = false;
            for (let br of this.bridges) {
                if (x >= br.x && x <= br.x + br.width && y >= br.y && y <= br.y + br.height) {
                    onBridge = true;
                    break;
                }
            }
            if (!onBridge) {
                return true; // Collides with deep water flow!
            }
        }

        return false;
    }

    // Render static canvas layer elements
    draw(ctx, renderLights) {
        // Draw overall grass background
        ctx.fillStyle = this.colors.grass;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw sandy beach along right coast
        ctx.fillStyle = this.colors.beach;
        ctx.fillRect(this.waterBody.beachLineX, 0, this.width - this.waterBody.beachLineX, this.height);

        // Draw beach wave lines
        ctx.strokeStyle = '#e5d5c5';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let y = 0; y < this.height; y += 40) {
            ctx.lineTo(this.waterBody.beachLineX + 20 * Math.sin(y/100), y);
        }
        ctx.stroke();

        // Draw water river flows
        ctx.fillStyle = this.colors.water;
        ctx.beginPath();
        ctx.moveTo(this.waterBody.points[0].x - this.waterBody.width/2, this.waterBody.points[0].y);
        for (let i = 1; i < this.waterBody.points.length; i++) {
            ctx.lineTo(this.waterBody.points[i].x - this.waterBody.width/2, this.waterBody.points[i].y);
        }
        for (let i = this.waterBody.points.length - 1; i >= 0; i--) {
            ctx.lineTo(this.waterBody.points[i].x + this.waterBody.width/2, this.waterBody.points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw airport runway
        ctx.fillStyle = this.colors.airportRunway;
        ctx.fillRect(this.airport.runwayX, this.airport.runwayY, this.airport.runwayW, this.airport.runwayH);

        // Runway center lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(this.airport.runwayX + 20, this.airport.runwayY + this.airport.runwayH/2);
        ctx.lineTo(this.airport.runwayX + this.airport.runwayW - 20, this.airport.runwayY + this.airport.runwayH/2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runway lights blinking
        this.airport.lights.forEach(light => {
            const glow = Math.sin(Date.now() / 150) > 0;
            ctx.fillStyle = glow ? light.color : '#333333';
            ctx.beginPath();
            ctx.arc(light.x, light.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw metro track lines
        ctx.strokeStyle = this.colors.metroTrack;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, this.metro.trackY);
        ctx.lineTo(this.width, this.metro.trackY);
        ctx.stroke();

        // Draw bridges crossing water
        this.bridges.forEach(b => {
            ctx.fillStyle = this.colors.bridge;
            ctx.fillRect(b.x, b.y, b.width, b.height);

            // Bridge girders/railings
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 4;
            ctx.strokeRect(b.x, b.y, b.width, b.height);

            // Internal safety lanes
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.height/2);
            ctx.lineTo(b.x + b.width, b.y + b.height/2);
            ctx.stroke();
        });

        // Draw highways and local streets
        this.roads.forEach(r => {
            ctx.fillStyle = this.colors.road;
            ctx.fillRect(r.x, r.y, r.width, r.height);

            // Center lane yellow dividing stripes
            ctx.strokeStyle = r.type === 'highway' ? '#f59e0b' : '#475569';
            ctx.lineWidth = 2;
            if (r.type === 'highway') {
                ctx.setLineDash([12, 12]);
            } else {
                ctx.setLineDash([8, 15]);
            }

            ctx.beginPath();
            if (r.dir === 'H') {
                ctx.moveTo(r.x, r.y + r.height/2);
                ctx.lineTo(r.x + r.width, r.y + r.height/2);
            } else {
                ctx.moveTo(r.x + r.width/2, r.y);
                ctx.lineTo(r.x + r.width/2, r.y + r.height);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Draw mountains
        this.mountains.forEach(m => {
            // Draw gradient concentric layers for peak elevation heights
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(m.cx, m.cy, m.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(m.cx, m.cy, m.radius * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Snow capped summit circle
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(m.cx, m.cy, m.radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Buildings
        this.buildings.forEach(b => {
            // Drop base shadow rectangle
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);

            // Structure body fills
            ctx.fillStyle = '#111827';
            ctx.fillRect(b.x, b.y, b.w, b.h);

            // Neon roof borders glowing outline
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(b.x, b.y, b.w, b.h);

            // Window pixels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let wx = b.x + 15; wx < b.x + b.w - 15; wx += 25) {
                for (let wy = b.y + 15; wy < b.y + b.h - 15; wy += 25) {
                    if (Math.sin(wx + wy + Date.now()/1000) > -0.2) {
                        ctx.fillStyle = b.color + '66'; // Glowing opacity windows
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                    }
                    ctx.fillRect(wx, wy, 8, 8);
                }
            }

            // Draw Building Core text label inside
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 9px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.name, b.x + b.w/2, b.y + b.h/2 + 3);
        });

        // Draw Foliage trees
        this.scenery.forEach(item => {
            if (item.type === 'tree') {
                const swayOffset = Math.sin(item.sway) * 2.5;
                ctx.fillStyle = '#065f46';
                ctx.beginPath();
                ctx.arc(item.x + swayOffset, item.y, item.size, 0, Math.PI * 2);
                ctx.fill();

                // Inner highlighted green layer
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(item.x + swayOffset - 2, item.y - 2, item.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw Metro train carriages sliding on track
        const train = this.metro.train;
        ctx.fillStyle = '#38bdf8'; // Futuristic cyan train body
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = renderLights ? 15 : 0;

        for (let c = 0; c < train.cars; c++) {
            const cx = train.x - (c * 30 * train.dir);
            ctx.fillRect(cx - 12, this.metro.trackY - 6, 24, 12);

            // Connection coupling lines between cars
            if (c < train.cars - 1) {
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(cx - 12 * train.dir, this.metro.trackY);
                ctx.lineTo(cx - 18 * train.dir, this.metro.trackY);
                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;

        // Draw traffic lights signals
        this.trafficLights.forEach(light => {
            // Draw signal post
            ctx.fillStyle = '#475569';
            ctx.fillRect(light.x - 3, light.y - 12, 6, 24);

            // Draw active bulb glow
            let bulbColor = '#ef4444';
            if (light.state === 'G') bulbColor = '#10b981';
            else if (light.state === 'Y') bulbColor = '#f59e0b';

            ctx.fillStyle = bulbColor;
            ctx.shadowColor = bulbColor;
            ctx.shadowBlur = renderLights ? 12 : 0;
            ctx.beginPath();
            ctx.arc(light.x, light.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    // Draw nightly streetlights cones overlay
    drawStreetLightGlows(ctx) {
        this.scenery.forEach(item => {
            if (item.type === 'streetlight' && item.glowing) {
                // Post point base
                ctx.fillStyle = '#1e293b';
                ctx.beginPath();
                ctx.arc(item.x, item.y, 4, 0, Math.PI * 2);
                ctx.fill();

                // Golden radial gradient light cone
                const grad = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 70);
                grad.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
                grad.addColorStop(0.3, 'rgba(253, 224, 71, 0.15)');
                grad.addColorStop(1, 'rgba(253, 224, 71, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.x, item.y, 70, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

// Export class globally
window.WorldMap = WorldMap;
