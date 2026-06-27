export const methodologyData = {
  overview: {
    title: "Project Overview",
    content: `TypePrint is an end-to-end keystroke biometric identification system built using the GREYC-NISLAB benchmark dataset. The project demonstrates the complete machine learning workflow, from exploratory data analysis and model development to backend deployment and browser-based inference.`
  },
  
  dataset: {
    title: "Dataset",
    details: [
      { label: "Name", value: "GREYC-NISLAB Keystroke Benchmark" },
      { label: "Users", value: "110 participants" },
      { label: "Samples per user", value: "20" },
      { label: "Passwords", value: "5 different passwords" },
      { label: "Feature dimensions", value: "64 to 92 (varies by password)" }
    ],
    passwordTable: [
      { password: "P1", features: 64, accuracy: 71.4 },
      { password: "P2", features: 68, accuracy: 76.1 },
      { password: "P3", features: 68, accuracy: 72.3 },
      { password: "P4", features: 84, accuracy: 80.2 },
      { password: "P5 (Used)", features: 92, accuracy: 86.1, highlight: true }
    ]
  },
  
  eda: {
    title: "Exploratory Data Analysis",
    findings: [
      {
        title: "Balanced Dataset",
        description: "✓ 110 users with exactly 20 samples each - perfectly balanced classes"
      },
      {
        title: "Password Complexity Matters",
        description: "Longer passwords with more characters provide better identification accuracy. P5 (92 features) achieved 86.1% accuracy vs 71.4% for P1 (64 features)."
      },
      {
        title: "User Clustering",
        description: "PCA visualization shows that different users form partially separable clusters in the feature space."
      }
    ]
  },
  
  modelComparison: {
    title: "Model Comparison",
    models: [
      { name: "Random Forest", accuracy: 86.1, description: "Best performing model" },
      { name: "XGBoost", accuracy: 58.2, description: "Second best" },
      { name: "SVM (RBF)", accuracy: 82.3, description: "Good but slower" },
      { name: "K-Nearest Neighbors", accuracy: 78.9, description: "Solid baseline" },
      { name: "Logistic Regression", accuracy: 65.4, description: "Limited by complexity" }
    ]
  },
  
  architecture: {
    title: "System Architecture",
    flow: [
      "User types password in browser",
      "Keystroke capture (keydown/keyup events)",
      "Feature extraction (PP, RR, PR, RP)",
      "92-dimensional feature vector",
      "FastAPI backend receives request",
      "Random Forest model predicts user",
      "Top-5 predictions with confidence scores",
      "Results displayed to user"
    ]
  },
  
  featureExtraction: {
    title: "Feature Extraction",
    description: "The GREYC-NISLAB dataset uses four types of timing features:",
    features: [
      {
        name: "PP (Press-to-Press)",
        description: "Time between consecutive keydown events",
        formula: "PP[i] = Press[i+1] - Press[i]"
      },
      {
        name: "RR (Release-to-Release)",
        description: "Time between consecutive keyup events",
        formula: "RR[i] = Release[i+1] - Release[i]"
      },
      {
        name: "PR (Press-to-Release)",
        description: "Hold duration of each key",
        formula: "PR[i] = Release[i] - Press[i]"
      },
      {
        name: "RP (Release-to-Press)",
        description: "Time between keyup and next keydown",
        formula: "RP[i] = Press[i+1] - Release[i]"
      }
    ]
  },
  
  results: {
    title: "Benchmark Results",
    metrics: [
      { label: "Top-1 Accuracy", value: "86.1%" },
      { label: "Top-5 Accuracy", value: "97.0%" },
      { label: "Training Samples", value: "1,760" },
      { label: "Test Samples", value: "440" },
      { label: "Classes (Users)", value: "110" }
    ]
  },
  
  findings: {
    title: "Key Findings",
    items: [
      "Longer passwords significantly improve identification accuracy (P5: 86.1% vs P1: 71.4%)",
      "Random Forest outperformed XGBoost on this dataset (86.1% vs 58.2%)",
      "Browser-based inference introduces a domain shift from benchmark conditions",
      "Hold times (PR) are the most discriminative feature type"
    ]
  },
  
  limitations: {
    title: "Limitations",
    items: [
      {
        title: "Closed-Set Classification",
        description: "The model identifies one of 110 benchmark participants. Unknown users are assigned to the closest learned identity."
      },
      {
        title: "Domain Shift",
        description: "Benchmark data was collected under controlled laboratory conditions with dedicated logging hardware. Browser-based keystroke capture introduces additional latency and variability."
      },
      {
        title: "Feature Representation",
        description: "The browser implementation approximates the benchmark feature representation. The original acquisition software and exact preprocessing pipeline are not publicly available."
      }
    ]
  },
  
  futureWork: {
    title: "Future Work",
    items: [
      "User enrollment system for new users",
      "Online learning to adapt to user typing changes",
      "Verification mode (1:1 matching) instead of identification (1:N)",
      "Continuous authentication during active typing sessions",
      "Deep learning approaches (LSTM, Transformers)",
      "Mobile application with touchscreen keystroke capture",
      "Multi-factor authentication (typing + face/voice)"
    ]
  }
}