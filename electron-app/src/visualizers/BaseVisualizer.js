export class BaseVisualizer {
  constructor(options) {
    this.options = options;
  }

  draw(ctx, features, canvas) {
    throw Error("Implement in child class.");
  }
}
