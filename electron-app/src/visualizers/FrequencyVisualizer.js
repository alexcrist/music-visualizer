import { BaseVisualizer } from "./BaseVisualizer";

export class FrequencyVisualizer extends BaseVisualizer {
  constructor(options) {
    super(options);
    this.volumeHistory = [];
  }

  draw(ctx, features, canvas) {
    const { baseColor = "#7658FF", backgroundColor = "#000" } = this.options;

    // Canvas dimensions for responsive calculations
    const { width: canvasWidth, height: canvasHeight } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (!features || !features.frequencyData) {
      // Draw placeholder when no audio
      ctx.fillStyle = "#666";
      ctx.font = `${Math.max(canvasHeight * 0.06, 14)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("No Audio Data", canvasWidth / 2, canvasHeight / 2);
      return;
    }

    const frequencyData = features.frequencyData;

    // Focus on musical frequency range (roughly 20Hz - 20kHz)
    const musicalRangeEnd = Math.floor(frequencyData.length * 0.6);
    const musicalFreqData = frequencyData.slice(0, musicalRangeEnd);

    // Calculate bar dimensions to perfectly fill canvas width
    const minBarWidth = 2;
    const maxBars = Math.floor(canvasWidth / minBarWidth);
    const barCount = Math.min(musicalFreqData.length, maxBars);
    const barWidth = canvasWidth / barCount;
    const maxBarHeight = canvasHeight * 0.9;
    const bottomMargin = canvasHeight * 0.05;

    // Sample musical frequency data
    const step = Math.floor(musicalFreqData.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * step;
      const amplitude = musicalFreqData[dataIndex] / 255; // Normalize to 0-1
      const barHeight = Math.max(
        canvasHeight * 0.005,
        amplitude * maxBarHeight
      );

      const x = i * barWidth;
      const y = canvasHeight - barHeight - bottomMargin;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, baseColor + "44");

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw subtle bar outline only if bars are wide enough
      if (barWidth > 3) {
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = Math.max(canvasWidth * 0.0005, 0.5);
        ctx.strokeRect(x, y, barWidth, barHeight);
      }
    }
  }
}
