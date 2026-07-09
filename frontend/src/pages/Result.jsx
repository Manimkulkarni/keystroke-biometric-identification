import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import PredictionCard from '../components/PredictionCard'
import Top5Table from '../components/Top5Table'
import ConfidenceBar from '../components/ConfidenceBar'
import TypingAnalytics from '../components/TypingAnalytics'  // Fix: correct component name

function Result() {
  const location = useLocation()
  const { result, features, events } = location.state || {}

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

  // Handle rejection (if implemented)
  if (result.status === 'rejected') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              User Not Recognized
            </h2>
            <p className="text-gray-600 mb-4">
              {result.reason || "Your typing pattern doesn't match any enrolled user."}
            </p>
            <Link 
              to="/" 
              className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { predicted_user, confidence, top5_predictions } = result

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          🎯 Closest Benchmark Profile
        </h2>

        {/* Honest Explanation */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This identifies the <em>closest matching typing behavior</em> among our 110 benchmark participants. It does <strong>not</strong> uniquely identify you as a specific person.
          </p>
        </div>

        {/* Analytics Dashboard */}
        <TypingAnalytics events={events} features={features} />

        <div className="mt-8">
          <PredictionCard userId={predicted_user} confidence={confidence} />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Confidence Distribution
          </h3>
          <ConfidenceBar predictions={top5_predictions} maxConfidence={confidence} />
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