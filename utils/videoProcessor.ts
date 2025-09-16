
import type { FrameData } from "../types";

export const extractFramesFromVideo = (
  videoFile: File,
  maxFrames: number = 10
): Promise<FrameData[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const frames: FrameData[] = [];
    const videoUrl = URL.createObjectURL(videoFile);

    if (!context) {
      return reject(new Error("Failed to get canvas context."));
    }
    
    video.preload = "metadata";
    video.src = videoUrl;
    video.muted = true;

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const duration = video.duration;
      const interval = duration / maxFrames;
      let currentTime = 0;
      let framesExtracted = 0;

      const captureFrame = () => {
        if (framesExtracted >= maxFrames) {
          URL.revokeObjectURL(videoUrl);
          video.remove();
          canvas.remove();
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };
      
      video.onseeked = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        const [meta, data] = dataUrl.split(",");
        
        if (meta && data) {
           const mimeTypeMatch = meta.match(/:(.*?);/);
            if(mimeTypeMatch && mimeTypeMatch[1]){
                frames.push({ mimeType: mimeTypeMatch[1], data });
            }
        }
        
        framesExtracted++;
        currentTime += interval;
        
        if (currentTime <= duration) {
            captureFrame();
        } else {
            URL.revokeObjectURL(videoUrl);
            video.remove();
            canvas.remove();
            resolve(frames);
        }
      };
      
      video.onerror = (e) => {
        URL.revokeObjectURL(videoUrl);
        video.remove();
        canvas.remove();
        reject(new Error("Error loading or processing video."));
      };

      // Start the process
      video.play().then(() => {
        video.pause();
        captureFrame();
      }).catch(err => {
        // Fallback for browsers that don't like playing then pausing.
        captureFrame();
      });
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Could not load video metadata. Is the file corrupted?"));
    };
  });
};
