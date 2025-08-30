import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "OPSERVER",
  description: "Hub profissional para equipes de Counter-Strike 2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
