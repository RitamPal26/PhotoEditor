
import React, { useState, useRef, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import Sidebar from '@/components/Sidebar';
import Canvas from '@/components/Canvas';
import MediaUploader from '@/components/MediaUploader';
import Timeline from '@/components/Timeline';
import { toast } from '@/hooks/use-toast';
import { Pause } from 'lucide-react';

const EditorPage = () => {
  // Media state
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaWidth, setMediaWidth] = useState<number>(400);
  const [mediaHeight, setMediaHeight] = useState<number>(300);
  
  // Timeline state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10); // Default duration
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Selected media state
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  
  // Timer ref for play functionality
  const timerRef = useRef<number | null>(null);
  
  // Handle file upload
  const handleFileSelected = (file: File, type: 'image' | 'video') => {
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setMediaType(type);
    
    // Reset times when new media is uploaded
    setCurrentTime(0);
    
    // For videos, get the actual duration once it's loaded
    if (type === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setDuration(video.duration);
        setEndTime(video.duration);
      };
    }
    
    toast({
      title: "Media Uploaded",
      description: `Your ${type} has been uploaded successfully.`
    });
  };
  
  // Handle playing/pausing timeline
  const handlePlay = () => {
    if (isPlaying) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start from current time or loop back to start time if past end time
      if (currentTime >= endTime) {
        setCurrentTime(startTime);
      }
      
      // Set up timer to increment currentTime
      timerRef.current = window.setInterval(() => {
        setCurrentTime(prevTime => {
          const nextTime = prevTime + 0.1;
          if (nextTime >= endTime) {
            // Stop when we reach the end time
            if (timerRef.current !== null) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsPlaying(false);
            return endTime;
          }
          return nextTime;
        });
      }, 100); // Update every 100ms for smoother animation
      
      setIsPlaying(true);
    }
  };
  
  // Handle seeking in timeline
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };
  
  // Handle download
  const handleDownload = () => {
    if (!mediaUrl) return;
    
    if (mediaType === 'image') {
      // For images, open in new tab first (simple approach)
      window.open(mediaUrl, '_blank');
    } else if (mediaType === 'video') {
      // For videos, create a download link
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.download = `edited-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    
    toast({
      title: "Download Started",
      description: "Your media is being downloaded."
    });
  };
  
  // Handle upload button click
  const handleUpload = () => {
    // This will be handled by the MediaUploader component
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      
      // Clean up object URLs to avoid memory leaks
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);
  
  // Is media visible at current time?
  const isMediaVisible = currentTime >= startTime && currentTime <= endTime;
  
  return (
    <div className="min-h-screen bg-editor-bg flex flex-col">
      <header className="h-12 border-b border-editor-border bg-editor-panel flex items-center px-4">
        <h1 className="text-white font-semibold">Media Editor</h1>
      </header>
      
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
            <Sidebar 
              mediaWidth={mediaWidth}
              mediaHeight={mediaHeight}
              startTime={startTime}
              endTime={endTime}
              duration={duration}
              onWidthChange={setMediaWidth}
              onHeightChange={setMediaHeight}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onPlay={handlePlay}
              onUpload={handleUpload}
              onDownload={handleDownload}
              isPlaying={isPlaying}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col h-full">
              <main className="flex-1 bg-editor-bg p-4 overflow-auto relative">
                {!mediaUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <MediaUploader onFileSelected={handleFileSelected} />
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {/* Canvas where media elements are placed */}
                    <Canvas 
                      mediaUrl={mediaUrl}
                      mediaType={mediaType}
                      mediaWidth={mediaWidth}
                      mediaHeight={mediaHeight}
                      isVisible={isMediaVisible}
                      onSelect={() => setSelectedMediaIndex(0)}
                      isSelected={selectedMediaIndex === 0}
                    />
                    
                    {/* Current time display */}
                    <div className="absolute top-4 right-4 bg-editor-panel text-white px-3 py-1 rounded-md">
                      {currentTime.toFixed(1)}s
                    </div>
                    
                    {/* Play/Pause button */}
                    <button 
                      className="absolute bottom-4 right-4 bg-editor-accent text-white p-2 rounded-full shadow-lg"
                      onClick={handlePlay}
                    >
                      {isPlaying ? <Pause size={24} /> : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 4L18 12L6 20V4Z" fill="white"/>
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </main>
              
              <footer className="h-24 bg-editor-panel border-t border-editor-border p-2">
                <Timeline 
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                />
              </footer>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default EditorPage;
