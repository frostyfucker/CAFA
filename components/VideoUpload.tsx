import React from 'react';
import { UploadIcon } from './icons';

interface VideoUploadProps {
  videoUrl: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ videoUrl, onFileChange }) => {
  return (
    <div className="w-full">
      {videoUrl ? (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-[#30363d]">
          <video controls src={videoUrl} className="w-full h-full">
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#30363d] border-dashed rounded-lg cursor-pointer bg-[#0d1117] hover:bg-[#161b22]/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-[#8b949e]" />
            <p className="mb-2 text-sm text-[#8b949e]">
              <span className="font-semibold text-white">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-[#8b949e]">MP4 video file</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="video/mp4"
            onChange={onFileChange}
          />
        </label>
      )}
    </div>
  );
};

export default VideoUpload;