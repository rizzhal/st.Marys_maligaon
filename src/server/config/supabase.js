import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const bucket = process.env.SUPABASE_BUCKET || process.env.SUPABASE_BUCKET

if (!url || !key || !bucket) {
  throw new Error('Supabase storage is not configured')
}

export const storageBucket = bucket
export const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export async function uploadToStorage(filePath, buffer, contentType) {
  const { error } = await supabase.storage.from(storageBucket).upload(filePath, buffer, {
    contentType,
    upsert: true,
  })
  if (error) throw error
}

export async function removeFromStorage(filePath) {
  const { error } = await supabase.storage.from(storageBucket).remove([filePath])
  if (error) console.error('Supabase storage delete failed:', error.message)
}

export async function downloadFromStorage(filePath) {
  const { data, error } = await supabase.storage.from(storageBucket).download(filePath)
  if (error) return null
  return data
}