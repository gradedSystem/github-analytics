"use client";

import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Inter } from 'next/font/google';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' }); // Add display: 'swap'

let theme = createTheme({
    palette: {
        primary: { main: '#3b82f6' },
        secondary: { main: '#f43f5e' },
        background: { default: '#f9fafb' },
    },
    typography: {
        fontFamily: inter.style.fontFamily,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 600,
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none' }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: { boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }
            }
        }
    }
});

theme = responsiveFontSizes(theme);

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.className}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>GitHub Analytics</title>
            </head>
            <body>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <Container maxWidth="xl" sx={{ flex: 1, padding: (theme) => theme.spacing(3) }}>
                            {children}
                        </Container>
                    </Box>
                </ThemeProvider>
            </body>
        </html>
    );
}