// web/components/ui/risk-radar.tsx
'use client'

import React from 'react'

export function RiskRadar() {
  const points = [
    { label: 'Security', value: 80 },
    { label: 'Latency', value: 40 },
    { label: 'Compliance', value: 90 },
    { label: 'Cost', value: 30 },
    { label: 'Accuracy', value: 75 },
  ]

  const size = 200
  const center = size / 2
  const radius = size * 0.4

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / points.length - Math.PI / 2
    const x = center + radius * (value / 100) * Math.cos(angle)
    const y = center + radius * (value / 100) * Math.sin(angle)
    return `${x},${y}`
  }

  const polygonPoints = points.map((p, i) => getPoint(i, p.value)).join(' ')
  const gridPoints = [20, 40, 60, 80, 100].map(v => 
    points.map((_, i) => getPoint(i, v)).join(' ')
  )

  return (
    <div className="w-full flex items-center justify-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grids */}
        {gridPoints.map((gp, i) => (
          <polygon 
            key={i} 
            points={gp} 
            fill="none" 
            stroke="currentColor" 
            className="text-neural-800" 
            strokeWidth="1" 
          />
        ))}
        
        {/* Base Axes */}
        {points.map((_, i) => {
          const p = getPoint(i, 100)
          return (
            <line 
              key={i} 
              x1={center} 
              y1={center} 
              x2={p.split(',')[0]} 
              y2={p.split(',')[1]} 
              stroke="currentColor" 
              className="text-neural-800" 
              strokeWidth="1" 
            />
          )
        })}

        {/* Data Shape */}
        <polygon 
          points={polygonPoints} 
          fill="url(#radarGradient)" 
          stroke="currentColor" 
          className="text-ai-teal" 
          strokeWidth="2"
          fillOpacity="0.3"
        />

        {/* Labels (simplified) */}
        {points.map((p, i) => {
          const pos = getPoint(i, 115)
          const [x, y] = pos.split(',').map(Number)
          return (
            <text 
              key={i} 
              x={x} 
              y={y} 
              textAnchor="middle" 
              className="fill-neural-500 text-[10px] font-mono uppercase"
            >
              {p.label[0]}
            </text>
          )
        })}

        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066ff" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
