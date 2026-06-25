/**
 * CORRECT Feature Extraction for GREYC-NISLAB Dataset
 * 
 * The dataset expects features in this order:
 * 1. Press-to-Press (PP) times: time between consecutive keydowns
 * 2. Release-to-Release (RR) times: time between consecutive keyups
 * 3. Press-to-Release (PR) times: hold duration for each key
 * 4. Release-to-Press (RP) times: time between keyup and next keydown
 * 
 * Important: Features are based on the CHRONOLOGICAL ORDER of keystrokes,
 * NOT grouped by key character.
 */
export const extractFeatures = (keystrokeData) => {
  // Sort events by timestamp (chronological order)
  const events = [...keystrokeData].sort((a, b) => a.timestamp - b.timestamp)
  
  if (events.length === 0) {
    return new Array(92).fill(0)
  }

  // Extract press (keydown) and release (keyup) times in order
  const pressTimes = []
  const releaseTimes = []
  
  for (const event of events) {
    if (event.type === 'keydown') {
      pressTimes.push(event.timestamp)
    } else if (event.type === 'keyup') {
      releaseTimes.push(event.timestamp)
    }
  }

  // We need both press and release times
  // If we have more presses than releases, the last key might not have been released yet
  const n = Math.min(pressTimes.length, releaseTimes.length)
  
  // Use only complete pairs (press + release)
  const validPressTimes = pressTimes.slice(0, n)
  const validReleaseTimes = releaseTimes.slice(0, n)

  if (validPressTimes.length === 0 || validReleaseTimes.length === 0) {
    return new Array(92).fill(0)
  }

  const features = []

  // 1. Press-to-Press (PP) times
  // Time between consecutive keydown events
  // PP[i] = pressTimes[i+1] - pressTimes[i]
  for (let i = 0; i < validPressTimes.length - 1; i++) {
    const pp = validPressTimes[i + 1] - validPressTimes[i]
    features.push(pp)
  }

  // 2. Release-to-Release (RR) times
  // Time between consecutive keyup events
  // RR[i] = releaseTimes[i+1] - releaseTimes[i]
  for (let i = 0; i < validReleaseTimes.length - 1; i++) {
    const rr = validReleaseTimes[i + 1] - validReleaseTimes[i]
    features.push(rr)
  }

  // 3. Press-to-Release (PR) times (hold duration)
  // Time between keydown and keyup for the same key press
  // PR[i] = releaseTimes[i] - pressTimes[i]
  for (let i = 0; i < validPressTimes.length; i++) {
    const pr = validReleaseTimes[i] - validPressTimes[i]
    features.push(pr)
  }

  // 4. Release-to-Press (RP) times
  // Time between keyup and the next keydown
  // RP[i] = pressTimes[i+1] - releaseTimes[i]
  for (let i = 0; i < validPressTimes.length - 1; i++) {
    const rp = validPressTimes[i + 1] - validReleaseTimes[i]
    features.push(rp)
  }

  // Pad or truncate to exactly 92 features
  while (features.length < 92) {
    features.push(0)
  }
  
  // Truncate to 92 if we have more (shouldn't happen with the password length)
  const result = features.slice(0, 92)
  
  console.log(`✅ Extracted ${result.length} features (${result.filter(f => f !== 0).length} non-zero)`)
  console.log(`📊 First 10 features:`, result.slice(0, 10))
  console.log(`📊 Last 10 features:`, result.slice(-10))
  
  return result
}