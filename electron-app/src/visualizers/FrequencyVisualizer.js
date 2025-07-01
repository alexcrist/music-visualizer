import chroma from "chroma-js";
import _ from "lodash";
import { BaseVisualizer } from "./BaseVisualizer";

const LOW_COLOR = "#5630FF";
const HIGH_COLOR = "#59C9FF";
const COLOR_SCALE = chroma.scale([LOW_COLOR, HIGH_COLOR]);
const VOLUME_WINDOW_SECONDS = 10;
const MAX_FREQUENCY_BARS = 100;

export class FrequencyVisualizer extends BaseVisualizer {
  constructor(options) {
    super(options);
    this.volumeHistory = [];
  }

  draw(ctx, features, canvas, sampleRate, bufferLength) {
    const { backgroundColor = "#000" } = this.options;

    // Canvas dimensions for responsive calculations
    const { width: canvasWidth, height: canvasHeight } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (!features || !features.frequencyData || !sampleRate || !bufferLength) {
      // Draw placeholder when no audio
      ctx.fillStyle = "#666";
      ctx.font = `${Math.max(canvasHeight * 0.06, 14)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("No Audio Data", canvasWidth / 2, canvasHeight / 2);
      return;
    }

    // Calculate color based on volume compared to average volume
    const { volume, frequencyData } = features;
    const avgVolume = _.mean(this.volumeHistory) ?? 0;
    let colorPercent = volume / avgVolume - 1;
    colorPercent = Math.max(0, colorPercent);
    colorPercent = Math.min(1, colorPercent);
    const color = COLOR_SCALE(colorPercent).hex();

    // Update volume history
    const bufferLengthSeconds = bufferLength / sampleRate;
    const volumeHistoryMaxLength = parseInt(
      VOLUME_WINDOW_SECONDS / bufferLengthSeconds
    );
    if (this.volumeHistory === volumeHistoryMaxLength) {
      this.volumeHistory.shift();
    }
    this.volumeHistory.push(volume);

    // Focus on musical frequency range (roughly 20Hz - 20kHz)
    const musicalRangeEnd = Math.floor(frequencyData.length * 0.6);
    const musicalFreqData = frequencyData.slice(0, musicalRangeEnd);

    // Calculate dimensions for symmetrical quadrants
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const quadrantWidth = centerX;
    const quadrantHeight = centerY;

    // Calculate bar dimensions with configurable maximum for quadrant
    const minBarWidth = 2;
    const quadrantMaxBars = Math.floor(quadrantWidth / minBarWidth);
    const barCount = Math.min(musicalFreqData.length, quadrantMaxBars, MAX_FREQUENCY_BARS);
    const barWidth = quadrantWidth / barCount;
    const maxBarHeight = quadrantHeight * 0.9;
    const bottomMargin = quadrantHeight * 0.05;

    // Resample frequency data to match bar count using averaging
    const resampledData = this.resampleFrequencyData(musicalFreqData, barCount);

    // Draw bars in all four quadrants
    this.drawQuadrantBars(ctx, resampledData, color, {
      centerX,
      centerY,
      quadrantWidth,
      quadrantHeight,
      barCount,
      barWidth,
      maxBarHeight,
      bottomMargin,
      canvasWidth
    });
  }

  resampleFrequencyData(frequencyData, targetLength) {
    if (frequencyData.length <= targetLength) {
      return frequencyData;
    }

    const resampled = [];
    const binSize = frequencyData.length / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const startIndex = Math.floor(i * binSize);
      const endIndex = Math.floor((i + 1) * binSize);
      
      let sum = 0;
      let count = 0;

      for (let j = startIndex; j < endIndex && j < frequencyData.length; j++) {
        sum += frequencyData[j];
        count++;
      }

      resampled[i] = count > 0 ? sum / count : 0;
    }

    return resampled;
  }

  drawQuadrantBars(ctx, resampledData, color, params) {
    const {
      centerX,
      centerY,
      quadrantWidth,
      quadrantHeight,
      barCount,
      barWidth,
      maxBarHeight,
      bottomMargin,
      canvasWidth
    } = params;

    for (let i = 0; i < barCount; i++) {
      const amplitude = resampledData[i] / 255; // Normalize to 0-1
      const barHeight = Math.max(
        quadrantHeight * 0.005,
        amplitude * maxBarHeight
      );

      // Calculate positions for top-right quadrant
      const baseX = centerX + (i * barWidth);
      const baseY = centerY - barHeight - bottomMargin;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, baseY, 0, baseY + barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "44");

      ctx.fillStyle = gradient;

      // Top-right quadrant (original)
      ctx.fillRect(baseX, baseY, barWidth, barHeight);

      // Top-left quadrant (reflect about Y-axis)
      const leftX = centerX - (i * barWidth) - barWidth;
      ctx.fillRect(leftX, baseY, barWidth, barHeight);

      // Bottom-right quadrant (reflect about X-axis)
      const bottomY = centerY + bottomMargin;
      ctx.fillRect(baseX, bottomY, barWidth, barHeight);

      // Bottom-left quadrant (reflect about both axes)
      ctx.fillRect(leftX, bottomY, barWidth, barHeight);

      // Draw subtle bar outlines only if bars are wide enough
      if (barWidth > 3) {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(canvasWidth * 0.0005, 0.5);
        
        // Outline all four quadrants
        ctx.strokeRect(baseX, baseY, barWidth, barHeight);
        ctx.strokeRect(leftX, baseY, barWidth, barHeight);
        ctx.strokeRect(baseX, bottomY, barWidth, barHeight);
        ctx.strokeRect(leftX, bottomY, barWidth, barHeight);
      }
    }
  }
}
