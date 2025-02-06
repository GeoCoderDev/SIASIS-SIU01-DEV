import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["var(--font-roboto)", "sans-serif"],
      },

      colors: {
        // PALETA DE COLORES
        "color-interfaz": "var(--rojo-principal)",
        "rojo-oscuro": "var(--rojo-oscuro)",
        "verde-principal": "var(--verde-principal)",
        "azul-principal": "var(--azul-principal)",
        "violeta-principal": "var(--violeta-principal)",
        "naranja-principal": "var(--naranja-principal)  ",
        "amarillo-ediciones": "var(--amarillo-ediciones)",
        "verde-brilloso": "var(--verde-brilloso)",
        "gris-oscuro": "var(--gris-oscuro)",
        "gris-intermedio": "var(--gris-intermedio)",
        "gris-claro": "var(--gris-claro)",
        blanco: "var(--blanco)",
        negro: "var(--negro)",
      },
    },
  },
  plugins: [],
};
export default config;
