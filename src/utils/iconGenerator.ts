import type { IconConfig } from './iconConstants';

export interface GenerationSettings {
  background: string; // Hex or rgba
  stroke: string; // Hex or rgba
  fill?: string; // Hex or rgba
  padding?: number; // Padding as percentage (0-1)
}

export const generateIcon = async (
  svgContent: string,
  config: IconConfig,
  settings: GenerationSettings
): Promise<string> => {
  // Handle SVG output (Safari Pinned Tab)
  if (config.type === 'image/svg+xml') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = doc.documentElement;
    
    // For pinned tabs, we want a monochrome SVG (usually black)
    // The actual color is applied via the link tag's color attribute
    // We'll strip existing colors and apply black fill
    const elements = svgElement.querySelectorAll('*');
    elements.forEach(el => {
      if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
        el.setAttribute('fill', 'black');
      }
      if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
        el.setAttribute('stroke', 'black');
      }
      // Also handle style attributes
      if (el.hasAttribute('style')) {
        (el as HTMLElement).style.fill = 'black';
        (el as HTMLElement).style.stroke = 'black';
      }
    });
    
    const serializer = new XMLSerializer();
    const newSvgContent = serializer.serializeToString(svgElement);
    return `data:image/svg+xml;base64,${btoa(newSvgContent)}`;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = config.width;
      canvas.height = config.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw background if needed
      if (!config.transparent || settings.background !== 'transparent') {
        ctx.fillStyle = settings.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Calculate dimensions with uniform padding
      const paddingPercent = settings.padding ?? 0.1;
      const paddingX = paddingPercent * canvas.width;
      const paddingY = paddingPercent * canvas.height;
      const availableWidth = canvas.width - (paddingX * 2);
      const availableHeight = canvas.height - (paddingY * 2);

      // Calculate aspect ratios
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = availableWidth / availableHeight;

      let drawWidth: number;
      let drawHeight: number;

      // Maintain aspect ratio - fit image within available space
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas - fit to width
        drawWidth = availableWidth;
        drawHeight = availableWidth / imgAspectRatio;
      } else {
        // Image is taller than canvas - fit to height
        drawHeight = availableHeight;
        drawWidth = availableHeight * imgAspectRatio;
      }

      // Center the image on the canvas
      const x = paddingX + (availableWidth - drawWidth) / 2;
      const y = paddingY + (availableHeight - drawHeight) / 2;

      // Draw image with maintained aspect ratio
      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Export
      const dataUrl = canvas.toDataURL(config.type);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
};

export const modifySvgColors = (svgContent: string, stroke: string, fill?: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  // This is a naive implementation. A robust one would traverse all elements.
  // For now, let's try to update common attributes on the root or all elements.
  
  const elements = doc.querySelectorAll('*');
  elements.forEach(el => {
    if (el.hasAttribute('stroke') && stroke) {
      if (el.getAttribute('stroke') !== 'none') {
         el.setAttribute('stroke', stroke);
      }
    }
    if (el.hasAttribute('fill') && fill) {
       if (el.getAttribute('fill') !== 'none') {
         el.setAttribute('fill', fill);
       }
    }
    // Also handle style attributes if possible, but that's harder.
  });

  return new XMLSerializer().serializeToString(doc);
};
