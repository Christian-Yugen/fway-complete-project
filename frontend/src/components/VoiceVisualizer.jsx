import React, { useRef, useEffect } from 'react';

const VoiceVisualizer = ({ 
  isListening = false, 
  volume = 0, 
  frequencyData = null,
  size = 100,
  color = '#3b82f6'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isListening) {
        // Desenhar círculo base
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Desenhar ondas baseadas no volume
        const waveRadius = 30 + (volume * 40);
        const opacity = Math.max(0.1, volume);

        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius + (i * 15), 0, 2 * Math.PI);
          ctx.strokeStyle = `${color}${Math.floor(opacity * 255 / i).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2 - (i * 0.3);
          ctx.stroke();
        }

        // Desenhar barras de frequência se disponível
        if (frequencyData && frequencyData.length > 0) {
          const barCount = 8;
          const angleStep = (2 * Math.PI) / barCount;
          
          for (let i = 0; i < barCount; i++) {
            const angle = i * angleStep;
            const dataIndex = Math.floor((i / barCount) * frequencyData.length);
            const barHeight = (frequencyData[dataIndex] / 255) * 20;
            
            const startX = centerX + Math.cos(angle) * 35;
            const startY = centerY + Math.sin(angle) * 35;
            const endX = centerX + Math.cos(angle) * (35 + barHeight);
            const endY = centerY + Math.sin(angle) * (35 + barHeight);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        }

        // Desenhar ponto central pulsante
        const pulseRadius = 8 + (volume * 5);
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        // Estado inativo - apenas círculo estático
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}60`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, volume, frequencyData, color]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
};

export default VoiceVisualizer;

