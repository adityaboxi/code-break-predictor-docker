import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Start a new analysis job.
 * POST /api/analysis/start
 * Body: { repoUrl, futureDate }
 * Returns: { jobId }
 */
export const startAnalysis = async ({ repoUrl, futureDate }) => {
  const { data } = await api.post('/analysis/start', { repoUrl, futureDate })
  return data
}

/**
 * Poll status of an ongoing analysis job.
 * GET /api/analysis/status/:id
 * Returns: { status, progress, message }
 */
export const getAnalysisStatus = async (jobId) => {
  const { data } = await api.get(`/analysis/status/${jobId}`)
  return data
}

/**
 * Fetch final analysis results.
 * GET /api/analysis/results/:id
 * Returns: { repoUrl, futureDate, packages: [...] }
 */
export const getAnalysisResults = async (jobId) => {
  const { data } = await api.get(`/analysis/results/${jobId}`)
  return data
}
