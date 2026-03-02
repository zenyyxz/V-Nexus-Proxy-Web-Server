'use client';

import { useEffect, useRef } from 'react';

export default function NeuralNetwork() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let nodes = [];
        let mouse = { x: null, y: null, radius: 150 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Node {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 3 + 2;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse repulsion
                if (mouse.x != null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= Math.cos(angle) * force * 3;
                        this.y -= Math.sin(angle) * force * 3;
                    }
                }

                this.pulsePhase += this.pulseSpeed;
            }

            draw() {
                const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
                const alpha = 0.3 + pulse * 0.4;

                // Glow effect
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
                gradient.addColorStop(0, `rgba(0, 204, 102, ${alpha * 0.8})`);
                gradient.addColorStop(1, 'rgba(0, 204, 102, 0)');
                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core node
                ctx.beginPath();
                ctx.fillStyle = `rgba(0, 204, 102, ${alpha})`;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            nodes = [];
            const nodeCount = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < nodeCount; i++) {
                nodes.push(new Node());
            }
        };

        const drawConnections = () => {
            nodes.forEach((nodeA, i) => {
                nodes.slice(i + 1).forEach(nodeB => {
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 200) {
                        const opacity = (1 - distance / 200) * 0.3;

                        // Animated pulse along connection
                        const pulse = (Math.sin(Date.now() * 0.001 + distance * 0.01) + 1) / 2;
                        const lineWidth = 1 + pulse * 0.5;

                        ctx.strokeStyle = `rgba(0, 204, 102, ${opacity})`;
                        ctx.lineWidth = lineWidth;
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        ctx.stroke();

                        // Data packet animation
                        if (Math.random() > 0.99) {
                            const t = Math.random();
                            const px = nodeA.x + (nodeB.x - nodeA.x) * t;
                            const py = nodeA.y + (nodeB.y - nodeA.y) * t;

                            ctx.beginPath();
                            ctx.fillStyle = `rgba(0, 255, 128, ${opacity * 2})`;
                            ctx.arc(px, py, 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                });
            });
        };

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawConnections();

            nodes.forEach(node => {
                node.update();
                node.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        resizeCanvas();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
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
            }}
        />
    );
}
