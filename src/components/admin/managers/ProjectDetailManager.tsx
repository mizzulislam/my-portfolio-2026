import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Check, Trash2, Image as ImageIcon, Plus, GripVertical, 
  FileText, Columns, Table, Film, AlignLeft, Eye, ChevronDown, ChevronUp, Link as LinkIcon, Layers,
  ChevronLeft, ChevronRight, EyeOff, Bold, Italic, Underline, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, FolderPlus, UploadCloud, Folder, Search, Video, Music, Copy
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Project } from "@/src/types/project";
import { projectsApi } from "@/src/lib/api/projects";
import { AdminCard, AdminBtn, ImageUpload, AdminConfirmModal, AdminDropdown } from "../AdminSharedUI";
import RichTextEditor from "../RichTextEditor";
import { supabase } from "@/src/lib/supabase";
import { translateToIndonesian, translateArrayToIndonesian } from "@/src/lib/translate";

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectDetailManagerProps {
  projectId: string;
  onBack: () => void;
}

// Block Schema type
type BlockType = "text" | "divider" | "media" | "table" | "grid" | "carousel" | "accordion" | "split-banner";

interface BlockItem {
  id: string;
  type: BlockType;
  data: any;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  isHidden?: boolean;
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to extract hex color from hex/rgb/rgba string
const getHexColor = (colorStr: string) => {
  if (!colorStr) return "#ffffff";
  const trimmed = colorStr.trim();
  if (trimmed.startsWith("#")) {
    if (trimmed.length === 4) {
      return "#" + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
    }
    return trimmed.substring(0, 7);
  }
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return "#ffffff";
};

function CustomColorPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // HSV state: h (0-360), s (0-100), v (0-100), a (0-1)
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 100, a: 1.0 });

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    s = s / 100;
    v = v / 100;
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) {
        h = ((g - b) / d) % 6;
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else if (max === b) {
        h = (r - g) / d + 4;
      }
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : Math.round((d / max) * 100);
    const v = Math.round(max * 100);
    return { h, s, v };
  };

  // RGB to HEX String (#rrggbb)
  const rgbToHex = (r: number, g: number, b: number) => {
    const hexR = Math.max(0, Math.min(255, r)).toString(16).padStart(2, '0');
    const hexG = Math.max(0, Math.min(255, g)).toString(16).padStart(2, '0');
    const hexB = Math.max(0, Math.min(255, b)).toString(16).padStart(2, '0');
    return `#${hexR}${hexG}${hexB}`;
  };

  // Parse color string to RGBA values
  const parseColor = (colorStr: string) => {
    let r = 255, g = 255, b = 255, a = 1.0;
    const trimmed = (colorStr || "").trim().toLowerCase();

    if (trimmed.startsWith("#")) {
      let hex = trimmed.substring(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length === 4) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16) || 0;
        g = parseInt(hex.substring(2, 4), 16) || 0;
        b = parseInt(hex.substring(4, 6), 16) || 0;
        a = 1.0;
      } else if (hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16) || 0;
        g = parseInt(hex.substring(2, 4), 16) || 0;
        b = parseInt(hex.substring(4, 6), 16) || 0;
        a = Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100) / 100;
      }
    } else {
      const match = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
        a = match[4] !== undefined ? parseFloat(match[4]) : 1.0;
      }
    }
    return {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
      a: Math.max(0, Math.min(1, a)),
    };
  };

  // Sync prop value with internal HSV state
  useEffect(() => {
    const { r: pr, g: pg, b: pb, a: pa } = parseColor(value);
    const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    if (currentRgb.r !== pr || currentRgb.g !== pg || currentRgb.b !== pb || hsv.a !== pa) {
      const newHsv = rgbToHsv(pr, pg, pb);
      setHsv({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: pa });
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const sbRef = useRef<HTMLDivElement>(null);

  // Saturation / Brightness Board Mouse Drag
  const handleSBDrag = (clientX: number, clientY: number) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);
    
    setHsv((prev) => {
      const next = { ...prev, s, v };
      const rgb = hsvToRgb(next.h, next.s, next.v);
      const output = next.a === 1.0 
        ? rgbToHex(rgb.r, rgb.g, rgb.b) 
        : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${next.a})`;
      onChange(output);
      return next;
    });
  };

  const handleSBStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    handleSBDrag(clientX, clientY);

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const mIsTouch = 'touches' in moveEvent;
      const mClientX = mIsTouch ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const mClientY = mIsTouch ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;
      handleSBDrag(mClientX, mClientY);
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  const handleHueChange = (newH: number) => {
    setHsv((prev) => {
      const next = { ...prev, h: newH };
      const rgb = hsvToRgb(next.h, next.s, next.v);
      const output = next.a === 1.0 
        ? rgbToHex(rgb.r, rgb.g, rgb.b) 
        : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${next.a})`;
      onChange(output);
      return next;
    });
  };

  const handleAlphaChange = (newA: number) => {
    setHsv((prev) => {
      const next = { ...prev, a: newA };
      const rgb = hsvToRgb(next.h, next.s, next.v);
      const output = next.a === 1.0 
        ? rgbToHex(rgb.r, rgb.g, rgb.b) 
        : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${next.a})`;
      onChange(output);
      return next;
    });
  };

  const handlePresetClick = (presetVal: string) => {
    const parsed = parseColor(presetVal);
    const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    setHsv({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: parsed.a });
    onChange(presetVal);
  };

  const handleHexInput = (val: string) => {
    if (/^#[0-9a-fA-F]{3,8}$/.test(val)) {
      const parsed = parseColor(val);
      const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHsv({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: parsed.a });
      onChange(val);
    }
  };

  const handleRgbaInput = (val: string) => {
    if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.test(val.trim())) {
      const parsed = parseColor(val);
      const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHsv({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: parsed.a });
      onChange(val);
    }
  };

  const { r: curR, g: curG, b: curB } = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const hexString = rgbToHex(curR, curG, curB);
  const rgbaString = `rgba(${curR}, ${curG}, ${curB}, ${hsv.a})`;

  const presets = [
    { name: "Brand Blue", value: "#3b82f6" },
    { name: "Brand Purple", value: "#8b5cf6" },
    { name: "Brand Cyan", value: "#06b6d4" },
    { name: "Brand Emerald", value: "#10b981" },
    { name: "Brand Amber", value: "#f59e0b" },
    { name: "Brand Rose", value: "#f43f5e" },
    { name: "Solid White", value: "#ffffff" },
    { name: "White 20%", value: "rgba(255,255,255,0.2)" },
    { name: "White 10%", value: "rgba(255,255,255,0.1)" },
    { name: "Blue 20%", value: "rgba(59,130,246,0.2)" },
    { name: "Blue 10%", value: "rgba(59,130,246,0.1)" },
    { name: "Transparent Glass", value: "rgba(255,255,255,0.05)" },
  ];

  const isEyeDropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  const triggerEyeDropper = async () => {
    if (!isEyeDropperSupported) return;
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const parsed = parseColor(result.sRGBHex);
      const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHsv({ h: newHsv.h, s: newHsv.s, v: newHsv.v, a: 1.0 });
      onChange(result.sRGBHex);
    } catch (e) {
      console.log("EyeDropper closed or failed:", e);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 rounded-xl bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-white/10 flex items-center justify-center shrink-0 transition-all relative overflow-hidden group shadow-md"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23475569'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23475569'/%3E%3Crect x='4' width='4' height='4' fill='%231e293b'/%3E%3Crect y='4' width='4' height='4' fill='%231e293b'/%3E%3C/svg%3E")`
        }}
        title="Open color picker"
      >
        <span
          className="absolute inset-0.5 rounded-lg border border-white/10 transition-all group-hover:scale-95 shadow-sm block"
          style={{ background: value || "#ffffff" }}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute left-0 mt-3 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] w-[280px] space-y-4"
        >
          {/* Saturation/Brightness Board */}
          <div 
            ref={sbRef}
            onMouseDown={handleSBStart}
            onTouchStart={handleSBStart}
            className="w-full h-32 rounded-xl relative overflow-hidden cursor-crosshair border border-white/5 select-none"
            style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div 
              className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.6)] bg-transparent absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
            />
          </div>

          {/* Sliders Area */}
          <div className="space-y-3">
            {/* Hue Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono tracking-wider">
                <span>HUE</span>
                <span>{hsv.h}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hsv.h}
                onChange={(e) => handleHueChange(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg cursor-pointer appearance-none outline-none border border-white/10 shadow-sm
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-900/30 [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-slate-900/30 [&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:border-none"
                style={{
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
            </div>

            {/* Alpha Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono tracking-wider">
                <span>OPACITY</span>
                <span>{Math.round(hsv.a * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={hsv.a}
                onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                className="w-full h-3 rounded-lg cursor-pointer appearance-none outline-none border border-white/10 shadow-sm
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-slate-900/30 [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-slate-900/30 [&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.3)] [&::-moz-range-thumb]:border-none"
                style={{
                  background: `linear-gradient(to right, rgba(${curR}, ${curG}, ${curB}, 0), rgba(${curR}, ${curG}, ${curB}, 1)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23475569'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23475569'/%3E%3Crect x='4' width='4' height='4' fill='%231e293b'/%3E%3Crect y='4' width='4' height='4' fill='%231e293b'/%3E%3C/svg%3E") repeat`
                }}
              />
            </div>
          </div>

          {/* Color Preview & Pipette Row */}
          <div className="flex items-center gap-3 pt-1">
            <div 
              className="w-10 h-10 rounded-xl border border-white/10 relative overflow-hidden shrink-0 shadow-inner"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23475569'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23475569'/%3E%3Crect x='4' width='4' height='4' fill='%231e293b'/%3E%3Crect y='4' width='4' height='4' fill='%231e293b'/%3E%3C/svg%3E")`
              }}
            >
              <div 
                className="absolute inset-0 transition-all duration-150"
                style={{ backgroundColor: value || "#ffffff" }}
              />
            </div>

            {isEyeDropperSupported && (
              <button
                type="button"
                onClick={triggerEyeDropper}
                className="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-md active:scale-95"
                title="Eye Dropper - Pick a color from screen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pipette">
                  <path d="m2 22 1-1c1.4-1.4 2.4-3.2 3-5.2L7.5 12H12L22 2l.01.01L12 12v4.5l-3.8 1.5c-2 1-3.8 2-5.2 3.5l-1 1" />
                  <path d="m17 7 3-3" />
                  <path d="m19 9 1-1" />
                  <path d="m15 5 1-1" />
                  <path d="m9 15 3-3" />
                </svg>
              </button>
            )}

            {/* Manual Inputs inside popover */}
            <div className="grid grid-cols-2 gap-2 text-slate-300 flex-1">
              <div className="space-y-1">
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block font-mono">HEX</span>
                <input
                  type="text"
                  value={hexString}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-lg py-1 px-1.5 text-[9px] text-slate-300 focus:outline-none focus:border-blue-500/40 text-center font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest block font-mono">RGBA</span>
                <input
                  type="text"
                  value={rgbaString}
                  onChange={(e) => handleRgbaInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/5 rounded-lg py-1 px-1 text-[9px] text-slate-300 focus:outline-none focus:border-blue-500/40 text-center font-mono"
                />
              </div>
            </div>
          </div>

          {/* Presets Swatches */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Preset Colors</span>
            <div className="grid grid-cols-6 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`w-6 h-6 rounded-lg border transition-all duration-150 hover:scale-115 hover:rotate-2 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-95 relative overflow-hidden ${
                    value === preset.value ? "border-blue-500 scale-105" : "border-white/10"
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Crect width='4' height='4' fill='%23475569'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23475569'/%3E%3Crect x='4' width='4' height='4' fill='%231e293b'/%3E%3Crect y='4' width='4' height='4' fill='%231e293b'/%3E%3C/svg%3E")`
                  }}
                  title={preset.name}
                >
                  <span 
                    className="absolute inset-0"
                    style={{ backgroundColor: preset.value }}
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Sortable Wrapper Component
function SortableBlockWrapper({ id, onDelete, onDuplicate, children }: { id: string; onDelete: () => void; onDuplicate: () => void; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group border border-slate-100 bg-slate-50/70 p-6 rounded-2xl transition-all hover:border-slate-200 hover:bg-slate-50 text-slate-900 shadow-sm">
      {/* Drag & Action Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 hover:bg-slate-200/40 rounded-lg py-1 px-2.5 transition-all"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Move Block</span>
        </div>
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onDuplicate}
            className="text-[9px] font-bold uppercase tracking-wider bg-slate-200/60 hover:bg-slate-200 text-slate-600 py-1 px-2.5 rounded-md transition-all cursor-pointer"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-[9px] font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-600 py-1 px-2.5 rounded-md transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

// Helper to translate all blocks to Indonesian in batch
async function translateBlocksToIndonesian(blocks: BlockItem[]): Promise<BlockItem[]> {
  const cloned = JSON.parse(JSON.stringify(blocks));
  const textsToTranslate: { text: string; apply: (translated: string) => void }[] = [];

  for (const block of cloned) {
    if (block.type === "text") {
      if (block.data.html && block.data.html.trim() !== "") {
        textsToTranslate.push({
          text: block.data.html,
          apply: (translated) => { block.data.html = translated; }
        });
      }
    } else if (block.type === "media") {
      if (block.data.caption && block.data.caption.trim() !== "") {
        textsToTranslate.push({
          text: block.data.caption,
          apply: (translated) => { block.data.caption = translated; }
        });
      }
    } else if (block.type === "table") {
      if (block.data.headers) {
        block.data.headers.forEach((h: string, idx: number) => {
          if (h && h.trim() !== "") {
            textsToTranslate.push({
              text: h,
              apply: (translated) => { block.data.headers[idx] = translated; }
            });
          }
        });
      }
      if (block.data.rows) {
        block.data.rows.forEach((row: string[], rowIdx: number) => {
          row.forEach((cell: string, cellIdx: number) => {
            if (cell && cell.trim() !== "") {
              textsToTranslate.push({
                text: cell,
                apply: (translated) => { block.data.rows[rowIdx][cellIdx] = translated; }
              });
            }
          });
        });
      }
    } else if (block.type === "grid") {
      if (block.data.items) {
        block.data.items.forEach((item: any, idx: number) => {
          if (item.title && item.title.trim() !== "") {
            textsToTranslate.push({
              text: item.title,
              apply: (translated) => { block.data.items[idx].title = translated; }
            });
          }
          if (item.content && item.content.trim() !== "") {
            textsToTranslate.push({
              text: item.content,
              apply: (translated) => { block.data.items[idx].content = translated; }
            });
          }
        });
      }
    } else if (block.type === "accordion") {
      if (block.data.items) {
        block.data.items.forEach((item: any, idx: number) => {
          if (item.title && item.title.trim() !== "") {
            textsToTranslate.push({
              text: item.title,
              apply: (translated) => { block.data.items[idx].title = translated; }
            });
          }
          if (item.content && item.content.trim() !== "") {
            textsToTranslate.push({
              text: item.content,
              apply: (translated) => { block.data.items[idx].content = translated; }
            });
          }
        });
      }
    } else if (block.type === "split-banner") {
      if (block.data.title && block.data.title.trim() !== "") {
        textsToTranslate.push({
          text: block.data.title,
          apply: (translated) => { block.data.title = translated; }
        });
      }
      if (block.data.content && block.data.content.trim() !== "") {
        textsToTranslate.push({
          text: block.data.content,
          apply: (translated) => { block.data.content = translated; }
        });
      }
    }
  }

  if (textsToTranslate.length === 0) return cloned;

  // Batch translate
  const rawTexts = textsToTranslate.map(t => t.text);
  try {
    const translatedTexts = await translateArrayToIndonesian(rawTexts);
    textsToTranslate.forEach((t, idx) => {
      if (translatedTexts[idx]) {
        t.apply(translatedTexts[idx]);
      }
    });
  } catch (err) {
    console.error("Failed to translate block contents", err);
  }

  return cloned;
}

export default function ProjectDetailManager({ projectId, onBack }: ProjectDetailManagerProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [blocksState, setBlocksState] = useState<BlockItem[]>([]);
  const [specsLayout, setSpecsLayout] = useState<"right" | "left" | "hidden">("right");

  // Media Library State
  interface MediaFolder {
    id: string;
    name: string;
  }
  interface MediaFile {
    id: string;
    name: string;
    url: string;
    type: "image" | "video" | "audio";
    folderId?: string;
  }

  const [mediaFolders, setMediaFolders] = useState<MediaFolder[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"blocks" | "uploads">("blocks");
  const [mediaTab, setMediaTab] = useState<"images" | "video" | "audio" | "folders">("images");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const ensurePositions = (items: BlockItem[]) => {
    return items.map((block, idx) => {
      if (!block.position || block.position.x === undefined) {
        return {
          ...block,
          position: {
            x: 40,
            y: idx * 240 + 40,
            w: 750,
            h: block.type === "text" ? 150 : 200
          },
          isHidden: block.isHidden || false
        };
      }
      return block;
    });
  };

  const setBlocks = (newVal: BlockItem[] | ((prev: BlockItem[]) => BlockItem[])) => {
    if (typeof newVal === "function") {
      setBlocksState(prev => ensurePositions(newVal(prev)));
    } else {
      setBlocksState(ensurePositions(newVal));
    }
  };

  const blocks = blocksState;
  const canvasHeight = Math.max(...blocks.map(b => (b.position?.y || 0) + (b.position?.h || 200)), 800) + 100;

  const startDrag = (e: React.MouseEvent, blockId: string) => {
    e.preventDefault();
    setActiveBlockId(blockId);
    
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.position) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...block.position };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newX = Math.max(0, startPos.x + deltaX);
      const newY = Math.max(0, startPos.y + deltaY);
      
      setBlocksState(prev => prev.map(b => b.id === blockId ? {
        ...b,
        position: {
          ...b.position!,
          x: newX,
          y: newY
        }
      } : b));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const startResize = (e: React.MouseEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.position) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { 
      w: block.position.w || 700, 
      h: block.position.h || 200 
    };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newW = Math.max(100, startSize.w + deltaX);
      const newH = Math.max(50, startSize.h + deltaY);
      
      setBlocksState(prev => prev.map(b => b.id === blockId ? {
        ...b,
        position: {
          ...b.position!,
          w: newW,
          h: newH
        }
      } : b));
    };
    
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Step Wizard State
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Accordion active index helper in preview mode
  const [activeAccordionIdx, setActiveAccordionIdx] = useState<{ [blockId: string]: number | null }>({});

  // Custom Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag to Resize Columns Ref & Handler
  const colResizeRef = useRef<{
    blockId: string;
    colIdx: number;
    startWidth: number;
    startX: number;
  } | null>(null);

  const handleColResizeStart = (e: React.MouseEvent, blockId: string, colIdx: number) => {
    e.preventDefault();
    const thElement = (e.target as HTMLElement).parentElement;
    if (!thElement) return;

    const startWidth = thElement.getBoundingClientRect().width;
    const startX = e.clientX;

    colResizeRef.current = {
      blockId,
      colIdx,
      startWidth,
      startX,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!colResizeRef.current) return;
      const { blockId: activeId, colIdx: activeIdx, startWidth: w, startX: x } = colResizeRef.current;
      const deltaX = moveEvent.clientX - x;
      const newWidth = Math.max(50, w + deltaX); // Min width 50px

      setBlocks((prevBlocks) =>
        prevBlocks.map((b) => {
          if (b.id === activeId) {
            const currentWidths = [...(b.data.columnWidths || Array(b.data.headers.length).fill(""))];
            currentWidths[activeIdx] = `${newWidth}px`;
            return {
              ...b,
              data: {
                ...b.data,
                columnWidths: currentWidths,
              },
            };
          }
          return b;
        })
      );
    };

    const handleMouseUp = () => {
      colResizeRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drag to Resize Rows Ref & Handler
  const rowResizeRef = useRef<{
    blockId: string;
    rowIdx: number;
    startHeight: number;
    startY: number;
  } | null>(null);

  const handleRowResizeStart = (e: React.MouseEvent, blockId: string, rowIdx: number) => {
    e.preventDefault();
    const trElement = (e.target as HTMLElement).closest("tr");
    if (!trElement) return;

    const startHeight = trElement.getBoundingClientRect().height;
    const startY = e.clientY;

    rowResizeRef.current = {
      blockId,
      rowIdx,
      startHeight,
      startY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!rowResizeRef.current) return;
      const { blockId: activeId, rowIdx: activeIdx, startHeight: h, startY: y } = rowResizeRef.current;
      const deltaY = moveEvent.clientY - y;
      const newHeight = Math.max(25, h + deltaY); // Min height 25px

      setBlocks((prevBlocks) =>
        prevBlocks.map((b) => {
          if (b.id === activeId) {
            const currentHeights = [...(b.data.rowHeights || Array(b.data.rows.length).fill(""))];
            currentHeights[activeIdx] = `${newHeight}px`;
            return {
              ...b,
              data: {
                ...b.data,
                rowHeights: currentHeights,
              },
            };
          }
          return b;
        })
      );
    };

    const handleMouseUp = () => {
      rowResizeRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const data = await projectsApi.getAll();
        const found = data.find((p) => p.id === projectId);
        if (found) {
          setProject(found);
          setGalleryImages(found.gallery_images || []);
          
          const rawContent = found.detailed_content || "";
          const trimmed = rawContent.trim();
          if (trimmed.startsWith("[")) {
            try {
              const parsed = JSON.parse(trimmed);
              setBlocks(parsed);
              setSpecsLayout("right");
            } catch (err) {
              setBlocks([{ id: "text-init", type: "text", data: { html: rawContent } }]);
              setSpecsLayout("right");
            }
          } else if (trimmed.startsWith("{")) {
            try {
              const parsed = JSON.parse(trimmed);
              setBlocks(parsed.blocks || []);
              setSpecsLayout(parsed.specsLayout || "right");
              if (parsed.mediaLibrary) {
                setMediaFolders(parsed.mediaLibrary.folders || []);
                setMediaFiles(parsed.mediaLibrary.files || []);
              }
            } catch (err) {
              setBlocks([{ id: "text-init", type: "text", data: { html: rawContent } }]);
              setSpecsLayout("right");
            }
          } else {
            setBlocks([{ id: "text-init", type: "text", data: { html: rawContent } }]);
            setSpecsLayout("right");
          }
        } else {
          toast.error("Proyek tidak ditemukan");
          onBack();
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat detail proyek");
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      loadProject();
    }
  }, [projectId, onBack]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toastId = toast.loading("Menerjemahkan konten studi kasus secara otomatis...");
      let translatedBlocks = blocks;
      try {
        translatedBlocks = await translateBlocksToIndonesian(blocks);
      } catch (err) {
        console.error("Auto translation error:", err);
      }
      toast.dismiss(toastId);

      const payloadEn = JSON.stringify({ specsLayout, blocks, mediaLibrary: { folders: mediaFolders, files: mediaFiles } });
      const payloadId = JSON.stringify({ specsLayout, blocks: translatedBlocks, mediaLibrary: { folders: mediaFolders, files: mediaFiles } });

      await projectsApi.update(projectId, {
        detailed_content: payloadEn,
        detailed_content_id: payloadId,
        gallery_images: galleryImages,
      });
      toast.success("Tata letak blok & studi kasus berhasil disimpan! 🚀");
      setStep("edit"); // return to editor
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan detail proyek");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Add block action
  const addBlock = (type: BlockType) => {
    let defaultData: any = {};
    
    switch (type) {
      case "text":
        defaultData = { html: "", mode: "rich" };
        break;
      case "divider":
        defaultData = { style: "line", color: "rgba(255,255,255,0.1)" };
        break;
      case "media":
        defaultData = { mediaType: "image", url: "", caption: "Keterangan gambar atau video." };
        break;
      case "table":
        defaultData = { 
          headers: ["Kolom A", "Kolom B"], 
          rows: [["Baris 1 Sel A", "Baris 1 Sel B"], ["Baris 2 Sel A", "Baris 2 Sel B"]],
          columnWidths: ["", ""],
          cellPadding: "standard",
          rowHeight: ""
        };
        break;
      case "grid":
        defaultData = { 
          columns: 2, 
          items: [
            { title: "Fitur Unggulan 1", content: "Penjelasan detail mengenai fitur atau poin unggulan ini." },
            { title: "Fitur Unggulan 2", content: "Penjelasan detail mengenai fitur atau poin unggulan ini." }
          ] 
        };
        break;
      case "carousel":
        defaultData = { images: [] };
        break;
      case "accordion":
        defaultData = { 
          items: [
            { title: "Poin Pembahasan 1 (FAQ)", content: "Detail jawaban atau penjelasan poin di sini." }
          ] 
        };
        break;
      case "split-banner":
        defaultData = { 
          layout: "left", 
          mediaUrl: "", 
          mediaType: "image", 
          title: "Judul Sorotan Utama", 
          content: "Penjelasan studi kasus yang disandingkan dengan media representatif di sebelahnya." 
        };
        break;
    }

    const maxY = blocks.reduce((max, b) => Math.max(max, (b.position?.y || 0) + (b.position?.h || 200)), 0);
    const newBlock: BlockItem = {
      id: generateId(),
      type,
      data: defaultData,
      position: {
        x: 40,
        y: maxY + 40,
        w: 750,
        h: type === "text" ? 150 : type === "divider" ? 60 : 200
      },
      isHidden: false
    };

    setBlocks(prev => [...prev, newBlock]);
    toast.success(`Blok ${type.toUpperCase()} berhasil ditambahkan!`);
  };

  const updateBlock = (blockId: string, updatedData: any) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, data: { ...b.data, ...updatedData } } : b));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const duplicateBlock = (blockId: string) => {
    const blockToCopy = blocks.find(b => b.id === blockId);
    if (blockToCopy) {
      const duplicated: BlockItem = {
        id: generateId(),
        type: blockToCopy.type,
        data: JSON.parse(JSON.stringify(blockToCopy.data)),
        position: {
          x: (blockToCopy.position?.x || 40) + 20,
          y: (blockToCopy.position?.y || 40) + 20,
          w: blockToCopy.position?.w || 750,
          h: blockToCopy.position?.h || 200
        },
        isHidden: blockToCopy.isHidden || false
      };
      const idx = blocks.findIndex(b => b.id === blockId);
      const newBlocks = [...blocks];
      newBlocks.splice(idx + 1, 0, duplicated);
      setBlocks(newBlocks);
      toast.success("Blok berhasil diduplikasi!");
    }
  };

  const handleAddImage = (url: string) => {
    if (url) {
      setGalleryImages((prev) => [...prev, url]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image") {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        toast.error("API Key ImgBB tidak ditemukan di .env!");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran gambar terlalu besar! Maksimal 2MB.");
        return;
      }

      const toastId = toast.loading("Mengunggah gambar ke ImgBB...");
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("key", apiKey);

        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          const url = data.data.url;
          const newFile: MediaFile = {
            id: generateId(),
            name: file.name,
            url,
            type: "image",
            folderId: selectedFolderId || undefined
          };
          setMediaFiles(prev => [...prev, newFile]);
          toast.success("Gambar berhasil diunggah! 🚀");
        } else {
          toast.error("Gagal mengunggah gambar.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan saat mengunggah.");
      } finally {
        toast.dismiss(toastId);
      }
    } else {
      const url = window.prompt(`Masukkan URL/Link eksternal untuk file ${type} "${file.name}":`);
      if (url) {
        const newFile: MediaFile = {
          id: generateId(),
          name: file.name,
          url,
          type,
          folderId: selectedFolderId || undefined
        };
        setMediaFiles(prev => [...prev, newFile]);
        toast.success(`${type === "video" ? "Video" : "Audio"} ditambahkan!`);
      }
    }
  };

  const insertMediaBlock = (file: MediaFile) => {
    const maxY = blocks.reduce((max, b) => Math.max(max, (b.position?.y || 0) + (b.position?.h || 200)), 0);
    const newBlock: BlockItem = {
      id: generateId(),
      type: "media",
      data: {
        mediaType: file.type === "video" ? "video" : "image",
        url: file.url,
        caption: file.name
      },
      position: {
        x: 40,
        y: maxY + 40,
        w: 750,
        h: 400
      },
      isHidden: false
    };
    setBlocks(prev => [...prev, newBlock]);
    toast.success(`Elemen media "${file.name}" ditambahkan ke Kanvas!`);
  };

  // Stack/Composite Block layout presets
  const applyUXLayoutStack = (layoutType: "standard" | "showcase" | "tech") => {
    triggerConfirm(
      "Terapkan Preset Tata Letak",
      "Apakah Anda yakin ingin memuat preset gabungan blok template ini? Blok yang ada saat ini akan diganti sepenuhnya.",
      () => {
        let preset: BlockItem[] = [];

    if (layoutType === "standard") {
      preset = [
        {
          id: generateId(),
          type: "split-banner",
          data: {
            layout: "left",
            mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            mediaType: "image",
            title: "Latar Belakang & Ringkasan Eksekutif",
            content: "Proyek ini dirancang untuk menyederhanakan alur kerja keuangan. Kami mengidentifikasi masalah utama dan merumuskan strategi matang."
          }
        },
        {
          id: generateId(),
          type: "grid",
          data: {
            columns: 2,
            items: [
              { title: "Tantangan Utama", content: "Performa query yang lambat dan sinkronisasi data real-time." },
              { title: "Solusi Cerdas", content: "Optimasi indexing PostgreSQL dan integrasi Supabase realtime channels." }
            ]
          }
        },
        {
          id: generateId(),
          type: "text",
          data: {
            html: "<h2>Hasil Akhir & Dampak Proyek</h2><p>Setelah diimplementasikan secara penuh, proyek ini berhasil meningkatkan efisiensi pembukuan hingga 45% dan mempercepat pelaporan pajak.</p>"
          }
        }
      ];
    } else if (layoutType === "showcase") {
      preset = [
        {
          id: generateId(),
          type: "split-banner",
          data: {
            layout: "right",
            mediaUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800",
            mediaType: "image",
            title: "Feyment Pajak: Platform Cerdas",
            content: "Pengembangan platform manajemen kepatuhan pajak terintegrasi AI, mempercepat perolehan critical outputs wajib pajak."
          }
        },
        {
          id: generateId(),
          type: "carousel",
          data: { images: [] }
        },
        {
          id: generateId(),
          type: "accordion",
          data: {
            items: [
              { title: "Bagaimana cara kerja sinkronisasi data?", content: "Data disinkronisasikan menggunakan background queue workers." },
              { title: "Apakah sistem ini aman?", content: "Platform ini menggunakan enkripsi JWT standar industri dan PostgreSQL RLS." }
            ]
          }
        }
      ];
    } else if (layoutType === "tech") {
      preset = [
        {
          id: generateId(),
          type: "text",
          data: {
            html: "<h2>Arsitektur Sistem & Tech-Stack</h2><p>Kami merancang arsitektur microservices berbasis Next.js dan Supabase DB dengan performa tinggi.</p>"
          }
        },
        {
          id: generateId(),
          type: "table",
          data: {
            headers: ["Komponen Utama", "Teknologi", "Keterangan"],
            rows: [
              ["Web Framework", "React 19, Vite, TypeScript", "Stabilitas rendering"],
              ["Database & Realtime", "Supabase (PostgreSQL)", "Relasi data & realtime triggers"],
              ["Style Engine", "Tailwind CSS v4", "Desain visual premium & responsif"]
            ]
          }
        },
        {
          id: generateId(),
          type: "text",
          data: {
            html: "<blockquote>Proses deployment dilakukan secara otomatis menggunakan Vercel CI/CD hooks yang terhubung ke repositori GitHub utama.</blockquote>"
          }
        }
      ];
    }

    setBlocks(preset);
    toast.success("Preset tata letak blok UX berhasil diterapkan!");
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // WIZARD PREVIEW MODE
  if (step === "preview") {
    const previewSpecsCard = () => {
      const displayTags = project?.tags || [];
      return (
        <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/40 space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="text-blue-500" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Spesifikasi Proyek
            </h3>
          </div>

          <div className="space-y-6">
            {displayTags.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Output Kritis
                </h4>
                <ul className="space-y-2">
                  {displayTags.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-blue-500 shrink-0 mt-0.5">✓</span>
                      <span className="text-xs font-bold leading-tight text-slate-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-white/5 space-y-3">
              {project?.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center shadow-lg"
                >
                  Demo Aplikasi
                </a>
              )}
              {project?.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/5 bg-slate-950 text-slate-300 hover:text-white transition-all text-center"
                >
                  Kode GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderPreviewContent = () => {
      return (
        <div className="space-y-12">
          {/* Header Specs Preview */}
          <div className="border-b border-white/5 pb-8">
            <span className="inline-block bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg mb-6">
              {project?.category || "Project Category"}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white mb-6">
              {project?.title}
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              {project?.description}
            </p>
          </div>

          {/* Dynamic Blocks Renderer */}
          <div className="space-y-12">
            {blocks.map((block) => {
              switch (block.type) {
                case "text":
                  return (
                    <div 
                      key={block.id}
                      className="case-study-content text-slate-300"
                      dangerouslySetInnerHTML={{ __html: block.data.html }}
                    />
                  );
                  
                case "divider":
                  const divStyle = block.data.style || "line";
                  const divColor = block.data.color || "rgba(255,255,255,0.1)";
                  return (
                    <div key={block.id} className="py-2">
                      {divStyle === "line" && <hr className="border-t" style={{ borderColor: divColor }} />}
                      {divStyle === "dashed" && <hr className="border-t border-dashed" style={{ borderColor: divColor }} />}
                      {divStyle === "double" && <div className="border-t border-b h-1" style={{ borderColor: divColor }} />}
                      {divStyle === "dots" && <hr className="border-t border-dotted border-spacing-2" style={{ borderColor: divColor }} />}
                    </div>
                  );
                  
                case "media":
                  const isVid = block.data.mediaType === "video";
                  return (
                    <div key={block.id} className="space-y-3">
                      {isVid ? (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                          {block.data.url ? (
                            <iframe 
                              src={block.data.url.replace("watch?v=", "embed/")} 
                              className="w-full h-full"
                              title="Video embed"
                              allowFullScreen
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 font-bold text-xs">Video Embed URL Not Provided</div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-slate-950 flex items-center justify-center">
                          {block.data.url ? (
                            <img src={block.data.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-slate-500 font-bold text-xs">No Image Loaded</div>
                          )}
                        </div>
                      )}
                      {block.data.caption && <p className="text-center text-xs italic text-slate-500">{block.data.caption}</p>}
                    </div>
                  );
                  
                case "table":
                  const previewPadClass = block.data.cellPadding === "compact" ? "p-2" : block.data.cellPadding === "spacious" ? "p-6" : "p-4";
                  return (
                    <div key={block.id} className="overflow-x-auto rounded-2xl border border-white/10">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-white/[0.03] border-b border-white/10 text-blue-400 font-bold">
                            {block.data.headers.map((h: string, idx: number) => (
                              <th 
                                key={idx} 
                                className={`${previewPadClass} uppercase tracking-wider`}
                                style={{ width: block.data.columnWidths?.[idx] || 'auto' }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {block.data.rows.map((row: string[], rowIdx: number) => (
                            <tr 
                              key={rowIdx} 
                              className="hover:bg-white/[0.01]"
                              style={{ height: block.data.rowHeights?.[rowIdx] || block.data.rowHeight || 'auto' }}
                            >
                              {row.map((cell: string, cellIdx: number) => (
                                <td key={cellIdx} className={`${previewPadClass} text-slate-300 font-medium`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                  
                case "grid":
                  const cols = block.data.columns || 2;
                  return (
                    <div key={block.id} className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
                      {block.data.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                          <h4 className="text-white font-bold text-sm mb-2">{item.title}</h4>
                          <p className="text-slate-400 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
                        </div>
                      ))}
                    </div>
                  );
                  
                case "carousel":
                  const hasImgs = block.data.images && block.data.images.length > 0;
                  return (
                    <div key={block.id} className="space-y-4">
                      {hasImgs ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {block.data.images.map((img: string, idx: number) => (
                            <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-white/5">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center text-slate-600 text-xs font-bold">
                          Galeri Foto Carousel Kosong
                        </div>
                      )}
                    </div>
                  );
                  
                case "accordion":
                  return (
                    <div key={block.id} className="space-y-3">
                      {block.data.items.map((item: any, idx: number) => {
                        const isOpen = activeAccordionIdx[block.id] === idx;
                        return (
                          <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                            <button
                              onClick={() => setActiveAccordionIdx(prev => ({
                                ...prev,
                                [block.id]: isOpen ? null : idx
                              }))}
                              className="w-full flex items-center justify-between p-4 font-bold text-xs uppercase tracking-wider text-left text-slate-300 hover:text-white"
                            >
                              <span>{item.title}</span>
                              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {isOpen && (
                              <div className="p-4 border-t border-white/5 text-slate-400 text-xs leading-relaxed bg-black/10" dangerouslySetInnerHTML={{ __html: item.content }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                  
                case "split-banner":
                  const leftLayout = block.data.layout === "left";
                  const splitVid = block.data.mediaType === "video";
                  return (
                    <div key={block.id} className={`flex flex-col md:flex-row items-center gap-8 ${leftLayout ? "" : "md:flex-row-reverse"}`}>
                      {/* Media block */}
                      <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center shrink-0">
                        {block.data.mediaUrl ? (
                          splitVid ? (
                            <iframe 
                              src={block.data.mediaUrl.replace("watch?v=", "embed/")} 
                              className="w-full h-full"
                              title="Embed video"
                              allowFullScreen
                            />
                          ) : (
                            <img src={block.data.mediaUrl} alt="" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="text-slate-500 font-bold text-xs">No Media Specified</div>
                        )}
                      </div>
                      {/* Text block */}
                      <div className="w-full md:w-1/2 text-left space-y-4">
                        <h3 className="text-xl font-black text-white">{block.data.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: block.data.content }} />
                      </div>
                    </div>
                  );
                  
                default:
                  return null;
              }
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        {/* Preview Floating Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-slate-950/85 backdrop-blur-md border border-white/5 rounded-[2rem] shadow-2xl mb-8">
          <div className="flex items-center gap-4">
            <AdminBtn variant="secondary" onClick={() => setStep("edit")}>
              <ArrowLeft size={14} /> Kembali ke Edit Konten
            </AdminBtn>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Step 2: Preview Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <AdminBtn variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Simpan &amp; Publikasikan
            </AdminBtn>
          </div>
        </div>

        {/* Dynamic 1:1 Page Rendering Layout matching Frontend */}
        {specsLayout === "hidden" ? (
          <div className="w-full p-8 md:p-12 rounded-3xl border border-white/5 bg-[#020617] shadow-2xl">
            {renderPreviewContent()}
          </div>
        ) : specsLayout === "left" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Specs Sidebar Mock */}
            <aside className="space-y-8 lg:col-span-1 order-2 lg:order-1">
              {previewSpecsCard()}
            </aside>
            {/* Main Content Area */}
            <div className="lg:col-span-2 p-8 md:p-12 rounded-3xl border border-white/5 bg-[#020617] shadow-2xl order-1 lg:order-2">
              {renderPreviewContent()}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Content Area */}
            <div className="lg:col-span-2 p-8 md:p-12 rounded-3xl border border-white/5 bg-[#020617] shadow-2xl">
              {renderPreviewContent()}
            </div>
            {/* Right Specs Sidebar Mock */}
            <aside className="space-y-8 lg:col-span-1">
              {previewSpecsCard()}
            </aside>
          </div>
        )}
      </div>
    );
  }

  // WIZARD EDIT MODE
  return (
    <div className={`transition-all duration-300 relative ${rightSidebarOpen ? "md:pr-80" : "pr-0"}`}>
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-5">
          {/* Left: title block */}
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.18em]">Editor Proyek</p>
            <h3 className="text-white font-black text-xs tracking-wide truncate leading-tight">
              {project?.title}
            </h3>
          </div>
          {/* Right: back button + review button */}
          <div className="flex items-center gap-2 shrink-0">
            <AdminBtn variant="secondary" onClick={onBack}>
              <ArrowLeft size={13} /> Kembali ke Proyek
            </AdminBtn>
            <AdminBtn variant="primary" onClick={() => setStep("preview")}>
              <Eye size={13} /> Review Tampilan
            </AdminBtn>
          </div>
        </div>

        {/* Template Presets Composite Selector (MS Word Style) */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Layers className="text-blue-500" size={16} />
            <span>Pilih Template Tata Letak UI (MS Word Preset)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Template Card 1 (Blank/Standard) */}
            <button
              type="button"
              onClick={() => applyUXLayoutStack("standard")}
              className="group flex flex-col items-center bg-slate-900/30 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition-all duration-300 text-center cursor-pointer"
            >
              <div className="aspect-[4/3] w-full bg-slate-950 rounded-xl mb-3 flex items-center justify-center p-4 border border-white/5 group-hover:border-blue-500/20 overflow-hidden relative">
                <div className="w-16 h-20 bg-white rounded shadow-md p-2 flex flex-col gap-1.5">
                  <div className="w-full h-2 bg-blue-500 rounded" />
                  <div className="w-10 h-1 bg-slate-200 rounded" />
                  <div className="w-full h-1 bg-slate-100 rounded" />
                  <div className="w-full h-1 bg-slate-100 rounded" />
                  <div className="w-full h-1 bg-slate-100 rounded" />
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-350 group-hover:text-white leading-none mb-1">
                Blank / Standar
              </p>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">
                Template Dokumen Dasar
              </span>
            </button>

            {/* Template Card 2 (Showcase/Grid Stack) */}
            <button
              type="button"
              onClick={() => applyUXLayoutStack("showcase")}
              className="group flex flex-col items-center bg-slate-900/30 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition-all duration-300 text-center cursor-pointer"
            >
              <div className="aspect-[4/3] w-full bg-slate-950 rounded-xl mb-3 flex items-center justify-center p-4 border border-white/5 group-hover:border-blue-500/20 overflow-hidden relative">
                <div className="w-16 h-20 bg-white rounded shadow-md p-2 flex flex-col gap-2">
                  <div className="w-full h-2 bg-purple-500 rounded" />
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    <div className="border border-slate-100 rounded p-0.5 flex flex-col gap-1">
                      <div className="w-full h-1 bg-slate-200 rounded" />
                      <div className="w-4 h-1 bg-slate-100 rounded" />
                    </div>
                    <div className="border border-slate-100 rounded p-0.5 flex flex-col gap-1">
                      <div className="w-full h-1 bg-slate-200 rounded" />
                      <div className="w-4 h-1 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-355 group-hover:text-white leading-none mb-1">
                Showcase / Grid Stack
              </p>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">
                Template Grid & Kolom
              </span>
            </button>

            {/* Template Card 3 (Tech Stack / Carousel) */}
            <button
              type="button"
              onClick={() => applyUXLayoutStack("tech")}
              className="group flex flex-col items-center bg-slate-900/30 hover:bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition-all duration-300 text-center cursor-pointer"
            >
              <div className="aspect-[4/3] w-full bg-slate-950 rounded-xl mb-3 flex items-center justify-center p-4 border border-white/5 group-hover:border-blue-500/20 overflow-hidden relative">
                <div className="w-16 h-20 bg-white rounded shadow-md p-2 flex flex-col gap-1.5">
                  <div className="w-full h-2 bg-emerald-500 rounded" />
                  <div className="w-full h-3 border border-slate-100 rounded flex items-center justify-center text-[5px] text-slate-300 font-bold">
                    [===]
                  </div>
                  <div className="w-full h-3 border border-slate-100 rounded flex flex-col gap-0.5 p-0.5">
                    <div className="w-full h-1 bg-slate-100 rounded" />
                    <div className="w-full h-1 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-355 group-hover:text-white leading-none mb-1">
                Tech Stack / Carousel
              </p>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">
                Template Tabel & Slider
              </span>
            </button>
          </div>
        </div>

        {/* Project Specs Layout Selector inside main workspace */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tata Letak Card "Project Specs"</h4>
            <p className="text-[10px] text-slate-500 mt-1">Mengatur posisi sidebar spesifikasi proyek di halaman detail.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            {(["right", "left", "hidden"] as const).map((layout) => (
              <button
                key={layout}
                type="button"
                onClick={() => setSpecsLayout(layout)}
                className={`flex-1 sm:flex-none text-center py-2.5 px-5 rounded-xl font-bold text-[9px] uppercase tracking-wider border transition-all cursor-pointer ${
                  specsLayout === layout
                    ? "border-blue-500/30 text-blue-400 bg-blue-500/10 font-black"
                    : "border-white/5 text-slate-400 hover:text-white hover:bg-white/5 bg-slate-950/40"
                }`}
              >
                {layout === "right" ? "Kanan" : layout === "left" ? "Kiri" : "Sembunyi"}
              </button>
            ))}
          </div>
        </div>

        {/* MS Word style formatting ribbon / Toolbar */}
        <div className="sticky top-[72px] z-30 flex flex-wrap items-center gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm mb-6 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Aksi Cepat:</span>
            <button
              type="button"
              disabled={!activeBlockId}
              onClick={() => {
                if (activeBlockId) {
                  const activeBlock = blocks.find(b => b.id === activeBlockId);
                  if (activeBlock) {
                    updateBlock(activeBlockId, { isHidden: !activeBlock.isHidden });
                  }
                }
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-bold tracking-wider uppercase transition-all ${
                activeBlockId
                  ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  : "bg-slate-100 border-slate-100 text-slate-300"
              }`}
              title="Sembunyikan / Tampilkan elemen"
            >
              {activeBlockId && blocks.find(b => b.id === activeBlockId)?.isHidden ? (
                <>
                  <Eye size={12} className="text-amber-500" />
                  <span>Tampilkan</span>
                </>
              ) : (
                <>
                  <EyeOff size={12} />
                  <span>Sembunyikan</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!activeBlockId}
              onClick={() => activeBlockId && duplicateBlock(activeBlockId)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-bold tracking-wider uppercase transition-all ${
                activeBlockId
                  ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  : "bg-slate-100 border-slate-100 text-slate-300"
              }`}
              title="Duplikat elemen"
            >
              <Copy size={12} />
              <span>Duplikat</span>
            </button>

            <button
              type="button"
              disabled={!activeBlockId}
              onClick={() => activeBlockId && deleteBlock(activeBlockId)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 font-bold tracking-wider uppercase transition-all ${
                activeBlockId
                  ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100 cursor-pointer"
                  : "bg-slate-100 border-slate-100 text-slate-300"
              }`}
              title="Hapus elemen"
            >
              <Trash2 size={12} />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Editor (Blank Document Style) */}
        <div 
          onClick={() => setActiveBlockId(null)}
          className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-[2.5rem] border border-slate-200 text-slate-900 mx-auto w-full max-w-[850px] transition-all text-left p-6 select-none" 
          style={{ height: `${canvasHeight}px` }}
        >
          <div className="border-b border-slate-100 pb-6 mb-8 select-none">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-lg border border-blue-200/50">
              Live Canvas Page
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-snug mt-4">
              {project?.title}
            </h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Tulis dokumen studi kasus proyek Anda secara visual di bawah. Seret, pindahkan, dan ubah ukuran elemen visual secara bebas.
            </p>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl opacity-50 bg-slate-50 text-slate-400 mx-4 select-none">
              <Plus size={40} className="mx-auto mb-4 text-slate-400" />
              <p className="text-xs font-bold uppercase tracking-wider">Kanvas Kosong. Silakan tambahkan elemen dari panel kanan.</p>
            </div>
          ) : (
            blocks.map((block) => (
              <div
                key={block.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBlockId(block.id);
                }}
                className={`absolute group rounded-2xl border transition-all select-none bg-slate-50/90 text-slate-900 ${
                  activeBlockId === block.id 
                    ? "border-blue-500 shadow-xl z-20 ring-2 ring-blue-500/20" 
                    : "border-slate-200 hover:border-slate-300 shadow-sm z-10"
                } ${block.isHidden ? "opacity-45" : ""}`}
                style={{
                  left: `${block.position?.x || 0}px`,
                  top: `${block.position?.y || 0}px`,
                  width: `${block.position?.w || 750}px`,
                  height: `${block.position?.h || 200}px`
                }}
              >
                {/* Drag Handle Bar (only shown on hover or when active) */}
                <div 
                  onMouseDown={(e) => startDrag(e, block.id)}
                  className="absolute -top-3.5 left-4 px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider cursor-move select-none flex items-center gap-1 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity z-30 shadow"
                >
                  <GripVertical size={10} />
                  <span>Seret Elemen</span>
                </div>

                {/* Visibility indicator / Hidden badge */}
                {block.isHidden && (
                  <div className="absolute -top-3.5 right-10 px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 z-30 shadow">
                    <EyeOff size={10} />
                    <span>Tersembunyi</span>
                  </div>
                )}

                {/* Quick action actions toolbar */}
                {activeBlockId === block.id && (
                  <div className="absolute -top-10 right-4 flex items-center gap-1 bg-slate-900 text-white px-2 py-1.5 rounded-lg shadow-lg z-40 border border-white/10 animate-fade-in select-none">
                    <button
                      type="button"
                      onClick={() => {
                        updateBlock(block.id, { isHidden: !block.isHidden });
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                      title={block.isHidden ? "Tampilkan di Website" : "Sembunyikan dari Website"}
                    >
                      {block.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateBlock(block.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white cursor-pointer"
                      title="Duplikat Elemen"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors text-red-400 cursor-pointer"
                      title="Hapus Elemen"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {/* Resize Corner Handle */}
                <div 
                  onMouseDown={(e) => startResize(e, block.id)}
                  className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 text-slate-400 hover:text-blue-500 z-30"
                  title="Tarik untuk mengubah ukuran"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-70 group-hover:opacity-100">
                    <path d="M6 0 L8 0 L8 8 L0 8 L0 6 L6 6 Z" fill="currentColor" />
                  </svg>
                </div>

                {/* Block Content Container */}
                <div className="w-full h-full p-4 overflow-y-auto no-scrollbar relative select-text">
                  
                  {/* TEXT BLOCK */}
                  {block.type === "text" && (
                    <div className="w-full h-full min-h-[100px]" onClick={(e) => e.stopPropagation()}>
                      {activeBlockId === block.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                              {block.data.mode === "html" ? "HTML / Raw Code" : "Rich Text (WYSIWYG)"}
                            </label>
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { mode: block.data.mode === "html" ? "rich" : "html" })}
                              className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer bg-white text-slate-700"
                            >
                              {block.data.mode === "html" ? "Aa Ganti ke Rich Text" : "⟨/⟩ Ganti ke HTML"}
                            </button>
                          </div>
                          {block.data.mode === "html" ? (
                            <textarea
                              value={block.data.html}
                              onChange={(e) => updateBlock(block.id, { html: e.target.value })}
                              rows={4}
                              placeholder="Masukkan HTML..."
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500/50"
                            />
                          ) : (
                            <RichTextEditor
                              value={block.data.html}
                              onChange={(html) => updateBlock(block.id, { html })}
                              placeholder="Ketik konten rich text di sini..."
                              light={true}
                            />
                          )}
                        </div>
                      ) : (
                        <div 
                          className="case-study-content text-slate-700 text-xs" 
                          dangerouslySetInnerHTML={{ __html: block.data.html || "<p className='text-slate-400 italic'>Konten teks kosong...</p>" }} 
                        />
                      )}
                    </div>
                  )}

                  {/* DIVIDER BLOCK */}
                  {block.type === "divider" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-3 pt-2 text-left" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Divider</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Style</label>
                              <AdminDropdown
                                value={block.data.style}
                                onChange={(v) => updateBlock(block.id, { style: v })}
                                size="compact"
                                className="h-10 text-[10px]"
                                light={true}
                                options={[
                                  { value: "line", label: "Solid Line" },
                                  { value: "dashed", label: "Dashed Line" },
                                  { value: "double", label: "Double Line" },
                                  { value: "dots", label: "Dots Line" }
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Warna</label>
                              <div className="flex items-center gap-2">
                                <CustomColorPicker value={block.data.color} onChange={(c) => updateBlock(block.id, { color: c })} />
                                <input
                                  type="text"
                                  value={block.data.color}
                                  onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                                  className="flex-1 h-10 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div 
                            className={`w-full ${block.data.style === 'dashed' ? 'border-dashed' : block.data.style === 'dots' ? 'border-dotted' : 'border-solid'}`}
                            style={{ borderTopWidth: block.data.style === 'double' ? '3px' : '1px', borderTopStyle: block.data.style === 'double' ? 'double' : undefined, borderColor: block.data.color || '#cbd5e1' }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* MEDIA BLOCK */}
                  {block.type === "media" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-3 text-left" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Media</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tipe Media</label>
                              <AdminDropdown
                                value={block.data.mediaType}
                                onChange={(v) => updateBlock(block.id, { mediaType: v })}
                                size="compact"
                                className="h-10 text-[10px]"
                                light={true}
                                options={[
                                  { value: "image", label: "Gambar (Image)" },
                                  { value: "video", label: "Video YouTube" }
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Media URL</label>
                              <input
                                type="text"
                                value={block.data.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs"
                                placeholder="http://..."
                              />
                            </div>
                          </div>
                          {block.data.mediaType === "image" && (
                            <ImageUpload
                              value={block.data.url}
                              onChange={(url) => updateBlock(block.id, { url })}
                              light={true}
                            />
                          )}
                          <input
                            type="text"
                            value={block.data.caption}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs"
                            placeholder="Caption media..."
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center text-center p-1">
                          {block.data.mediaType === "video" ? (
                            <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-xs text-slate-400 min-h-[120px]">
                              {block.data.url ? (
                                <iframe src={block.data.url.replace("watch?v=", "embed/")} className="w-full h-full pointer-events-none" />
                              ) : "Video URL Kosong"}
                            </div>
                          ) : (
                            <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[120px]">
                              {block.data.url ? (
                                <img src={block.data.url} alt="" className="w-full h-full object-cover" />
                              ) : "Gambar URL Kosong"}
                            </div>
                          )}
                          {block.data.caption && <p className="text-[10px] text-slate-500 italic mt-1">{block.data.caption}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DATA TABLE BLOCK */}
                  {block.type === "table" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Tabel</span>
                            <div className="flex gap-1.5">
                              <button type="button" onClick={() => {
                                const newHeights = [...(block.data.rowHeights || Array(block.data.rows.length).fill(""))];
                                newHeights.push("");
                                updateBlock(block.id, {
                                  rows: [...block.data.rows, Array(block.data.headers.length).fill("")],
                                  rowHeights: newHeights
                                });
                              }} className="text-[8px] font-bold bg-slate-200 hover:bg-slate-350 px-2 py-1 rounded cursor-pointer">+ Row</button>
                              <button type="button" onClick={() => {
                                const newWidths = [...(block.data.columnWidths || Array(block.data.headers.length).fill(""))];
                                newWidths.push("");
                                updateBlock(block.id, {
                                  headers: [...block.data.headers, `Header ${block.data.headers.length + 1}`],
                                  rows: block.data.rows.map((row: string[]) => [...row, ""]),
                                  columnWidths: newWidths
                                });
                              }} className="text-[8px] font-bold bg-slate-200 hover:bg-slate-350 px-2 py-1 rounded cursor-pointer">+ Col</button>
                              <button type="button" onClick={() => {
                                if (block.data.rows.length > 1) {
                                  const newHeights = [...(block.data.rowHeights || Array(block.data.rows.length).fill(""))];
                                  newHeights.pop();
                                  updateBlock(block.id, {
                                    rows: block.data.rows.slice(0, -1),
                                    rowHeights: newHeights
                                  });
                                }
                              }} className="text-[8px] font-bold bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded cursor-pointer">- Row</button>
                              <button type="button" onClick={() => {
                                if (block.data.headers.length > 1) {
                                  const newWidths = [...(block.data.columnWidths || Array(block.data.headers.length).fill(""))];
                                  newWidths.pop();
                                  updateBlock(block.id, {
                                    headers: block.data.headers.slice(0, -1),
                                    rows: block.data.rows.map((row: string[]) => row.slice(0, -1)),
                                    columnWidths: newWidths
                                  });
                                }
                              }} className="text-[8px] font-bold bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded cursor-pointer">- Col</button>
                            </div>
                          </div>

                          <div className="overflow-x-auto bg-slate-50 border border-slate-200 p-2 rounded-xl">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  {block.data.headers.map((h: string, idx: number) => (
                                    <th key={idx} className="p-1">
                                      <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => {
                                          const newHeaders = [...block.data.headers];
                                          newHeaders[idx] = e.target.value;
                                          updateBlock(block.id, { headers: newHeaders });
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded p-1 text-[9px] font-black text-blue-600"
                                      />
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {block.data.rows.map((row: string[], rowIdx: number) => (
                                  <tr key={rowIdx}>
                                    {row.map((cell: string, cellIdx: number) => (
                                      <td key={cellIdx} className="p-1">
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const newRows = [...block.data.rows];
                                            newRows[rowIdx][cellIdx] = e.target.value;
                                            updateBlock(block.id, { rows: newRows });
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded p-1 text-[9px]"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full overflow-auto p-1">
                          <table className="w-full border-collapse border border-slate-200 text-[10px]">
                            <thead>
                              <tr className="bg-slate-50">
                                {block.data.headers.map((h: string, i: number) => (
                                  <th key={i} className="border border-slate-200 p-1.5 font-black text-slate-700 text-left" style={{ width: block.data.columnWidths?.[i] || 'auto' }}>{h || 'Header'}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.data.rows.map((r: string[], ri: number) => (
                                <tr key={ri} style={{ height: block.data.rowHeights?.[ri] || 'auto' }}>
                                  {r.map((c: string, ci: number) => (
                                    <td key={ci} className="border border-slate-200 p-1.5 text-slate-600 font-medium">{c || '-'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GRID COLUMN BLOCK */}
                  {block.type === "grid" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Grid</span>
                            <div className="flex gap-1.5">
                              <button type="button" onClick={() => updateBlock(block.id, { columns: 2 })} className={`text-[8px] font-bold px-2 py-1 rounded cursor-pointer ${block.data.columns === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2 Columns</button>
                              <button type="button" onClick={() => updateBlock(block.id, { columns: 3 })} className={`text-[8px] font-bold px-2 py-1 rounded cursor-pointer ${block.data.columns === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>3 Columns</button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {block.data.items.map((item: any, idx: number) => (
                              <div key={idx} className="border border-slate-200 p-3 rounded-xl bg-white space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-slate-400">Item #{idx+1}</span>
                                  <button type="button" onClick={() => {
                                    if (block.data.items.length > 1) {
                                      updateBlock(block.id, { items: block.data.items.filter((_: any, i: number) => i !== idx) });
                                    }
                                  }} className="text-[8px] text-red-500 hover:underline">Hapus</button>
                                </div>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...block.data.items];
                                    newItems[idx].title = e.target.value;
                                    updateBlock(block.id, { items: newItems });
                                  }}
                                  className="w-full h-8 bg-slate-50 border border-slate-200 rounded px-2 text-xs font-bold"
                                  placeholder="Judul Poin..."
                                />
                                <RichTextEditor
                                  value={item.content || ""}
                                  onChange={(html) => {
                                    const newItems = [...block.data.items];
                                    newItems[idx].content = html;
                                    updateBlock(block.id, { items: newItems });
                                  }}
                                  minHeight={60}
                                  light={true}
                                />
                              </div>
                            ))}
                            <button type="button" onClick={() => {
                              updateBlock(block.id, { items: [...block.data.items, { title: "Poin Baru", content: "Keterangan detail..." }] });
                            }} className="w-full py-1.5 border border-dashed border-slate-300 rounded-lg text-[9px] text-slate-500 hover:bg-slate-50 font-bold uppercase tracking-wider cursor-pointer">+ Tambah Poin</button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full p-1 text-left">
                          <div className={`grid gap-4 ${block.data.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            {block.data.items.map((it: any, i: number) => (
                              <div key={i} className="border border-slate-100 bg-white p-2.5 rounded-xl shadow-xs">
                                <h4 className="font-bold text-slate-800 text-[11px] mb-1 truncate">{it.title || 'Judul Poin'}</h4>
                                <div className="text-[9px] text-slate-500 leading-relaxed max-h-[80px] overflow-hidden no-scrollbar" dangerouslySetInnerHTML={{ __html: it.content || 'Penjelasan...' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CAROUSEL SLIDER BLOCK */}
                  {block.type === "carousel" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Galeri Slider</span>
                          
                          <div className="grid grid-cols-4 gap-2">
                            {block.data.images?.map((img: string, idx: number) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-white">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => {
                                  updateBlock(block.id, { images: block.data.images.filter((_: string, i: number) => i !== idx) });
                                }} className="absolute right-1 top-1 p-1 bg-red-600 text-white rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={8} /></button>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => {
                              const url = window.prompt("Masukkan URL Gambar:");
                              if (url) {
                                updateBlock(block.id, { images: [...(block.data.images || []), url] });
                              }
                            }} className="py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer">Tambah URL</button>
                            <ImageUpload
                              value=""
                              light={true}
                              onChange={(url) => {
                                if (url) updateBlock(block.id, { images: [...(block.data.images || []), url] });
                              }}
                              label="Unggah File"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center gap-2 overflow-x-auto py-1">
                          {(block.data.images || []).length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 bg-slate-50 rounded-xl min-h-[100px]">Galeri Slider Kosong</div>
                          ) : (
                            block.data.images.map((img: string, i: number) => (
                              <img key={i} src={img} alt="" className="h-full aspect-video object-cover rounded-xl border border-slate-200 shrink-0" />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACCORDION (FAQ) BLOCK */}
                  {block.type === "accordion" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Accordion (FAQ)</span>
                          <div className="space-y-3">
                            {block.data.items.map((item: any, idx: number) => (
                              <div key={idx} className="border border-slate-200 p-3 rounded-xl bg-white space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-slate-400">FAQ #{idx+1}</span>
                                  <button type="button" onClick={() => {
                                    if (block.data.items.length > 1) {
                                      updateBlock(block.id, { items: block.data.items.filter((_: any, i: number) => i !== idx) });
                                    }
                                  }} className="text-[8px] text-red-500 hover:underline">Hapus</button>
                                </div>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...block.data.items];
                                    newItems[idx].title = e.target.value;
                                    updateBlock(block.id, { items: newItems });
                                  }}
                                  className="w-full h-8 bg-slate-50 border border-slate-200 rounded px-2 text-xs font-bold"
                                  placeholder="Pertanyaan FAQ..."
                                />
                                <RichTextEditor
                                  value={item.content || ""}
                                  onChange={(html) => {
                                    const newItems = [...block.data.items];
                                    newItems[idx].content = html;
                                    updateBlock(block.id, { items: newItems });
                                  }}
                                  minHeight={60}
                                  light={true}
                                />
                              </div>
                            ))}
                            <button type="button" onClick={() => {
                              updateBlock(block.id, { items: [...block.data.items, { title: "Poin Baru FAQ", content: "Jawaban/detail FAQ..." }] });
                            }} className="w-full py-1.5 border border-dashed border-slate-300 rounded-lg text-[9px] text-slate-500 hover:bg-slate-50 font-bold uppercase tracking-wider cursor-pointer">+ Tambah FAQ</button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full p-1 space-y-2 text-left">
                          {block.data.items.map((it: any, i: number) => (
                            <div key={i} className="border border-slate-150 rounded-xl p-2 bg-white">
                              <div className="flex items-center justify-between font-bold text-[11px] text-slate-800">
                                <span>{it.title || 'Judul FAQ'}</span>
                                <ChevronDown size={12} className="text-slate-400" />
                              </div>
                              <div className="text-[9px] text-slate-500 mt-1 leading-relaxed max-h-[60px] overflow-hidden no-scrollbar" dangerouslySetInnerHTML={{ __html: it.content || 'Penjelasan...' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SPLIT BANNER BLOCK */}
                  {block.type === "split-banner" && (
                    <div className="w-full h-full">
                      {activeBlockId === block.id ? (
                        <div className="space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Edit Split Banner</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tata Letak</label>
                              <AdminDropdown
                                value={block.data.layout}
                                onChange={(v) => updateBlock(block.id, { layout: v })}
                                size="compact"
                                className="h-10 text-[10px]"
                                light={true}
                                options={[
                                  { value: "left", label: "Media Kiri / Teks Kanan" },
                                  { value: "right", label: "Media Kanan / Teks Kiri" }
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Tipe Media</label>
                              <AdminDropdown
                                value={block.data.mediaType}
                                onChange={(v) => updateBlock(block.id, { mediaType: v })}
                                size="compact"
                                className="h-10 text-[10px]"
                                light={true}
                                options={[
                                  { value: "image", label: "Gambar (Image)" },
                                  { value: "video", label: "Video YouTube" }
                                ]}
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={block.data.mediaUrl}
                            onChange={(e) => updateBlock(block.id, { mediaUrl: e.target.value })}
                            className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs"
                            placeholder="Media URL..."
                          />
                          {block.data.mediaType === "image" && (
                            <ImageUpload
                              value={block.data.mediaUrl}
                              onChange={(mediaUrl) => updateBlock(block.id, { mediaUrl })}
                              light={true}
                            />
                          )}
                          <input
                            type="text"
                            value={block.data.title}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-xs font-bold"
                            placeholder="Judul Banner..."
                          />
                          <RichTextEditor
                            value={block.data.content || ""}
                            onChange={(html) => updateBlock(block.id, { content: html })}
                            minHeight={80}
                            light={true}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full p-1 flex gap-4 items-center text-left">
                          <div className={`flex w-full gap-4 items-center ${block.data.layout === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-1/3 aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                              {block.data.mediaUrl ? (
                                block.data.mediaType === "video" ? (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 bg-slate-950">Video</div>
                                ) : (
                                  <img src={block.data.mediaUrl} alt="" className="w-full h-full object-cover" />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">Media</div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1 overflow-hidden">
                              <h4 className="font-bold text-[11px] text-slate-800 truncate">{block.data.title || 'Judul Banner'}</h4>
                              <div className="text-[9px] text-slate-500 leading-relaxed max-h-[60px] overflow-hidden no-scrollbar" dangerouslySetInnerHTML={{ __html: block.data.content || 'Konten banner...' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Toggle button for Right Sidebar */}
      <button
        type="button"
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 w-8 h-16 rounded-l-2xl bg-blue-600 hover:bg-blue-700 text-white border-l border-t border-b border-blue-500/30 flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${
          rightSidebarOpen ? "mr-80" : "mr-0"
        }`}
        title={rightSidebarOpen ? "Sembunyikan Toolbar" : "Tampilkan Toolbar"}
      >
        {rightSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Right Sidebar - Insert Block Elements & uploads manager (Symmetrical to Left Sidebar) */}
      <aside 
        className={`fixed right-0 top-0 h-screen z-40 bg-[#050a18]/95 backdrop-blur-2xl border-l border-white/5 flex flex-col transition-all duration-300 overflow-y-auto no-scrollbar pt-6 ${
          rightSidebarOpen ? "w-80 px-6" : "w-0 p-0 overflow-hidden"
        }`}
      >
        <div className="flex items-center gap-3.5 mb-6 px-1 pt-2 shrink-0 border-b border-white/5 pb-5 select-none">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Layers size={20} className="text-white" />
          </div>
          <div className="flex flex-col justify-center text-left pl-0.5">
            <h2 className="font-extrabold text-lg tracking-wider text-white uppercase leading-tight">
              Insert Elements
            </h2>
            <span className="text-[9px] font-black text-blue-500/90 tracking-[0.25em] uppercase whitespace-nowrap leading-none mt-0.5">
              No-Code Blocks
            </span>
          </div>
        </div>

        {/* Tab selection ribbon */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white/5 rounded-xl shrink-0 select-none">
          <button
            type="button"
            onClick={() => setSidebarTab("blocks")}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              sidebarTab === "blocks"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Elemen
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("uploads")}
            className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              sidebarTab === "uploads"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Unggahan
          </button>
        </div>

        {sidebarTab === "blocks" ? (
          <div className="flex-1 space-y-3 pb-8 text-left animate-fade-in">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
              Pilih Elemen untuk Ditambahkan:
            </label>

            <button
              type="button"
              onClick={() => addBlock("text")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <FileText size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Teks / Rich Text</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Editor Paragraf WYSIWYG</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("media")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <ImageIcon size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Foto / Video</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Kamera Media & Embed Link</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("grid")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <Columns size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Grid Kolom</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Susunan Multi-kolom</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("split-banner")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <AlignLeft size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Split Banner</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Banner Teks & Media</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("table")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <Table size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Tabel Data</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Tabel Informasi Interaktif</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("accordion")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <ChevronDown size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Accordion (FAQ)</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Daftar Lipat FAQ</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("carousel")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <Film size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Galeri Slider</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Slider Carousel Gambar</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>

            <button
              type="button"
              onClick={() => addBlock("divider")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 text-left text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                  <LinkIcon size={16} className="text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider leading-none mb-1">Divider Kustom</p>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">Garis Pembatas Layout</span>
                </div>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white" />
            </button>
          </div>
        ) : (
          /* Canva Uploads Tab Content */
          <div className="flex-1 flex flex-col min-h-0 text-left animate-fade-in pb-8">
            <input
              type="file"
              id="canva-file-uploader"
              className="hidden"
              onChange={(e) => {
                const fileType = mediaTab === "video" ? "video" : mediaTab === "audio" ? "audio" : "image";
                handleMediaUpload(e, fileType);
              }}
              accept={mediaTab === "video" ? "video/*" : mediaTab === "audio" ? "audio/*" : "image/*"}
            />
            
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                <input
                  type="text"
                  placeholder="Cari file unggahan..."
                  className="w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const inputEl = document.getElementById("canva-file-uploader");
                  inputEl?.click();
                }}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition-colors shadow-lg cursor-pointer"
                title="Unggah Aset Baru"
              >
                <UploadCloud size={16} />
              </button>
            </div>

            {/* Canva internal tabs */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-2 mb-4 text-xs font-bold text-slate-400">
              {(["images", "video", "audio", "folders"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setMediaTab(tab);
                    if (tab !== "folders") {
                      setSelectedFolderId(null);
                    }
                  }}
                  className={`pb-1.5 border-b-2 transition-all capitalize cursor-pointer ${
                    mediaTab === tab
                      ? "border-blue-500 text-white font-extrabold"
                      : "border-transparent hover:text-slate-200"
                  }`}
                >
                  {tab === "images" ? "Gambar" : tab === "folders" ? "Folder" : tab}
                </button>
              ))}
            </div>

            {/* Tab contents list scroll area */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {mediaTab === "folders" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Folder List</span>
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt("Nama Folder Baru:");
                        if (name) {
                          setMediaFolders(prev => [...prev, { id: generateId(), name }]);
                          toast.success("Folder berhasil dibuat!");
                        }
                      }}
                      className="text-[9px] font-extrabold bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-2.5 py-1.5 rounded-lg border border-blue-500/20 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <FolderPlus size={10} />
                      <span>Buat Folder</span>
                    </button>
                  </div>

                  {selectedFolderId ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setSelectedFolderId(null)}
                        className="text-[9px] font-extrabold text-blue-400 hover:underline mb-3 flex items-center gap-1 cursor-pointer"
                      >
                        ← Kembali ke Semua Folder
                      </button>
                      <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 text-center text-xs text-slate-500 mb-2">
                        Folder: <strong className="text-white">{mediaFolders.find(f => f.id === selectedFolderId)?.name}</strong>
                      </div>
                      
                      {mediaFiles.filter(f => f.folderId === selectedFolderId).length === 0 ? (
                        <p className="text-[10px] text-center text-slate-600 py-6">Folder ini kosong.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {mediaFiles.filter(f => f.folderId === selectedFolderId).map(file => (
                            <div 
                              key={file.id} 
                              onClick={() => insertMediaBlock(file)}
                              className="group/file relative aspect-video bg-slate-900 border border-white/5 hover:border-blue-500 rounded-xl overflow-hidden cursor-pointer transition-all"
                            >
                              {file.type === "image" ? (
                                <img src={file.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                  {file.type === "video" ? <Video size={16} className="text-blue-400" /> : <Music size={16} className="text-emerald-400" />}
                                  <span className="text-[8px] text-slate-400 truncate w-full mt-1">{file.name}</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMediaFiles(prev => prev.filter(f => f.id !== file.id));
                                  toast.success("Aset dihapus!");
                                }}
                                className="absolute right-1 top-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover/file:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                              >
                                <Trash2 size={8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {mediaFolders.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-600">Belum ada folder yang dibuat.</div>
                      ) : (
                        mediaFolders.map(folder => (
                          <div
                            key={folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-blue-500 rounded-2xl cursor-pointer transition-all group/folder"
                          >
                            <div className="flex items-center gap-3">
                              <Folder className="text-blue-400" size={18} />
                              <span className="text-xs font-bold text-slate-200">{folder.name}</span>
                              <span className="text-[9px] text-slate-500">({mediaFiles.filter(f => f.folderId === folder.id).length} file)</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMediaFolders(prev => prev.filter(f => f.id !== folder.id));
                                setMediaFiles(prev => prev.map(f => f.folderId === folder.id ? { ...f, folderId: undefined } : f));
                                toast.success("Folder dihapus!");
                              }}
                              className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover/folder:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      {mediaTab === "images" ? "Daftar Gambar" : mediaTab === "video" ? "Daftar Video" : "Daftar Audio"}
                    </span>
                  </div>

                  {mediaFiles.filter(f => f.type === (mediaTab === "images" ? "image" : mediaTab === "video" ? "video" : "audio")).length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-xs text-slate-600">
                      Belum ada file {mediaTab === "images" ? "gambar" : mediaTab === "video" ? "video" : "audio"}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {mediaFiles.filter(f => f.type === (mediaTab === "images" ? "image" : mediaTab === "video" ? "video" : "audio")).map(file => (
                        <div
                          key={file.id}
                          onClick={() => insertMediaBlock(file)}
                          className="group/file relative aspect-video bg-slate-900 border border-white/5 hover:border-blue-500 rounded-xl overflow-hidden cursor-pointer transition-all"
                          title="Klik untuk memasukkan ke Kanvas"
                        >
                          {file.type === "image" ? (
                            <img src={file.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                              {file.type === "video" ? <Video size={16} className="text-blue-400" /> : <Music size={16} className="text-emerald-400" />}
                              <span className="text-[8px] text-slate-400 truncate w-full mt-1">{file.name}</span>
                            </div>
                          )}
                          <div className="absolute left-1 top-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                            <select
                              value={file.folderId || ""}
                              onChange={(e) => {
                                const fid = e.target.value || undefined;
                                setMediaFiles(prev => prev.map(f => f.id === file.id ? { ...f, folderId: fid } : f));
                                toast.success("Folder file diperbarui!");
                              }}
                              className="bg-slate-950 text-white border border-white/10 rounded text-[8px] p-0.5 outline-none cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">No Folder</option>
                              {mediaFolders.map(fo => (
                                <option key={fo.id} value={fo.id}>{fo.name}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMediaFiles(prev => prev.filter(f => f.id !== file.id));
                              toast.success("Aset dihapus!");
                            }}
                            className="absolute right-1 top-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover/file:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                          >
                            <Trash2 size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Custom Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
