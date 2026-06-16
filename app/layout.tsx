import './globals.css'
import AuthProvider from './components/AuthProvider'

export const metadata = {
  title: 'LearnSphere AI',
  description: 'Personalized AI-Powered Learning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}