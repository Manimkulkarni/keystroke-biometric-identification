import React from 'react'

function PredictionCard({ userId, confidence }) {
  const confidencePercent = (confidence * 100).toFixed(1)
  const isHighConfidence = confidence > 0.7

  return (
    <div className={`rounded-lg p-6 text-center ${
      isHighConfidence ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="text-sm text-gray-600 mb-2">Predicted User</div>
      <div className="text-5xl font-bold text-indigo-600 mb-2">
        #{userId}
      </div>
      <div className="flex items-center justify-center gap-2">
        <span className={`text-lg font-semibold ${
          isHighConfidence ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {confidencePercent}% Confidence
        </span>
        {isHighConfidence ? (
          <span className="text-2xl">✅</span>
        ) : (
          <span className="text-2xl">⚠️</span>
        )}
      </div>
      {!isHighConfidence && (
        <p className="text-sm text-gray-600 mt-2">
          Low confidence prediction - consider trying again
        </p>
      )}
    </div>
  )
}

export default PredictionCard