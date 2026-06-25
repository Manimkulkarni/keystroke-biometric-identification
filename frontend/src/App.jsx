import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Result from './pages/Result'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              ⌨️ TypePrint
            </Link>
          </div>
        </nav>
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App