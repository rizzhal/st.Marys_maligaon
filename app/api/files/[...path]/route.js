import { NextResponse } from 'next/server'
import { createStorageUrl } from '@/server/config/supabase.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  const { path: segments = [] } = await context.params
  const storagePath = segments.join('/')

  try {
    const signedUrl = await createStorageUrl(storagePath)
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error(`Supabase file not found: ${storagePath}`, error.message)
    return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 })
  }
}
