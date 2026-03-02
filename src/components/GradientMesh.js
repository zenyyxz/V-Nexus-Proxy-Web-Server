'use client';

import { useEffect, useRef } from 'react';

export default function GradientMesh() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Blob {
            constructor(index) {
                this.baseX = Math.random() * canvas.width;
                this.baseY = Math.random() * canvas.height;
                this.x = this.baseX;
                this.y = this.baseY;
                this.radius = Math.random() * 200 + 150;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.hue = (index * 60 + 150) % 360; // Green-cyan range
                this.phase = Math.random() * Math.PI * 2;
            }

            update(time) {
                // Smooth floating motion
                this.x = this.baseX + Math.sin(time * 0.001 + this.phase) * 100;
                this.y = this.baseY + Math.cos(time * 0.0008 + this.phase) * 80;

                // Drift
                this.baseX += this.speedX;
                this.baseY += this.speedY;

                // Bounce off edges
                if (this.baseX < -200 || this.baseX > canvas.width + 200) this.speedX *= -1;
                if (this.baseY < -200 || this.baseY > canvas.height + 200) this.speedY *= -1;
            }

            draw(ctx) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );

                gradient.addColorStop(0, `hsla(${this.hue}, 80%, 50%, 0.4)`);
                gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 70%, 45%, 0.2)`);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const blobs = [];
        const blobCount = 5;

        const init = () => {
            blobs.length = 0;
            for (let i = 0; i < blobCount; i++) {
                blobs.push(new Blob(i));
            }
        };

        const animate = () => {
            time += 16;

            // Create smooth fade effect instead of clearing
            ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw blobs
            blobs.forEach(blob => {
                blob.update(time);
                blob.draw(ctx);
            });

            // Add subtle noise/grain effect
            if (Math.random() > 0.95) {
                ctx.fillStyle = `rgba(0, 204, 102, ${Math.random() * 0.02})`;
                ctx.fillRect(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 50,
                    Math.random() * 50
                );
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });

        resizeCanvas();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #0f1419 50%, #0a0f0a 100%)',
            }}
        />
    );
}
