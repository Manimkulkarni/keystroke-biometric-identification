import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingBox from '../components/TypingBox'
import { predict, storeKeystroke } from '../services/api'
import { extractFeatures } from '../services/featureExtractor'

const PASSWORD = "united states of america"

function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const navigate = useNavigate()

  // Calculate metrics from events
  const calculateMetrics = (events) => {
    // Get keydown/keyup pairs
    const keyEvents = {}
    events.forEach(e => {
      if (!keyEvents[e.key]) keyEvents[e.key] = { down: [], up: [] }
      if (e.type === 'keydown') keyEvents[e.key].down.push(e.timestamp)
      else keyEvents[e.key].up.push(e.timestamp)
    })

    const holds = []
    const flights = []
    const keys = Object.keys(keyEvents)
    
    for (const key of keys) {
      const ev = keyEvents[key]
      for (let i = 0; i < Math.min(ev.down.length, ev.up.length); i++) {
        holds.push(ev.up[i] - ev.down[i])
      }
    }

    for (let i = 0; i < events.length - 1; i++) {
      if (events[i].type === 'keyup' && events[i+1].type === 'keydown') {
        flights.push(events[i+1].timestamp - events[i].timestamp)
      }
    }

    const avgHold = holds.length ? holds.reduce((a,b) => a + b, 0) / holds.length : 0
    const avgFlight = flights.length ? flights.reduce((a,b) => a + b, 0) / flights.length : 0
    const wpm = avgFlight > 0 ? Math.round(60000 / avgFlight / 5) : 0

    return { avgHold, avgFlight, wpm }
  }

  const handleTypingComplete = async (keystrokeData) => {
    console.log('📊 Keystroke data received:', keystrokeData.length, 'events')
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Extract features
      const features = extractFeatures(keystrokeData)
      
      // Calculate metrics
      const metrics = calculateMetrics(keystrokeData)
      
      // Store data if consent given
      if (consentGiven) {
        console.log('📤 Storing keystroke data with consent...')
        const storeResult = await storeKeystroke(features, {
          phrase: PASSWORD,
          typing_speed: metrics.wpm,
          hold_time_avg: metrics.avgHold,
          flight_time_avg: metrics.avgFlight
        })
        if (storeResult.success) {
          console.log('✅ Keystroke data stored (ID:', storeResult.sample_id, ')')
        } else {
          console.warn('⚠️ Failed to store keystroke:', storeResult.error)
        }
      } else {
        console.log('⏭️ Skipping storage (no consent)')
      }
      
      // Send for prediction
      console.log('📤 Sending features to backend...')
      const result = await predict(features)
      
      navigate('/result', { state: { result, features, events: keystrokeData } })
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
          Type the password below to find your closest matching typing profile
        </p>
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600">Password to type:</p>
          <p className="text-xl font-mono font-bold text-indigo-600">
            {PASSWORD}
          </p>
        </div>

        {/* Consent Checkbox */}
        <div className="mb-4 flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
            Help improve the model by anonymously storing this typing sample.
            <span className="text-gray-400 text-xs block mt-0.5">
              No personal information is collected. Data is used for research purposes only.
            </span>
          </label>
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