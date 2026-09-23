'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Link({ to, href, ...props }) {
  return <NextLink href={href ?? to} {...props} />
}

export function NavLink({ to, className, children, ...props }) {
  const pathname = usePathname()
  const isActive = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className

  return (
    <Link href={to} className={resolvedClassName} {...props}>
      {children}
    </Link>
  )
}

export function useNavigate() {
  const router = useRouter()
  return (to, options = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back()
      else router.forward()
      return
    }
    if (options.replace) router.replace(to)
    else router.push(to)
  }
}

export function Navigate({ to, replace = false }) {
  const router = useRouter()

  useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [router, to, replace])

  return null
}
