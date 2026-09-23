'use client'

import { AdminAuthProvider } from '@/admin/context/AdminAuthContext.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </AuthProvider>
  )
}
