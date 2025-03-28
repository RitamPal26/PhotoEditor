import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';

interface MediaLayer {
  id: string;
  startTime: number;
  endTime: number;
  type: 'image' | 'video';
  name: string;
}

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  layers?: MediaLayer[];
  onLayerChange?: (layerId: string, startTime: number, endTime: number) => void;
  onSelectLayer?: (layerId: string | null) => void;
  selectedLayerId?: string | null;
}

const Timeline = ({ 
  currentTime, 
  duration, 
  onSeek, 
  layers = [],
  onLayerChange = () => {},
  onSelectLayer = () => {},
  selectedLayerId = null
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [draggingItem, setDraggingItem] = useState<{
    layerId: string;
    type: 'start' | 'end' | 'position';
    initialX: number;
    initialTime: number;
    initialEndTime?: number;
  } | null>(null);

  // Generate tick marks for the timeline
  const renderTicks = () => {
    const ticks = [];
    const interval = duration > 30 ? 5 : 1; // Use 5s intervals for longer videos
    
    for (let i = 0; i <= duration; i += interval) {
      const position = (i / duration) * 100;
      ticks.push(
        <React.Fragment key={i}>
          <div 
            className="absolute h-3 w-px bg-editor-border"
            style={{ left: `${position}%` }} 
          />
          <div 
            className="absolute text-xs text-gray-400 -mt-5"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          >
            {i}s
          </div>
        </React.Fragment>
      );
    }
    
    return ticks;
  };

  // Handle clicking on timeline to seek
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      onSeek(Math.max(0, Math.min(duration, position * duration)));
    }
  };

  // Start dragging a layer's start or end handle
  const handleDragStart = (
    e: React.MouseEvent, 
    layerId: string, 
    type: 'start' | 'end' | 'position'
  ) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;
    
    setDraggingItem({
      layerId,
      type,
      initialX: e.clientX,
      initialTime: type === 'end' ? layer.endTime : layer.startTime,
      initialEndTime: type === 'position' ? layer.endTime : undefined
    });
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Select the layer when starting to drag
    onSelectLayer(layerId);
  };
  
  // Handle drag movement
  const handleDragMove = (e: MouseEvent) => {
    if (!draggingItem || !timelineRef.current) return;
    
    const layer = layers.find(l => l.id === draggingItem.layerId);
    if (!layer) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - draggingItem.initialX;
    const deltaTime = (deltaX / rect.width) * duration;
    
    let newStartTime = layer.startTime;
    let newEndTime = layer.endTime;
    
    if (draggingItem.type === 'start') {
      newStartTime = Math.max(0, Math.min(layer.endTime - 0.1, draggingItem.initialTime + deltaTime));
    } else if (draggingItem.type === 'end') {
      newEndTime = Math.max(layer.startTime + 0.1, Math.min(duration, draggingItem.initialTime + deltaTime));
    } else if (draggingItem.type === 'position') {
      // Move both start and end times, keeping duration constant
      const layerDuration = layer.endTime - layer.startTime;
      newStartTime = Math.max(0, Math.min(duration - layerDuration, draggingItem.initialTime + deltaTime));
      newEndTime = newStartTime + layerDuration;
      
      // If we hit the end, adjust start accordingly
      if (newEndTime > duration) {
        newEndTime = duration;
        newStartTime = newEndTime - layerDuration;
      }
    }
    
    onLayerChange(draggingItem.layerId, newStartTime, newEndTime);
  };
  
  // End dragging
  const handleDragEnd = () => {
    setDraggingItem(null);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };
  
  // Adjust zoom level
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.5, 4));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.5, 0.5));
  };
  
  return (
    <div className="w-full h-full p-4 flex flex-col justify-center">
      <div className="flex justify-between items-center text-white text-sm mb-2">
        <div>Timeline</div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="p-1 h-8 w-8 border-editor-border"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="p-1 h-8 w-8 border-editor-border"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative overflow-x-auto" style={{ height: `${40 + layers.length * 32}px` }}>
        <div className="w-full" style={{ width: `${100 * zoom}%`, minWidth: '100%' }}>
          <div 
            ref={timelineRef}
            className="relative h-8 bg-editor-control rounded cursor-pointer mb-2"
            onClick={handleTimelineClick}
          >
            {renderTicks()}
            
            <div 
              className="absolute top-0 h-full bg-editor-accent bg-opacity-20"
              style={{ 
                left: `${(0 / duration) * 100}%`,
                width: `${((currentTime) / duration) * 100}%`,
              }}
            />
            
            <div 
              className="absolute top-0 h-full w-px bg-editor-accent"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-3 h-3 bg-editor-accent rounded-full -ml-1.5 -mt-1.5" />
            </div>
          </div>
          
          {/* Layers section */}
          {layers.map((layer, index) => (
            <div 
              key={layer.id}
              className={`relative h-8 mb-2 rounded overflow-hidden ${
                selectedLayerId === layer.id ? 'ring-2 ring-editor-accent' : ''
              }`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-editor-control z-10 flex items-center px-2">
                <span className="text-xs text-white truncate">{layer.name}</span>
              </div>
              
              <div className="absolute left-20 right-0 top-0 bottom-0 bg-editor-control">
                <div 
                  className={`absolute h-full rounded cursor-move ${
                    layer.type === 'video' ? 'bg-blue-500/30' : 'bg-green-500/30'
                  }`}
                  style={{ 
                    left: `${(layer.startTime / duration) * 100}%`,
                    width: `${((layer.endTime - layer.startTime) / duration) * 100}%`,
                  }}
                  onMouseDown={(e) => handleDragStart(e, layer.id, 'position')}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize"
                    onMouseDown={(e) => handleDragStart(e, layer.id, 'start')}
                  />
                  
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 cursor-ew-resize"
                    onMouseDown={(e) => handleDragStart(e, layer.id, 'end')}
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white/80">
                      {layer.startTime.toFixed(1)}s - {layer.endTime.toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
