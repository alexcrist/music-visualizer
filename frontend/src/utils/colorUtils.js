import ColorThief from "colorthief";

export const extractDominantColor = (imageElement) => {
  const colorThief = new ColorThief();
  const [r, g, b] = colorThief.getColor(imageElement);
  const color = rgbToHex(r, g, b);
  console.log("color", color);
  return color;
};

const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
