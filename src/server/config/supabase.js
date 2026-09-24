import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.SUPABASE_BUCKET

function getStorageClient() {
  if (!url || !key || !bucket) {
    throw new Error('Supabase Storage requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_BUCKET, and SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function uploadToStorage(filePath, buffer, contentType) {
  const { error } = await getStorageClient().storage.from(bucket).upload(filePath, buffer, {
    contentType,
    upsert: true,
  })
  if (error) throw error
}

export async function removeFromStorage(filePath) {
  const { error } = await getStorageClient().storage.from(bucket).remove([filePath])
  if (error) console.error('Supabase storage delete failed:', error.message)
}

export async function downloadFromStorage(filePath) {
  const { data, error } = await getStorageClient().storage.from(bucket).download(filePath)
  if (error) return null
  return data
}

export async function createStorageUrl(filePath) {
  const { data, error } = await getStorageClient().storage.from(bucket).createSignedUrl(filePath, 300)
  if (error) throw error
  return data.signedUrl
}