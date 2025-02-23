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

      screens: {
        sxs: "0px",
        xs: "300px",
        sm: "500px",
        md: "768px",
        lg: "976px",
        xl: "1440px",

        "max-xs": { max: "300px" },
        "max-sm": { max: "500px" },
        "max-md": { max: "768px" },
        "max-lg": { max: "976px" },
        "max-xl": { max: "1440px" },

    
        "sxs-only": { min: "0px", max: "300px" },
        "xs-only": { min: "300px", max: "499px" },
        "sm-only": { min: "500px", max: "767px" },
        "md-only": { min: "768px", max: "975px" },
        "lg-only": { min: "976px", max: "1600px" },
        "xl-only": { min: "1600px" },
        
        'short-height': {'raw': '(max-height: 50vw)'}

      },



    },
  },
  plugins: [],
};
export default config;
