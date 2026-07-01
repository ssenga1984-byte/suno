import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ui: {
          surface: {
            base: "#FBFAF5",
            sunk: "#F6F3EA",
            raised: "#FFFFFF",
            inverse: "#123B2A"
          },
          text: {
            heading: "#123B2A",
            body: "#1E2722",
            muted: "#7B8A80",
            inverse: "#FBFAF5"
          },
          accent: {
            DEFAULT: "#B79A5B",
            hover: "#C5AA68"
          },
          line: {
            hairline: "rgb(18 59 42 / 0.14)"
          },
          focus: "#A8C66C",
          support: {
            leaf: "#EEF7F2",
            leafText: "#4F7D5A"
          },
          state: {
            info: "#4F7D5A"
          }
        },
        forest: {
          deep: "#123B2A",
          leaf: "#4F7D5A",
          moss: "#A8C66C",
          paper: "#F6F3EA",
          linen: "#FBFAF5",
          ink: "#1E2722",
          muted: "#7B8A80",
          gold: "#B79A5B",
          goldlight: "#C5AA68",
          cream: "#FFF8E6"
        },
        tint: {
          sky: "#EEF8FA",
          skyline: "#BEE0E8",
          aqua: "#DDEEF0",
          lime: "#E8F4C6",
          leaf: "#E8F4E2",
          moss: "#EEF7F2"
        },
        consult: {
          matcha: "#DCECC2",
          teal: "#2F83A0",
          tealink: "#1D6475",
          amber: "#F2D27A",
          amberink: "#8A6A18",
          sand: "#F6E9D2",
          sandink: "#8A6A45",
          rose: "#F4DCDD",
          roseink: "#B75D4A"
        }
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Hiragino Kaku Gothic ProN"',
          '"Yu Gothic"',
          "Meiryo",
          "sans-serif"
        ],
        serif: ['"Noto Serif JP"', '"Yu Mincho"', "serif"]
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.12", letterSpacing: "0", fontWeight: "500" }],
        h1: ["2.75rem", { lineHeight: "1.16", letterSpacing: "0", fontWeight: "500" }],
        h2: ["2.5rem", { lineHeight: "1.2", letterSpacing: "0", fontWeight: "500" }],
        h3: ["1.5rem", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "500" }],
        lead: ["1.125rem", { lineHeight: "1.8", letterSpacing: "0", fontWeight: "400" }],
        body: ["1rem", { lineHeight: "1.8", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.7", letterSpacing: "0", fontWeight: "400" }],
        eyebrow: ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.16em", fontWeight: "600" }],
        caption: ["0.75rem", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }]
      },
      spacing: {
        "space-3xs": "0.25rem",
        "space-2xs": "0.5rem",
        "space-xs": "0.75rem",
        "space-sm": "1rem",
        "space-md": "1.5rem",
        "space-lg": "2rem",
        "section-y": "4rem",
        "section-y-md": "6rem",
        "heading-gap": "1.5rem",
        "card-pad": "1.5rem",
        "card-gap": "1.5rem",
        "banner-y": "3.5rem",
        "banner-y-md": "4.5rem",
        "banner-top-y": "5rem",
        "banner-top-y-md": "6rem"
      },
      boxShadow: {
        soft: "0 18px 48px rgb(18 59 42 / 0.14)",
        elevation: "0 18px 44px rgb(30 64 49 / 0.1)"
      },
      maxWidth: {
        read: "48rem",
        page: "80rem"
      },
      zIndex: {
        base: "0",
        "banner-media": "-20",
        "banner-overlay": "-10",
        "overlay-badge": "10",
        "mobile-menu": "60",
        "sticky-header": "50",
        "modal": "70"
      }
    }
  },
  plugins: []
} satisfies Config;
