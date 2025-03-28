
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Download, 
  Play, 
  Upload, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface SidebarProps {
  mediaWidth: number;
  mediaHeight: number;
  startTime: number;
  endTime: number;
  duration: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onPlay: () => void;
  onUpload: () => void;
  onDownload: () => void;
  isPlaying: boolean;
  onRotate?: (degrees: number) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  brightness?: number;
  onBrightnessChange?: (brightness: number) => void;
  contrast?: number;
  onContrastChange?: (contrast: number) => void;
  onPositionChange?: (x: number, y: number) => void;
}

const Sidebar = ({
  mediaWidth,
  mediaHeight,
  startTime,
  endTime,
  duration,
  onWidthChange,
  onHeightChange,
  onStartTimeChange,
  onEndTimeChange,
  onPlay,
  onUpload,
  onDownload,
  isPlaying,
  onRotate = () => {},
  opacity = 100,
  onOpacityChange = () => {},
  brightness = 100,
  onBrightnessChange = () => {},
  contrast = 100,
  onContrastChange = () => {},
  onPositionChange = () => {}
}: SidebarProps) => {
  return (
    <div className="bg-editor-panel w-full h-full p-4 flex flex-col border-r border-editor-border overflow-y-auto">
      <h2 className="font-semibold text-lg mb-6 text-white">Media Controls</h2>
      
      <Button onClick={onUpload} className="mb-6 bg-editor-accent hover:bg-opacity-80 text-white w-full">
        <Upload className="mr-2 h-4 w-4" />
        Upload Media
      </Button>
      
      <div className="space-y-6 flex-1">
        <div>
          <h3 className="font-medium mb-3 text-sm text-gray-300">Dimensions</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Width</label>
              <Input 
                type="number" 
                value={mediaWidth} 
                onChange={e => onWidthChange(Number(e.target.value))} 
                className="bg-editor-control border-editor-border" 
                min={50} 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Height</label>
              <Input 
                type="number" 
                value={mediaHeight} 
                onChange={e => onHeightChange(Number(e.target.value))} 
                className="bg-editor-control border-editor-border" 
                min={50} 
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3 text-sm text-gray-300">Position Fine-Tuning</h3>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div></div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPositionChange(0, -5)} 
              className="border-editor-border"
            >
              <ArrowUp className="h-4 w-4 text-black" />
            </Button>
            <div></div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPositionChange(-5, 0)} 
              className="border-editor-border"
            >
              <ArrowLeft className="h-4 w-4 text-black" />
            </Button>
            <div></div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPositionChange(5, 0)} 
              className="border-editor-border"
            >
              <ArrowRight className="h-4 w-4 text-black" />
            </Button>
            
            <div></div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPositionChange(0, 5)} 
              className="border-editor-border"
            >
              <ArrowDown className="h-4 w-4 text-black" />
            </Button>
            <div></div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3 text-sm text-gray-300">Rotation</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onRotate(-90)} 
              className="flex-1 border-editor-border"
            >
              <RotateCcw className="h-4 w-4 mr-1 text-black" />
              <span style={{ color: 'black' }}>Left</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onRotate(90)} 
              className="flex-1 border-editor-border"
            >
              <RotateCw className="h-4 w-4 mr-1 text-black" />
              <span style={{ color: 'black' }}>Right</span>
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3 text-sm text-gray-300">Image Adjustments</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Opacity</label>
                <span className="text-xs text-gray-400">{opacity}%</span>
              </div>
              <Slider 
                value={[opacity]} 
                min={0} 
                max={100} 
                step={1} 
                onValueChange={value => onOpacityChange(value[0])} 
                className="mb-4" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Brightness</label>
                <span className="text-xs text-gray-400">{brightness}%</span>
              </div>
              <Slider 
                value={[brightness]} 
                min={0} 
                max={200} 
                step={1} 
                onValueChange={value => onBrightnessChange(value[0])} 
                className="mb-4" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Contrast</label>
                <span className="text-xs text-gray-400">{contrast}%</span>
              </div>
              <Slider 
                value={[contrast]} 
                min={0} 
                max={200} 
                step={1} 
                onValueChange={value => onContrastChange(value[0])} 
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3 text-sm text-gray-300">Time Controls</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">Start Time (s)</label>
                <span className="text-xs text-gray-400">{startTime.toFixed(1)}</span>
              </div>
              <Slider 
                value={[startTime]} 
                min={0} 
                max={duration} 
                step={0.1} 
                onValueChange={value => onStartTimeChange(value[0])} 
                className="mb-4" 
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-400">End Time (s)</label>
                <span className="text-xs text-gray-400">{endTime.toFixed(1)}</span>
              </div>
              <Slider 
                value={[endTime]} 
                min={0} 
                max={duration} 
                step={0.1} 
                onValueChange={value => onEndTimeChange(value[0])} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-editor-border space-y-3">
        <Button 
          onClick={onPlay} 
          variant="outline" 
          className="w-full border-editor-border text-zinc-950"
        >
          {isPlaying ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              <span>Play</span>
            </>
          )}
        </Button>
        
        <Button 
          onClick={onDownload} 
          className="w-full bg-editor-accent hover:bg-opacity-80 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
