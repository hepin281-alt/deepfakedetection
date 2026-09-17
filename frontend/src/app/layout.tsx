import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepfake Detector — AI-Powered Media Authentication",
  description:
    "Upload images or videos to instantly detect AI manipulation and deepfake artifacts using advanced machine learning.",
  keywords: ["deepfake detector", "AI detection", "fake image detector", "media authentication"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
