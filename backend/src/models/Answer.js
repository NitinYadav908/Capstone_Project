const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  doubt: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  kind: { type: String, enum: ['human', 'ai'], required: true },

  // Main explanation
  body: { type: String, required: true },
  summary: { type: String, default: '' },
  steps: [{ type: String }],

  // Visual learning
  flowchart: [{ type: String }],
  diagram: { type: String, default: '' },

  // Subject-specific content
  equations: [{ type: String }],
  codeBlocks: [{
    language: { type: String, default: 'text' },
    code: { type: String, default: '' },
    explanation: { type: String, default: '' }
  }],

  // AI Mentor teaching content
  problemIntro: { type: String, default: '' },
  simpleExample: { type: String, default: '' },
  keywords: [{
    term: { type: String, default: '' },
    meaning: { type: String, default: '' }
  }],
  givens: [{
    label: { type: String, default: '' },
    value: { type: String, default: '' }
  }],
  conceptExplanation: { type: String, default: '' },
  solutionSteps: [{
    title: { type: String, default: '' },
    explanation: { type: String, default: '' },
    working: { type: String, default: '' }
  }],
  handwrittenBoard: {
    title: { type: String, default: '' },
    lines: [{
      text: { type: String, default: '' },
      type: {
        type: String,
        enum: ['heading', 'formula', 'step', 'note', 'result'],
        default: 'step'
      }
    }]
  },

  // Further learning
  relatedTopics: [{ type: String }],
  youtubeQuery: { type: String, default: '' },

  accepted: { type: Boolean, default: false },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

module.exports = mongoose.model('Answer', answerSchema)
