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

    // Calculate bar dimensions with configurable maximum
    const minBarWidth = 2;
    const canvasMaxBars = Math.floor(canvasWidth / minBarWidth);
    const barCount = Math.min(musicalFreqData.length, canvasMaxBars, MAX_FREQUENCY_BARS);
    const barWidth = canvasWidth / barCount;
    const maxBarHeight = canvasHeight * 0.9;
    const bottomMargin = canvasHeight * 0.05;

    // Resample frequency data to match bar count using averaging
    const resampledData = this.resampleFrequencyData(musicalFreqData, barCount);

    for (let i = 0; i < barCount; i++) {
      const amplitude = resampledData[i] / 255; // Normalize to 0-1
      const barHeight = Math.max(
        canvasHeight * 0.005,
        amplitude * maxBarHeight
      );

      const x = i * barWidth;
      const y = canvasHeight - barHeight - bottomMargin;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "44");

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw subtle bar outline only if bars are wide enough
      if (barWidth > 3) {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(canvasWidth * 0.0005, 0.5);
        ctx.strokeRect(x, y, barWidth, barHeight);
      }
    }
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
}
