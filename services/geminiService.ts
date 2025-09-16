import { GoogleGenAI, Type } from "@google/genai";
import { extractFramesFromVideo } from "../utils/videoProcessor";
import type { FrameData, AnalysisReport } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getRepoContext = async (repoUrl: string, branch: string): Promise<string> => {
    try {
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!urlMatch) throw new Error("Invalid GitHub URL format.");
        
        const owner = urlMatch[1];
        const repoName = urlMatch[2].replace(/\.git$/, '');

        const [repoRes, commitsRes] = await Promise.all([
            fetch(`https://api.github.com/repos/${owner}/${repoName}`),
            fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?sha=${branch}&per_page=5`)
        ]);

        if (!repoRes.ok || !commitsRes.ok) {
            throw new Error(`Failed to fetch data from GitHub. Status: ${repoRes.status}, ${commitsRes.status}`);
        }

        const repoData = await repoRes.json();
        const commitsData = await commitsRes.json();
        
        const description = repoData.description || "No description provided.";
        const recentCommits = commitsData.map((c: any) => `- ${c.commit.message.split('\n')[0]}`).join('\n');

        return `Repository: ${repoData.full_name}\nDescription: ${description}\n\nRecent Commits (branch: ${branch}):\n${recentCommits}`;
    } catch (error) {
        console.error("Error fetching repo context:", error);
        return "Could not fetch repository context. Proceeding with video analysis only.";
    }
}

const ANALYSIS_PROMPT_TEMPLATE = (repoContext: string) => `
You are an expert UX/UI designer, senior software developer, and product manager. Your task is to provide a comprehensive analysis of an application by correlating its visual representation from a video with its development context from a GitHub repository.

**GitHub Repository Context:**
${repoContext}

**Task:**
Analyze the following video frames in light of the repository context provided above. Connect the visual evidence from the frames to the recent development activity indicated by the commit messages. Provide detailed, constructive feedback in the requested JSON format.

When providing feedback:
- Be specific and reference visual elements in the frames.
- Correlate your UI/UX feedback with the recent commits if possible (e.g., "The recent commit about refactoring the login page seems to have introduced this alignment issue...").
- Offer concrete, actionable suggestions that consider both design best practices and potential implementation steps.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        projectOverview: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the project's purpose and the state of the app as shown in the video, based on all available context." }
            },
        },
        visualAnalysis: {
            type: Type.OBJECT,
            properties: {
                overallImpression: { type: Type.STRING, description: "A summary of your overall thoughts on the app's visual presentation." },
                uiUxFeedback: { type: Type.STRING, description: "Specific comments on design, layout, color, typography, and user flow. Use bullet points for clarity." },
                presentationClarity: { type: Type.STRING, description: "Feedback on how well the video communicates its purpose. Is it easy to follow?" },
            },
        },
        codeAnalysis: {
            type: Type.OBJECT,
            properties: {
                recentActivity: { type: Type.STRING, description: "A brief interpretation of the recent commit messages and how they might relate to what's visible in the video." },
            },
        },
        actionableSuggestions: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING,
                description: "A concrete step the creator can take to improve their app and presentation."
            },
            description: "A list of the most important, actionable steps for improvement, combining insights from both visual and code analysis."
        }
    },
};


export const generateAnalysis = async (
  videoFile: File,
  repoUrl: string,
  branchName: string,
  onProgress: (message: string) => void
): Promise<AnalysisReport> => {
  try {
    onProgress("Fetching repository details from GitHub...");
    const repoContext = await getRepoContext(repoUrl, branchName);

    onProgress("Extracting frames from video... (this may take a moment)");
    const frames: FrameData[] = await extractFramesFromVideo(videoFile, 10);
    
    if (frames.length === 0) {
      throw new Error("Could not extract any frames from the video.");
    }

    onProgress("Analyzing context with Gemini AI...");
    
    const imageParts = frames.map(frame => ({
        inlineData: {
            mimeType: frame.mimeType,
            data: frame.data
        }
    }));
    
    const prompt = ANALYSIS_PROMPT_TEMPLATE(repoContext);
    const contents = {
        parts: [{ text: prompt }, ...imageParts]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisReport;

  } catch (error) {
    console.error("Error analyzing video:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to generate analysis: ${message}`);
  }
};
