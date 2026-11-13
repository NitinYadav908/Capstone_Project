const app = require('../src/server')
const connectDB = require('../src/config/db')

let dbConnection

module.exports = async (req, res) => {
  try {
    if (!dbConnection) {
      dbConnection = connectDB().catch(error => {
        dbConnection = null
        throw error
      })
    }

    await dbConnection
    return app(req, res)
  } catch (error) {
    console.error('API startup error:', error.message)
    return res.status(500).json({ message: 'Database connection failed.' })
  }
}
