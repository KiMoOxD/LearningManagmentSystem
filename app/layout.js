import localFont from "next/font/local";
import "./globals.css"
import { AuthProvider } from "../context/AuthContext"

const inter = localFont({
  src: [
    {
      path: './fonts/InterVariable.woff2',
      style: 'normal',
    },
    {
      path: './fonts/InterVariable-Italic.woff2',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: "Dr. Johnson's LMS",
  description: "Learning Management System for Dr. Sarah Johnson's students",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
