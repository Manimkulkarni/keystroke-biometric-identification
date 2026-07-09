import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingBox from '../components/TypingBox'
import { storeKeystroke } from '../services/api'
import { extractFeatures } from '../services/featureExtractor'

const PASSWORD = "united states of america"

const STYLES = [
  { id: 'normal', label: '🔄 Normal Typing', description: 'Type at your natural pace' },
  { id: 'fast', label: '⚡ Fast Typing', description: 'Type as fast as you can' },
  { id: 'slow', label: '🐢 Slow Typing', description: 'Type deliberately slowly' },
  { id: 'onehand', label: '✋ One-Hand Typing', description: 'Type with one hand only' },
]

const SAMPLES_PER_STYLE = 3  // Reduced from 5 for better UX

function TypingExperiment() {
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0)
  const [samples, setSamples] = useState({})
  const [currentStyleSamples, setCurrentStyleSamples] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const currentStyle = STYLES[currentStyleIndex]
  const totalStyles = STYLES.length
  const samplesNeeded = SAMPLES_PER_STYLE

  // Calculate total progress
  const totalSamples = Object.values(samples).reduce((sum, arr) => sum + arr.length, 0)
  const totalNeeded = totalStyles * samplesNeeded
  const progress = Math.round((totalSamples / totalNeeded) * 100)

  // Calculate metrics from events
  const calculateMetrics = (events) => {
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
    setIsLoading(true)
    setStatus('Processing...')
    
    try {
      // Extract features
      const features = extractFeatures(keystrokeData)
      const metrics = calculateMetrics(keystrokeData)
      
      // Store with style tag
      const storeResult = await storeKeystroke(features, {
        phrase: PASSWORD,
        style: currentStyle.id,
        typing_speed: metrics.wpm,
        hold_time_avg: metrics.avgHold,
        flight_time_avg: metrics.avgFlight
      })
      
      if (storeResult.success) {
        // Update local state
        const newSamples = [...currentStyleSamples, {
          features,
          metrics,
          style: currentStyle.id,
          sample_id: storeResult.sample_id
        }]
        setCurrentStyleSamples(newSamples)
        setSamples({
          ...samples,
          [currentStyle.id]: newSamples
        })
        
        const done = newSamples.length
        setStatus(`✅ Sample ${done}/${samplesNeeded} collected`)
        
        // Check if style is complete
        if (done >= samplesNeeded) {
          // Move to next style
          if (currentStyleIndex < totalStyles - 1) {
            setStatus(`🎯 Moving to next style...`)
            setTimeout(() => {
              setCurrentStyleIndex(currentStyleIndex + 1)
              setCurrentStyleSamples([])
              setIsLoading(false)
            }, 1000)
          } else {
            setStatus('🎉 All styles complete!')
            setIsComplete(true)
            setIsLoading(false)
          }
        } else {
          setIsLoading(false)
        }
      } else {
        setStatus(`❌ Failed: ${storeResult.error}`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus(`❌ Error: ${error.message}`)
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentStyleIndex(0)
    setSamples({})
    setCurrentStyleSamples([])
    setIsComplete(false)
    setStatus('')
    setIsLoading(false)
  }

  const handleContinue = () => {
    navigate('/')
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Data Collection Complete!
          </h2>
          <p className="text-gray-600 mb-4">
            You've contributed {totalSamples} samples across {totalStyles} typing styles.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              Thank you for helping improve the model! Your data will be used to build a better browser-native keystroke biometric system.
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Demo
          </button>
          <button
            onClick={handleReset}
            className="ml-4 text-gray-600 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          🧪 Typing Experiment
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Help us collect data by typing in different styles
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Style Card */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-indigo-700">{currentStyle.label}</h3>
              <p className="text-sm text-indigo-600">{currentStyle.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Style {currentStyleIndex + 1}/{totalStyles}</p>
              <p className="text-lg font-bold text-indigo-700">
                {currentStyleSamples.length}/{samplesNeeded}
              </p>
            </div>
          </div>
        </div>

        {/* Password Display */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center border border-gray-200">
          <p className="text-sm text-gray-600">Type this password:</p>
          <p className="text-xl font-mono font-bold text-indigo-600">
            {PASSWORD}
          </p>
        </div>

        {/* Typing Box */}
        <TypingBox 
          password={PASSWORD}
          onComplete={handleTypingComplete}
          isLoading={isLoading}
        />

        {/* Status */}
        {status && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600">{status}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Try to type naturally for each style. 
            The more varied your samples, the better the model will learn.
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isLoading}
        >
          Reset Experiment
        </button>
      </div>
    </div>
  )
}

export default TypingExperiment