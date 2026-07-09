import React from 'react';

function Benchmark() {
  const passwordData = [
    { password: 'P5', features: 92, accuracy: 86.1 },
    { password: 'P4', features: 84, accuracy: 80.2 },
    { password: 'P2', features: 68, accuracy: 76.1 },
    { password: 'P3', features: 68, accuracy: 72.3 },
    { password: 'P1', features: 64, accuracy: 71.4 },
  ];

  const modelData = [
    { model: 'Random Forest', accuracy: 86.1 },
    { model: 'SVM (RBF)', accuracy: 82.3 },
    { model: 'KNN', accuracy: 78.9 },
    { model: 'Logistic Regression', accuracy: 65.4 },
    { model: 'XGBoost', accuracy: 58.2 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📊 Benchmark Results</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Model Performance (P5)</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modelData.map((m) => (
                  <tr key={m.model} className={m.model === 'Random Forest' ? 'bg-indigo-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {m.model} {m.model === 'Random Forest' ? '🏆' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{m.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">Top-5 Accuracy: 97.0%</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Password Comparison</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {passwordData.map((p) => (
                  <tr key={p.password} className={p.password === 'P5' ? 'bg-indigo-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.password}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.features}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{p.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">⭐ P5 (92 features) achieved the highest accuracy</p>
        </div>
      </div>
    </div>
  );
}

export default Benchmark;