import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for debugging
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

// Add response interceptor for debugging
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

export const predictFromKeystrokes = async (events) => {
  try {
    console.log(`📤 Sending ${events.length} keystroke events to backend`)
    // FIXED: Use the correct endpoint with /api/v1 prefix
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

export const predict = async (features) => {
  try {
    // FIXED: Use the correct endpoint with /api/v1 prefix
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