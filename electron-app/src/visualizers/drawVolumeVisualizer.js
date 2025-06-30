export const drawVolumeVisualizer = (ctx, features, canvas, options = {}) => {
  const { color = "#00ff88", backgroundColor = "#000" } = options;

  // Canvas dimensions for responsive calculations
  const { width: canvasWidth, height: canvasHeight } = canvas;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!features) {
    // Draw placeholder when no audio - responsive sizing
    const placeholderWidth = Math.min(canvasWidth * 0.25, 100);
    const placeholderHeight = Math.max(canvasHeight * 0.05, 20);
    
    ctx.fillStyle = "#333";
    ctx.fillRect(
      canvasWidth / 2 - placeholderWidth / 2, 
      canvasHeight - placeholderHeight - canvasHeight * 0.05, 
      placeholderWidth, 
      placeholderHeight
    );

    ctx.fillStyle = "#666";
    ctx.font = `${Math.max(canvasHeight * 0.04, 12)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("No Audio", canvasWidth / 2, canvasHeight / 2);
    return;
  }

  const volume = features.volume ? Math.sqrt(features.volume) : 0;

  // Calculate rectangle dimensions - fully responsive
  const rectWidth = canvasWidth * 0.6; // 60% of canvas width
  const maxRectHeight = canvasHeight * 0.7; // 70% of canvas height for volume bar
  const rectHeight = Math.max(canvasHeight * 0.02, volume * maxRectHeight); // Min 2% height
  const bottomMargin = canvasHeight * 0.1; // 10% margin from bottom

  // Center the rectangle horizontally
  const rectX = (canvasWidth - rectWidth) / 2;
  const rectY = canvasHeight - rectHeight - bottomMargin;

  // Draw the volume rectangle with gradient
  const gradient = ctx.createLinearGradient(0, rectY, 0, rectY + rectHeight);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color + "80"); // Add transparency

  ctx.fillStyle = gradient;
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

  // Draw border - responsive line width
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(canvasWidth * 0.005, 1); // 0.5% of width, min 1px
  ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

  // Draw volume text - responsive font size and positioning
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(canvasHeight * 0.05, 14)}px Arial`;
  ctx.textAlign = "center";
  const volumePercent = Math.round(volume * 100);
  ctx.fillText(`${volumePercent}%`, canvasWidth / 2, canvasHeight - canvasHeight * 0.02);

  // Draw history if available - fully responsive
  if (features.history && features.history.length > 1) {
    const historyWidth = rectWidth * 0.8;
    const historyHeight = canvasHeight * 0.15; // 15% of canvas height
    const historyX = (canvasWidth - historyWidth) / 2;
    const historyY = canvasHeight * 0.05; // 5% from top

    ctx.strokeStyle = "#444";
    ctx.lineWidth = Math.max(canvasWidth * 0.002, 1); // Responsive border
    ctx.strokeRect(historyX, historyY, historyWidth, historyHeight);

    // Draw volume history as a line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(canvasWidth * 0.005, 2); // Responsive line width

    features.history.forEach((feature, index) => {
      const x =
        historyX + (index / (features.history.length - 1)) * historyWidth;
      const y = historyY + historyHeight - feature.volume * historyHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Label - responsive font and positioning
    ctx.fillStyle = "#888";
    ctx.font = `${Math.max(canvasHeight * 0.03, 10)}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText("Volume History", historyX, historyY - canvasHeight * 0.01);
  }
};
