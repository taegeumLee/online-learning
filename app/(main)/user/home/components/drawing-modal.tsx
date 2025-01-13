"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colors = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#9400D3", // Violet
  "#FF1493", // Pink
  "#000000", // Black
  "#FFFFFF", // White
];

export function DrawingModal({ isOpen, onClose }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(colors[0]);
  const [lineWidth, setLineWidth] = useState(1);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const context = canvas.getContext("2d", { alpha: true });
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        setCtx(context);
      }
    }
  }, [isOpen]);

  const getMousePos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctx) return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    setLastX(pos.x);
    setLastY(pos.y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !ctx) return;
    const pos = getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    setLastX(pos.x);
    setLastY(pos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30"
    >
      <div className="absolute top-4 right-4 flex gap-4 items-center bg-white rounded-lg p-4 shadow-lg">
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full ${
                color === c ? "ring-2 ring-blue-500" : ""
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <select
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          onClick={clearCanvas}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ✕
        </button>
      </div>
      <div className="w-full h-full">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </motion.div>
  );
}
