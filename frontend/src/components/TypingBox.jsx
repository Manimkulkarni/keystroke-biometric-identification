import React, { useState, useEffect, useRef } from 'react'

function TypingBox({ password, onComplete, isLoading }) {
  const [typedText, setTypedText] = useState('')
  const [keystrokeData, setKeystrokeData] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [errors, setErrors] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e) => {
    const timestamp = performance.now()
    const key = e.key
    
    // Store keydown event
    setKeystrokeData(prev => [
      ...prev,
      { 
        type: 'keydown', 
        key, 
        timestamp,
        charCode: e.keyCode || e.which
      }
    ])
  }

  const handleKeyUp = (e) => {
    const timestamp = performance.now()
    const key = e.key
    
    // Store keyup event
    setKeystrokeData(prev => [
      ...prev,
      { 
        type: 'keyup', 
        key, 
        timestamp,
        charCode: e.keyCode || e.which
      }
    ])

    // Update typed text
    const currentText = e.target.value
    setTypedText(currentText)

    // Check for errors
    const expectedChar = password[typedText.length]
    if (typedText.length < password.length && e.key !== 'Backspace') {
      if (e.key !== expectedChar && expectedChar !== undefined) {
        setErrors(prev => [...prev, typedText.length])
      }
    }

    // Check completion
    if (currentText === password) {
      setIsComplete(true)
      // Wait a moment then process
      setTimeout(() => {
        if (keystrokeData.length > 0) {
          onComplete(keystrokeData)
        }
      }, 500)
    }
  }

  const handleReset = () => {
    setTypedText('')
    setKeystrokeData([])
    setIsComplete(false)
    setErrors([])
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="text"
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        disabled={isComplete || isLoading}
        placeholder="Start typing here..."
        className="w-full px-4 py-3 text-xl font-mono border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoFocus
      />

      <div className="flex items-center justify-between text-sm">
        <div className="space-x-4">
          <span className="text-gray-600">
            Characters: <span className="font-semibold">{typedText.length}/{password.length}</span>
          </span>
          {errors.length > 0 && (
            <span className="text-red-600">
              ⚠️ {errors.length} mistakes
            </span>
          )}
        </div>
        
        <button
          onClick={handleReset}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
          disabled={isLoading}
        >
          Reset
        </button>
      </div>

      {isComplete && !isLoading && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-center">
          ✅ Password complete! Analyzing your typing pattern...
        </div>
      )}
    </div>
  )
}

export default TypingBox