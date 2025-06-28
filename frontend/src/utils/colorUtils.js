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

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const getContrastColor = (backgroundColor) => {
  if (!backgroundColor) return "#ffffff";

  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "#ffffff";

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  if (luminance > 0.4) {
    return "#000000";
  } else {
    return "#ffffff";
  }
};
