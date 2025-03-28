
import React, { useState, useRef, useEffect, CSSProperties } from 'react';

interface CanvasProps {
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  mediaWidth: number;
  mediaHeight: number;
  isVisible: boolean;
  onSelect: () => void;
  isSelected: boolean;
  opacity?: number;
  brightness?: number;
  contrast?: number;
  rotation?: number;
  onResize?: (width: number, height: number) => void;
  onPositionUpdate?: (x: number, y: number) => void;
}

const Canvas = ({ 
  mediaUrl, 
  mediaType, 
  mediaWidth, 
  mediaHeight, 
  isVisible,
  onSelect,
  isSelected,
  opacity = 100,
  brightness = 100,
  contrast = 100,
  rotation = 0,
  onResize,
  onPositionUpdate
}: CanvasProps) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const mediaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Apply position updates from parent
  useEffect(() => {
    if (onPositionUpdate) {
      // This effect will fire when position changes to notify parent
      onPositionUpdate(position.x, position.y);
    }
  }, [position, onPositionUpdate]);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    if (mediaRef.current) {
      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (dragRef.current.isDragging && mediaRef.current) {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
      
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  // Handle resizing from corners
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const initialX = e.clientX;
    const initialY = e.clientY;
    const initialWidth = mediaWidth;
    const initialHeight = mediaHeight;
    const initialPosition = { ...position };
    
    const handleResizeMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      const deltaX = moveEvent.clientX - initialX;
      const deltaY = moveEvent.clientY - initialY;
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialPosition.x;
      let newY = initialPosition.y;
      
      // Different behavior based on which corner is being dragged
      switch(corner) {
        case 'se':
          newWidth = Math.max(50, initialWidth + deltaX);
          newHeight = Math.max(50, initialHeight + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, initialWidth - deltaX);
          newHeight = Math.max(50, initialHeight + deltaY);
          newX = initialPosition.x + (initialWidth - newWidth);
          break;
        case 'ne':
          newWidth = Math.max(50, initialWidth + deltaX);
          newHeight = Math.max(50, initialHeight - deltaY);
          newY = initialPosition.y + (initialHeight - newHeight);
          break;
        case 'nw':
          newWidth = Math.max(50, initialWidth - deltaX);
          newHeight = Math.max(50, initialHeight - deltaY);
          newX = initialPosition.x + (initialWidth - newWidth);
          newY = initialPosition.y + (initialHeight - newHeight);
          break;
      }
      
      // Update dimensions in parent component
      if (onResize) {
        onResize(newWidth, newHeight);
      }
      
      setPosition({ x: newX, y: newY });
    };
    
    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Set up event listeners for dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [position]);

  // Return null if no media
  if (!mediaUrl) return null;

  // Calculate media style including filters
  const mediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: opacity / 100,
    filter: `brightness(${brightness}%) contrast(${contrast}%)`
  };

  // Calculate container style including rotation
  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${mediaWidth}px`,
    height: `${mediaHeight}px`,
    cursor: isSelected ? 'move' : 'pointer',
    transform: rotation ? `rotate(${rotation}deg)` : undefined
  };

  const mediaClasses = `media-element ${isSelected ? 'selected' : ''} ${isVisible ? '' : 'opacity-30'}`;

  return (
    <div 
      ref={mediaRef}
      className={mediaClasses}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      {mediaType === 'image' && (
        <img 
          src={mediaUrl} 
          alt="Uploaded media" 
          style={mediaStyle}
        />
      )}
      
      {mediaType === 'video' && (
        <video 
          ref={videoRef}
          src={mediaUrl}
          style={mediaStyle}
          controls={false}
          muted
        />
      )}
      
      {isSelected && (
        <>
          <div 
            className="resize-handle nw"
            style={{
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              width: '10px',
              height: '10px',
              background: '#9b87f5',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: 10
            }}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            className="resize-handle ne"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              background: '#9b87f5',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              zIndex: 10
            }}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="resize-handle sw" 
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '-4px',
              width: '10px',
              height: '10px',
              background: '#9b87f5',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'nesw-resize',
              zIndex: 10
            }}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="resize-handle se"
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              background: '#9b87f5',
              border: '1px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: 10
            }}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px solid #9b87f5',
              pointerEvents: 'none',
              zIndex: 5
            }}
          />
        </>
      )}
    </div>
  );
};

export default Canvas;
