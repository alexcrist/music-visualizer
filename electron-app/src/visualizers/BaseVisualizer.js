export class BaseVisualizer {
  constructor(options) {
    this.options = options;
  }

  draw() {
    throw Error("Implement in child class.");
  }
}
