import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
interface MediaUploaderProps {
  onFileSelected: (file: File, type: 'image' | 'video') => void;
}
const MediaUploader = ({
  onFileSelected
}: MediaUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    if (fileType) {
      onFileSelected(file, fileType as 'image' | 'video');
    } else {
      console.error('Unsupported file type');
      // You could show an error toast here
    }

    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
      if (fileType) {
        onFileSelected(file, fileType as 'image' | 'video');
      } else {
        console.error('Unsupported file type');
        // You could show an error toast here
      }
    }
  };
  return <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all ${isDragging ? 'border-editor-accent bg-editor-accent bg-opacity-10' : 'border-editor-border bg-editor-control'}`} style={{
    width: '400px',
    height: '300px'
  }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
      <Upload className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-300 text-sm mb-4 text-center">
        Drag & drop media here or click to browse
      </p>
      <Button onClick={handleButtonClick} variant="outline" className="border-editor-border text-zinc-950">
        Upload Media
      </Button>
    </div>;
};
export default MediaUploader;