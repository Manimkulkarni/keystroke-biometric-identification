import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingBox from '../components/TypingBox'
import { predict } from '../services/api'  // Use the feature-based endpoint
import { extractFeatures } from '../services/featureExtractor'

const PASSWORD = "united states of america"

function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleTypingComplete = async (keystrokeData) => {
    console.log('📊 Keystroke data received:', keystrokeData.length, 'events')
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Extract features from keystroke events
      console.log('🔧 Extracting features...')
      const features = extractFeatures(keystrokeData)
      
      console.log('📊 Features extracted:', features.length)
      console.log('📊 Non-zero features:', features.filter(f => f !== 0).length)
      
      // Send features to backend (using the feature-based endpoint)
      console.log('📤 Sending features to backend...')
      const result = await predict(features)
      
      console.log('📥 Prediction result:', result)
      
      // Navigate to results page with data
      navigate('/result', { state: { result } })
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message || 'Failed to process typing data')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🔐 Type to Identify
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Type the password below to verify your identity through keystroke biometrics
        </p>
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600">Password to type:</p>
          <p className="text-xl font-mono font-bold text-indigo-600">
            {PASSWORD}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <TypingBox 
          password={PASSWORD}
          onComplete={handleTypingComplete}
          isLoading={isLoading}
        />

        {isLoading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Analyzing your typing pattern...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home