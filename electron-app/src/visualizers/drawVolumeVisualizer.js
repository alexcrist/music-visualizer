export const drawVolumeVisualizer = (ctx, features, canvas, options = {}) => {
  const { color = "#00ff88", backgroundColor = "#000" } = options;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!features) {
    // Draw placeholder when no audio
    ctx.fillStyle = "#333";
    ctx.fillRect(canvas.width / 2 - 50, canvas.height - 20, 100, 20);

    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No Audio", canvas.width / 2, canvas.height / 2);
    return;
  }

  const volume = features.volume || 0;

  // Calculate rectangle dimensions
  const rectWidth = Math.min(canvas.width * 0.8, 200);
  const maxRectHeight = canvas.height * 0.8;
  const rectHeight = Math.max(5, volume * maxRectHeight);

  // Center the rectangle horizontally
  const rectX = (canvas.width - rectWidth) / 2;
  const rectY = canvas.height - rectHeight - 20; // 20px from bottom

  // Draw the volume rectangle with gradient
  const gradient = ctx.createLinearGradient(0, rectY, 0, rectY + rectHeight);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color + "80"); // Add transparency

  ctx.fillStyle = gradient;
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

  // Draw border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

  // Draw volume text
  ctx.fillStyle = "#fff";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  const volumePercent = Math.round(volume * 100);
  ctx.fillText(`${volumePercent}%`, canvas.width / 2, canvas.height - 5);

  // Draw history if available
  if (features.history && features.history.length > 1) {
    const historyWidth = rectWidth * 0.8;
    const historyHeight = 40;
    const historyX = (canvas.width - historyWidth) / 2;
    const historyY = 20;

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(historyX, historyY, historyWidth, historyHeight);

    // Draw volume history as a line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

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

    // Label
    ctx.fillStyle = "#888";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Volume History", historyX, historyY - 5);
  }
};
