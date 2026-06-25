import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import PredictionCard from '../components/PredictionCard'
import Top5Table from '../components/Top5Table'
import ConfidenceBar from '../components/ConfidenceBar'

function Result() {
  const location = useLocation()
  const { result, features } = location.state || {}

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No prediction data available.</p>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">
          Go back to type
        </Link>
      </div>
    )
  }

  const { predicted_user, confidence, top5_predictions } = result

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          🎯 Identification Results
        </h2>

        <PredictionCard 
          userId={predicted_user} 
          confidence={confidence} 
        />

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Confidence Distribution
          </h3>
          <ConfidenceBar 
            predictions={top5_predictions}
            maxConfidence={confidence}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Top 5 Possible Users
          </h3>
          <Top5Table predictions={top5_predictions} />
        </div>

        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            🔄 Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Result