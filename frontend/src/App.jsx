import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'
import About from './pages/About'
import Benchmark from './pages/Benchmark'
import DataStats from './pages/DataStats'
import TypingExperiment from './pages/TypingExperiment'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              ⌨️ TypePrint
            </Link>
            <div className="flex gap-6">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Demo
              </Link>
              <Link to="/benchmark" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Benchmark
              </Link>
              <Link to="/stats" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Stats
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
                About
              </Link>
              <Link to="/experiment" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Experiment
              </Link>
              <a 
                href="https://github.com/Manimkulkarni/keystroke-biometric-identification" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
            <Route path="/about" element={<About />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="/stats" element={<DataStats />} />
            <Route path="/experiment" element={<TypingExperiment />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App