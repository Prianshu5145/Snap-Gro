import 'dotenv/config'
import { connectDB } from './src/config/connect.js'
import fastify from 'fastify'

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)

    const app = fastify()

    const PORT = process.env.PORT || 3000

    app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      } else {
        console.log(`🚀 Grocery App running at ${PORT}`)
      }
    })
  } catch (error) {
    console.error('Failed to start the server:', error)
    process.exit(1)
  }
}

start()
