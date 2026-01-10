import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const Background = () => {
  const { theme, mode } = useTheme();

  const isDark = mode === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base Gradient Layer */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark ? 'bg-slate-950' : 'bg-slate-50'
        }`}
      />

      {/* Animated Orbs/Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-30 ${
            isDark ? `bg-${theme}-900` : `bg-${theme}-200`
        }`}
      />

      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
        className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full filter blur-[120px] opacity-20 ${
             isDark ? 'bg-purple-900' : 'bg-purple-200'
        }`}
      />

      <motion.div
         animate={{
            x: [0, 50, -50, 0],
            y: [0, 50, 50, 0],
         }}
         transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
         }}
         className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full filter blur-[150px] opacity-10 ${
            isDark ? 'bg-blue-900' : 'bg-blue-200'
         }`}
      />

      {/* Grid Pattern Overlay (Optional for "Tech" feel) */}
      <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay`}></div>
    </div>
  );
};
