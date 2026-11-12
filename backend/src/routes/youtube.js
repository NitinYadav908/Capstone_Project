const router = require('express').Router()
const protect = require('../middleware/auth')

router.get('/search', protect, async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 180)
  if (!query) return res.status(400).json({ message: 'A search query is required.' })
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return res.json({
    configured: false,
    searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    videos: []
  })
  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.search = new URLSearchParams({ part: 'snippet', type: 'video', maxResults: '5', q: query, key }).toString()
    const response = await fetch(url)
    const data = await response.json()
    if (!response.ok) return res.status(502).json({ message: data.error?.message || 'YouTube API request failed.' })
    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))
    res.json({ configured: true, videos })
  } catch (error) { res.status(502).json({ message: 'Could not contact YouTube.', detail: error.message }) }
})

module.exports = router
