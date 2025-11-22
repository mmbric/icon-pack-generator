import React from 'react';
import { IconTile } from './IconTile';
import type { IconConfig } from '../utils/iconConstants';

interface IconGridProps {
  icons: IconConfig[];
  generatedIcons: Record<string, string>;
  onDownload: (config: IconConfig, dataUrl: string) => void;
  onRegenerate: (config: IconConfig, stroke: string, background: string, padding: number) => void;
  globalStroke: string;
  globalBackground: string;
  iconColorOverrides: Record<string, { stroke: string; background: string }>;
  iconPaddingOverrides: Record<string, number>;
}

export const IconGrid: React.FC<IconGridProps> = ({ 
  icons, 
  generatedIcons,
  onDownload,
  onRegenerate,
  globalStroke,
  globalBackground,
  iconColorOverrides,
  iconPaddingOverrides
}) => {
  return (
    <div className="icon-grid">
      {icons.map((config) => (
        <IconTile
          key={config.id}
          config={config}
          dataUrl={generatedIcons[config.id] || null}
          onDownload={onDownload}
          onRegenerate={onRegenerate}
          globalStroke={globalStroke}
          globalBackground={globalBackground}
          colorOverride={iconColorOverrides[config.id]}
          paddingOverride={iconPaddingOverrides[config.id]}
        />
      ))}
    </div>
  );
};
