import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/server/config/database.js'
import { protect } from '@/server/middleware/auth.js'
import { verifyImageUploads, verifyCircularPdf, compressSingleImage } from '@/server/middleware/upload.js'

import { login, logout, checkAuth, changePassword } from '@/server/controllers/authController.js'
import { createManagement, getManagement, getAllManagement, getManagementById, updateManagement, deleteManagement } from '@/server/controllers/managementController.js'
import { createCommittee, getCommittee, getAllCommittee, getCommitteeById, updateCommittee, deleteCommittee } from '@/server/controllers/managingCommitteeController.js'
import { createStaff, getStaff, getAllStaff, getStaffById, updateStaff, deleteStaff } from '@/server/controllers/staffController.js'
import { createTeachingStaff, getTeachingStaff, getAllTeachingStaff, getTeachingStaffById, updateTeachingStaff, deleteTeachingStaff } from '@/server/controllers/teachingStaffController.js'
import { createCircular, getCirculars, getAllCirculars, getCircularById, updateCircular, deleteCircular } from '@/server/controllers/circularController.js'
import { createGallery, getGalleries, getAllGalleries, getGalleryById, updateGallery, deleteGallery, toggleGalleryStatus } from '@/server/controllers/galleryController.js'
import { createDownload, getDownloads, getAllDownloads, getDownloadById, updateDownload, deleteDownload, toggleDownloadStatus } from '@/server/controllers/downloadController.js'

const uploadRoot = path.join(process.cwd(), 'uploads')

const cookieOptions = (options = {}) => {
  const production = process.env.NODE_ENV === 'production'
  return {
    httpOnly: options.httpOnly ?? true,
    secure: production ? (options.secure ?? true) : false,
    sameSite: options.sameSite ?? (production ? 'none' : 'lax'),
    partitioned: production ? options.partitioned ?? true : false,
    maxAge: options.maxAge,
    path: options.path ?? '/',
  }
}

function createResponse() {
  const state = { status: 200, body: null, cookies: [] }
  return {
    state,
    status(code) { state.status = code; return this },
    json(body) { state.body = body; return this },
    cookie(name, value, options = {}) {
      state.cookies.push({ name, value, options: cookieOptions(options) })
      return this
    },
    clearCookie(name, options = {}) {
      state.cookies.push({ name, value: '', options: { ...cookieOptions(options), maxAge: 0 } })
      return this
    },
    setHeader() { return this },
    get(name) { return state.headers?.[name.toLowerCase()] },
  }
}

function parseCookies(header) {
  const cookies = {}
  for (const item of (header || '').split(';')) {
    if (!item.trim()) continue
    const index = item.indexOf('=')
    if (index === -1) continue
    const name = item.slice(0, index).trim()
    const value = item.slice(index + 1).trim()
    cookies[name] = decodeURIComponent(value)
  }
  return cookies
}

const extensionForMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

async function writeUpload(file, type, fieldname) {
  const originalname = file.name || 'upload'
  const mimetype = file.type || 'application/octet-stream'
  const size = file.size || 0

  const limits = {
    image: 5 * 1024 * 1024,
    pdf: 10 * 1024 * 1024,
    document: 20 * 1024 * 1024,
  }
  if (size > limits[type]) throw Object.assign(new Error(`File too large. Maximum size is ${limits[type] / (1024 * 1024)}MB`), { status: 400 })

  let directory
  let filename
  if (type === 'image') {
    if (!extensionForMime[mimetype]) throw Object.assign(new Error('Only image files are allowed'), { status: 400 })
    directory = path.join(uploadRoot, 'images')
    filename = `${uuidv4()}${extensionForMime[mimetype]}`
  } else if (type === 'pdf') {
    if (mimetype !== 'application/pdf' || path.extname(originalname).toLowerCase() !== '.pdf') {
      throw Object.assign(new Error('Only PDF files are allowed'), { status: 400 })
    }
    filename = `${uuidv4()}.pdf`
    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw Object.assign(new Error('Invalid PDF upload'), { status: 400 })
    }
    return {
      fieldname,
      originalname,
      encoding: '7bit',
      mimetype,
      destination: '',
      filename,
      path: '',
      buffer,
      size,
    }
  } else {
    const allowed = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'])
    const ext = path.extname(originalname).toLowerCase()
    if (!allowed.has(ext)) throw Object.assign(new Error('Only document files are allowed'), { status: 400 })
    directory = path.join(uploadRoot, 'downloads')
    filename = `${uuidv4()}${ext}`
  }

  await fs.ensureDir(directory)
  const filePath = path.join(directory, filename)
  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return {
    fieldname,
    originalname,
    encoding: '7bit',
    mimetype,
    destination: directory,
    filename,
    path: filePath,
    size,
  }
}

async function parseRequest(request, pathParts) {
  const url = new URL(request.url)
  const cookies = parseCookies(request.headers.get('cookie'))
  const contentType = request.headers.get('content-type') || ''
  let body = {}
  let file
  let files

  if (!['GET', 'HEAD'].includes(request.method)) {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      for (const [key, value] of form.entries()) {
        if (typeof value === 'string') body[key] = value
      }

      const imageFiles = form.getAll('images').filter((value) => value instanceof File)
      const singleImage = form.get('image')
      const pdf = form.get('pdf')
      const downloadFile = form.get('file')

      const resource = pathParts[0]
      if (resource === 'gallery' && imageFiles.length) {
        if (imageFiles.length > 4) throw Object.assign(new Error('Maximum 4 images can be uploaded at once'), { status: 400 })
        files = await Promise.all(imageFiles.map((item) => writeUpload(item, 'image', 'images')))
      } else if (resource === 'circulars' && pdf instanceof File) {
        file = await writeUpload(pdf, 'pdf', 'pdf')
      } else if (resource === 'downloads' && downloadFile instanceof File) {
        file = await writeUpload(downloadFile, 'document', 'file')
      } else if (['management', 'managing-committee', 'staff', 'teaching-staff'].includes(resource) && singleImage instanceof File) {
        file = await writeUpload(singleImage, 'image', 'image')
      }
    } else {
      const text = await request.text()
      body = text ? JSON.parse(text) : {}
    }
  }

  return {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    params: {},
    query: Object.fromEntries(url.searchParams.entries()),
    cookies,
    file,
    files,
    session: undefined,
    get(name) { return this.headers[name.toLowerCase()] },
  }
}

async function runMiddleware(middleware, req, res) {
  let nextCalled = false
  await middleware(req, res, () => { nextCalled = true })
  return nextCalled
}

function matchRoute(method, parts) {
  const [resource, first, second] = parts

  if (resource === 'health' && method === 'GET') return { handler: (_req, res) => res.json({ success: true, message: 'API is running' }) }

  if (resource === 'auth') {
    if (method === 'POST' && first === 'login') return { handler: login }
    if (method === 'POST' && first === 'logout') return { handler: logout }
    if (method === 'GET' && first === 'check') return { handler: checkAuth, auth: true }
    if (method === 'PUT' && first === 'change-password') return { handler: changePassword, auth: true }
  }

  if (resource === 'management') {
    if (method === 'GET' && !first) return { handler: getManagement }
    if (method === 'GET' && first === 'all') return { handler: getAllManagement, auth: true }
    if (method === 'GET' && first) return { handler: getManagementById, params: { id: first } }
    if (method === 'POST' && !first) return { handler: createManagement, auth: true, upload: 'image-single' }
    if (method === 'PUT' && first) return { handler: updateManagement, auth: true, upload: 'image-single', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteManagement, auth: true, params: { id: first } }
  }

  if (resource === 'managing-committee') {
    if (method === 'GET' && !first) return { handler: getCommittee }
    if (method === 'GET' && first === 'all') return { handler: getAllCommittee, auth: true }
    if (method === 'GET' && first) return { handler: getCommitteeById, params: { id: first } }
    if (method === 'POST' && !first) return { handler: createCommittee, auth: true, upload: 'image-single' }
    if (method === 'PUT' && first) return { handler: updateCommittee, auth: true, upload: 'image-single', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteCommittee, auth: true, params: { id: first } }
  }

  if (resource === 'staff') {
    if (method === 'GET' && !first) return { handler: getStaff }
    if (method === 'GET' && first === 'all') return { handler: getAllStaff, auth: true }
    if (method === 'GET' && first) return { handler: getStaffById, params: { id: first } }
    if (method === 'POST' && !first) return { handler: createStaff, auth: true, upload: 'image-single' }
    if (method === 'PUT' && first) return { handler: updateStaff, auth: true, upload: 'image-single', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteStaff, auth: true, params: { id: first } }
  }

  if (resource === 'teaching-staff') {
    if (method === 'GET' && !first) return { handler: getTeachingStaff }
    if (method === 'GET' && first === 'all') return { handler: getAllTeachingStaff, auth: true }
    if (method === 'GET' && first) return { handler: getTeachingStaffById, params: { id: first } }
    if (method === 'POST' && !first) return { handler: createTeachingStaff, auth: true, upload: 'image-single' }
    if (method === 'PUT' && first) return { handler: updateTeachingStaff, auth: true, upload: 'image-single', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteTeachingStaff, auth: true, params: { id: first } }
  }

  if (resource === 'circulars') {
    if (method === 'GET' && first === 'all') return { handler: getAllCirculars, auth: true }
    if (method === 'GET' && !first) return { handler: getCirculars }
    if (method === 'GET' && first) return { handler: getCircularById, params: { id: first } }
    if (method === 'POST' && !first) return { handler: createCircular, auth: true, upload: 'pdf', params: {} }
    if (method === 'PUT' && first) return { handler: updateCircular, auth: true, upload: 'pdf', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteCircular, auth: true, params: { id: first } }
  }

  if (resource === 'gallery') {
    if (method === 'GET' && first === 'all') return { handler: getAllGalleries, auth: true }
    if (method === 'GET' && !first) return { handler: getGalleries }
    if (method === 'GET' && first) return { handler: getGalleryById, params: { id: first } }
    if (method === 'POST' && !first) return { handler: createGallery, auth: true, upload: 'images' }
    if (method === 'PUT' && first) return { handler: updateGallery, auth: true, upload: 'images', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteGallery, auth: true, params: { id: first } }
    if (method === 'PATCH' && first && second === 'toggle') return { handler: toggleGalleryStatus, auth: true, params: { id: first } }
  }

  if (resource === 'downloads') {
    if (method === 'GET' && !first) return { handler: getDownloads }
    if (method === 'GET' && first === 'all') return { handler: getAllDownloads, auth: true }
    if (method === 'GET' && first) return { handler: getDownloadById, params: { id: first } }
    if (method === 'POST' && (!first || first === 'upload')) return { handler: createDownload, auth: true, upload: 'document' }
    if (method === 'PUT' && first) return { handler: updateDownload, auth: true, upload: 'document', params: { id: first } }
    if (method === 'DELETE' && first) return { handler: deleteDownload, auth: true, params: { id: first } }
    if (method === 'PATCH' && first && second === 'toggle') return { handler: toggleDownloadStatus, auth: true, params: { id: first } }
  }

  return null
}

async function applyUploadMiddleware(route, req, res) {
  if (!route.upload) return true

  if (route.upload === 'image-single') {
    if (!req.file) return true
    if (!(await runMiddleware(verifyImageUploads, req, res))) return false
    return runMiddleware(compressSingleImage, req, res)
  }

  if (route.upload === 'images') {
    return runMiddleware(verifyImageUploads, req, res)
  }

  if (route.upload === 'pdf') {
    return runMiddleware(verifyCircularPdf, req, res)
  }

  return true
}

function toNextResponse(state) {
  const response = NextResponse.json(state.body ?? {}, { status: state.status })
  for (const cookie of state.cookies) response.cookies.set(cookie.name, cookie.value, cookie.options)
  return response
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function handleApiRequest(request, context) {
  try {
    await connectDB()
    const { path: pathParts = [] } = await context.params
    const route = matchRoute(request.method, pathParts)

    if (!route) return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 })

    const req = await parseRequest(request, pathParts)
    req.params = route.params || {}
    const res = createResponse()

    if (route.auth) {
      const authenticated = await runMiddleware(protect, req, res)
      if (!authenticated) return toNextResponse(res.state)
    }

    const uploadOk = await applyUploadMiddleware(route, req, res)
    if (!uploadOk) return toNextResponse(res.state)

    await route.handler(req, res)
    return toNextResponse(res.state)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Something went wrong!' },
      { status: error?.status || 500 },
    )
  }
}

export async function GET(request, context) { return handleApiRequest(request, context) }
export async function POST(request, context) { return handleApiRequest(request, context) }
export async function PUT(request, context) { return handleApiRequest(request, context) }
export async function DELETE(request, context) { return handleApiRequest(request, context) }
export async function PATCH(request, context) { return handleApiRequest(request, context) }
