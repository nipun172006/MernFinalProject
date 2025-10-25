// Lightweight validation helpers (no external schema library)

function isNonEmptyString(v, { max } = {}) {
  if (typeof v !== 'string') return false
  const s = v.trim()
  if (!s) return false
  if (max && s.length > max) return false
  return true
}

function isOptionalUrl(v) {
  if (v == null || v === '') return true
  try {
    const u = new URL(String(v))
    return ['http:', 'https:'].includes(u.protocol)
  } catch {
    return false
  }
}

function parseNonNegativeInt(v, fallback) {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

function sanitizeGenres(genres) {
  if (Array.isArray(genres)) return genres.filter(Boolean).map((g)=>String(g).trim()).filter(Boolean)
  if (typeof genres === 'string') return genres.split(/[;|,]/g).map((g)=>g.trim()).filter(Boolean)
  return []
}

function clampRating(r) {
  const n = Number(r)
  if (!Number.isFinite(n)) return undefined
  return Math.min(5, Math.max(0, n))
}

// Validators returning { ok, errors, value }
function validateBookCreate(body) {
  const errors = []
  const title = String(body?.title ?? '').trim()
  const author = String(body?.author ?? '').trim()
  const ISBN = String(body?.ISBN ?? '').trim()
  const coverImageUrl = body?.coverImageUrl
  const description = String(body?.description ?? '')
  const totalCopies = parseNonNegativeInt(body?.totalCopies, NaN)
  const genres = sanitizeGenres(body?.genres)
  const rating = clampRating(body?.rating)

  if (!isNonEmptyString(title, { max: 200 })) errors.push('title is required (<= 200 chars)')
  if (!isNonEmptyString(ISBN, { max: 40 })) errors.push('ISBN is required (<= 40 chars)')
  if (!Number.isFinite(totalCopies)) errors.push('totalCopies must be a non-negative integer')
  if (!isOptionalUrl(coverImageUrl)) errors.push('coverImageUrl must be a valid http(s) URL')
  if (description && description.length > 2000) errors.push('description too long (<= 2000 chars)')

  return { ok: errors.length === 0, errors, value: { title, author, ISBN, coverImageUrl, description, totalCopies, genres, rating } }
}

function validateBookUpdate(body) {
  const errors = []
  const update = {}
  if (body?.title !== undefined) {
    if (!isNonEmptyString(body.title, { max: 200 })) errors.push('title must be non-empty if provided')
    else update.title = String(body.title).trim()
  }
  if (body?.author !== undefined) update.author = String(body.author).trim()
  if (body?.coverImageUrl !== undefined) {
    if (!isOptionalUrl(body.coverImageUrl)) errors.push('coverImageUrl must be a valid http(s) URL')
    else update.coverImageUrl = String(body.coverImageUrl)
  }
  if (body?.description !== undefined) {
    if (String(body.description).length > 2000) errors.push('description too long (<= 2000 chars)')
    else update.description = String(body.description)
  }
  if (body?.totalCopies !== undefined) {
    const n = parseNonNegativeInt(body.totalCopies, NaN)
    if (!Number.isFinite(n)) errors.push('totalCopies must be a non-negative integer')
    else update.totalCopies = n
  }
  if (body?.genres !== undefined) update.genres = sanitizeGenres(body.genres)
  if (body?.rating !== undefined) {
    const r = clampRating(body.rating)
    if (!Number.isFinite(r)) errors.push('rating must be a number between 0 and 5')
    else update.rating = r
  }
  return { ok: errors.length === 0, errors, value: update }
}

function validateSettingsUpdate(body) {
  const errors = []
  const updates = {}
  if (body?.loanDaysDefault !== undefined) {
    const v = parseNonNegativeInt(body.loanDaysDefault, NaN)
    if (!Number.isFinite(v) || v < 1) errors.push('loanDaysDefault must be >= 1')
    else updates.loanDaysDefault = Math.max(1, v)
  }
  if (body?.finePerDay !== undefined) {
    const v = Number(body.finePerDay)
    if (!Number.isFinite(v) || v < 0) errors.push('finePerDay must be >= 0')
    else updates.finePerDay = v
  }
  return { ok: errors.length === 0, errors, value: updates }
}

module.exports = { validateBookCreate, validateBookUpdate, validateSettingsUpdate, sanitizeGenres, clampRating }
