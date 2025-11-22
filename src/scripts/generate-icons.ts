import fs from 'fs';
import path from 'path';
import { ICON_DEFINITIONS } from '../utils/iconConstants';
import { generateIcon } from '../utils/iconGenerator';
import { JSDOM } from 'jsdom';

// Mock browser environment for Canvas API
const dom = new JSDOM('<!DOCTYPE html>');
global.document = dom.window.document;
// @ts-ignore
global.Image = dom.window.Image;
// @ts-ignore
global.Blob = dom.window.Blob;
// @ts-ignore
global.URL = dom.window.URL;
// @ts-ignore
global.DOMParser = dom.window.DOMParser;
// @ts-ignore
global.XMLSerializer = dom.window.XMLSerializer;
// @ts-ignore
global.btoa = (str) => Buffer.from(str).toString('base64');

// Mock Canvas
const { createCanvas } = require('canvas');
global.document.createElement = (tagName: string) => {
  if (tagName === 'canvas') {
    return createCanvas(100, 100);
  }
  return dom.window.document.createElement(tagName);
};

async function generateAllIcons() {
  const svgPath = path.join(process.cwd(), 'killer_logo.svg');
  const outputDir = path.join(process.cwd(), 'public', 'app-icons');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  console.log('Generating icons from killer_logo.svg...');

  for (const config of ICON_DEFINITIONS) {
    try {
      // Handle dark mode icons (white stroke)
      const isDarkModeIcon = config.id.includes('-dark');
      const stroke = isDarkModeIcon ? '#ffffff' : '#000000';
      
      // For SVG output (Safari Pinned Tab), we need to handle it differently
      // But our generateIcon function already handles it and returns a data URL
      
      const dataUrl = await generateIcon(svgContent, config, {
        background: 'transparent',
        stroke: stroke,
        padding: 0.1
      });

      const base64Data = dataUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      const outputPath = path.join(outputDir, config.name);
      fs.writeFileSync(outputPath, buffer);
      console.log(`Generated: ${config.name}`);
    } catch (error) {
      console.error(`Error generating ${config.name}:`, error);
    }
  }
  
  console.log('All icons generated successfully!');
}

generateAllIcons();
