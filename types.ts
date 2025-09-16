export interface FrameData {
  mimeType: string;
  data: string;
}

export interface AnalysisReport {
  projectOverview: {
    summary: string;
  };
  visualAnalysis: {
    overallImpression: string;
    uiUxFeedback: string;
    presentationClarity: string;
  };
  codeAnalysis: {
    recentActivity: string;
  };
  actionableSuggestions: string[];
}
