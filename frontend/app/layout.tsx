import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Container Optimizer 3D",
  description: "MVP para simular carga de contenedores en 3D.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
