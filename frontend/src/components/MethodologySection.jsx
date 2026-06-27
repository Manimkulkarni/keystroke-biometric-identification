import React from 'react'

function MethodologySection({ title, children, className = '' }) {
  return (
    <section className={`mb-12 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-200 pb-2">
        {title}
      </h2>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}

export default MethodologySection