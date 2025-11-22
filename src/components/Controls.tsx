import React from 'react';
import { Download, RefreshCw, FileEdit, Palette } from 'lucide-react';
import type { Theme } from '../App';

interface ControlsProps {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  onRegenerate: () => void;
  onDownloadAll: () => void;
  fileName: string;
  onChangeFile: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  strokeColor,
  setStrokeColor,
  backgroundColor,
  setBackgroundColor,
  onRegenerate,
  onDownloadAll,
  fileName,
  onChangeFile,
  currentTheme,
  onThemeChange
}) => {
  const isTransparent = backgroundColor === 'transparent';

  return (
    <div className="controls-container glass-panel">
      <div className="file-preview-container">
        <div className="file-preview">
          <div className="file-preview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div className="file-info">
            <h2>{fileName}</h2>
            <button onClick={onChangeFile} className="file-change-btn">
              <FileEdit size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Change File
            </button>
          </div>
        </div>
        
        <div className="theme-selector">
          <div className="control-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={16} />
            <span>Theme</span>
          </div>
          <select 
            value={currentTheme} 
            onChange={(e) => onThemeChange(e.target.value as Theme)}
            className="theme-select"
          >
            <option value="aurora">Aurora Mesh</option>
            <option value="sunset">Sunset Glow</option>
            <option value="cyberpunk">Neon Cyberpunk</option>
            <option value="pastel">Soft Pastel</option>
          </select>
        </div>
      </div>

      <div className="controls-content">
        <div className="control-group">
          <label className="control-label">Stroke Color</label>
          <div className="control-inputs">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="color-input"
            />
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Background</label>
          <div className="control-inputs">
            <input
              type="color"
              value={isTransparent ? '#ffffff' : backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              disabled={isTransparent}
              className="color-picker"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={(e) => setBackgroundColor(e.target.checked ? 'transparent' : '#ffffff')}
              />
              Transparent
            </label>
          </div>
        </div>

        <div className="controls-spacer"></div>

        <button onClick={onRegenerate} className="btn btn-secondary">
          <RefreshCw size={18} />
          Regenerate All
        </button>

        <button onClick={onDownloadAll} className="btn btn-primary">
          <Download size={18} />
          Download All
        </button>
      </div>
    </div>
  );
};
