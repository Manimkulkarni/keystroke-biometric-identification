import React from 'react'

function Top5Table({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return <p className="text-gray-500">No predictions available</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bar
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {predictions.map((pred, index) => {
            const isTop = index === 0
            const percentage = (pred.confidence * 100).toFixed(1)
            const maxConfidence = predictions[0]?.confidence || 1
            const barWidth = (pred.confidence / maxConfidence) * 100

            return (
              <tr key={index} className={isTop ? 'bg-indigo-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{index + 1}
                  {isTop && ' 🏆'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {pred.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {percentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        isTop ? 'bg-indigo-600' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.max(barWidth, 5)}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Top5Table
