import React, { useState, useCallback, useEffect } from 'react';
import VideoUpload from './components/VideoUpload';
import AnalysisDisplay from './components/AnalysisDisplay';
import Loader from './components/Loader';
import { generateAnalysis } from './services/geminiService';
import { SparklesIcon, VideoIcon, GithubIcon, GitBranchIcon } from './components/icons';
import type { AnalysisReport } from './types';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('main');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up the object URL when the component unmounts or the video changes
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "video/mp4") {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAnalysis(null);
      setError(null);
    } else {
      setError("Please upload a valid MP4 file.");
      setVideoFile(null);
      setVideoUrl(null);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!videoFile || !repoUrl) {
      setError("Please provide a repository URL and a video file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setProgressMessage("Preparing analysis...");

    try {
      const result = await generateAnalysis(videoFile, repoUrl, branchName, setProgressMessage);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [videoFile, repoUrl, branchName]);
  
  const canAnalyze = repoUrl && videoFile && !isLoading;

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 antialiased">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white flex items-center justify-center gap-3">
            <VideoIcon className="w-10 h-10 text-[#58a6ff]" />
            Context-Aware Feedback AI
          </h1>
          <p className="text-[#8b949e] mt-2">
            Get AI-powered feedback by analyzing your GitHub repo and app video together.
          </p>
        </header>

        <main className="space-y-8">
          <div className="bg-[#161b22] p-8 rounded-xl border border-[#30363d] shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Connect Your Repository</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-3">
                  <label htmlFor="repoUrl" className="block text-sm font-semibold mb-2 text-[#8b949e]">GitHub Repository URL</label>
                  <div className="relative">
                    <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                    <input
                      type="text"
                      id="repoUrl"
                      className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58a6ff] transition-colors duration-200"
                      placeholder="e.g., https://github.com/owner/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="branchName" className="block text-sm font-semibold mb-2 text-[#8b949e]">Branch</label>
                  <div className="relative">
                    <GitBranchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                    <input
                      type="text"
                      id="branchName"
                      className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58a6ff] transition-colors duration-200"
                      placeholder="e.g., main"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
             <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Upload Your Video</h2>
               <VideoUpload videoUrl={videoUrl} onFileChange={handleFileChange} />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleAnalyzeClick}
              disabled={!canAnalyze}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#58a6ff] text-white font-bold rounded-lg shadow-lg hover:bg-[#4a90e2] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <SparklesIcon className="w-6 h-6" />
              {isLoading ? "Analyzing..." : "Generate Analysis"}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {isLoading && <Loader progressMessage={progressMessage} />}
          
          {analysis && (
             <AnalysisDisplay report={analysis} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
