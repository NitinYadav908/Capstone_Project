const fs = require('fs/promises')
const path = require('path')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

const MAX_TOTAL_CHARS = 18000

async function extractDocumentText(attachments = []) {
  const results = []
  let total = 0

  for (const file of attachments) {
    if (total >= MAX_TOTAL_CHARS) break

    const filename = path.basename(file.filename || '')
    if (!filename) continue

    const filePath = path.resolve(__dirname, '../../uploads', filename)
    const uploadDir = path.resolve(__dirname, '../../uploads')

    if (!filePath.startsWith(uploadDir + path.sep)) continue

    try {
      const buffer = await fs.readFile(filePath)
      let content = ''

      if (file.mimetype === 'application/pdf') {
        const parsed = await pdfParse(buffer)
        content = parsed.text || ''
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const parsed = await mammoth.extractRawText({ buffer })
        content = parsed.value || ''
      } else if (
        file.mimetype === 'text/plain' ||
        file.mimetype === 'text/markdown' ||
        file.mimetype === 'text/csv'
      ) {
        content = buffer.toString('utf8')
      } else {
        continue
      }

      content = content.replace(/\u0000/g, '').trim()
      const remaining = MAX_TOTAL_CHARS - total
      content = content.slice(0, remaining)

      if (content) {
        results.push({
          filename: file.originalName,
          text: content
        })
        total += content.length
      }
    } catch (error) {
      console.error(`Could not extract ${filename}:`, error.message)
      results.push({
        filename: file.originalName,
        text: '[Text extraction failed for this attachment.]'
      })
    }
  }

  return results
}

module.exports = { extractDocumentText }
