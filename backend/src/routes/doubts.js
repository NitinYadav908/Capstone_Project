const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Doubt = require('../models/Doubt')
const Answer = require('../models/Answer')
const protect = require('../middleware/auth')
const { generateSolution } = require('../services/ollama')
const { extractDocumentText } = require('../services/documentReader')

const uploadDir = path.join(__dirname, '../../uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const allowed = new Set(['image/jpeg','image/png','image/webp','application/pdf','text/plain','text/markdown','text/csv','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
})
const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 12) * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, cb) => cb(null, allowed.has(file.mimetype))
})

router.get('/', protect, async (req, res) => {
  const { q, subject, status } = req.query
  const filter = {}
  if (subject) filter.subject = subject
  if (status) filter.status = status
  if (q) filter.$text = { $search: q }
  const doubts = await Doubt.find(filter).populate('author','name').sort({ createdAt: -1 }).limit(100)
  res.json({ doubts })
})

router.post('/', protect, (req, res, next) => upload.array('attachments', 4)(req, res, err => {
  if (err) return res.status(400).json({ message: err.message || 'Upload failed.' })
  next()
}), async (req, res) => {
  try {
    const { title, description, subject, tags } = req.body
    if (!title?.trim() || !description?.trim() || !subject?.trim()) return res.status(400).json({ message: 'Title, question details and subject are required.' })
    const attachments = (req.files || []).map(file => ({
      originalName: file.originalname, filename: file.filename, mimetype: file.mimetype,
      size: file.size, url: `/uploads/${file.filename}`
    }))
    const doubt = await Doubt.create({
      title: title.trim(), description: description.trim(), subject: subject.trim(),
      tags: String(tags || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 8),
      attachments, author: req.user._id
    })
    await req.user.updateOne({ $inc: { xp: 5 } })
    const populated = await doubt.populate('author','name')
    res.status(201).json({ doubt: populated })
  } catch (error) { res.status(500).json({ message: 'Could not create doubt.', detail: error.message }) }
})

router.get('/:id', protect, async (req, res) => {
  const doubt = await Doubt.findById(req.params.id).populate('author','name')
  if (!doubt) return res.status(404).json({ message: 'Doubt not found.' })
  await Doubt.updateOne({ _id: doubt._id }, { $inc: { views: 1 } })
  const answers = await Answer.find({ doubt: doubt._id }).populate('author','name').sort({ accepted: -1, createdAt: 1 })
  res.json({ doubt, answers })
})

router.post('/:id/ai-answer', protect, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) return res.status(404).json({ message: 'Doubt not found.' })

    const documents = await extractDocumentText(doubt.attachments || [])

    const solution = await generateSolution({
      title: doubt.title,
      description: doubt.description,
      subject: doubt.subject,
      documents,
      requestToken: req.headers['x-vercel-oidc-token']
    })

    const answer = await Answer.create({
      doubt: doubt._id,
      kind: 'ai',
      ...solution
    })

    await UserXP(req.user._id, 2)

    res.status(201).json({ answer })
  } catch (error) {
    console.error('AI answer error:', error)
    res.status(502).json({
      message: error.message || 'AI service is unavailable.'
    })
  }
})

async function UserXP(userId, points) {
  const User = require('../models/User')
  await User.updateOne({ _id: userId }, { $inc: { xp: points } })
}

router.post('/:id/answers', protect, async (req, res) => {
  const doubt = await Doubt.findById(req.params.id)
  if (!doubt) return res.status(404).json({ message: 'Doubt not found.' })
  const body = String(req.body.body || '').trim()
  if (body.length < 5) return res.status(400).json({ message: 'Write an answer with at least 5 characters.' })
  const answer = await Answer.create({ doubt: doubt._id, author: req.user._id, kind: 'human', body })
  await require('../models/User').updateOne({ _id: req.user._id }, { $inc: { xp: 10 } })
  if (doubt.status === 'open') { doubt.status = 'answered'; await doubt.save() }
  res.status(201).json({ answer: await answer.populate('author','name') })
})

router.post('/:doubtId/answers/:answerId/vote', protect, async (req, res) => {
  const answer = await Answer.findOne({ _id: req.params.answerId, doubt: req.params.doubtId })
  if (!answer) return res.status(404).json({ message: 'Answer not found.' })
  const already = answer.votes.some(id => id.equals(req.user._id))
  if (already) answer.votes = answer.votes.filter(id => !id.equals(req.user._id))
  else answer.votes.push(req.user._id)
  await answer.save()
  res.json({ votes: answer.votes.length, voted: !already })
})

router.post('/:doubtId/answers/:answerId/accept', protect, async (req, res) => {
  const doubt = await Doubt.findById(req.params.doubtId)
  if (!doubt) return res.status(404).json({ message: 'Doubt not found.' })
  if (!doubt.author.equals(req.user._id)) return res.status(403).json({ message: 'Only the student who asked this doubt can accept an answer.' })
  const answer = await Answer.findOne({ _id: req.params.answerId, doubt: doubt._id })
  if (!answer) return res.status(404).json({ message: 'Answer not found.' })
  await Answer.updateMany({ doubt: doubt._id }, { accepted: false })
  answer.accepted = true
  await answer.save()
  doubt.status = 'resolved'
  await doubt.save()
  res.json({ message: 'Answer accepted.', answer })
})

module.exports = router
