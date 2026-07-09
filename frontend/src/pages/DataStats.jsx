import React, { useState, useEffect } from 'react'
import { getDBStats } from '../services/api'

function DataStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDBStats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-600">Error loading stats: {error}</p>
        </div>
      </div>
    )
  }

  const {
    total_samples = 0,
    unique_users = 0,
    sources = {},
    browsers = {},
    os = {},
    phrases = {},
    styles = {},
    avg_typing_speed = 0,
    avg_hold_time = 0,
    avg_flight_time = 0,
    avg_quality_score = 0,
    recent_days = {}
  } = stats || {}

  // Sort recent days
  const sortedDays = Object.entries(recent_days).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dataset Statistics</h1>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg text-center border border-indigo-100">
            <p className="text-sm text-gray-500">Total Samples</p>
            <p className="text-2xl font-bold text-indigo-600">{total_samples}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
            <p className="text-sm text-gray-500">Unique Users</p>
            <p className="text-2xl font-bold text-green-600">{unique_users}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
            <p className="text-sm text-gray-500">Avg WPM</p>
            <p className="text-2xl font-bold text-blue-600">{avg_typing_speed || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
            <p className="text-sm text-gray-500">Avg Quality</p>
            <p className="text-2xl font-bold text-yellow-600">{avg_quality_score || 0}%</p>
          </div>
        </div>

        {/* Timing Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
            <p className="text-sm text-gray-500">Avg Hold Time</p>
            <p className="text-2xl font-bold text-purple-600">{Math.round(avg_hold_time)} ms</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg text-center border border-pink-100">
            <p className="text-sm text-gray-500">Avg Flight Time</p>
            <p className="text-2xl font-bold text-pink-600">{Math.round(avg_flight_time)} ms</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg text-center border border-teal-100">
            <p className="text-sm text-gray-500">Unique Phrases</p>
            <p className="text-2xl font-bold text-teal-600">{Object.keys(phrases).length}</p>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Browser Distribution */}
          {Object.keys(browsers).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Browser Distribution</h3>
              <div className="space-y-2">
                {Object.entries(browsers).map(([browser, count]) => {
                  const percentage = total_samples > 0 ? Math.round((count / total_samples) * 100) : 0
                  return (
                    <div key={browser} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{browser}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* OS Distribution */}
          {Object.keys(os).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">OS Distribution</h3>
              <div className="space-y-2">
                {Object.entries(os).map(([osName, count]) => {
                  const percentage = total_samples > 0 ? Math.round((count / total_samples) * 100) : 0
                  return (
                    <div key={osName} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{osName}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Phrases */}
        {Object.keys(phrases).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Phrases Used</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(phrases).map(([phrase, count]) => (
                <span key={phrase} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-200">
                  "{phrase}" × {count}
                </span>
              ))}
            </div>
          </div>
        )}
        {Object.keys(styles).length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Typing Styles</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(styles).map(([style, count]) => (
                <span key={style} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-200">
                  {style}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {sortedDays.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Recent Activity</h3>
            <div className="space-y-1">
              {sortedDays.map(([date, count]) => {
                const maxCount = Math.max(...Object.values(recent_days), 1)
                const percentage = Math.min((count / maxCount) * 100, 100)
                
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-32">{date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {total_samples === 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-gray-500">No data collected yet. Type the password with consent to start building your dataset.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataStats