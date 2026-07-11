import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 Sending request:', {
      url: config.url,
      method: config.method,
      data: config.data
    })
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 Received response:', {
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================
// Prediction endpoints
// ============================================

export const predict = async (features) => {
  try {
    const response = await apiClient.post('/api/v1/predict', { features })
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Prediction failed')
    } else if (error.request) {
      throw new Error('No response from server. Is the backend running?')
    } else {
      throw new Error(error.message || 'Failed to make prediction')
    }
  }
}

export const predictFromKeystrokes = async (events) => {
  try {
    const response = await apiClient.post('/api/v1/predict-from-keystrokes', { events })
    return response.data
  } catch (error) {
    console.error('❌ Prediction failed:', error)
    if (error.response) {
      throw new Error(error.response.data.detail || 'Prediction failed')
    } else if (error.request) {
      throw new Error('No response from server. Is the backend running?')
    } else {
      throw new Error(error.message || 'Failed to make prediction')
    }
  }
}

// ============================================
// Data Collection endpoints (Phase 2)
// ============================================
export const storeKeystroke = async (features, metadata = {}) => {
  try {
    // Generate UUID for anonymous user
    const userId = metadata.user_id || crypto.randomUUID()
    
    const response = await apiClient.post('/api/v1/store-keystroke', {
      user_id: userId,
      features: features,
      phrase: metadata.phrase || 'united states of america',
      style: metadata.style || 'normal',
      user_agent: navigator.userAgent,
      typing_speed: metadata.typing_speed,
      hold_time_avg: metadata.hold_time_avg,
      flight_time_avg: metadata.flight_time_avg
    })
    console.log('✅ Keystroke stored:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Failed to store keystroke:', error)
    return { success: false, error: error.message }
  }
}

export const getDBStats = async () => {
  try {
    const response = await apiClient.get('/api/v1/db-stats')
    return response.data
  } catch (error) {
    console.error('Failed to get DB stats:', error)
    return { total_samples: 0, unique_users: 0, sources: {} }
  }
}

export const getSamples = async (limit = 100, source = null) => {
  try {
    const params = new URLSearchParams()
    params.append('limit', limit)
    if (source) params.append('source', source)
    const response = await apiClient.get(`/api/v1/samples?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Failed to get samples:', error)
    return []
  }
}

// ============================================
// Metadata endpoints
// ============================================

export const getMetadata = async () => {
  try {
    const response = await apiClient.get('/metadata')
    return response.data
  } catch (error) {
    throw new Error('Failed to fetch metadata')
  }
}

export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (error) {
    throw new Error('Backend is not healthy')
  }
}