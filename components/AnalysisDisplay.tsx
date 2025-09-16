import React from 'react';
import { AnalysisReport } from '../types';
import { SparklesIcon } from './icons';

interface AnalysisDisplayProps {
  report: AnalysisReport;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-6 rounded-lg bg-[#0d1117] border border-[#30363d] transition-transform duration-300 hover:scale-[1.02]">
    <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
    <div className="text-[#c9d1d9] space-y-3 whitespace-pre-wrap">{children}</div>
  </div>
);


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ report }) => {
  // Helper to format text with potential markdown-like lists
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc">{trimmedLine.substring(2)}</li>;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div id="report-container" className="bg-[#161b22] p-8 rounded-xl border border-[#30363d] shadow-2xl animate-fade-in-up space-y-6">
       <h2 className="text-3xl font-bold text-center text-white flex items-center justify-center gap-2">
        <SparklesIcon className="w-8 h-8 text-[#58a6ff]" />
        AI-Generated Analysis
      </h2>

      <Section title="🚀 Project Overview">
        {formatText(report.projectOverview.summary)}
      </Section>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="🎨 Visual & UX Analysis">
            <h4 className="font-semibold text-slate-300">Overall Impression</h4>
            <p className="text-sm text-slate-400 mb-2">{formatText(report.visualAnalysis.overallImpression)}</p>

             <h4 className="font-semibold text-slate-300 mt-4">UI/UX Feedback</h4>
            <p className="text-sm text-slate-400 mb-2">{formatText(report.visualAnalysis.uiUxFeedback)}</p>

            <h4 className="font-semibold text-slate-300 mt-4">Presentation Clarity</h4>
            <p className="text-sm text-slate-400">{formatText(report.visualAnalysis.presentationClarity)}</p>
        </Section>
        
        <Section title="💻 Code Insights">
            <h4 className="font-semibold text-slate-300">Recent Activity Summary</h4>
            <p className="text-sm text-slate-400">{formatText(report.codeAnalysis.recentActivity)}</p>
        </Section>
      </div>

      <Section title="✅ Actionable Suggestions">
        <ul className="list-disc list-inside space-y-2">
          {report.actionableSuggestions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

export default AnalysisDisplay;
