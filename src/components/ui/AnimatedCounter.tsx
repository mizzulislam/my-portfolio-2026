import React, { useState, useRef, useEffect } from "react";
import { animate, useInView } from "motion/react";

export function AnimatedCounter({
  to,
  duration = 2,
}: {
  to: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (value) => setCount(Math.floor(value)),
      });
      return () => controls.stop();
    } else {
      setCount(0);
    }
  }, [isInView, to, duration]);
  return <span ref={ref}>{count}</span>;
}
