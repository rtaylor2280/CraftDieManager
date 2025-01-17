import { Inter, Roboto_Mono } from "next/font/google"; // Replace with valid fonts
import { AuthProvider } from "@/context/AuthContext";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMonoFont = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Craft Die Manager",
  description: "Easily manage your dies, locations, and project images.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${interFont.variable} ${robotoMonoFont.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          {/* Global Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-grow">{children}</main>

          {/* Global Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
