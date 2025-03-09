import { Roboto } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import ProviderStore from "@/global/store/Provider";
import WindowDimensionsLabel from "../components/shared/WindowDimensionsLabel";
import { ViewTransitions } from "next-view-transitions";
import dotenv from "dotenv";
import PlantillaSegunRol from "@/components/shared/layouts/PlantillaSegunRol";

dotenv.config();

// Configurando Fuente Roboto
const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "SIASIS | I.E. 20935",
  description:
    "Sistema de asistencia para la institucion educativa 20935 Asunción 8, Imperial, Cañete",
  icons: "/images/svg/Logo.svg",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const interfazColor = "#dd3524";

  return (
    <ViewTransitions>
      <html lang="es">
        <body
          className={`${roboto.variable} font-roboto antialiased min-h-[100dvh]`}
        >
          <style>
            {`
      
        :root{
          --color-interfaz: ${interfazColor};
        }

      `}
          </style>

          <WindowDimensionsLabel />
          <ProviderStore>
            <PlantillaSegunRol>{children}</PlantillaSegunRol>
          </ProviderStore>
        </body>
      </html>
    </ViewTransitions>
  );
}
