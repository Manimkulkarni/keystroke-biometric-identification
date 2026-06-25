import { useState, useCallback } from 'react'

export const useKeystrokes = () => {
  const [events, setEvents] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  const startRecording = useCallback(() => {
    setEvents([])
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  const recordEvent = useCallback((event) => {
    if (isRecording) {
      setEvents(prev => [...prev, event])
    }
  }, [isRecording])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return {
    events,
    isRecording,
    startRecording,
    stopRecording,
    recordEvent,
    clearEvents
  }
}

export default useKeystrokes