import { useState, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import { UploadZone } from './components/UploadZone';
import { Controls } from './components/Controls';
import { IconGrid } from './components/IconGrid';
import { ICON_DEFINITIONS } from './utils/iconConstants';
import { generateIcon, modifySvgColors } from './utils/iconGenerator';

export type Theme = 'aurora' | 'sunset' | 'cyberpunk' | 'pastel';

function App() {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgName, setSvgName] = useState<string>('');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  const [generatedIcons, setGeneratedIcons] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [iconColorOverrides, setIconColorOverrides] = useState<Record<string, { stroke: string; background: string }>>({});
  const [iconPaddingOverrides, setIconPaddingOverrides] = useState<Record<string, number>>({});
  const [currentTheme, setCurrentTheme] = useState<Theme>('pastel');

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  const handleGenerate = useCallback(async (content: string, stroke: string, bg: string) => {
    setIsGenerating(true);
    try {
      const newIcons: Record<string, string> = {};
      
      await Promise.all(ICON_DEFINITIONS.map(async (config) => {
        try {
          // Use white stroke for dark mode icons, otherwise use the selected stroke color
          const isDarkModeIcon = config.id.includes('-dark');
          const iconStroke = isDarkModeIcon ? '#ffffff' : stroke;
          const modifiedSvg = modifySvgColors(content, iconStroke);
          
          const dataUrl = await generateIcon(modifiedSvg, config, {
            background: bg,
            stroke: iconStroke,
            padding: 0.1
          });
          newIcons[config.id] = dataUrl;
        } catch (err) {
          console.error(`Failed to generate ${config.name}`, err);
        }
      }));

      setGeneratedIcons(newIcons);
    } catch (error) {
      console.error('Generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleUpload = useCallback((content: string, name: string) => {
    setSvgContent(content);
    setSvgName(name);
    handleGenerate(content, strokeColor, backgroundColor);
  }, [strokeColor, backgroundColor, handleGenerate]);

  const handleRegenerate = () => {
    if (svgContent) {
      handleGenerate(svgContent, strokeColor, backgroundColor);
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder('app-icons');
    
    if (!folder) return;

    ICON_DEFINITIONS.forEach((config) => {
      const dataUrl = generatedIcons[config.id];
      if (dataUrl) {
        const base64Data = dataUrl.split(',')[1];
        folder.file(config.name, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-icons.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIndividual = (config: any, dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = config.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRegenerateIndividual = async (config: any, stroke: string, bg: string, padding: number) => {
    if (!svgContent) return;
    
    // Don't set global loading state for individual regeneration
    try {
      const isDarkModeIcon = config.id.includes('-dark');
      const iconStroke = isDarkModeIcon ? '#ffffff' : stroke;
      const modifiedSvg = modifySvgColors(svgContent, iconStroke);
      
      const dataUrl = await generateIcon(modifiedSvg, config, {
        background: bg,
        stroke: iconStroke,
        padding
      });
      
      // Save color and padding overrides for this icon
      setIconColorOverrides(prev => ({
        ...prev,
        [config.id]: { stroke, background: bg }
      }));
      
      setIconPaddingOverrides(prev => ({
        ...prev,
        [config.id]: padding
      }));
      
      setGeneratedIcons(prev => ({
        ...prev,
        [config.id]: dataUrl
      }));
    } catch (err) {
      console.error(`Failed to regenerate ${config.name}`, err);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <header className="app-header">
          <h1 className="app-title">Icon Generator</h1>
          <p className="app-subtitle">Generate all your app icons from a single SVG</p>
        </header>

        {!svgContent ? (
          <UploadZone onUpload={handleUpload} />
        ) : (
          <div className="workspace">
            <Controls
              strokeColor={strokeColor}
              setStrokeColor={setStrokeColor}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              onRegenerate={handleRegenerate}
              onDownloadAll={handleDownloadAll}
              fileName={svgName}
              onChangeFile={() => setSvgContent(null)}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
            
            {isGenerating ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : (
              <IconGrid 
                icons={ICON_DEFINITIONS} 
                generatedIcons={generatedIcons}
                onDownload={handleDownloadIndividual}
                onRegenerate={handleRegenerateIndividual}
                globalStroke={strokeColor}
                globalBackground={backgroundColor}
                iconColorOverrides={iconColorOverrides}
                iconPaddingOverrides={iconPaddingOverrides}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
