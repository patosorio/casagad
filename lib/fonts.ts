import localFont from "next/font/local";

const cormorantLatin = localFont({
  src: [
    {
      path: "../public/fonts/CormorantGaramond-normal-latin.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/CormorantGaramond-normal-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/CormorantGaramond-italic-latin.woff2",
      weight: "300",
      style: "italic",
    },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
  variable: "--font-cormorant-latin",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

const cormorantLatinExt = localFont({
  src: [
    {
      path: "../public/fonts/CormorantGaramond-normal-latin-ext.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/CormorantGaramond-normal-latin-ext.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/CormorantGaramond-italic-latin-ext.woff2",
      weight: "300",
      style: "italic",
    },
  ],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["Georgia", "serif"],
  variable: "--font-cormorant-latin-ext",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

const jostLatin = localFont({
  src: [
    {
      path: "../public/fonts/Jost-normal-latin.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Jost-normal-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Jost-normal-latin.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  variable: "--font-jost-latin",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

const jostLatinExt = localFont({
  src: [
    {
      path: "../public/fonts/Jost-normal-latin-ext.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Jost-normal-latin-ext.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Jost-normal-latin-ext.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  variable: "--font-jost-latin-ext",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

/** Class names that define the font CSS variables on `<html>`. */
export const fontVariableClassName = [
  cormorantLatin.variable,
  cormorantLatinExt.variable,
  jostLatin.variable,
  jostLatinExt.variable,
].join(" ");
