import { useCallback, useEffect, useRef } from "react";

const Visualizer = ({
  features,
  drawFunction,
  drawOptions = {},
  width = 400,
  height = 300,
  className = "",
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const customDrawRef = useRef(null);

  const defaultDraw = useCallback((ctx, features, canvas) => {
    // Base implementation - fallback when no drawFunction provided
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder text
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Base Visualizer", canvas.width / 2, canvas.height / 2);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Use custom draw function if provided, otherwise use default
    const activeDraw = customDrawRef.current || drawFunction || defaultDraw;
    activeDraw(ctx, features, canvas, drawOptions);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawFunction, drawOptions, defaultDraw, features, height, width]);

  // Update custom draw function reference
  useEffect(() => {
    customDrawRef.current = null;
  }, [drawFunction]);

  useEffect(() => {
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        border: "1px solid #ccc",
        backgroundColor: "#000",
      }}
    />
  );
};

export default Visualizer;
