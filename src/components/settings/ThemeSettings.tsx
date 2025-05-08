'use client';

import React, { useState } from 'react';
import { Moon, Sun, Palette, Check, Monitor, PanelTop, Toggle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useTheme } from '@/components/providers/ThemeProvider';
import { PRESET_THEMES, ThemeMode } from '@/lib/themes';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColorPicker from '@/components/ui/color-picker';

const fonts = [
  { name: 'System Default', value: 'system-ui, sans-serif' },
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
];

export const ThemeSettings = () => {
  const { 
    mode, 
    setMode, 
    setPrimaryColor,
    setSecondaryColor,
    setFontFamily,
    toggleAnimations,
    animationsEnabled,
    theme,
    presetThemes,
    applyPresetTheme,
    saveThemePreferences,
  } = useTheme();
  
  const [activeTab, setActiveTab] = useState('mode');
  const [selectedPreset, setSelectedPreset] = useState('');
  
  const handleSaveChanges = () => {
    saveThemePreferences();
    toast.success('Theme preferences saved successfully!');
  };
  
  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    applyPresetTheme(presetKey);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Theme Settings</h2>
        <p className="text-muted-foreground">
          Customize the appearance of the application to match your preferences.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="mode" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Mode</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Colors</span>
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center gap-2">
            <PanelTop className="h-4 w-4" />
            <span>Customize</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mode" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemeModeCard
              mode="light"
              name="Light"
              icon={<Sun className="h-5 w-5" />}
              isActive={mode === 'light'}
              onClick={() => setMode('light')}
            />
            <ThemeModeCard
              mode="dark"
              name="Dark"
              icon={<Moon className="h-5 w-5" />}
              isActive={mode === 'dark'}
              onClick={() => setMode('dark')}
            />
            <ThemeModeCard
              mode="dusk"
              name="Dusk"
              icon={<PanelTop className="h-5 w-5" />}
              isActive={mode === 'dusk'}
              onClick={() => setMode('dusk')}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Use system settings</p>
                <p className="text-sm text-muted-foreground">
                  Automatically switch between light and dark mode based on your system.
                </p>
              </div>
            </div>
            <Switch 
              checked={mode === 'system'} 
              onCheckedChange={(checked) => {
                if (checked) {
                  setMode('system');
                } else {
                  // Default to light if unchecking system
                  setMode('light');
                }
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="colors" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Preset Themes</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPreset('')}>
                Reset
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(presetThemes).map(([key, presetTheme]) => (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col items-center rounded-lg p-3 cursor-pointer transition-all",
                    "border hover:border-primary",
                    selectedPreset === key && "border-primary bg-primary/5"
                  )}
                  onClick={() => applyPreset(key)}
                >
                  <div 
                    className="w-full h-12 rounded-md mb-2 relative overflow-hidden"
                    style={{ 
                      background: `linear-gradient(to right, ${presetTheme.primaryColor}, ${presetTheme.secondaryColor || presetTheme.primaryColor})`,
                    }}
                  >
                    {selectedPreset === key && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm">{presetTheme.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Custom Colors</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Primary Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full" 
                          style={{ backgroundColor: theme.primaryColor }} 
                        />
                        <span>{theme.primaryColor}</span>
                      </div>
                      <Palette className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <ColorPicker 
                      color={theme.primaryColor} 
                      onChange={setPrimaryColor} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="mb-2 block">Secondary Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full" 
                          style={{ backgroundColor: theme.secondaryColor || '#cbd5e1' }} 
                        />
                        <span>{theme.secondaryColor || 'Not set'}</span>
                      </div>
                      <Palette className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <ColorPicker 
                      color={theme.secondaryColor || '#cbd5e1'} 
                      onChange={setSecondaryColor} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="customize" className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Typography</h3>
            
            <div>
              <Label htmlFor="font-family" className="mb-2 block">Font Family</Label>
              <Select 
                value={theme.fontFamily || fonts[0].value} 
                onValueChange={setFontFamily}
              >
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Select a font" />
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
            
            <div className="mt-4">
              <Label htmlFor="font-preview" className="mb-2 block">Preview</Label>
              <div 
                id="font-preview"
                className="p-4 border rounded-lg"
                style={{ fontFamily: theme.fontFamily || 'inherit' }}
              >
                <p className="text-2xl font-bold mb-2">The quick brown fox jumps over the lazy dog</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Toggle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Enable Animations</p>
                <p className="text-sm text-muted-foreground">
                  Toggle animations and transitions for better performance on older devices.
                </p>
              </div>
            </div>
            <Switch 
              checked={animationsEnabled} 
              onCheckedChange={toggleAnimations}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};

interface ThemeModeCardProps {
  mode: ThemeMode;
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const ThemeModeCard: React.FC<ThemeModeCardProps> = ({ 
  mode, 
  name, 
  icon, 
  isActive, 
  onClick 
}) => {
  const bgColor = mode === 'light' ? 'bg-white' : mode === 'dark' ? 'bg-gray-900' : 'bg-indigo-900';
  const textColor = mode === 'light' ? 'text-gray-900' : 'text-white';
  
  return (
    <div 
      className={cn(
        "relative rounded-lg border cursor-pointer overflow-hidden transition-all",
        isActive ? "border-primary ring-1 ring-primary" : "hover:border-primary"
      )}
      onClick={onClick}
    >
      <div className={cn("p-6 h-40 flex flex-col items-center justify-center", bgColor, textColor)}>
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-medium">{name}</h3>
        
        {isActive && (
          <motion.div 
            className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check className="h-3 w-3" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;