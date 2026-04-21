import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export function CustomCursor({ isDark }: { isDark: boolean }) {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const springConfig = { damping: 30, stiffness: 500 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { 
      mouseX.set(e.clientX); 
      mouseY.set(e.clientY); 
    };
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('button') || target.closest('a');
      setIsHovering(!!isInteractive);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseover', handleMouseOver); 
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
      <motion.div 
        className="absolute top-0 left-0 rounded-full border-2 mix-blend-difference" 
        style={{ 
          x: cursorX, 
          y: cursorY, 
          translateX: '-50%', 
          translateY: '-50%', 
          width: isHovering ? 60 : 35, 
          height: isHovering ? 60 : 35, 
          borderColor: isHovering ? '#3b82f6' : (isDark ? '#ffffff' : '#3b82f6'), 
          backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.15)' : 'transparent' 
        }} 
      />
      <motion.div 
        className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full" 
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%', scale: isHovering ? 0 : 1 }} 
      />
    </div>
  );
}
