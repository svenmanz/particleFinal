class Particle {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.size = 5;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * 360;
        this.speed = 0.02 + Math.random() * 0.04;
    }

    update(progress, mouseX, mouseY) {
        // Cursor interaction
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 100;
        let force = (maxDistance - distance) / maxDistance;
        if (force < 0) force = 0;

        let directionX = (forceDirectionX * force * this.density) * 0.6;
        let directionY = (forceDirectionY * force * this.density) * 0.6;

        // Random movement
        this.angle += this.speed;
        let wobbleX = Math.sin(this.angle) * 2;
        let wobbleY = Math.cos(this.angle) * 2;

        // Combine movements
        this.x = this.baseX + wobbleX + directionX + (this.targetX - this.baseX) * progress;
        this.y = this.baseY + wobbleY + directionY + (this.targetY - this.baseY) * progress;
    }

    draw(ctx) {
        ctx.fillStyle = 'turquoise';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size*0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor(canvasId, imageUrl) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.image = new Image();
        this.image.onload = () => {
            console.log('Image loaded successfully');
            this.setupParticles();
        };
        this.image.onerror = (e) => console.error('Error loading image:', e);
        this.image.src = imageUrl;

        console.log('ParticleSystem initialized');

        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0, 0, 100, 100);
        console.log('Drew red rectangle');

        this.isSetup = false;
        this.animate = this.animate.bind(this);

        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas.addEventListener('mousemove', (event) => {
            this.mouseX = event.x;
            this.mouseY = event.y;
        });
    }

    setupParticles() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;

        const scale = Math.min(this.canvas.width / this.image.width, this.canvas.height / this.image.height);
        const x = (this.canvas.width / 2) - (this.image.width / 2) * scale;
        const y = (this.canvas.height / 2) - (this.image.height / 2) * scale;
        tempCtx.drawImage(this.image, x, y, this.image.width * scale, this.image.height * scale);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        for (let y = 0; y < tempCanvas.height; y += 5) {
            for (let x = 0; x < tempCanvas.width; x += 5) {
                const i = (y * tempCanvas.width + x) * 4;
                if (data[i + 3] > 128) {
                    const particle = new Particle(
                        Math.random() * this.canvas.width,
                        Math.random() * this.canvas.height,
                        x,
                        y
                    );
                    this.particles.push(particle);
                }
            }
        }
        console.log('Particles setup complete. Particle count:', this.particles.length);
        this.isSetup = true;
        requestAnimationFrame(this.animate);

        for (let y = 0; y < tempCanvas.height; y += 5) {
            for (let x = 0; x < tempCanvas.width; x += 5) {
                const i = (y * tempCanvas.width + x) * 4;
                if (data[i + 3] > 128) {
                    const particle = new Particle(
                        Math.random() * this.canvas.width,
                        Math.random() * this.canvas.height,
                        x,
                        y
                    );
                    particle.baseX = particle.x;
                    particle.baseY = particle.y;
                    this.particles.push(particle);
                }
            }
        }
    }

    update(progress) {
        if (!this.isSetup) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => {
            particle.update(progress, this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });
    }

   animate() {
        const scrollProgress = Math.max(0, Math.min(1, window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)));
        this.update(scrollProgress);
        requestAnimationFrame(this.animate);
    }
    
}

let ps;

window.onload = () => {
// Initialize and run the particle system
 ps = new ParticleSystem('particle-canvas', 'data:image/png;base64,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');
 
console.log('Window loaded, ParticleSystem initialized');
};
// Initial render
//ps.update(0);