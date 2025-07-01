import * as THREE from "three";
import chroma from "chroma-js";
import _ from "lodash";
import { BaseVisualizer } from "./BaseVisualizer";

const LOW_COLOR = "#FF5381";
const HIGH_COLOR = "#FF084A";
const COLOR_SCALE = chroma.scale([LOW_COLOR, HIGH_COLOR]).mode("hsl");
const VOLUME_WINDOW_SECONDS = 10;
const MAX_FREQUENCY_BARS = 100;

export class ThreeJSFrequencyVisualizer extends BaseVisualizer {
  constructor(options) {
    super(options);
    this.volumeHistory = [];
    this.barAmplitudeHistory = [];
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bars = [];
    this.mirroredBars = [];
    this.initialized = false;
  }

  init(canvas) {
    // Set up THREE.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Set up camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 20, 50);
    this.camera.lookAt(0, 0, 0);

    // Create a new canvas element for THREE.js since the existing one has a 2D context
    this.threeCanvas = document.createElement('canvas');
    this.threeCanvas.width = canvas.width;
    this.threeCanvas.height = canvas.height;
    this.threeCanvas.style.position = 'absolute';
    this.threeCanvas.style.top = '0';
    this.threeCanvas.style.left = '0';
    this.threeCanvas.style.pointerEvents = 'none';
    
    // Insert the THREE.js canvas into the same container
    canvas.parentNode.style.position = 'relative';
    canvas.parentNode.appendChild(this.threeCanvas);

    // Set up renderer with the new canvas
    this.renderer = new THREE.WebGLRenderer({ canvas: this.threeCanvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    // Add point light that moves with the music
    this.dynamicLight = new THREE.PointLight(0xff6b6b, 1, 100);
    this.dynamicLight.position.set(0, 20, 0);
    this.scene.add(this.dynamicLight);

    this.initialized = true;
  }

  draw(ctx, features, canvas, sampleRate, bufferLength) {
    if (!this.initialized) {
      this.init(canvas);
    }

    // Update canvas size if it changed
    if (this.threeCanvas && (this.threeCanvas.width !== canvas.width || this.threeCanvas.height !== canvas.height)) {
      this.threeCanvas.width = canvas.width;
      this.threeCanvas.height = canvas.height;
      this.renderer.setSize(canvas.width, canvas.height);
      this.camera.aspect = canvas.width / canvas.height;
      this.camera.updateProjectionMatrix();
    }

    if (!features || !features.frequencyData || !sampleRate || !bufferLength) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const { volume, frequencyData } = features;

    // Update volume history
    const bufferLengthSeconds = bufferLength / sampleRate;
    const volumeHistoryMaxLength = parseInt(
      VOLUME_WINDOW_SECONDS / bufferLengthSeconds
    );
    if (this.volumeHistory.length >= volumeHistoryMaxLength) {
      this.volumeHistory.shift();
    }
    this.volumeHistory.push(volume);

    // Focus on musical frequency range
    const musicalRangeEnd = Math.floor(frequencyData.length * 1);
    const musicalFreqData = frequencyData.slice(0, musicalRangeEnd);

    // Calculate bar count and dimensions
    const barCount = Math.min(musicalFreqData.length, MAX_FREQUENCY_BARS);

    // Convert frequency data using Mel scale
    const melScaledData = this.convertToMelScale(
      musicalFreqData,
      sampleRate,
      barCount
    );

    // Update bar amplitude history and calculate per-bar colors
    this.updateBarAmplitudeHistory(melScaledData, volumeHistoryMaxLength);
    const barColors = this.calculateBarColors(melScaledData);

    // Calculate smoothed amplitudes
    const smoothedAmplitudes = this.calculateSmoothedAmplitudes(melScaledData);

    // Update or create 3D bars
    this.update3DBars(smoothedAmplitudes, barColors, barCount);

    // Update dynamic lighting based on volume
    const avgVolume = _.mean(this.volumeHistory) ?? 0;
    const volumeRatio = avgVolume > 0 ? volume / avgVolume : 1;
    this.dynamicLight.intensity = Math.min(2, 0.5 + volumeRatio);

    // Static camera position
    this.camera.position.set(0, 20, 50);
    this.camera.lookAt(0, 0, 0);

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  update3DBars(amplitudes, colors, barCount) {
    const barWidth = 1;
    const barSpacing = 1.2;
    const maxHeight = 20;

    // Remove excess bars if count decreased
    while (this.bars.length > barCount) {
      const bar = this.bars.pop();
      this.scene.remove(bar);
    }
    while (this.mirroredBars.length > barCount) {
      const bar = this.mirroredBars.pop();
      this.scene.remove(bar);
    }

    // Update or create bars
    for (let i = 0; i < barCount; i++) {
      const amplitude = amplitudes[i] / 255;
      const barHeight = Math.max(0.1, amplitude * maxHeight);
      const color = new THREE.Color(colors[i]);
      const xPosition = (i - barCount / 2) * barSpacing;

      // Main bars (front row)
      if (i < this.bars.length) {
        // Update existing bar
        const bar = this.bars[i];
        bar.scale.y = barHeight;
        bar.position.y = barHeight / 2;
        bar.material.color = color;
        bar.position.x = xPosition;
      } else {
        // Create new bar
        const geometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
        const material = new THREE.MeshPhongMaterial({ color });
        const bar = new THREE.Mesh(geometry, material);

        bar.position.x = xPosition;
        bar.position.z = 0;
        bar.position.y = barHeight / 2;
        bar.scale.y = barHeight;

        this.scene.add(bar);
        this.bars.push(bar);
      }

      // Mirrored bars (back row for vertical symmetry)
      if (i < this.mirroredBars.length) {
        // Update existing mirrored bar
        const mirroredBar = this.mirroredBars[i];
        mirroredBar.scale.y = barHeight;
        mirroredBar.position.y = barHeight / 2;
        mirroredBar.material.color = color;
        mirroredBar.position.x = xPosition;
      } else {
        // Create new mirrored bar
        const mirroredGeometry = new THREE.BoxGeometry(barWidth, 1, barWidth);
        const mirroredMaterial = new THREE.MeshPhongMaterial({ color });
        const mirroredBar = new THREE.Mesh(mirroredGeometry, mirroredMaterial);

        mirroredBar.position.x = xPosition;
        mirroredBar.position.z = -10; // Mirror across Z axis
        mirroredBar.position.y = barHeight / 2;
        mirroredBar.scale.y = barHeight;

        this.scene.add(mirroredBar);
        this.mirroredBars.push(mirroredBar);
      }
    }
  }

  // Reuse methods from FrequencyVisualizer
  frequencyToMel(frequency) {
    return 2595 * Math.log10(1 + frequency / 700);
  }

  melToFrequency(mel) {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  convertToMelScale(frequencyData, sampleRate, targetLength) {
    const nyquistFreq = sampleRate / 2;
    const freqPerBin = nyquistFreq / frequencyData.length;

    const minFreq = 20;
    const maxFreq = Math.min(nyquistFreq, 20000);
    const minMel = this.frequencyToMel(minFreq);
    const maxMel = this.frequencyToMel(maxFreq);

    const melScaledData = [];
    const melStep = (maxMel - minMel) / targetLength;

    for (let i = 0; i < targetLength; i++) {
      const currentMel = minMel + i * melStep;
      const nextMel = minMel + (i + 1) * melStep;

      const currentFreq = this.melToFrequency(currentMel);
      const nextFreq = this.melToFrequency(nextMel);

      const startBin = Math.floor(currentFreq / freqPerBin);
      const endBin = Math.ceil(nextFreq / freqPerBin);

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
    if (this.barAmplitudeHistory.length === 0) {
      this.barAmplitudeHistory = new Array(melScaledData.length)
        .fill(null)
        .map(() => []);
    }

    for (let i = 0; i < melScaledData.length; i++) {
      const barHistory = this.barAmplitudeHistory[i];

      if (barHistory.length >= maxHistoryLength) {
        barHistory.shift();
      }

      barHistory.push(melScaledData[i]);
    }
  }

  calculateBarColors(melScaledData) {
    const colors = [];

    for (let i = 0; i < melScaledData.length; i++) {
      const currentAmplitude = melScaledData[i];
      const barHistory = this.barAmplitudeHistory[i] || [];

      const avgAmplitude = barHistory.length > 0 ? _.mean(barHistory) : 0;

      let colorPercent =
        avgAmplitude > 0 ? currentAmplitude / avgAmplitude - 1 : 0;
      colorPercent = Math.max(0, colorPercent);
      colorPercent = Math.min(1, colorPercent);

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

      const previousAmplitude =
        barHistory.length >= 2
          ? barHistory[barHistory.length - 2]
          : currentAmplitude;

      const smoothedAmplitude = (currentAmplitude + previousAmplitude) / 2;
      smoothedAmplitudes.push(smoothedAmplitude);
    }

    return smoothedAmplitudes;
  }

  resize(width, height) {
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.threeCanvas && this.threeCanvas.parentNode) {
      this.threeCanvas.parentNode.removeChild(this.threeCanvas);
    }
    this.bars.forEach(bar => {
      if (bar.geometry) bar.geometry.dispose();
      if (bar.material) bar.material.dispose();
    });
    this.mirroredBars.forEach(bar => {
      if (bar.geometry) bar.geometry.dispose();
      if (bar.material) bar.material.dispose();
    });
    this.bars = [];
    this.mirroredBars = [];
  }
}