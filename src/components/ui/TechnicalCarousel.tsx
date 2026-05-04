import React, { useState, useRef, useEffect } from "react";
import { MotionValue } from "motion/react";
import { TechnicalTool } from "@/src/types";
import { SkillLogoBox } from "./SkillLogoBox";

export function TechnicalCarousel({
  tools,
  isDark,
  isScannerActive,
  globalMouseX,
}: {
  tools: TechnicalTool[];
  isDark: boolean;
  isScannerActive: boolean;
  globalMouseX: MotionValue<number>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // We'll pass the globalMouseX directly since we can handle the relative
  // calculation more efficiently inside SkillLogoBox or via transforms
  return (
    <div
      ref={containerRef}
      className={`relative select-none w-full flex flex-col items-center justify-start transition-all duration-700 ${isScannerActive ? "cursor-crosshair" : "cursor-default"}`}
    >
      <div className="grid grid-cols-4 place-items-center gap-y-6 gap-x-4 relative z-20 w-full max-w-4xl mx-auto">
        {tools.map((tool: TechnicalTool, idx: number) => (
          <SkillLogoBox
            key={idx}
            skill={tool}
            isDark={isDark}
            type="tech"
            beamX={isScannerActive ? globalMouseX : null}
            parentRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}
