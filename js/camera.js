/**
 * Metropolis Directive - Camera Module (js/camera.js)
 *
 * Camera module supporting smooth interpolation tracking (lerping),
 * custom zoom scaling, viewport rotation, and viewport transformations.
 */

class CameraController {
    constructor() {
        this.x = 0;
        this.y = 0;

        // Lens properties
        this.zoom = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 1.8;

        this.rotation = 0; // Viewport rotation in radians

        // Elastic interpolation coefficient
        this.lerpFactor = 0.08;
    }

    // Attach tracking system to standard canvas width/height
    update(playerX, playerY, viewW, viewH) {
        // Calculate centered target
        const targetX = playerX - (viewW / 2) / this.zoom;
        const targetY = playerY - (viewH / 2) / this.zoom;

        // Apply smooth ease tracking
        this.x += (targetX - this.x) * this.lerpFactor;
        this.y += (targetY - this.y) * this.lerpFactor;
    }

    // Apply scaling translation matrix rotations
    applyTransforms(ctx, viewW, viewH) {
        // Translate to screen center, rotate, zoom, and translate back
        ctx.translate(viewW / 2, viewH / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-viewW / 2, -viewH / 2);

        // Standard camera viewport offsets translation
        ctx.translate(-this.x, -this.y);
    }

    adjustZoom(amount) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + amount));
    }

    rotate(amount) {
        this.rotation += amount;
    }

    resetRotation() {
        this.rotation = 0;
    }
}

// Export class globally
window.CameraController = CameraController;
