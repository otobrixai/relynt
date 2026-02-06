// web/components/ui/data-viz.tsx
'use client'

import React from 'react'

export function DataVizChart() {
  return (
    <div className="w-full h-full min-h-[200px] flex items-end justify-between gap-2 px-2 pb-2">
      {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 55].map((height, i) => (
        <div key={i} className="flex-1 group relative">
          <div 
            className="w-full bg-linear-to-t from-cyber-blue/20 to-ai-teal/40 rounded-t-lg transition-all duration-500 ease-out group-hover:from-cyber-blue/40 group-hover:to-ai-teal/60"
            style={{ 
              height: `${height}%`,
              animation: `grow-up 1s ease-out ${i * 0.05}s both`
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-ai-teal shadow-[0_0_10px_rgba(6,182,212,0.5)] rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-neural-500 font-mono hidden group-hover:block">
            {height}%
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes grow-up {
          from { height: 0; }
          to { height: var(--final-height); }
        }
      `}</style>
    </div>
  )
}
