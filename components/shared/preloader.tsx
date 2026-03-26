"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const greetings = [
  "Hello",
  "Bonjour",
  "Ciao",
  "Olà",
  "やあ",
  "Hallå",
  "Guten tag",
  "হ্যালো",
  "வணக்கம்",
];

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [dimension, setDimension] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });

    function handleResize() {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cycle through greetings
  useEffect(() => {
    if (currentIndex < greetings.length - 1) {
      const delay = currentIndex === 0 ? 1000 : 150;
      const timer = setTimeout(() => setCurrentIndex((i) => i + 1), delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsExiting(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Fire onComplete after exit animation
  const handleExitComplete = useCallback(() => {
    if (isExiting) onComplete();
  }, [isExiting, onComplete]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {!isExiting && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-50 bg-background overflow-hidden"
          exit={{ y: "-100%" }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          {/* SVG curve at the bottom during exit */}
          {dimension && (
            <svg
              className="absolute bottom-0 left-0 w-full"
              viewBox={`0 0 ${dimension.width} 100`}
              preserveAspectRatio="none"
              style={{ height: 100 }}
            >
              <motion.path
                d={`M0 0 L${dimension.width} 0 L${dimension.width} 100 Q${dimension.width / 2} 100 0 100 Z`}
                exit={{
                  d: `M0 0 L${dimension.width} 0 L${dimension.width} 100 Q${dimension.width / 2} 400 0 100 Z`,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.76, 0, 0.24, 1],
                }}
                className="fill-background"
              />
            </svg>
          )}

          {/* Greeting text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                <span className="font-heading text-3xl sm:text-5xl font-bold text-foreground">
                  {greetings[currentIndex]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
