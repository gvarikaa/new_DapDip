import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ImagePlus, Music, PanelTop, Palette, Smile, List, Trash2, X, Send, Pencil, StickerIcon, Link, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { api } from '@/lib/api/trpc/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColorPicker from '@/components/ui/color-picker';

import type { MediaType, TextOverlay, DrawElement, Sticker } from '@/types/stories';

const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 960;

const fonts = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
];

const stickers = [
  { id: 'sticker1', src: '/stickers/sticker1.png', alt: 'Sticker 1' },
  { id: 'sticker2', src: '/stickers/sticker2.png', alt: 'Sticker 2' },
  { id: 'sticker3', src: '/stickers/sticker3.png', alt: 'Sticker 3' },
  { id: 'sticker4', src: '/stickers/sticker4.png', alt: 'Sticker 4' },
  { id: 'sticker5', src: '/stickers/sticker5.png', alt: 'Sticker 5' },
];

const filters = [
  { id: 'none', name: 'Normal', value: 'none' },
  { id: 'grayscale', name: 'Grayscale', value: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', value: 'sepia(100%)' },
  { id: 'vintage', name: 'Vintage', value: 'contrast(120%) sepia(30%)' },
  { id: 'bright', name: 'Bright', value: 'brightness(130%) contrast(110%)' },
  { id: 'cool', name: 'Cool', value: 'hue-rotate(180deg)' },
  { id: 'warm', name: 'Warm', value: 'sepia(30%) hue-rotate(-30deg)' },
];

interface StoryCreatorProps {
  storyType?: MediaType;
  initialMediaUrl?: string;
  initialThumbnailUrl?: string;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({
  storyType = 'IMAGE',
  initialMediaUrl = '',
  initialThumbnailUrl = '',
}) => {
  const router = useRouter();
  const [mediaUrl, setMediaUrl] = useState<string>(initialMediaUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(initialThumbnailUrl);
  const [mediaType, setMediaType] = useState<MediaType>(storyType);
  const [caption, setCaption] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [privacy, setPrivacy] = useState<string>('PUBLIC');
  const [backgroundColor, setBackgroundColor] = useState<string>('#3B82F6');
  const [musicUrl, setMusicUrl] = useState<string>('');
  const [musicArtist, setMusicArtist] = useState<string>('');
  const [musicTitle, setMusicTitle] = useState<string>('');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [drawElements, setDrawElements] = useState<DrawElement[]>([]);
  const [stickersElements, setStickersElements] = useState<Sticker[]>([]);
  const [allowResponses, setAllowResponses] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(5);
  const [links, setLinks] = useState<{url: string; label?: string}[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('none');
  
  // Interactive creation tools
  const [activeTool, setActiveTool] = useState<string>('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentDrawing, setCurrentDrawing] = useState<{points: {x: number; y: number}[]; color: string; width: number} | null>(null);
  const [drawColor, setDrawColor] = useState<string>('#ffffff');
  const [drawWidth, setDrawWidth] = useState<number>(3);
  
  // Text state
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textBgColor, setTextBgColor] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontFamily, setFontFamily] = useState<string>('Arial, sans-serif');
  
  // Link state
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkLabel, setLinkLabel] = useState<string>('');
  
  // Active element state for dragging
  const [activeElementType, setActiveElementType] = useState<'text' | 'sticker' | null>(null);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Create story mutation
  const createStoryMutation = api.story.create.useMutation({
    onSuccess: () => {
      toast.success('Story created successfully!');
      router.push('/stories');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create story');
    },
  });

  // Handle media upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload to a storage service here
    // For now, we'll use a fake URL
    const fakeUrl = URL.createObjectURL(file);
    setMediaUrl(fakeUrl);
    setMediaType('IMAGE');
  };
  
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload to a storage service here
    // For now, we'll use a fake URL
    const fakeUrl = URL.createObjectURL(file);
    setMediaUrl(fakeUrl);
    setMediaType('VIDEO');
  };

  // Text overlay tools
  const addTextOverlay = () => {
    if (!textInput.trim()) return;
    
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: textInput,
      position: { x: 50, y: 50 },
      rotation: 0,
      fontSize,
      fontFamily,
      fontWeight: 'normal',
      color: textColor,
      backgroundColor: textBgColor || undefined,
      padding: textBgColor ? 8 : undefined,
      borderRadius: textBgColor ? 4 : undefined,
    };
    
    setTextOverlays([...textOverlays, newText]);
    setTextInput('');
    setActiveTextId(newText.id);
    setActiveTool('');
  };
  
  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };
  
  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
    if (activeTextId === id) {
      setActiveTextId(null);
    }
  };

  // Drawing tools
  const startDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'draw' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setCurrentDrawing({
      points: [{ x, y }],
      color: drawColor,
      width: drawWidth
    });
  };
  
  const continueDrawing = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCurrentDrawing({
      ...currentDrawing,
      points: [...currentDrawing.points, { x, y }]
    });
  };
  
  const endDrawing = () => {
    if (!isDrawing || !currentDrawing) return;
    
    if (currentDrawing.points.length > 1) {
      const newDrawElement: DrawElement = {
        id: `draw-${Date.now()}`,
        points: currentDrawing.points,
        color: currentDrawing.color,
        width: currentDrawing.width
      };
      
      setDrawElements([...drawElements, newDrawElement]);
    }
    
    setIsDrawing(false);
    setCurrentDrawing(null);
  };
  
  const clearDrawings = () => {
    setDrawElements([]);
  };

  // Sticker tools
  const addSticker = (stickerId: string) => {
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      stickerId,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0
    };
    
    setStickersElements([...stickersElements, newSticker]);
    setActiveTool('');
  };
  
  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickersElements(stickersElements.map(sticker => 
      sticker.id === id ? { ...sticker, ...updates } : sticker
    ));
  };
  
  const removeSticker = (id: string) => {
    setStickersElements(stickersElements.filter(sticker => sticker.id !== id));
  };

  // Link tools
  const addLink = () => {
    if (!linkUrl) return;
    
    setLinks([...links, { 
      url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`, 
      label: linkLabel || undefined 
    }]);
    setLinkUrl('');
    setLinkLabel('');
    setActiveTool('');
  };
  
  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Element dragging
  const handleElementMouseDown = (
    e: React.MouseEvent, 
    type: 'text' | 'sticker', 
    id: string
  ) => {
    e.stopPropagation();
    setActiveElementType(type);
    setActiveElementId(id);
    setIsDragging(true);
  };
  
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'draw' && isDrawing) {
      continueDrawing(e);
      return;
    }
    
    if (!isDragging || !activeElementType || !activeElementId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
    const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);
    
    if (activeElementType === 'text') {
      updateTextOverlay(activeElementId, { position: { x, y } });
    } else if (activeElementType === 'sticker') {
      updateSticker(activeElementId, { position: { x, y } });
    }
  }, [isDragging, activeElementType, activeElementId, activeTool, isDrawing]);
  
  const handleCanvasMouseUp = useCallback(() => {
    if (activeTool === 'draw' && isDrawing) {
      endDrawing();
      return;
    }
    
    setIsDragging(false);
  }, [activeTool, isDrawing]);

  // Create and publish story
  const handleCreateStory = async () => {
    try {
      // In a real app, you would upload media, then create story
      // Also handle conversion of client-side Blob URLs to actual URLs
      
      await createStoryMutation.mutateAsync({
        mediaUrl,
        thumbnailUrl,
        mediaType,
        duration: mediaType === 'VIDEO' ? undefined : duration,
        caption,
        location: location || undefined,
        backgroundColor: mediaType === 'TEXT' ? backgroundColor : undefined,
        textOverlays: textOverlays.length > 0 ? textOverlays : undefined,
        drawElements: drawElements.length > 0 ? drawElements : undefined,
        stickers: stickersElements.length > 0 ? stickersElements : undefined,
        filter: filter !== 'none' ? filter : undefined,
        musicTrackUrl: musicUrl || undefined,
        musicArtist: musicArtist || undefined,
        musicTitle: musicTitle || undefined,
        allowResponses,
        privacyLevel: privacy as any,
        links: links.length > 0 ? links : undefined,
        topicIds: topicIds.length > 0 ? topicIds : undefined,
      });
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-5xl px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Story</h1>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleCreateStory}
            disabled={!mediaUrl && mediaType !== 'TEXT'}
          >
            <Send className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      <div className="container max-w-5xl px-4 py-6 flex flex-col lg:flex-row gap-8">
        {/* Canvas/Preview Area */}
        <div className="flex-1 flex flex-col items-center">
          <div 
            ref={canvasRef}
            className={cn(
              "relative w-full max-w-[540px] aspect-[9/16] rounded-lg overflow-hidden shadow-md",
              "border border-border",
              mediaType === 'TEXT' ? "bg-primary" : "bg-black"
            )}
            style={{ 
              backgroundColor: mediaType === 'TEXT' ? backgroundColor : undefined,
              filter: filters.find(f => f.id === filter)?.value,
            }}
            onMouseDown={startDrawing}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Media */}
            {mediaUrl && mediaType === 'IMAGE' && (
              <img 
                src={mediaUrl} 
                alt="Story preview" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            
            {mediaUrl && mediaType === 'VIDEO' && (
              <video 
                src={mediaUrl} 
                className="absolute inset-0 w-full h-full object-cover" 
                controls 
              />
            )}
            
            {/* Text Overlays */}
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={cn(
                  "absolute flex items-center justify-center cursor-move",
                  activeTextId === overlay.id && "ring-2 ring-primary"
                )}
                style={{
                  left: `${overlay.position.x}%`,
                  top: `${overlay.position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, 'text', overlay.id)}
                onClick={() => setActiveTextId(overlay.id)}
              >
                <p
                  style={{
                    color: overlay.color,
                    fontSize: `${overlay.fontSize}px`,
                    fontFamily: overlay.fontFamily,
                    fontWeight: overlay.fontWeight,
                    backgroundColor: overlay.backgroundColor,
                    padding: overlay.padding ? `${overlay.padding}px` : undefined,
                    borderRadius: overlay.borderRadius ? `${overlay.borderRadius}px` : undefined,
                  }}
                  className="whitespace-pre-wrap text-center max-w-[80%]"
                >
                  {overlay.text}
                </p>
                
                {activeTextId === overlay.id && (
                  <button 
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTextOverlay(overlay.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Drawing Elements */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {drawElements.map((element) => (
                <polyline
                  key={element.id}
                  points={element.points.map(p => `${p.x * CANVAS_WIDTH / 100},${p.y * CANVAS_HEIGHT / 100}`).join(' ')}
                  fill="none"
                  stroke={element.color}
                  strokeWidth={element.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              
              {currentDrawing && (
                <polyline
                  points={currentDrawing.points.map(p => `${p.x * CANVAS_WIDTH / 100},${p.y * CANVAS_HEIGHT / 100}`).join(' ')}
                  fill="none"
                  stroke={currentDrawing.color}
                  strokeWidth={currentDrawing.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            
            {/* Stickers */}
            {stickersElements.map((sticker) => (
              <div
                key={sticker.id}
                className="absolute cursor-move"
                style={{
                  left: `${sticker.position.x}%`,
                  top: `${sticker.position.y}%`,
                  transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, 'sticker', sticker.id)}
              >
                <img
                  src={`/stickers/${sticker.stickerId}.png`}
                  alt="Sticker"
                  className="w-16 h-16 object-contain"
                />
                
                <button 
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSticker(sticker.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Controls & Tools */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              <span>Photo</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => videoInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              <span>Video</span>
            </Button>
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleVideoUpload}
            />
            
            <Button
              variant="outline"
              className={cn("flex items-center gap-2", mediaType === 'TEXT' && "bg-primary text-primary-foreground")}
              onClick={() => setMediaType('TEXT')}
            >
              <PanelTop className="h-4 w-4" />
              <span>Text</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setActiveTool(activeTool === 'music' ? '' : 'music')}
            >
              <Music className="h-4 w-4" />
              <span>Music</span>
            </Button>
          </div>
          
          {/* Creative Tools */}
          <Tabs defaultValue="create">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(activeTool === 'text' && "bg-primary text-primary-foreground")}
                  onClick={() => setActiveTool(activeTool === 'text' ? '' : 'text')}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Add Text
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(activeTool === 'draw' && "bg-primary text-primary-foreground")}
                  onClick={() => setActiveTool(activeTool === 'draw' ? '' : 'draw')}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Draw
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(activeTool === 'stickers' && "bg-primary text-primary-foreground")}
                  onClick={() => setActiveTool(activeTool === 'stickers' ? '' : 'stickers')}
                >
                  <StickerIcon className="h-4 w-4 mr-1" />
                  Stickers
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(activeTool === 'link' && "bg-primary text-primary-foreground")}
                  onClick={() => setActiveTool(activeTool === 'link' ? '' : 'link')}
                >
                  <Link className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              </div>
              
              {activeTool === 'text' && (
                <div className="space-y-2 p-2 border rounded-md">
                  <Textarea 
                    placeholder="Enter text..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="font-size">Size</Label>
                      <div className="flex items-center gap-2">
                        <Slider 
                          id="font-size"
                          min={12} 
                          max={72} 
                          step={1} 
                          value={[fontSize]} 
                          onValueChange={(value) => setFontSize(value[0])} 
                        />
                        <span className="text-xs">{fontSize}px</span>
                      </div>
                    </div>
                    
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger>
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: textColor }} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <ColorPicker 
                          color={textColor} 
                          onChange={setTextColor} 
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs">Text</span>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: textBgColor || 'transparent' }} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <ColorPicker 
                          color={textBgColor} 
                          onChange={setTextBgColor} 
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs">Background</span>
                  </div>
                  
                  <Button className="w-full" onClick={addTextOverlay} disabled={!textInput.trim()}>
                    Add Text
                  </Button>
                </div>
              )}
              
              {activeTool === 'draw' && (
                <div className="space-y-2 p-2 border rounded-md">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="draw-width">Width</Label>
                    <div className="flex items-center gap-2">
                      <Slider 
                        id="draw-width"
                        min={1} 
                        max={10} 
                        step={1} 
                        value={[drawWidth]} 
                        onValueChange={(value) => setDrawWidth(value[0])} 
                        className="w-32"
                      />
                      <span className="text-xs">{drawWidth}px</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: drawColor }} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <ColorPicker 
                          color={drawColor} 
                          onChange={setDrawColor} 
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-xs">Color</span>
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={clearDrawings}
                      disabled={drawElements.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTool === 'stickers' && (
                <div className="p-2 border rounded-md">
                  <div className="grid grid-cols-3 gap-2">
                    {stickers.map((sticker) => (
                      <Button
                        key={sticker.id}
                        variant="ghost"
                        className="w-full h-20 p-1"
                        onClick={() => addSticker(sticker.id)}
                      >
                        <img 
                          src={sticker.src} 
                          alt={sticker.alt} 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTool === 'link' && (
                <div className="space-y-2 p-2 border rounded-md">
                  <div className="space-y-1">
                    <Label htmlFor="link-url">URL</Label>
                    <Input 
                      id="link-url"
                      placeholder="https://example.com" 
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="link-label">Label (optional)</Label>
                    <Input 
                      id="link-label"
                      placeholder="Tap to visit" 
                      value={linkLabel}
                      onChange={(e) => setLinkLabel(e.target.value)}
                    />
                  </div>
                  
                  <Button className="w-full" onClick={addLink} disabled={!linkUrl}>
                    Add Link
                  </Button>
                </div>
              )}
              
              {activeTool === 'music' && (
                <div className="space-y-2 p-2 border rounded-md">
                  <div className="space-y-1">
                    <Label htmlFor="music-url">Music URL</Label>
                    <Input 
                      id="music-url"
                      placeholder="https://music.example.com/track" 
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="music-artist">Artist</Label>
                      <Input 
                        id="music-artist"
                        placeholder="Artist name" 
                        value={musicArtist}
                        onChange={(e) => setMusicArtist(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="music-title">Title</Label>
                      <Input 
                        id="music-title"
                        placeholder="Song title" 
                        value={musicTitle}
                        onChange={(e) => setMusicTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Links List */}
              {links.length > 0 && (
                <div className="mt-2">
                  <Label>Links</Label>
                  <ul className="mt-1 space-y-1">
                    {links.map((link, index) => (
                      <li key={index} className="flex items-center justify-between p-1 bg-muted rounded text-xs">
                        <span className="truncate max-w-[200px]">
                          {link.label ? link.label : link.url}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => removeLink(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="design" className="space-y-4">
              {mediaType === 'TEXT' && (
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-10 flex items-center justify-between"
                      >
                        <span>Select Color</span>
                        <div 
                          className="w-6 h-6 rounded" 
                          style={{ backgroundColor: backgroundColor }}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <ColorPicker 
                        color={backgroundColor} 
                        onChange={setBackgroundColor} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Filter</Label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.map((filterOption) => (
                      <SelectItem key={filterOption.id} value={filterOption.id}>
                        {filterOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {mediaType !== 'VIDEO' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Display Duration (seconds)</Label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      id="duration"
                      min={3} 
                      max={10} 
                      step={1} 
                      value={[duration]} 
                      onValueChange={(value) => setDuration(value[0])} 
                    />
                    <span className="text-xs">{duration}s</span>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea 
                  id="caption"
                  placeholder="Add a caption..." 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  placeholder="Add location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select value={privacy} onValueChange={setPrivacy}>
                  <SelectTrigger id="privacy">
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="FRIENDS">Friends Only</SelectItem>
                    <SelectItem value="PRIVATE">Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-responses">Allow Responses</Label>
                <Switch 
                  id="allow-responses" 
                  checked={allowResponses} 
                  onCheckedChange={setAllowResponses} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;