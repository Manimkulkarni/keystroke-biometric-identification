import React from 'react'

function ConfidenceBar({ predictions, maxConfidence }) {
  if (!predictions || predictions.length === 0) {
    return <p className="text-gray-500">No data available</p>
  }

  // Only show top 5
  const displayPredictions = predictions.slice(0, 5)

  return (
    <div className="space-y-3">
      {displayPredictions.map((pred, index) => {
        const percentage = (pred.confidence * 100).toFixed(1)
        const barWidth = (pred.confidence / maxConfidence) * 100

        return (
          <div key={index} className="flex items-center gap-3">
            <span className="w-12 text-sm font-medium text-gray-600">
              #{pred.user_id}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-full flex items-center justify-end px-2 text-xs font-semibold text-white transition-all duration-500 ${
                  index === 0 ? 'bg-indigo-600' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.max(barWidth, 5)}%` }}
              >
                {barWidth > 15 && `${percentage}%`}
              </div>
            </div>
            {barWidth <= 15 && (
              <span className="text-xs text-gray-500 w-12">{percentage}%</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ConfidenceBar