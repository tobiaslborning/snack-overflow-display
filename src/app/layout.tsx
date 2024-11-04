import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const clashGrotesk = localFont({
  src: [
    {
      path: 'fonts/ClashGrotesk-Bold.otf',
      weight: '700',
      style: 'bold',
    },
    {
      path: 'fonts/ClashGrotesk-Regular.otf',
      weight: '400',
      style: 'regular',
    },
    {
      path: 'fonts/ClashGrotesk-Medium.otf',
      weight: '500',
      style: 'medium',
    },
    {
      path: 'fonts/ClashGrotesk-Light.otf',
      weight: '300',
      style: 'light',
    },
    {
      path: 'fonts/ClashGrotesk-Extralight.otf',
      weight: '200',
      style: 'extralight',
    },
    {
      path: 'fonts/ClashGrotesk-Semibold.otf',
      weight: '600',
      style: 'semibold',
    },
  ],
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clashGrotesk.className}`}
      >
        {children}
      </body>
    </html>
  );
}