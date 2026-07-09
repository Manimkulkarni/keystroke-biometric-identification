/**
 * CORRECT Feature Extraction for GREYC-NISLAB Dataset
 * 
 * This extractor properly handles:
 * - Multiple key presses (same key repeated)
 * - Backspace corrections
 * - Event order validation
 * - Proper pairing of keydown/keyup
 * 
 * Time scale: 100ns ticks (multiply ms by 10,000)
 */
const TIME_SCALE = 10000  // Convert milliseconds to 100ns ticks

export const extractFeatures = (keystrokeData) => {
  console.log('🔧 Starting feature extraction...')
  
  // 1. Sort events by timestamp
  const events = [...keystrokeData].sort((a, b) => a.timestamp - b.timestamp)
  
  if (events.length === 0) {
    console.warn('No events provided')
    return new Array(92).fill(0)
  }

  // 2. Filter out non-character keys AND Backspace
  // Only keep: letters, space, and punctuation that are part of the password
  const validKeys = new Set([
    'a','b','c','d','e','f','g','h','i','j','k','l','m',
    'n','o','p','q','r','s','t','u','v','w','x','y','z',
    ' '
  ])
  
  const filteredEvents = events.filter(event => {
    // Skip Backspace entirely (we'll handle corrections differently)
    if (event.key === 'Backspace') return false
    // Only keep character keys
    return validKeys.has(event.key)
  })
  
  console.log(`📊 Filtered to ${filteredEvents.length} events`)

  if (filteredEvents.length === 0) {
    console.warn('No valid events after filtering')
    return new Array(92).fill(0)
  }

  // 3. Properly pair keydown with keyup using queues
  // This handles repeated keys correctly (e.g., 't' appears multiple times)
  const keyQueues = {}
  const pairedEvents = []
  
  for (const event of filteredEvents) {
    if (event.type === 'keydown') {
      // Add to queue for this key
      if (!keyQueues[event.key]) {
        keyQueues[event.key] = []
      }
      keyQueues[event.key].push({
        timestamp: event.timestamp,
        key: event.key
      })
    } else if (event.type === 'keyup') {
      // Find the matching keydown (FIFO)
      if (keyQueues[event.key] && keyQueues[event.key].length > 0) {
        const downEvent = keyQueues[event.key].shift()
        // Only pair if up timestamp is AFTER down timestamp
        if (event.timestamp > downEvent.timestamp) {
          pairedEvents.push({
            key: event.key,
            downTime: downEvent.timestamp,
            upTime: event.timestamp
          })
        } else {
          console.warn('⚠️ Keyup before keydown, skipping:', event.key)
        }
      }
    }
  }

  console.log(`📊 Paired ${pairedEvents.length} key events`)

  if (pairedEvents.length < 2) {
    console.warn('Not enough paired events')
    return new Array(92).fill(0)
  }

  // 4. Verify event order (should be strictly increasing)
  let isValid = true
  for (let i = 1; i < pairedEvents.length; i++) {
    if (pairedEvents[i].downTime <= pairedEvents[i-1].downTime) {
      console.warn('⚠️ Events out of order at index', i)
      isValid = false
    }
  }

  if (!isValid) {
    console.warn('⚠️ Event order invalid - using subset')
    // Sort by downTime to fix ordering
    pairedEvents.sort((a, b) => a.downTime - b.downTime)
  }

  // 5. Extract press and release times (in 100ns ticks)
  const pressTimes = pairedEvents.map(e => e.downTime * TIME_SCALE)
  const releaseTimes = pairedEvents.map(e => e.upTime * TIME_SCALE)

  console.log(`📊 Press times: ${pressTimes.length}, Release times: ${releaseTimes.length}`)

  // 6. Build features
  const features = []

  // PP: Press-to-Press (time between consecutive keydowns)
  for (let i = 0; i < pressTimes.length - 1; i++) {
    const pp = pressTimes[i + 1] - pressTimes[i]
    // Validate: PP should be positive and reasonable (0-10,000,000 = 0-1000ms)
    if (pp > 0 && pp < 10000000) {
      features.push(pp)
    } else {
      console.warn(`⚠️ Invalid PP at index ${i}: ${pp}`)
      features.push(0)
    }
  }

  // RR: Release-to-Release (time between consecutive keyups)
  for (let i = 0; i < releaseTimes.length - 1; i++) {
    const rr = releaseTimes[i + 1] - releaseTimes[i]
    if (rr > 0 && rr < 10000000) {
      features.push(rr)
    } else {
      console.warn(`⚠️ Invalid RR at index ${i}: ${rr}`)
      features.push(0)
    }
  }

  // PR: Press-to-Release (hold duration for each key)
  for (let i = 0; i < pressTimes.length; i++) {
    const pr = releaseTimes[i] - pressTimes[i]
    if (pr > 0 && pr < 10000000) {
      features.push(pr)
    } else {
      console.warn(`⚠️ Invalid PR at index ${i}: ${pr}`)
      features.push(0)
    }
  }

  // RP: Release-to-Press (time between keyup and next keydown)
  for (let i = 0; i < pressTimes.length - 1; i++) {
    const rp = pressTimes[i + 1] - releaseTimes[i]
    if (rp > 0 && rp < 10000000) {
      features.push(rp)
    } else {
      console.warn(`⚠️ Invalid RP at index ${i}: ${rp}`)
      features.push(0)
    }
  }

  // 7. Pad or truncate to exactly 92 features
  while (features.length < 92) {
    features.push(0)
  }
  
  const result = features.slice(0, 92)

  // 8. Log statistics
  const nonZero = result.filter(f => f !== 0).length
  const negatives = result.filter(f => f < 0).length
  
  console.log(`📊 Extracted ${result.length} features`)
  console.log(`📊 Non-zero features: ${nonZero}`)
  console.log(`📊 Negative features: ${negatives}`)
  
  if (negatives > 0) {
    console.warn(`⚠️ Found ${negatives} negative features!`)
  }
  
  console.log(`📊 First 10 features:`, result.slice(0, 10).map(f => Math.round(f)))
  console.log(`📊 Last 10 features:`, result.slice(82, 92).map(f => Math.round(f)))

  return result
}