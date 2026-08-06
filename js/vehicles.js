/**
 * Metropolis Directive - Autonomous Traffic Vehicles Module (js/vehicles.js)
 *
 * Auto-spawns cars, buses, and trucks moving on road networks.
 * Handles deceleration on approach of red traffic junctions, stops
 * for safety distance spacing, and wraps across boundaries.
 */

class TrafficManager {
    constructor(world) {
        this.world = world;
        this.vehicles = [];
        this.maxVehicles = 40;

        // Vehicle metadata colors and specs
        this.models = [
            { type: 'car', length: 24, width: 14, speed: 3.0, color: '#4cc9f0', label: 'E-Sedan' },
            { type: 'car', length: 22, width: 14, speed: 3.5, color: '#f72585', label: 'Neo-Coupe' },
            { type: 'truck', length: 38, width: 18, speed: 2.2, color: '#10b981', label: 'Cargo Carrier' },
            { type: 'bus', length: 45, width: 18, speed: 2.0, color: '#f59e0b', label: 'Metro-Transit' }
        ];

        this.spawnInitialTraffic();
    }

    spawnInitialTraffic() {
        for (let i = 0; i < this.maxVehicles; i++) {
            this.spawnVehicle();
        }
    }

    spawnVehicle() {
        // Find a random road segment to place the vehicle on
        const road = this.world.roads[Math.floor(Math.random() * this.world.roads.length)];
        const model = this.models[Math.floor(Math.random() * this.models.length)];

        // Random location along this road
        let rx = road.x + Math.random() * road.width;
        let ry = road.y + Math.random() * road.height;

        // Adjust positioning to align inside lanes
        let direction = Math.random() > 0.5 ? 1 : -1;

        if (road.dir === 'H') {
            // Keep on top or bottom lane halves
            ry = road.y + (direction > 0 ? road.height * 0.25 : road.height * 0.75);
        } else {
            rx = road.x + (direction > 0 ? road.width * 0.25 : road.width * 0.75);
        }

        this.vehicles.push({
            x: rx,
            y: ry,
            width: model.width,
            length: model.length,
            targetSpeed: model.speed,
            currentSpeed: model.speed,
            color: model.color,
            type: model.type,
            label: model.label,
            dir: road.dir, // H or V
            sense: direction, // 1 (forward) or -1 (reverse)
            road: road,
            brakeTimer: 0
        });
    }

    update(dt) {
        this.vehicles.forEach(veh => {
            // Check upcoming traffic signal junctions
            let shouldStop = false;

            this.world.trafficLights.forEach(light => {
                const distanceToLight = Math.hypot(light.x - veh.x, light.y - veh.y);

                if (distanceToLight < 160) {
                    // Check if light is Red/Yellow and vehicle is heading towards it
                    if (light.state === 'R' || light.state === 'Y') {
                        if (veh.dir === 'H') {
                            // Moving right and light is ahead of it, or moving left and light is ahead
                            if ((veh.sense > 0 && light.x > veh.x) || (veh.sense < 0 && light.x < veh.x)) {
                                shouldStop = true;
                            }
                        } else {
                            // Vertical check
                            if ((veh.sense > 0 && light.y > veh.y) || (veh.sense < 0 && light.y < veh.y)) {
                                shouldStop = true;
                            }
                        }
                    }
                }
            });

            // Check distance with vehicle in front to prevent collisions
            this.vehicles.forEach(other => {
                if (veh !== other && veh.dir === other.dir && veh.sense === other.sense) {
                    const dist = Math.hypot(other.x - veh.x, other.y - veh.y);
                    if (dist < veh.length + 40) {
                        // Check if other vehicle is indeed ahead in current movement lane
                        if (veh.dir === 'H') {
                            if ((veh.sense > 0 && other.x > veh.x) || (veh.sense < 0 && other.x < veh.x)) {
                                shouldStop = true;
                            }
                        } else {
                            if ((veh.sense > 0 && other.y > veh.y) || (veh.sense < 0 && other.y < veh.y)) {
                                shouldStop = true;
                            }
                        }
                    }
                }
            });

            // Accelerate or Brake
            if (shouldStop) {
                veh.currentSpeed = Math.max(veh.currentSpeed - 0.15, 0);
            } else {
                veh.currentSpeed = Math.min(veh.currentSpeed + 0.08, veh.targetSpeed);
            }

            // Move vehicle coordinates
            if (veh.dir === 'H') {
                veh.x += veh.currentSpeed * veh.sense;
                // Boundary wrapping
                if (veh.x < 0) veh.x = this.world.width;
                if (veh.x > this.world.width) veh.x = 0;
            } else {
                veh.y += veh.currentSpeed * veh.sense;
                // Boundary wrapping
                if (veh.y < 0) veh.y = this.world.height;
                if (veh.y > this.world.height) veh.y = 0;
            }
        });
    }

    draw(ctx, renderLights) {
        this.vehicles.forEach(veh => {
            ctx.save();
            ctx.translate(veh.x, veh.y);

            // Determine rotation according to lane direction and sense
            let angle = 0;
            if (veh.dir === 'H') {
                angle = veh.sense > 0 ? 0 : Math.PI;
            } else {
                angle = veh.sense > 0 ? Math.PI / 2 : -Math.PI / 2;
            }
            ctx.rotate(angle);

            // Shadow bounding box
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(-veh.length/2 + 2, -veh.width/2 + 2, veh.length, veh.width);

            // Vehicle body shell
            ctx.fillStyle = veh.color;
            ctx.fillRect(-veh.length/2, -veh.width/2, veh.length, veh.width);

            // Windshield glass window
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(veh.length/4 - 2, -veh.width/2 + 2, 5, veh.width - 4);

            // Headlights glowing (yellow forward, red brake taillights behind)
            if (renderLights) {
                // Taillights
                ctx.fillStyle = veh.currentSpeed === 0 ? '#ef4444' : '#b91c1c';
                ctx.fillRect(-veh.length/2, -veh.width/2 + 2, 2, 2);
                ctx.fillRect(-veh.length/2, veh.width/2 - 4, 2, 2);

                // Headlights
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(veh.length/2 - 2, -veh.width/2 + 2, 2, 2);
                ctx.fillRect(veh.length/2 - 2, veh.width/2 - 4, 2, 2);
            }

            ctx.restore();
        });
    }
}

// Export class globally
window.TrafficManager = TrafficManager;
