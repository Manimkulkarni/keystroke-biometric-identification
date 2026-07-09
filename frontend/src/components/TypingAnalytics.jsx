import React from 'react';

function TypingAnalytics({ events, features }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md mt-6">
        <p className="text-gray-500 text-center">Type the password to see analytics</p>
      </div>
    );
  }

  // Convert 100ns ticks to milliseconds
  const toMs = (value) => Math.round(value / 10000);

  // Calculate metrics from keystroke events
  const calculateMetrics = () => {
    // Get keydown/keyup pairs
    const keyEvents = {};
    events.forEach(e => {
      if (!keyEvents[e.key]) keyEvents[e.key] = { down: [], up: [] };
      if (e.type === 'keydown') keyEvents[e.key].down.push(e.timestamp);
      else keyEvents[e.key].up.push(e.timestamp);
    });

    const holds = [];
    const flights = [];
    const keys = Object.keys(keyEvents);
    
    for (const key of keys) {
      const ev = keyEvents[key];
      for (let i = 0; i < Math.min(ev.down.length, ev.up.length); i++) {
        holds.push(ev.up[i] - ev.down[i]);
      }
    }

    for (let i = 0; i < events.length - 1; i++) {
      if (events[i].type === 'keyup' && events[i+1].type === 'keydown') {
        flights.push(events[i+1].timestamp - events[i].timestamp);
      }
    }

    const avgHold = holds.length ? holds.reduce((a,b) => a + b, 0) / holds.length : 0;
    const avgFlight = flights.length ? flights.reduce((a,b) => a + b, 0) / flights.length : 0;
    const wpm = avgFlight > 0 ? Math.round(60000 / avgFlight / 5) : 0;

    // Feature groups - count features by type
    // PP: positions 0-20 (21 values)
    // RR: positions 21-41 (21 values)  
    // PR: positions 42-63 (22 values)
    // RP: positions 64-84 (21 values)
    const pp = features.slice(0, 21);
    const rr = features.slice(21, 42);
    const pr = features.slice(42, 64);
    const rp = features.slice(64, 85);

    // Calculate averages in milliseconds
    const avgPP = pp.length ? toMs(pp.reduce((a,b) => a + b, 0) / pp.length) : 0;
    const avgRR = rr.length ? toMs(rr.reduce((a,b) => a + b, 0) / rr.length) : 0;
    const avgPR = pr.length ? toMs(pr.reduce((a,b) => a + b, 0) / pr.length) : 0;
    const avgRP = rp.length ? toMs(rp.reduce((a,b) => a + b, 0) / rp.length) : 0;

    // For bar scaling - use the max of all feature averages
    const maxAvg = Math.max(avgPP, avgRR, avgPR, avgRP, 1);

    return { avgHold, avgFlight, wpm, avgPP, avgRR, avgPR, avgRP, maxAvg };
  };

  const metrics = calculateMetrics();

  // Helper to render a feature bar with percentages
  const renderFeatureBar = (name, value, maxVal) => {
    const pct = maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0;
    
    return (
      <div className="flex items-center gap-3">
        <span className="w-12 text-sm font-medium text-gray-600">{name}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-16 text-sm text-gray-500">{value}ms</span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Typing Analytics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Avg Hold Time</p>
          <p className="text-2xl font-bold text-indigo-600">{Math.round(metrics.avgHold)} ms</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Avg Flight Time</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(metrics.avgFlight)} ms</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Typing Speed</p>
          <p className="text-2xl font-bold text-green-600">{metrics.wpm} WPM</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Events Captured</p>
          <p className="text-2xl font-bold text-yellow-600">{events.length}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 mb-2">Feature Averages (ms)</p>
        {renderFeatureBar('PP', metrics.avgPP, metrics.maxAvg)}
        {renderFeatureBar('RR', metrics.avgRR, metrics.maxAvg)}
        {renderFeatureBar('PR', metrics.avgPR, metrics.maxAvg)}
        {renderFeatureBar('RP', metrics.avgRP, metrics.maxAvg)}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">
          PP = Press-to-Press · RR = Release-to-Release · PR = Press-to-Release · RP = Release-to-Press
        </p>
      </div>
    </div>
  );
}

export default TypingAnalytics;