import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

const globalForMongoose = globalThis

async function seedDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return

  const existingAdmin = await Admin.findOne({ email })
  if (!existingAdmin) {
    await Admin.create({ email, password, name: 'Super Admin' })
    console.log(`Default admin created: ${email}`)
  }
}

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  if (globalForMongoose.__maligaonMongoPromise) {
    return globalForMongoose.__maligaonMongoPromise
  }

  globalForMongoose.__maligaonMongoPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then(async (connection) => {
      await seedDefaultAdmin()
      console.log(`MongoDB Connected: ${connection.connection.host}`)
      return connection
    })
    .catch((error) => {
      globalForMongoose.__maligaonMongoPromise = null
      throw error
    })

  return globalForMongoose.__maligaonMongoPromise
}
