import React from 'react'
import { Link } from 'react-router-dom'
import MethodologySection from '../components/MethodologySection'
import { methodologyData } from '../data/methodologyData'
import datasetSummary from '../data/dataset_summary.json'

const passwordAccuracyImg = '/images/password_accuracy.png'
const modelComparisonImg = '/images/model_comparison.png'
const pcaUsersImg = '/images/pca_users.png'
const featureImportanceImg = '/images/feature_importance.png'
const architectureFlowImg = '/images/architecture_flow.png'

function About() {
  const { 
    overview, 
    dataset, 
    eda, 
    modelComparison, 
    architecture, 
    featureExtraction,
    results,
    findings,
    limitations,
    futureWork 
  } = methodologyData

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            About TypePrint
          </h1>
          <p className="text-gray-600">
            A case study in keystroke biometric identification
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm flex-wrap">
            <a href="#overview" className="text-indigo-600 hover:text-indigo-800">Overview</a>
            <span className="text-gray-300">|</span>
            <a href="#dataset" className="text-indigo-600 hover:text-indigo-800">Dataset</a>
            <span className="text-gray-300">|</span>
            <a href="#eda" className="text-indigo-600 hover:text-indigo-800">EDA</a>
            <span className="text-gray-300">|</span>
            <a href="#model" className="text-indigo-600 hover:text-indigo-800">Model</a>
            <span className="text-gray-300">|</span>
            <a href="#results" className="text-indigo-600 hover:text-indigo-800">Results</a>
            <span className="text-gray-300">|</span>
            <a href="#limitations" className="text-indigo-600 hover:text-indigo-800">Limitations</a>
          </div>
        </div>

        {/* Overview */}
        <MethodologySection title=" Project Overview" id="overview">
          <p className="text-gray-700 leading-relaxed">
            {overview.content}
          </p>
        </MethodologySection>

        {/* Dataset */}
        <MethodologySection title=" Dataset" id="dataset">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dataset.details.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="text-lg font-semibold text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Password Comparison</h4>
            <img src={passwordAccuracyImg} alt="Password Accuracy Comparison" className="w-full rounded-lg shadow-md" />
            <p className="text-sm text-gray-500 mt-2">
               P5 (92 features) achieved the highest accuracy with the longest password
            </p>
          </div>
        </MethodologySection>

        {/* EDA */}
        <MethodologySection title=" Exploratory Data Analysis" id="eda">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700">PCA Visualization</h4>
              <p className="text-sm text-gray-600 mb-3">Different users form partially separable clusters in the feature space</p>
              <img src={pcaUsersImg} alt="PCA Visualization" className="w-full rounded-lg shadow-md" />
            </div>
            {eda.findings.map((finding, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700">{finding.title}</h4>
                <p className="text-gray-600 text-sm">{finding.description}</p>
              </div>
            ))}
          </div>
        </MethodologySection>

        {/* Model Comparison */}
        <MethodologySection title=" Model Comparison" id="model">
          <img src={modelComparisonImg} alt="Model Comparison" className="w-full rounded-lg shadow-md mb-4" />
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modelComparison.models.map((model, idx) => (
                  <tr key={idx} className={model.name === 'Random Forest' ? 'bg-indigo-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {model.name}
                      {model.name === 'Random Forest' && ' 🏆'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{model.accuracy}%</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{model.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MethodologySection>

        {/* Architecture */}
        <MethodologySection title="System Architecture" id="architecture">
          <img src={architectureFlowImg} alt="System Architecture" className="w-full rounded-lg shadow-md mb-4" />
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-2">
              {architecture.flow.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </MethodologySection>

        {/* Feature Extraction */}
        <MethodologySection title="⚡ Feature Extraction" id="features">
          <p className="text-gray-700 mb-4">{featureExtraction.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureExtraction.features.map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-indigo-600">{feature.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 block">
                  {feature.formula}
                </code>
              </div>
            ))}
          </div>
        </MethodologySection>

        {/* Results */}
        <MethodologySection title="📈 Benchmark Results" id="results">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {results.metrics.map((metric, idx) => (
              <div key={idx} className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-4 text-center border border-indigo-100">
                <div className="text-2xl font-bold text-indigo-600">{metric.value}</div>
                <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">Feature Importance</h4>
            <img src={featureImportanceImg} alt="Feature Importance" className="w-full rounded-lg shadow-md" />
            <p className="text-sm text-gray-500 mt-2">Top 20 most important features for user identification</p>
          </div>
          
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800">🏆 Top-5 Accuracy: 97.0%</h4>
            <p className="text-sm text-green-700 mt-1">
              The correct user appears in the top 5 predictions 97% of the time
            </p>
          </div>
        </MethodologySection>

        {/* Key Findings */}
        <MethodologySection title="💡 Key Findings" id="findings">
          <ul className="space-y-2">
            {findings.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1">✦</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </MethodologySection>

        {/* Limitations */}
        <MethodologySection title="⚠️ Limitations" id="limitations">
          <div className="space-y-4">
            {limitations.items.map((item, idx) => (
              <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800">{item.title}</h4>
                <p className="text-sm text-yellow-700 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </MethodologySection>

        {/* Future Work */}
        <MethodologySection title="🚀 Future Work" id="future">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {futureWork.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </MethodologySection>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            🔐 Try the Live Demo
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            Built with React, FastAPI, and scikit-learn
          </div>
        </div>
      </div>
    </div>
  )
}

export default About