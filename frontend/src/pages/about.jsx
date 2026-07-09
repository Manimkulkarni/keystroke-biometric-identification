import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">About TypePrint</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Problem</h2>
            <p>Keystroke dynamics can identify individuals by their typing rhythm. This project demonstrates a complete pipeline from data to deployment.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Dataset</h2>
            <p>GREYC-NISLAB Keystroke Benchmark: 110 users, 20 samples each, 5 passwords (64-92 features).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Feature Extraction</h2>
            <p>PP (Press-to-Press), RR (Release-to-Release), PR (Press-to-Release), RP (Release-to-Press) — 92 features total.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Model</h2>
            <p>Random Forest: 86.1% accuracy, 97.0% top-5 accuracy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Limitations</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-sm text-yellow-800">
                <strong>Closed-set classifier:</strong> The model can only identify among 110 benchmark users. 
                Browser typing differs from benchmark data. Live results show closest match, not positive identification.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Lessons Learned</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Benchmark accuracy ≠ production accuracy</li>
              <li>Feature extraction must match training exactly</li>
              <li>Browser timing differs from controlled environments</li>
              <li>Closed-set classifiers are limited in real-world scenarios</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            Try the Demo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;