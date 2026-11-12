const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const protect = require('../middleware/auth')

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, bio: user.bio, xp: user.xp, streak: user.streak, createdAt: user.createdAt }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' })
    if (name.trim().length > 60) return res.status(400).json({ message: 'Name must be 60 characters or fewer.' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' })
    const normalizedEmail = email.trim().toLowerCase()
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' })
    const hash = await bcrypt.hash(password, 12)
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hash })
    res.status(201).json({ token: makeToken(user), user: publicUser(user) })
  } catch (error) { res.status(500).json({ message: 'Could not create account.', detail: error.message }) }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Incorrect email or password.' })
    res.json({ token: makeToken(user), user: publicUser(user) })
  } catch (error) { res.status(500).json({ message: 'Login failed.', detail: error.message }) }
})

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }))

router.patch('/me', protect, async (req, res) => {
  const { name, bio } = req.body
  if (name !== undefined) req.user.name = String(name).trim().slice(0, 60)
  if (bio !== undefined) req.user.bio = String(bio).trim().slice(0, 240)
  await req.user.save()
  res.json({ user: publicUser(req.user) })
})

module.exports = router
