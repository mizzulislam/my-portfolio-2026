import { useState, useEffect, useRef } from "react";
import React from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Check, Trash2, Image as ImageIcon, Plus, GripVertical, 
  FileText, Columns, Table, Film, AlignLeft, Eye, ChevronDown, ChevronUp, Link as LinkIcon, Layers
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
    <div ref={setNodeRef} style={style} className="relative group border border-white/5 bg-slate-900/40 p-6 rounded-2xl transition-all hover:border-blue-500/20 hover:bg-slate-900/70">
      {/* Drag & Action Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-slate-500 hover:text-white rounded-lg hover:bg-white/5 py-1 px-2.5 transition-all"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Move Block</span>
        </div>
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onDuplicate}
            className="text-[9px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-300 py-1 px-2.5 rounded-md transition-all"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-[9px] font-bold uppercase tracking-wider bg-red-950/40 hover:bg-red-900/60 text-red-400 py-1 px-2.5 rounded-md transition-all"
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
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [specsLayout, setSpecsLayout] = useState<"right" | "left" | "hidden">("right");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Step Wizard State
  const [step, setStep] = useState<"edit" | "preview">("edit");

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

      const payloadEn = JSON.stringify({ specsLayout, blocks });
      const payloadId = JSON.stringify({ specsLayout, blocks: translatedBlocks });

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

    const newBlock: BlockItem = {
      id: generateId(),
      type,
      data: defaultData
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
        // Deep copy data object
        data: JSON.parse(JSON.stringify(blockToCopy.data))
      };
      // Insert duplicate right below
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
    <div className="space-y-10 animate-fade-in">
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

      {/* Editor Main Content Builder - Full Width card layout */}
      <div className="w-full space-y-6">
        <AdminCard title="No-Code Page Blocks Builder" icon={ImageIcon}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Template Presets Composite Selector */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3 block">
                Terapkan Preset Gabungan Blok UX (UX Layout Presets)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyUXLayoutStack("standard")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => applyUXLayoutStack("showcase")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Showcase
                </button>
                <button
                  type="button"
                  onClick={() => applyUXLayoutStack("tech")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Tech
                </button>
              </div>
            </div>

            {/* Project Specs Layout Control Selector */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3 block">
                Tata Letak Card "Project Specs" (Specs Layout)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSpecsLayout("right")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border transition-all ${
                    specsLayout === "right"
                      ? "border-blue-500/30 text-blue-400 bg-blue-500/10 font-black"
                      : "border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Kanan
                </button>
                <button
                  type="button"
                  onClick={() => setSpecsLayout("left")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border transition-all ${
                    specsLayout === "left"
                      ? "border-blue-500/30 text-blue-400 bg-blue-500/10 font-black"
                      : "border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Kiri
                </button>
                <button
                  type="button"
                  onClick={() => setSpecsLayout("hidden")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-[9px] uppercase tracking-wider border transition-all ${
                    specsLayout === "hidden"
                      ? "border-blue-500/30 text-blue-400 bg-blue-500/10 font-black"
                      : "border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Sembunyi
                </button>
              </div>
            </div>
          </div>

          {/* Blocks Drag Drop Sortable Wrapper */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {blocks.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl opacity-40">
                    <Plus size={40} className="mx-auto mb-4 text-slate-500" />
                    <p className="text-xs font-bold uppercase tracking-wider">Mulai tambahkan blok layout di bawah</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <SortableBlockWrapper 
                      key={block.id} 
                      id={block.id} 
                      onDelete={() => deleteBlock(block.id)}
                      onDuplicate={() => duplicateBlock(block.id)}
                    >
                      {/* Type Indicator */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-blue-600/20 text-blue-400 px-3 py-1 rounded-md border border-blue-500/10">
                          {block.type}
                        </span>
                      </div>

                      {/* Rendering dynamic editors based on block type */}
                      {block.type === "text" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                              {block.data.mode === "html" ? "HTML / Raw Code" : "Rich Text (WYSIWYG)"}
                            </label>
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { mode: block.data.mode === "html" ? "rich" : "html" })}
                              className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border transition-all"
                              style={block.data.mode === "html"
                                ? { borderColor: "rgba(59,130,246,0.3)", color: "#60a5fa", background: "rgba(59,130,246,0.08)" }
                                : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8", background: "rgba(255,255,255,0.04)" }
                              }
                            >
                              {block.data.mode === "html" ? "Aa Ganti ke Rich Text" : "⟨/⟩ Ganti ke HTML"}
                            </button>
                          </div>

                          {block.data.mode === "html" ? (
                            <>
                              <textarea
                                value={block.data.html}
                                onChange={(e) => updateBlock(block.id, { html: e.target.value })}
                                rows={5}
                                placeholder="Masukkan teks HTML di sini, contoh: <h2>Judul</h2><p>Isi paragraf</p>"
                                className="w-full bg-slate-950 border border-white/5 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-blue-500/40 transition-all"
                              />
                              <p className="text-[9px] text-slate-600 leading-relaxed">
                                Mendukung tag HTML seperti <code className="text-blue-400/70">&lt;h2&gt;</code>, <code className="text-blue-400/70">&lt;p&gt;</code>, <code className="text-blue-400/70">&lt;ul&gt;</code>, <code className="text-blue-400/70">&lt;blockquote&gt;</code>, dll.
                              </p>
                            </>
                          ) : (
                            <RichTextEditor
                              value={block.data.html}
                              onChange={(html) => updateBlock(block.id, { html })}
                              placeholder="Tulis konten rich text di sini — gunakan toolbar di atas untuk format teks, heading, list, link, dan lainnya..."
                            />
                          )}
                        </div>
                      )}

                      {block.type === "divider" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Style</label>
                            <AdminDropdown
                              value={block.data.style}
                              onChange={(v) => updateBlock(block.id, { style: v })}
                              size="compact"
                              className="h-11"
                              options={[
                                { value: "line", label: "Solid Line" },
                                { value: "dashed", label: "Dashed Line" },
                                { value: "double", label: "Double Line" },
                                { value: "dots", label: "Dotted Line" },
                              ]}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Color Picker &amp; Code</label>
                            <div className="flex items-center gap-2">
                              <CustomColorPicker
                                value={block.data.color}
                                onChange={(val) => updateBlock(block.id, { color: val })}
                              />
                              <input
                                type="text"
                                value={block.data.color}
                                onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                                placeholder="e.g. rgba(255,255,255,0.1) or #3b82f6"
                                className="flex-1 h-11 bg-slate-950 border border-white/5 rounded-xl px-3.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "media" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Media Type</label>
                              <AdminDropdown
                                value={block.data.mediaType}
                                onChange={(v) => updateBlock(block.id, { mediaType: v })}
                                size="compact"
                                className="h-11"
                                options={[
                                  { value: "image", label: "Image" },
                                  { value: "video", label: "YouTube / Video Link" },
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Media URL</label>
                              <input
                                type="text"
                                value={block.data.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                placeholder="Masukkan URL foto/video..."
                                className="w-full h-11 bg-slate-950 border border-white/5 rounded-xl px-3.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                              />
                            </div>
                          </div>
                          
                          {block.data.mediaType === "image" && (
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Upload Foto</label>
                              <ImageUpload
                                value=""
                                onChange={(url) => updateBlock(block.id, { url })}
                                label="Upload Ke ImgBB &amp; Isi URL"
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Caption</label>
                            <input
                              type="text"
                              value={block.data.caption}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              placeholder="Tulis caption di sini..."
                              className="w-full h-11 bg-slate-950 border border-white/5 rounded-xl px-3.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "table" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Table Controller</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const colCount = block.data.headers.length;
                                  const nextRow = Array(colCount).fill("Sel Baru");
                                  const newHeights = [...(block.data.rowHeights || Array(block.data.rows.length).fill("")), ""];
                                  updateBlock(block.id, { 
                                    rows: [...block.data.rows, nextRow],
                                    rowHeights: newHeights
                                  });
                                }}
                                className="text-[9px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 py-1 px-2.5 rounded-md"
                              >
                                + Row
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newHeaders = [...block.data.headers, `Kolom ${block.data.headers.length + 1}`];
                                  const newRows = block.data.rows.map((row: string[]) => [...row, "Sel Baru"]);
                                  const newWidths = [...(block.data.columnWidths || Array(block.data.headers.length).fill("")), ""];
                                  updateBlock(block.id, { 
                                    headers: newHeaders,
                                    rows: newRows,
                                    columnWidths: newWidths
                                  });
                                }}
                                className="text-[9px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 py-1 px-2.5 rounded-md"
                              >
                                + Column
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (block.data.rows.length > 1) {
                                    const newRows = block.data.rows.slice(0, -1);
                                    const newHeights = block.data.rowHeights ? block.data.rowHeights.slice(0, -1) : [];
                                    updateBlock(block.id, { 
                                      rows: newRows,
                                      rowHeights: newHeights
                                    });
                                  }
                                }}
                                className="text-[9px] font-bold bg-red-950/20 text-red-400 py-1 px-2.5 rounded-md"
                              >
                                - Row
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (block.data.headers.length > 1) {
                                    const newHeaders = block.data.headers.slice(0, -1);
                                    const newRows = block.data.rows.map((row: string[]) => row.slice(0, -1));
                                    const newWidths = block.data.columnWidths ? block.data.columnWidths.slice(0, -1) : [];
                                    updateBlock(block.id, { 
                                      headers: newHeaders, 
                                      rows: newRows,
                                      columnWidths: newWidths
                                    });
                                  } else {
                                    toast.error("Tabel harus memiliki minimal 1 kolom!");
                                  }
                                }}
                                className="text-[9px] font-bold bg-red-950/20 text-red-400 py-1 px-2.5 rounded-md"
                              >
                                - Column
                              </button>
                            </div>
                          </div>

                          {/* Row & Column Sizing Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-white/5">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Cell Padding (Tinggi Baris)</label>
                              <AdminDropdown
                                value={block.data.cellPadding || "standard"}
                                onChange={(v) => updateBlock(block.id, { cellPadding: v })}
                                size="compact"
                                className="h-11"
                                options={[
                                  { value: "compact", label: "Compact (Padat)" },
                                  { value: "standard", label: "Standard" },
                                  { value: "spacious", label: "Spacious (Longgar)" },
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Custom Row Height</label>
                              <input
                                type="text"
                                value={block.data.rowHeight || ""}
                                onChange={(e) => updateBlock(block.id, { rowHeight: e.target.value })}
                                placeholder="e.g. auto, 50px, 80px"
                                className="w-full h-11 bg-slate-950 border border-white/5 rounded-xl px-3.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                              />
                            </div>

                            {/* Column Widths Config */}
                            <div className="col-span-1 md:col-span-2 space-y-2 pt-2 border-t border-white/5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Lebar Kolom (Column Widths)</label>
                              <div className="flex gap-2 flex-wrap">
                                {block.data.headers.map((_: string, idx: number) => (
                                  <div key={idx} className="flex-1 min-w-[70px]">
                                    <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Kolom {idx + 1}</label>
                                    <input
                                      type="text"
                                      value={block.data.columnWidths?.[idx] || ""}
                                      onChange={(e) => {
                                        const newWidths = [...(block.data.columnWidths || Array(block.data.headers.length).fill(""))];
                                        newWidths[idx] = e.target.value;
                                        updateBlock(block.id, { columnWidths: newWidths });
                                      }}
                                      placeholder="auto, 30%, 150px"
                                      className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500/40"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Render inputs grid */}
                          <div className="overflow-x-auto bg-slate-950/80 rounded-xl border border-white/5 p-4">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  {block.data.headers.map((h: string, idx: number) => (
                                    <th 
                                      key={idx} 
                                      className="p-1 relative group/col"
                                      style={{ width: block.data.columnWidths?.[idx] || 'auto' }}
                                    >
                                      <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => {
                                          const newHeaders = [...block.data.headers];
                                          newHeaders[idx] = e.target.value;
                                          updateBlock(block.id, { headers: newHeaders });
                                        }}
                                        className="w-full bg-slate-900 border border-white/5 rounded-md p-1.5 text-[10px] font-bold text-blue-400 focus:outline-none"
                                      />
                                      {/* Vertical Drag Resizer Line */}
                                      <div
                                        onMouseDown={(e) => handleColResizeStart(e, block.id, idx)}
                                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-10"
                                        title="Drag to resize column width"
                                      />
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {block.data.rows.map((row: string[], rowIdx: number) => (
                                  <tr key={rowIdx}>
                                    {row.map((cell: string, cellIdx: number) => (
                                      <td 
                                        key={cellIdx} 
                                        className="p-1 relative group/row"
                                        style={{ height: block.data.rowHeights?.[rowIdx] || 'auto' }}
                                      >
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const newRows = [...block.data.rows];
                                            newRows[rowIdx][cellIdx] = e.target.value;
                                            updateBlock(block.id, { rows: newRows });
                                          }}
                                          className="w-full bg-slate-900 border border-white/5 rounded-md p-1.5 text-[10px] text-slate-300 focus:outline-none"
                                        />
                                        {/* Horizontal Drag Resizer Line */}
                                        <div
                                          onMouseDown={(e) => handleRowResizeStart(e, block.id, rowIdx)}
                                          className="absolute left-0 right-0 bottom-0 h-1 cursor-row-resize bg-transparent hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-10"
                                          title="Drag to resize row height"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {block.type === "grid" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kolom Grid</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => updateBlock(block.id, { columns: 2 })}
                                className={`text-[9px] font-bold py-1 px-2.5 rounded ${block.data.columns === 2 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
                              >
                                2 Columns
                              </button>
                              <button
                                type="button"
                                onClick={() => updateBlock(block.id, { columns: 3 })}
                                className={`text-[9px] font-bold py-1 px-2.5 rounded ${block.data.columns === 3 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
                              >
                                3 Columns
                              </button>
                            </div>
                          </div>

                          {/* Grid items editor list */}
                          <div className="space-y-4 pt-2 border-t border-white/5">
                            {block.data.items.map((item: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-slate-500 uppercase">Item #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (block.data.items.length > 1) {
                                        updateBlock(block.id, {
                                          items: block.data.items.filter((_: any, i: number) => i !== idx)
                                        });
                                      }
                                    }}
                                    className="text-[8px] font-bold text-red-400 hover:underline"
                                  >
                                    Remove Item
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...block.data.items];
                                    newItems[idx].title = e.target.value;
                                    updateBlock(block.id, { items: newItems });
                                  }}
                                  placeholder="Judul Poin..."
                                  className="w-full h-10 bg-slate-900 border border-white/5 rounded-lg px-3 text-xs font-bold text-white focus:outline-none"
                                />
                                <div>
                                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Penjelasan detail (Rich Text)</label>
                                  <RichTextEditor
                                    value={item.content || ""}
                                    onChange={(html) => {
                                      const newItems = [...block.data.items];
                                      newItems[idx].content = html;
                                      updateBlock(block.id, { items: newItems });
                                    }}
                                    placeholder="Penjelasan detail..."
                                    minHeight={80}
                                  />
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => {
                                updateBlock(block.id, {
                                  items: [...block.data.items, { title: "Poin Baru", content: "Penjelasan detail..." }]
                                });
                              }}
                              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-[9px] uppercase tracking-wider text-slate-300 hover:text-white transition-all border border-dashed border-white/10"
                            >
                              + Add Grid Item
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === "carousel" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Images List</label>
                            <span className="text-[9px] text-slate-500 font-mono">{(block.data.images || []).length} Foto</span>
                          </div>
                          
                          {block.data.images && block.data.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                              {block.data.images.map((url: string, imgIdx: number) => (
                                <div key={imgIdx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-slate-950">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateBlock(block.id, {
                                          images: block.data.images.filter((_: string, i: number) => i !== imgIdx)
                                        });
                                      }}
                                      className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                            {/* Add Image from URL */}
                            <div className="mb-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = window.prompt("Masukkan URL Gambar:");
                                  if (url) {
                                    updateBlock(block.id, {
                                      images: [...(block.data.images || []), url]
                                    });
                                    toast.success("Gambar berhasil ditambahkan dari URL!");
                                  }
                                }}
                                className="w-full h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-400"
                              >
                                <svg
                                  width="32"
                                  height="32"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest">
                                  Tambah dari URL
                                </span>
                                <span className="text-[10px] text-slate-600">Alamat Web / External URL</span>
                              </button>
                            </div>

                            {/* Upload Image with resetKey */}
                            <ImageUpload
                              value=""
                              resetKey={block.data.images?.length || 0}
                              onChange={(url) => {
                                if (url) {
                                  updateBlock(block.id, {
                                    images: [...(block.data.images || []), url]
                                  });
                                  toast.success("Gambar berhasil diupload!");
                                }
                              }}
                              label="Upload Foto Baru"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "accordion" && (
                        <div className="space-y-4">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Accordion Items</label>
                          
                          <div className="space-y-4">
                            {block.data.items.map((item: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black text-slate-500 uppercase">Item #{idx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (block.data.items.length > 1) {
                                        updateBlock(block.id, {
                                          items: block.data.items.filter((_: any, i: number) => i !== idx)
                                        });
                                      }
                                    }}
                                    className="text-[8px] font-bold text-red-400 hover:underline"
                                  >
                                    Remove Item
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newItems = [...block.data.items];
                                    newItems[idx].title = e.target.value;
                                    updateBlock(block.id, { items: newItems });
                                  }}
                                  placeholder="Judul Accordion (FAQ)..."
                                  className="w-full h-10 bg-slate-900 border border-white/5 rounded-lg px-3 text-xs font-bold text-white focus:outline-none"
                                />
                                <div>
                                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Penjelasan accordion (Rich Text)</label>
                                  <RichTextEditor
                                    value={item.content || ""}
                                    onChange={(html) => {
                                      const newItems = [...block.data.items];
                                      newItems[idx].content = html;
                                      updateBlock(block.id, { items: newItems });
                                    }}
                                    placeholder="Penjelasan accordion..."
                                    minHeight={80}
                                  />
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => {
                                updateBlock(block.id, {
                                  items: [...block.data.items, { title: "Poin Baru FAQ", content: "Jawaban/detail FAQ..." }]
                                });
                              }}
                              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-[9px] uppercase tracking-wider text-slate-300 hover:text-white transition-all border border-dashed border-white/10"
                            >
                              + Add Accordion Item
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === "split-banner" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Media Layout</label>
                              <AdminDropdown
                                value={block.data.layout}
                                onChange={(v) => updateBlock(block.id, { layout: v })}
                                size="compact"
                                className="h-11"
                                options={[
                                  { value: "left", label: "Media Left / Text Right" },
                                  { value: "right", label: "Media Right / Text Left" },
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Media Type</label>
                              <AdminDropdown
                                value={block.data.mediaType}
                                onChange={(v) => updateBlock(block.id, { mediaType: v })}
                                size="compact"
                                className="h-11"
                                options={[
                                  { value: "image", label: "Image" },
                                  { value: "video", label: "Video URL (YouTube)" },
                                ]}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Media URL</label>
                              <input
                                type="text"
                                value={block.data.mediaUrl}
                                onChange={(e) => updateBlock(block.id, { mediaUrl: e.target.value })}
                                placeholder="Masukkan URL foto/video..."
                                className="w-full h-11 bg-slate-950 border border-white/5 rounded-xl px-3.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/40"
                              />
                            </div>
                          </div>
                          
                          {block.data.mediaType === "image" && (
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Upload Banner Image</label>
                              <ImageUpload
                                value=""
                                onChange={(mediaUrl) => updateBlock(block.id, { mediaUrl })}
                                label="Upload Foto Banner"
                              />
                            </div>
                          )}

                          <div className="space-y-3">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Judul Banner</label>
                            <input
                              type="text"
                              value={block.data.title}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                              placeholder="Judul Banner..."
                              className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500/40"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Konten Banner (Rich Text)</label>
                            <RichTextEditor
                              value={block.data.content || ""}
                              onChange={(html) => updateBlock(block.id, { content: html })}
                              placeholder="Tulis deskripsi penjelasan di sini..."
                              minHeight={100}
                            />
                          </div>
                        </div>
                      )}
                    </SortableBlockWrapper>
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Quick Add Block Bar */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4 block px-1">
              + Tambah Blok Konten Baru (Insert Block Elements)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => addBlock("text")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <FileText size={14} className="text-blue-500 shrink-0" /> Teks / Rich Text
              </button>
              <button
                type="button"
                onClick={() => addBlock("media")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <ImageIcon size={14} className="text-blue-500 shrink-0" /> Foto / Video
              </button>
              <button
                type="button"
                onClick={() => addBlock("grid")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <Columns size={14} className="text-blue-500 shrink-0" /> Grid Kolom
              </button>
              <button
                type="button"
                onClick={() => addBlock("split-banner")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <AlignLeft size={14} className="text-blue-500 shrink-0" /> Split Banner
              </button>
              <button
                type="button"
                onClick={() => addBlock("table")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <Table size={14} className="text-blue-500 shrink-0" /> Tabel Data
              </button>
              <button
                type="button"
                onClick={() => addBlock("accordion")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <ChevronDown size={14} className="text-blue-500 shrink-0" /> Accordion (FAQ)
              </button>
              <button
                type="button"
                onClick={() => addBlock("carousel")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <Film size={14} className="text-blue-500 shrink-0" /> Galeri Slider
              </button>
              <button
                type="button"
                onClick={() => addBlock("divider")}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/5 text-[10px] font-bold transition-all"
              >
                <LinkIcon size={14} className="text-blue-500 shrink-0" /> Divider Kustom
              </button>
            </div>
          </div>

        </AdminCard>

      </div>

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
