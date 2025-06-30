import { useCallback, useEffect, useRef, useState } from "react";
import { FaCompress, FaExpand } from "react-icons/fa6";
import styles from "./Visualizer.module.css";

const Visualizer = ({
  features,
  drawFunction,
  drawOptions = {},
  width = 400,
  height = 300,
  className = "",
}) => {
  const canvasRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use fullscreen dimensions if in fullscreen mode
    const canvasWidth = isFullscreen ? window.innerWidth : width;
    const canvasHeight = isFullscreen ? window.innerHeight : height;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    drawFunction(ctx, features, canvas, drawOptions);
  }, [drawFunction, drawOptions, features, height, width, isFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    animate();
  }, [animate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className={isFullscreen ? styles.containerFullscreen : styles.container}
    >
      <canvas
        ref={canvasRef}
        className={`${isFullscreen ? styles.canvasFullscreen : styles.canvas} ${className}`}
      />
      <button onClick={toggleFullscreen} className={styles.fullscreenButton}>
        {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
      </button>
    </div>
  );
};

export default Visualizer;
