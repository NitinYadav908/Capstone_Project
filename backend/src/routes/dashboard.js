const router = require('express').Router()
const protect = require('../middleware/auth')
const Doubt = require('../models/Doubt')
const Answer = require('../models/Answer')
const User = require('../models/User')

router.get('/', protect, async (req, res) => {
  const [myDoubts, myAnswers, totalDoubts, leaderboard] = await Promise.all([
    Doubt.countDocuments({ author: req.user._id }),
    Answer.countDocuments({ author: req.user._id, kind: 'human' }),
    Doubt.countDocuments(),
    User.find({ xp: { $gt: 0 } }).select('name xp streak').sort({ xp: -1 }).limit(10)
  ])
  res.json({
    stats: { xp: req.user.xp, streak: req.user.streak, myDoubts, myAnswers, totalDoubts },
    leaderboard
  })
})
module.exports = router
