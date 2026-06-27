/**
 * CORRECT Feature Extraction for GREYC-NISLAB Dataset
 * 
 * The dataset uses 100ns ticks (1 tick = 100 nanoseconds = 0.0001 ms)
 * Browser performance.now() returns milliseconds
 * Convert: ms * 10,000 = 100ns ticks
 */
const TIME_SCALE = 10000  // Convert milliseconds to 100ns ticks

export const extractFeatures = (keystrokeData) => {
  // Sort events by timestamp
  const events = [...keystrokeData].sort((a, b) => a.timestamp - b.timestamp)
  
  if (events.length === 0) {
    return new Array(92).fill(0)
  }

  // Simulate typing with Backspace to get final text
  const allKeydowns = events.filter(e => e.type === 'keydown')
  let survivingKeydowns = []
  let currentText = []
  
  for (const event of allKeydowns) {
    if (event.key === 'Backspace') {
      if (currentText.length > 0) {
        currentText.pop()
        if (survivingKeydowns.length > 0) {
          survivingKeydowns.pop()
        }
      }
    } else if (event.key.length === 1) {
      currentText.push(event.key)
      survivingKeydowns.push(event)
    }
  }

  const typedText = currentText.join('')
  console.log('📝 Final text after Backspace handling:', typedText)

  // PROPER KEY PAIRING: Use queues for each key
  // This handles repeated letters correctly
  const keyQueues = {}  // { 'a': [downTime1, downTime2, ...], 'b': [...], ... }
  const pairedEvents = []  // [{downTime, upTime, key}, ...]
  
  for (const event of events) {
    // Skip backspace and other non-character keys
    if (event.key === 'Backspace' || event.key.length > 1) {
      continue
    }
    
    if (event.type === 'keydown') {
      // Add to queue for this key
      if (!keyQueues[event.key]) {
        keyQueues[event.key] = []
      }
      keyQueues[event.key].push(event.timestamp)
    } else if (event.type === 'keyup') {
      // Pop the earliest unmatched down for this key
      if (keyQueues[event.key] && keyQueues[event.key].length > 0) {
        const downTime = keyQueues[event.key].shift()
        pairedEvents.push({
          key: event.key,
          downTime: downTime,
          upTime: event.timestamp
        })
      }
    }
  }

  // Now filter paired events to only include those that survived Backspace
  // This is complex, but we can use the surviving keydowns as a reference
  const survivingTimestamps = new Set(survivingKeydowns.map(e => e.timestamp))
  const finalEvents = pairedEvents.filter(e => survivingTimestamps.has(e.downTime))

  if (finalEvents.length < 2) {
    console.warn('Not enough keystroke pairs for feature extraction')
    return new Array(92).fill(0)
  }

  // Extract press and release times
  const pressTimes = finalEvents.map(e => e.downTime * TIME_SCALE)  // Convert to 100ns ticks
  const releaseTimes = finalEvents.map(e => e.upTime * TIME_SCALE)  // Convert to 100ns ticks

  console.log(`📊 Paired ${finalEvents.length} key events`)
  console.log(`📊 First 3 pairs:`, finalEvents.slice(0, 3).map(e => ({
    key: e.key,
    down: e.downTime,
    up: e.upTime,
    hold: e.upTime - e.downTime
  })))

  const features = []

  // 1. Press-to-Press (PP)
  for (let i = 0; i < pressTimes.length - 1; i++) {
    features.push(pressTimes[i + 1] - pressTimes[i])
  }

  // 2. Release-to-Release (RR)
  for (let i = 0; i < releaseTimes.length - 1; i++) {
    features.push(releaseTimes[i + 1] - releaseTimes[i])
  }

  // 3. Press-to-Release (PR)
  for (let i = 0; i < pressTimes.length; i++) {
    features.push(releaseTimes[i] - pressTimes[i])
  }

  // 4. Release-to-Press (RP)
  for (let i = 0; i < pressTimes.length - 1; i++) {
    features.push(pressTimes[i + 1] - releaseTimes[i])
  }

  // Pad or truncate to exactly 92 features
  while (features.length < 92) {
    features.push(0)
  }
  
  const result = features.slice(0, 92)
  
  console.log(`📊 Extracted ${result.length} features`)
  console.log(`📊 First 20 features (100ns ticks):`, result.slice(0, 20))
  console.log(`📊 First 20 features (ms):`, result.slice(0, 20).map(f => f / 10000))
  
  return result
}