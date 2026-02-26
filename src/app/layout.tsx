import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DO link | M&A 정보 매칭 서비스",
  description: "심연의 우주 속에서 지능형 자산망이 실시간으로 연결합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${jetBrainsMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
