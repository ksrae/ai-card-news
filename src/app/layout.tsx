import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

export const metadata = {
  title: "AI Card News",
  description: "Generate beautiful card news with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
