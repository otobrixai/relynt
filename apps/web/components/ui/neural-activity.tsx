// web/components/ui/neural-activity.tsx
'use client'

import React from 'react'

export function NeuralActivity() {
  return (
    <div className="w-full h-full min-h-[150px] relative overflow-hidden bg-neural-900/20 rounded-xl border border-neural-800/30">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#0066ff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        <path d="M 50 75 L 150 75 M 150 75 L 250 40 M 150 75 L 250 110" stroke="#334155" strokeWidth="2" fill="none" />
        
        {/* Animated Particles */}
        <circle r="3" fill="#06b6d4" filter="url(#glow)">
          <animateMotion 
            path="M 50 75 L 150 75 L 250 40" 
            dur="3s" 
            repeatCount="indefinite" 
          />
        </circle>
        <circle r="3" fill="#8b5cf6" filter="url(#glow)">
          <animateMotion 
            path="M 50 75 L 150 75 L 250 110" 
            dur="4s" 
            begin="1s"
            repeatCount="indefinite" 
          />
        </circle>

        {/* Nodes */}
        <circle cx="50" cy="75" r="8" fill="url(#nodeGradient)" filter="url(#glow)" />
        <circle cx="150" cy="75" r="10" fill="url(#nodeGradient)" filter="url(#glow)" />
        <circle cx="250" cy="40" r="6" fill="#06b6d4" />
        <circle cx="250" cy="110" r="6" fill="#8b5cf6" />
      </svg>
      
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <span className="text-[10px] font-mono text-ai-teal uppercase tracking-tighter">active_synapse_pulse</span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-ai-teal rounded-full animate-pulse" />
          <div className="w-1 h-1 bg-ai-teal rounded-full animate-pulse delay-75" />
          <div className="w-1 h-1 bg-ai-teal rounded-full animate-pulse delay-150" />
        </div>
      </div>
    </div>
  )
}
