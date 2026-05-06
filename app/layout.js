import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  title: 'Markaz Pilar',
  description: 'Internal Management Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: jakarta.style.fontFamily }} className="antialiased">
        {children}
      </body>
    </html>
  )
}
