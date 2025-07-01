import chroma from "chroma-js";
import _ from "lodash";
import { BaseVisualizer } from "./BaseVisualizer";

const LOW_COLOR = "#FF5381";
const HIGH_COLOR = "#FF084A";
const COLOR_SCALE = chroma.scale([LOW_COLOR, HIGH_COLOR]).mode("hsl");
const VOLUME_WINDOW_SECONDS = 10;
const MAX_FREQUENCY_BARS = 150;

export class FrequencyVisualizer extends BaseVisualizer {
  constructor(options) {
    super(options);
    this.volumeHistory = [];
    this.barAmplitudeHistory = [];
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

    const { volume, frequencyData } = features;

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
    const musicalRangeEnd = Math.floor(frequencyData.length * 1);
    const musicalFreqData = frequencyData.slice(0, musicalRangeEnd);

    // Calculate dimensions for symmetrical quadrants
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const quadrantWidth = centerX;
    const quadrantHeight = centerY;

    // Calculate bar dimensions with configurable maximum for quadrant
    const minBarWidth = 2;
    const quadrantMaxBars = Math.floor(quadrantWidth / minBarWidth);
    const barCount = Math.min(
      musicalFreqData.length,
      quadrantMaxBars,
      MAX_FREQUENCY_BARS
    );
    const barWidth = quadrantWidth / barCount;
    const maxBarHeight = quadrantHeight * 0.9;

    // Convert frequency data using Mel scale for perceptually uniform distribution
    const melScaledData = this.convertToMelScale(
      musicalFreqData,
      sampleRate,
      barCount
    );

    // Update bar amplitude history and calculate per-bar colors
    this.updateBarAmplitudeHistory(melScaledData, volumeHistoryMaxLength);
    const barColors = this.calculateBarColors(melScaledData);

    // Calculate smoothed amplitudes for less jerky visualization
    const smoothedAmplitudes = this.calculateSmoothedAmplitudes(melScaledData);

    // Draw bars in all four quadrants
    this.drawQuadrantBars(ctx, smoothedAmplitudes, barColors, backgroundColor, {
      centerX,
      centerY,
      quadrantHeight,
      barCount,
      barWidth,
      maxBarHeight,
      canvasWidth,
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

  drawQuadrantBars(ctx, resampledData, barColors, backgroundColor, params) {
    const { centerX, centerY, barCount, barWidth, maxBarHeight } = params;

    for (let i = 0; i < barCount; i++) {
      const amplitude = resampledData[i] / 255; // Normalize to 0-1
      const barHeight = Math.max(0, amplitude * maxBarHeight);
      const color = barColors[i];

      // Calculate positions for top-right quadrant
      const baseX = centerX + i * barWidth;
      const baseY = centerY - barHeight;

      // Create gradients for top and bottom bars
      const darkColor = chroma(color).darken(3).hex();
      const topGradient = ctx.createLinearGradient(
        0,
        baseY,
        0,
        baseY + barHeight
      );
      topGradient.addColorStop(0, color);
      topGradient.addColorStop(1, darkColor);

      const bottomY = centerY;
      const bottomGradient = ctx.createLinearGradient(
        0,
        bottomY,
        0,
        bottomY + barHeight
      );
      bottomGradient.addColorStop(0, darkColor);
      bottomGradient.addColorStop(1, color);

      const leftX = centerX - i * barWidth - barWidth;

      // Top-right quadrant (original)
      ctx.fillStyle = topGradient;
      ctx.fillRect(baseX, baseY, barWidth, barHeight);

      // Top-left quadrant (reflect about Y-axis)
      ctx.fillRect(leftX, baseY, barWidth, barHeight);

      // Bottom-right quadrant (reflect about X-axis)
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(baseX, bottomY, barWidth, barHeight);

      // Bottom-left quadrant (reflect about both axes)
      ctx.fillRect(leftX, bottomY, barWidth, barHeight);

      // Draw subtle bar outlines only if bars are wide enough
      if (barWidth > 3) {
        ctx.strokeStyle = backgroundColor;

        // Outline all four quadrants
        ctx.strokeRect(baseX, baseY, barWidth, barHeight);
        ctx.strokeRect(leftX, baseY, barWidth, barHeight);
        ctx.strokeRect(baseX, bottomY, barWidth, barHeight);
        ctx.strokeRect(leftX, bottomY, barWidth, barHeight);
      }
    }
  }

  frequencyToMel(frequency) {
    return 2595 * Math.log10(1 + frequency / 700);
  }

  melToFrequency(mel) {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  convertToMelScale(frequencyData, sampleRate, targetLength) {
    const nyquistFreq = sampleRate / 2;
    const freqPerBin = nyquistFreq / frequencyData.length;

    // Calculate mel scale range
    const minFreq = 20; // Hz
    const maxFreq = Math.min(nyquistFreq, 20000); // Hz, capped at 20kHz
    const minMel = this.frequencyToMel(minFreq);
    const maxMel = this.frequencyToMel(maxFreq);

    // Create mel-spaced frequency bins
    const melScaledData = [];
    const melStep = (maxMel - minMel) / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const currentMel = minMel + i * melStep;
      const nextMel = minMel + (i + 1) * melStep;

      const currentFreq = this.melToFrequency(currentMel);
      const nextFreq = this.melToFrequency(nextMel);

      // Find corresponding bins in original frequency data
      const startBin = Math.floor(currentFreq / freqPerBin);
      const endBin = Math.ceil(nextFreq / freqPerBin);

      // Average the amplitudes in this mel bin
      let sum = 0;
      let count = 0;

      for (let j = startBin; j < endBin && j < frequencyData.length; j++) {
        sum += frequencyData[j];
        count++;
      }

      melScaledData[i] = count > 0 ? sum / count : 0;
    }

    return melScaledData;
  }

  updateBarAmplitudeHistory(melScaledData, maxHistoryLength) {
    // Initialize history array if needed
    if (this.barAmplitudeHistory.length === 0) {
      this.barAmplitudeHistory = new Array(melScaledData.length)
        .fill(null)
        .map(() => []);
    }

    // Update each bar's amplitude history
    for (let i = 0; i < melScaledData.length; i++) {
      const barHistory = this.barAmplitudeHistory[i];

      // Remove old entries if at max length
      if (barHistory.length >= maxHistoryLength) {
        barHistory.shift();
      }

      // Add current amplitude
      barHistory.push(melScaledData[i]);
    }
  }

  calculateBarColors(melScaledData) {
    const colors = [];

    for (let i = 0; i < melScaledData.length; i++) {
      const currentAmplitude = melScaledData[i];
      const barHistory = this.barAmplitudeHistory[i] || [];

      // Calculate average amplitude for this bar
      const avgAmplitude = barHistory.length > 0 ? _.mean(barHistory) : 0;

      // Calculate color percentage based on current vs average amplitude
      let colorPercent =
        avgAmplitude > 0 ? currentAmplitude / avgAmplitude - 1 : 0;
      colorPercent = Math.max(0, colorPercent);
      colorPercent = Math.min(1, colorPercent);

      // Generate color for this bar
      const color = COLOR_SCALE(colorPercent).hex();
      colors.push(color);
    }

    return colors;
  }

  calculateSmoothedAmplitudes(currentAmplitudes) {
    const smoothedAmplitudes = [];

    for (let i = 0; i < currentAmplitudes.length; i++) {
      const currentAmplitude = currentAmplitudes[i];
      const barHistory = this.barAmplitudeHistory[i] || [];

      // Get previous amplitude (second to last in history)
      const previousAmplitude =
        barHistory.length >= 2
          ? barHistory[barHistory.length - 2]
          : currentAmplitude;

      // Average current and previous amplitude for smoothing
      const smoothedAmplitude = (currentAmplitude + previousAmplitude) / 2;
      smoothedAmplitudes.push(smoothedAmplitude);
    }

    return smoothedAmplitudes;
  }
}
