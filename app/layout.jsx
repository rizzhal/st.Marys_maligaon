import './globals.css'
import Providers from './providers.jsx'

export const metadata = {
  title: "St. Mary's Sr. Secondary School",
  description: "St. Mary's Sr. Secondary School",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
