require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const connectDB = require('./config/db')

const app = express()
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://127.0.0.1:5173' }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'PeerConnect API' }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/doubts', require('./routes/doubts'))
app.use('/api/youtube', require('./routes/youtube'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Unexpected server error.' })
})

module.exports = app

if (require.main === module) {
  const port = Number(process.env.PORT || 5001)
  connectDB().then(() => {
    app.listen(port, '0.0.0.0', () => console.log(`PeerConnect API running on port ${port}`))
  }).catch(error => {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  })
}
