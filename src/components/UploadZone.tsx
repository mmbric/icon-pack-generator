import React, { useCallback } from 'react';
import { Upload, FileUp } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (content: string, filename: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') {
      readFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpload(content, file.name);
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="upload-zone glass-panel"
    >
      <label className="upload-zone">
        <div className="upload-icon">
          <Upload size={32} color="#2563eb" />
        </div>
        <h3 className="upload-title">Upload your SVG</h3>
        <p className="upload-description">Drag and drop or click to browse</p>
        <input
          type="file"
          accept=".svg"
          className="upload-input"
          onChange={handleFileChange}
        />
        <div className="upload-hint">
          <FileUp size={16} />
          <span>Supports SVG files only</span>
        </div>
      </label>
    </div>
  );
};
