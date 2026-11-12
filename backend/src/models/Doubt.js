const mongoose = require('mongoose')

const attachmentSchema = new mongoose.Schema({
  originalName: String,
  filename: String,
  mimetype: String,
  size: Number,
  url: String
}, { _id: false })

const doubtSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 12000 },
  subject: { type: String, required: true, trim: true, maxlength: 80 },
  tags: [{ type: String, trim: true }],
  attachments: [attachmentSchema],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'answered', 'resolved'], default: 'open' },
  views: { type: Number, default: 0 }
}, { timestamps: true })

doubtSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' })
module.exports = mongoose.model('Doubt', doubtSchema)
