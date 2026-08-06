/**
 * Metropolis Directive - Player Module (js/player.js)
 *
 * Manages player mechanics, vector positioning, speed parameters, keyboard controls,
 * bounding-box collisions, and smooth vector rotation.
 */

class PlayerEntity {
    constructor(world) {
        this.world = world;

        // Positioning coordinates
        this.x = 800; // Start near hyper tower
        this.y = 450;
        this.angle = 0; // facing angle in radians
        this.radius = 12;

        // Dynamics coefficients
        this.speed = 0;
        this.maxNormalSpeed = 3.5;
        this.maxSprintSpeed = 6.2;
        this.acceleration = 0.22;
        this.friction = 0.12;

        // Control flags
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            sprint: false
        };

        // Interactive states
        this.isSprinting = false;
        this.currentZoneName = 'CITY CENTRAL';

        this.initControls();
    }

    initControls() {
        // Desktop key bindings
        window.addEventListener('keydown', e => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') this.keys.up = true;
            if (k === 's' || e.key === 'ArrowDown') this.keys.down = true;
            if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = true;
            if (k === 'd' || e.key === 'ArrowRight') this.keys.right = true;
            if (e.key === 'Shift') {
                this.keys.sprint = true;
                this.isSprinting = true;
            }
        });

        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            if (k === 'w' || e.key === 'ArrowUp') this.keys.up = false;
            if (k === 's' || e.key === 'ArrowDown') this.keys.down = false;
            if (k === 'a' || e.key === 'ArrowLeft') this.keys.left = false;
            if (k === 'd' || e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === 'Shift') {
                this.keys.sprint = false;
                this.isSprinting = false;
            }
        });
    }

    update() {
        // Horizontal and Vertical axes inputs
        let ax = 0;
        let ay = 0;

        if (this.keys.up) ay -= 1;
        if (this.keys.down) ay += 1;
        if (this.keys.left) ax -= 1;
        if (this.keys.right) ax += 1;

        // Normalize direction vector to prevent faster diagonal speeds
        let inputMag = Math.hypot(ax, ay);
        if (inputMag > 0) {
            ax /= inputMag;
            ay /= inputMag;

            // Target facing angle
            this.angle = Math.atan2(ay, ax);

            // Accelerate speed limiters
            const targetMax = this.isSprinting ? this.maxSprintSpeed : this.maxNormalSpeed;
            this.speed = Math.min(this.speed + this.acceleration, targetMax);
        } else {
            // Apply deceleration friction
            this.speed = Math.max(this.speed - this.friction, 0);
        }

        // Apply movement vector with step checks
        if (this.speed > 0) {
            let nextX = this.x + Math.cos(this.angle) * this.speed;
            let nextY = this.y + Math.sin(this.angle) * this.speed;

            // Slide-along-wall collision checks
            // Try combined x+y step
            if (!this.world.checkCollision(nextX, nextY, this.radius)) {
                this.x = nextX;
                this.y = nextY;
            } else {
                // Try x component separately
                let testX = this.x + Math.cos(this.angle) * this.speed;
                if (!this.world.checkCollision(testX, this.y, this.radius)) {
                    this.x = testX;
                } else {
                    // Try y component separately
                    let testY = this.y + Math.sin(this.angle) * this.speed;
                    if (!this.world.checkCollision(this.x, testY, this.radius)) {
                        this.y = testY;
                    }
                }
            }
        }

        // Update Zone label metadata based on player coordinates
        this.updateZoneName();
    }

    updateZoneName() {
        if (this.x < 1400) {
            if (this.y < 1200) this.currentZoneName = 'WEST CORE PLATFORM';
            else if (this.y > 2800) this.currentZoneName = 'SOUTH LABS SECTOR';
            else this.currentZoneName = 'METRO JUNCTION WEST';
        } else if (this.x > 2600) {
            if (this.y < 1200) this.currentZoneName = 'NORTHEAST TERMINAL';
            else if (this.y > 2800) this.currentZoneName = 'SANDY COAST BEACH';
            else this.currentZoneName = 'EASTERN LIVING BLOCK';
        } else {
            this.currentZoneName = 'AUTONOMOUS RIVERWAY BRIDGE';
        }
    }

    // Force player to specific position
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx, renderGlow) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Neon shadow halo
        ctx.shadowColor = '#f72585';
        ctx.shadowBlur = renderGlow ? 15 : 0;

        // Player vector body (futuristic triangle aircraft shape)
        ctx.fillStyle = '#f72585'; // glowing neon pink
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();

        // Engine glow circle
        ctx.fillStyle = '#4cc9f0';
        ctx.beginPath();
        ctx.arc(-6, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Export class globally
window.PlayerEntity = PlayerEntity;
