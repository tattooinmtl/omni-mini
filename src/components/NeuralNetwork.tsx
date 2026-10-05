import { useEffect, useRef, useState } from 'react';
import { neuralEngine } from '../engines/NeuralEngine';
import { NODE_COLORS, NodeType } from '../types';

export default function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{x: number; y: number; vx: number; vy: number; life: number; color: string}>>([]);

  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = dimensions.width;
      const h = dimensions.height;

      ctx.clearRect(0, 0, w, h);

      // Background with subtle hex grid
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.03)';
      ctx.lineWidth = 0.5;
      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const nodes = neuralEngine.getNodes();
      const paths = neuralEngine.getPaths();

      // Draw ambient connections (always visible, dim)
      nodes.forEach(node => {
        node.connections.forEach(targetId => {
          const target = nodes.find(n => n.id === targetId);
          if (!target) return;

          const x1 = node.x * w;
          const y1 = node.y * h;
          const x2 = target.x * w;
          const y2 = target.y * h;

          const activity = Math.max(node.activity, target.activity);
          const color = NODE_COLORS[node.type];
          
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.04 + activity * 0.2;
          ctx.lineWidth = 0.5 + activity * 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          
          // Organic curved connections
          const cp1x = x1 + (x2 - x1) * 0.3 + Math.sin(t * 0.5 + node.x * 5) * 15 * activity;
          const cp1y = y1 + (y2 - y1) * 0.3 + Math.cos(t * 0.7 + node.y * 5) * 15 * activity;
          const cp2x = x1 + (x2 - x1) * 0.7 + Math.sin(t * 0.3 + target.x * 5) * 15 * activity;
          const cp2y = y1 + (y2 - y1) * 0.7 + Math.cos(t * 0.4 + target.y * 5) * 15 * activity;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
          ctx.stroke();

          // Data flow dots along connection when active
          if (activity > 0.3) {
            const numDots = 3;
            for (let i = 0; i < numDots; i++) {
              const progress = ((t * 0.5 + i / numDots) % 1);
              const dotX = x1 + (x2 - x1) * progress;
              const dotY = y1 + (y2 - y1) * progress;
              ctx.fillStyle = color;
              ctx.globalAlpha = activity * 0.3 * (1 - Math.abs(progress - 0.5) * 2);
              ctx.beginPath();
              ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      });

      // Draw active paths with bright animation
      paths.forEach(path => {
        const fromNode = nodes.find(n => n.id === path.from);
        const toNode = nodes.find(n => n.id === path.to);
        if (!fromNode || !toNode) return;

        const x1 = fromNode.x * w;
        const y1 = fromNode.y * h;
        const x2 = toNode.x * w;
        const y2 = toNode.y * h;

        const color = NODE_COLORS[path.type];
        
        // Bright path line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Glow effect
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Animated particle along path
        const particlePos = path.progress;
        const px = x1 + (x2 - x1) * particlePos;
        const py = y1 + (y2 - y1) * particlePos;

        // Main particle
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();

        // Trail particles
        for (let i = 1; i <= 8; i++) {
          const trailPos = Math.max(0, particlePos - i * 0.04);
          const tx = x1 + (x2 - x1) * trailPos;
          const ty = y1 + (y2 - y1) * trailPos;
          ctx.globalAlpha = (0.4 - i * 0.04);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(tx, ty, 4 - i * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spawn ambient particles at destination
        if (path.progress > 0.9 && Math.random() > 0.7) {
          particlesRef.current.push({
            x: x2,
            y: y2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            color,
          });
        }
      });

      // Update and draw ambient particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        if (p.life <= 0) return false;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.globalAlpha = 1;

      // Draw nodes
      nodes.forEach(node => {
        const x = node.x * w;
        const y = node.y * h;
        const color = NODE_COLORS[node.type];
        const baseSize = 5;
        const size = baseSize + node.activity * 10;

        // Node outer glow
        if (node.activity > 0.05) {
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          glowGradient.addColorStop(0, `${color}${Math.floor(node.activity * 40).toString(16).padStart(2, '0')}`);
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node body shape based on type
        ctx.globalAlpha = 0.3 + node.activity * 0.7;
        ctx.fillStyle = color;
        ctx.beginPath();
        
        if (node.type === 'brain') {
          // Diamond
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size * 0.8, y);
          ctx.lineTo(x, y + size);
          ctx.lineTo(x - size * 0.8, y);
          ctx.closePath();
        } else if (node.type === 'emotion') {
          // Circle with inner ring
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.2;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        } else if (node.type === 'memory') {
          // Rounded square
          const s = size * 0.8;
          ctx.moveTo(x - s, y - s + 2);
          ctx.arcTo(x + s, y - s, x + s, y + s, 3);
          ctx.arcTo(x + s, y + s, x - s, y + s, 3);
          ctx.arcTo(x - s, y + s, x - s, y - s, 3);
          ctx.arcTo(x - s, y - s, x + s, y - s, 3);
        } else if (node.type === 'session') {
          // Triangle
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size, y + size * 0.7);
          ctx.lineTo(x - size, y + size * 0.7);
          ctx.closePath();
        } else {
          // Hexagon
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        }
        ctx.fill();

        // Node border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 + node.activity;
        ctx.globalAlpha = 0.5 + node.activity * 0.5;
        ctx.stroke();

        // Pulsing ring when highly active
        if (node.activity > 0.5) {
          ctx.globalAlpha = (1 - node.activity) * 0.5;
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.5;
          const pulseSize = size + (1 - node.activity) * 15;
          ctx.beginPath();
          ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Label
        ctx.globalAlpha = 0.4 + node.activity * 0.6;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `${node.activity > 0.3 ? 'bold ' : ''}9px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + size + 14);
      });

      // ===== LEGEND =====
      ctx.globalAlpha = 0.7;
      ctx.font = '9px monospace';
      const legendItems: [NodeType, string, string][] = [
        ['session', 'SessionID', '#f97316'],
        ['conversation', 'Conversation', '#14b8a6'],
        ['skill', 'Skills', '#22c55e'],
        ['tool', 'Tools', '#eab308'],
        ['hook', 'Hooks', '#3b82f6'],
        ['emotion', 'Emotions', '#ef4444'],
        ['memory', 'Memory', '#ec4899'],
        ['brain', 'Brain Core', '#a855f7'],
      ];
      
      const legendX = 8;
      const legendStartY = h - 120;
      
      // Legend background
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(legendX - 4, legendStartY - 14, 100, legendItems.length * 14 + 18);
      
      legendItems.forEach(([type, label, color], i) => {
        const ly = legendStartY + i * 14;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(legendX, ly - 3, 6, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.globalAlpha = 0.6;
        ctx.textAlign = 'left';
        ctx.fillText(label, legendX + 12, ly + 3);
      });

      // Title
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#14b8a6';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('NEURAL ENGINE v1.0', 10, 18);
      
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      const activePaths = paths.filter(p => p.active).length;
      ctx.fillText(`Nodes: ${nodes.length} | Paths: ${activePaths} active`, 10, 32);

      // Activity meter
      const totalActivity = nodes.reduce((sum, n) => sum + n.activity, 0) / nodes.length;
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(w - 80, 10, 70, 4);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = totalActivity > 0.5 ? '#22c55e' : totalActivity > 0.2 ? '#eab308' : '#64748b';
      ctx.fillRect(w - 80, 10, 70 * Math.min(1, totalActivity * 3), 4);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('NETWORK LOAD', w - 10, 24);

      animFrame.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full bg-black/50 rounded-xl overflow-hidden border border-teal-900/20">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
    </div>
  );
}
