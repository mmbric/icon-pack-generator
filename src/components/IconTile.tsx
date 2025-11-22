import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Download, Pencil, ExternalLink } from 'lucide-react';
import type { IconConfig } from '../utils/iconConstants';

interface IconTileProps {
  config: IconConfig;
  dataUrl: string | null;
  onDownload: (config: IconConfig, dataUrl: string) => void;
  onRegenerate: (config: IconConfig, stroke: string, background: string, padding: number) => void;
  globalStroke: string;
  globalBackground: string;
  colorOverride?: { stroke: string; background: string };
  paddingOverride?: number;
}

export const IconTile: React.FC<IconTileProps> = ({ 
  config, 
  dataUrl, 
  onDownload, 
  onRegenerate,
  globalStroke,
  globalBackground,
  colorOverride,
  paddingOverride
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showColorEditor, setShowColorEditor] = useState(false);
  
  // Use override colors if available, otherwise use global colors
  const currentStroke = colorOverride?.stroke ?? globalStroke;
  const currentBackground = colorOverride?.background ?? globalBackground;
  
  // Use override padding if available, otherwise use default 10%
  const currentPadding = paddingOverride ?? 0.1;
  
  // Convert transparent to white for color picker display
  const displayBackground = currentBackground === 'transparent' ? '#ffffff' : currentBackground;
  
  const [localStroke, setLocalStroke] = useState(currentStroke);
  const [localBackground, setLocalBackground] = useState(displayBackground);
  const [isTransparent, setIsTransparent] = useState(currentBackground === 'transparent');
  const [localPadding, setLocalPadding] = useState(currentPadding * 100); // Convert to percentage for display
  
  // Update local state when color editor is opened
  useEffect(() => {
    if (showColorEditor) {
      setLocalStroke(currentStroke);
      setLocalBackground(displayBackground);
      setIsTransparent(currentBackground === 'transparent');
      setLocalPadding(currentPadding * 100);
    }
  }, [showColorEditor, currentStroke, currentBackground, displayBackground, currentPadding]);
  
  // Auto-regenerate when colors or padding change (debounced)
  useEffect(() => {
    if (!showColorEditor) return;
    
    const timer = setTimeout(() => {
      const bgColor = isTransparent ? 'transparent' : localBackground;
      onRegenerate(config, localStroke, bgColor, localPadding / 100);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [localStroke, localBackground, isTransparent, localPadding, showColorEditor]);

  const handleCopy = () => {
    const html = config.htmlTemplate('/app-icons/' + config.name);
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (dataUrl) {
      onDownload(config, dataUrl);
    }
  };

  const isDarkModeIcon = config.id.includes('-dark');

  return (
    <div className="icon-tile glass-panel">
      <div className={`icon-preview ${isDarkModeIcon ? 'dark-preview' : ''}`}>
        {dataUrl ? (
          <div style={{ position: 'relative' }}>
             <img 
              src={dataUrl} 
              alt={config.name}
              style={{ 
                width: config.width > 128 ? 128 : config.width, 
                height: config.height > 128 ? 128 : config.height,
                objectFit: 'contain'
              }}
            />
            <div className="icon-overlay"></div>
          </div>
        ) : (
          <div className="waiting-text">Generating...</div>
        )}
        <div className="icon-size-badge">
          {config.width}x{config.height}
        </div>
      </div>

      <div className="icon-content">
        <div className="icon-info">
          <h3 className="icon-name">{config.name}</h3>
          <p className="icon-usage">{config.usage}</p>
        </div>

        {/* Action Buttons */}
        <div className="icon-actions">
          <button
            onClick={handleDownload}
            className="icon-action-btn"
            disabled={!dataUrl}
            title="Download this icon"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
          <button
            onClick={() => setShowColorEditor(!showColorEditor)}
            className="icon-action-btn"
            disabled={!dataUrl}
            title="Edit this icon"
          >
            <Pencil size={16} />
            <span>Edit</span>
          </button>
        </div>

        {/* Color Editor */}
        {showColorEditor && (
          <div className="color-editor">
            <div className="color-editor-row">
              <label>
                <span>Stroke:</span>
                <input
                  type="color"
                  value={localStroke}
                  onChange={(e) => setLocalStroke(e.target.value)}
                  disabled={isDarkModeIcon}
                />
              </label>
              <label>
                <span>Background:</span>
                <input
                  type="color"
                  value={localBackground}
                  onChange={(e) => setLocalBackground(e.target.value)}
                  disabled={isTransparent}
                />
              </label>
            </div>
            <label className="transparent-checkbox">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={(e) => setIsTransparent(e.target.checked)}
              />
              <span>Transparent background</span>
            </label>
            
            {/* Padding Control */}
            <div className="padding-controls">
              <label>
                <div className="padding-label">
                  <span>Padding</span>
                  <span className="padding-value">{localPadding.toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={localPadding}
                  onChange={(e) => setLocalPadding(Number(e.target.value))}
                  className="padding-slider"
                />
              </label>
            </div>
            
            {isDarkModeIcon && (
              <p className="color-editor-note">
                Note: Dark mode icons always use white stroke
              </p>
            )}
          </div>
        )}

        {/* Expandable Description */}
        <div className="icon-description-container">
          <button
            onClick={() => setExpanded(!expanded)}
            className="expand-button"
          >
            <span>Details</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expanded && (
            <div className="icon-description">
              <p>{config.description}</p>
              {config.learnMoreUrl && (
                <a 
                  href={config.learnMoreUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="learn-more-link"
                >
                  <ExternalLink size={14} />
                  <span>Learn more</span>
                </a>
              )}
              {/* HTML Code */}
              <div className="icon-code-container">
                <div className="icon-code">
                  <code>
                    {config.htmlTemplate('/app-icons/' + config.name)}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`copy-button ${copied ? 'copied' : ''}`}
                    title="Copy HTML"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
