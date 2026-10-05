import { useEffect, useRef, useState } from 'react';
import { emotionEngine } from '../engines/EmotionEngine';

interface Props {
  isSpeaking: boolean;
  isListening: boolean;
}

export default function WireframeFace({ isSpeaking, isListening }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const timeRef = useRef(0);
  const mouthOpenRef = useRef(0);
  const blinkRef = useRef(0);
  const breathRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas ref is null in WireframeFace');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Could not get 2d context in WireframeFace');
      return;
    }

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = dimensions.width;
      const h = dimensions.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const emotion = emotionEngine.getDominantEmotion();
      const allEmotions = emotionEngine.getActiveEmotions();
      const mood = emotionEngine.getMood();
      const color = emotion?.color || '#14b8a6';
      const intensity = emotion?.intensity || 0.3;

      // Breathing animation
      breathRef.current = Math.sin(t * 0.8) * 0.02;
      const breathScale = 1 + breathRef.current;

      // Background subtle radial gradient
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
      gradient.addColorStop(0, `${color}08`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Head wireframe - more complex geometric shape
      const headRadius = Math.min(w, h) * 0.32;
      
      // Outer glow ring
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.1 + intensity * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, headRadius * 1.4 * breathScale, 0, Math.PI * 2);
      ctx.stroke();

      // Main head shape - rounded wireframe
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4 + intensity * 0.4;

      // Draw head as smooth wireframe oval with subtle animation
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const rx = headRadius * breathScale;
        const ry = headRadius * 1.25 * breathScale;
        const wobble = Math.sin(t * 1.5 + angle * 3) * intensity * 2;
        const x = cx + Math.cos(angle) * (rx + wobble);
        const y = cy + Math.sin(angle) * (ry + wobble);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner structure lines (wireframe mesh)
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 0.5;
      // Horizontal lines
      for (let i = -3; i <= 3; i++) {
        const y = cy + i * headRadius * 0.25;
        const xSpan = Math.sqrt(Math.max(0, 1 - Math.pow((y - cy) / (headRadius * 1.25), 2))) * headRadius;
        ctx.beginPath();
        ctx.moveTo(cx - xSpan * breathScale, y);
        ctx.lineTo(cx + xSpan * breathScale, y);
        ctx.stroke();
      }
      // Vertical lines
      for (let i = -2; i <= 2; i++) {
        const x = cx + i * headRadius * 0.3;
        const ySpan = Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / headRadius, 2))) * headRadius * 1.25;
        ctx.beginPath();
        ctx.moveTo(x, cy - ySpan * breathScale);
        ctx.lineTo(x, cy + ySpan * breathScale);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;

      // ===== EYES =====
      const eyeY = cy - headRadius * 0.12;
      const eyeSpacing = headRadius * 0.32;
      const eyeWidth = headRadius * 0.18;
      const eyeHeight = headRadius * 0.1;

      // Blink logic
      blinkRef.current += 0.016;
      const blinkCycle = blinkRef.current > 3.5 + Math.random() * 2;
      if (blinkCycle) blinkRef.current = 0;
      const blinkAmount = blinkRef.current < 0.12 ? Math.sin(blinkRef.current / 0.12 * Math.PI) : 0;

      // Eye tracking based on mood
      let lookX = 0, lookY = 0;
      if (mood === 'curiosity') {
        lookX = Math.sin(t * 0.7) * 4;
        lookY = Math.cos(t * 0.5) * 2;
      } else if (mood === 'fear') {
        lookY = -4;
      } else if (mood === 'sadness') {
        lookY = 3;
      } else if (isListening) {
        lookX = Math.sin(t * 2) * 3;
      }

      // Emotion-based eye shape
      const eyeSquint = mood === 'joy' ? 0.7 : mood === 'anger' ? 0.6 : mood === 'surprise' ? 1.3 : 1;
      const eyeWiden = mood === 'surprise' ? 1.4 : mood === 'fear' ? 1.2 : 1;

      [-1, 1].forEach(side => {
        const ex = cx + side * eyeSpacing + lookX;
        const ey = eyeY + lookY;
        const ew = eyeWidth * eyeSquint;
        const eh = eyeHeight * eyeWiden * eyeSquint * (1 - blinkAmount * 0.95);

        // Eye socket wireframe
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5 + intensity * 0.3;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(ex, ey, ew * 1.4, eh * 1.3, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Upper eyelid line
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(ex, ey - eh * 0.1, ew * 1.3, eh * 0.8, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Iris ring
        if (eh > 1) {
          const irisSize = Math.min(ew, eh) * 0.7;
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ex + lookX * 0.3, ey + lookY * 0.3, irisSize, 0, Math.PI * 2);
          ctx.stroke();

          // Inner iris detail
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(ex + lookX * 0.3, ey + lookY * 0.3, irisSize * 0.6, 0, Math.PI * 2);
          ctx.stroke();

          // Pupil
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.9;
          const pupilSize = irisSize * (mood === 'fear' ? 0.5 : mood === 'surprise' ? 0.45 : 0.35);
          ctx.beginPath();
          ctx.arc(ex + lookX * 0.3, ey + lookY * 0.3, pupilSize, 0, Math.PI * 2);
          ctx.fill();

          // Eye highlight
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex + lookX * 0.3 - pupilSize * 0.5, ey + lookY * 0.3 - pupilSize * 0.5, pupilSize * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eyebrow
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const browY = ey - eyeHeight * 2.2;
        const browLift = mood === 'surprise' ? -8 : mood === 'sadness' ? 4 : mood === 'anger' ? 3 * side : 0;
        const browInner = mood === 'sadness' ? 5 : mood === 'anger' ? -3 : 0;
        ctx.moveTo(ex - ew * 1.3, browY + browLift + side * browInner);
        ctx.quadraticCurveTo(
          ex, 
          browY - 4 + browLift + Math.sin(t * 0.5) * 1,
          ex + ew * 1.3, 
          browY + browLift - side * browInner
        );
        ctx.stroke();
      });

      // ===== NOSE =====
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy + headRadius * 0.02);
      ctx.lineTo(cx - 6, cy + headRadius * 0.2);
      ctx.lineTo(cx - 3, cy + headRadius * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy + headRadius * 0.02);
      ctx.lineTo(cx + 6, cy + headRadius * 0.2);
      ctx.lineTo(cx + 3, cy + headRadius * 0.22);
      ctx.stroke();

      // ===== MOUTH =====
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const mouthY = cy + headRadius * 0.4;
      const mouthWidth = headRadius * 0.25;

      // Speaking animation
      if (isSpeaking) {
        mouthOpenRef.current = 0.4 + Math.sin(t * 14) * 0.25 + Math.sin(t * 9) * 0.15 + Math.sin(t * 22) * 0.1;
      } else {
        mouthOpenRef.current *= 0.92;
      }

      const mouthOpen = mouthOpenRef.current;
      
      // Mouth shape based on emotion
      let mouthCurve = 0;
      if (mood === 'joy') mouthCurve = 8;
      else if (mood === 'sadness') mouthCurve = -6;
      else if (mood === 'surprise') mouthCurve = 0;
      else if (mood === 'anger') mouthCurve = -3;
      else if (mood === 'contentment') mouthCurve = 5;
      else mouthCurve = 2;

      // Upper lip
      ctx.beginPath();
      ctx.moveTo(cx - mouthWidth, mouthY);
      ctx.quadraticCurveTo(cx - mouthWidth * 0.5, mouthY - mouthCurve * 0.5, cx, mouthY - mouthCurve * 0.3 - mouthOpen * 8);
      ctx.quadraticCurveTo(cx + mouthWidth * 0.5, mouthY - mouthCurve * 0.5, cx + mouthWidth, mouthY);
      ctx.stroke();

      // Lower lip / opening
      if (mouthOpen > 0.05) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - mouthWidth * 0.8, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + mouthOpen * 18 + mouthCurve * 0.3, cx + mouthWidth * 0.8, mouthY);
        ctx.stroke();

        // Mouth interior darkness
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + mouthOpen * 4, mouthWidth * 0.4, mouthOpen * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Closed mouth line
        ctx.beginPath();
        ctx.moveTo(cx - mouthWidth, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + mouthCurve * 0.5, cx + mouthWidth, mouthY);
        ctx.stroke();
      }

      // ===== NEURAL ACTIVITY PARTICLES =====
      ctx.globalAlpha = 0.4;
      const particleCount = 30 + Math.floor(intensity * 20);
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + t * 0.3;
        const dist = headRadius * (1.3 + Math.sin(t * 1.5 + i * 0.7) * 0.15);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 1.2;
        const size = 0.5 + Math.sin(t * 2 + i * 0.3) * 0.8;
        
        // Use different colors from active emotions
        const emotionColor = allEmotions[i % Math.max(1, allEmotions.length)]?.color || color;
        ctx.fillStyle = emotionColor;
        ctx.globalAlpha = 0.15 + Math.sin(t * 2.5 + i) * 0.15;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines between nearby particles
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 15; i++) {
        const angle1 = (i / 15) * Math.PI * 2 + t * 0.3;
        const angle2 = ((i + 1) / 15) * Math.PI * 2 + t * 0.3;
        const dist1 = headRadius * (1.3 + Math.sin(t * 1.5 + i * 0.7) * 0.15);
        const dist2 = headRadius * (1.3 + Math.sin(t * 1.5 + (i+1) * 0.7) * 0.15);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle1) * dist1, cy + Math.sin(angle1) * dist1 * 1.2);
        ctx.lineTo(cx + Math.cos(angle2) * dist2, cy + Math.sin(angle2) * dist2 * 1.2);
        ctx.stroke();
      }

      // ===== LISTENING INDICATOR =====
      if (isListening) {
        ctx.globalAlpha = 0.3 + Math.sin(t * 4) * 0.15;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const radius = headRadius * 1.5 + i * 12 + Math.sin(t * 3 + i) * 4;
          const arcSize = 0.2 + Math.sin(t * 2 + i * 0.5) * 0.1;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, -arcSize, arcSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, radius, Math.PI - arcSize, Math.PI + arcSize);
          ctx.stroke();
        }
      }

      // ===== SPEAKING INDICATOR =====
      if (isSpeaking) {
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const y = mouthY + 20 + i * 8;
          const width = mouthWidth * (1 - i * 0.2) * (0.5 + Math.sin(t * 10 + i) * 0.5);
          ctx.beginPath();
          ctx.moveTo(cx - width, y);
          ctx.quadraticCurveTo(cx, y + 3 * Math.sin(t * 8 + i), cx + width, y);
          ctx.stroke();
        }
      }

      // ===== EMOTION LABEL =====
      if (emotion && intensity > 0.15) {
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(emotion.name.toUpperCase(), cx, cy + headRadius * 1.55);
        
        // Intensity bar
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(cx - 40, cy + headRadius * 1.6, 80, 3);
        ctx.globalAlpha = intensity * 0.7;
        ctx.fillStyle = color;
        ctx.fillRect(cx - 40, cy + headRadius * 1.6, 80 * intensity, 3);
      }

      // Corner labels
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('FACE ENGINE v2.0', 8, 15);
      ctx.textAlign = 'right';
      ctx.fillText(`${allEmotions.length} emotions active`, w - 8, 15);

      animFrame.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame.current);
  }, [dimensions, isSpeaking, isListening]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black/50 rounded-xl overflow-hidden border border-teal-900/20">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <span className="text-[9px] text-teal-500/40 font-mono">WIREFRAME RENDER</span>
        <span className="text-[9px] text-teal-500/40 font-mono">60fps</span>
      </div>
    </div>
  );
}
