import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, SCRIPT_INICIAL_TEMA } from "../context/ThemeContext";
import { ConfiguracionProvider } from "../context/ConfiguracionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Taller Motos",
  description: "Sistema de administración para taller de motocicletas",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_INICIAL_TEMA }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <ConfiguracionProvider>{children}</ConfiguracionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
