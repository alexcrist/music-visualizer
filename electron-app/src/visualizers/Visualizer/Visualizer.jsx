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

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    drawFunction(ctx, features, canvas, drawOptions);
  }, [drawFunction, drawOptions, features, height, width]);

  useEffect(() => {
    animate();
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
