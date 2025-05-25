"use client";

import { Inter } from 'next/font/google';
import './globals.css'; // Ensure Tailwind directives and CSS variables are loaded

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.className} antialiased`}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>GitHub Analytics</title>
            </head>
            <body className="bg-background text-foreground">
                <main>{children}</main>
            </body>
        </html>
    );
}