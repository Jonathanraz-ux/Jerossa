import React, { useMemo, useState } from 'react';
import { formatEUR } from './format';

/**
 * AreaChart premium en SVG natif — aucune dépendance.
 * `points` : [{ label: string, value: number }]
 */
const W = 640;
const H = 220;
const PAD = { top: 18, right: 8, bottom: 26, left: 8 };

export const RevenueAreaChart = ({ points }) => {
  const [hover, setHover] = useState(null);

  const geometry = useMemo(() => {
    if (!points.length) return null;
    const maxVal = Math.max(...points.map((p) => p.value), 1);
    // Arrondi "beau" pour le haut de l'échelle
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const niceMax = Math.ceil(maxVal / magnitude) * magnitude || 1;

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

    const xy = points.map((p, i) => ({
      ...p,
      x: PAD.left + i * stepX,
      y: PAD.top + innerH * (1 - p.value / niceMax),
    }));

    // Courbe lissée (Catmull-Rom → Bézier)
    let line = '';
    xy.forEach((pt, i) => {
      if (i === 0) {
        line += `M ${pt.x} ${pt.y}`;
        return;
      }
      const p0 = xy[i - 1];
      const cx = (p0.x + pt.x) / 2;
      line += ` C ${cx} ${p0.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    });
    const area = `${line} L ${xy[xy.length - 1].x} ${H - PAD.bottom} L ${xy[0].x} ${H - PAD.bottom} Z`;

    return { xy, niceMax, line, area };
  }, [points]);

  if (!geometry) return null;

  const { xy, line, area } = geometry;
  const hoverPt = hover !== null ? xy[hover] : null;
  const labelEvery = Math.ceil(points.length / 7);

  return (
    <div className="adm-chart-wrap">
      <svg
        className="adm-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Évolution des revenus"
        style={{ height: 220 }}
      >
        <defs>
          <linearGradient id="adm-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a87945" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a87945" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grille discrète */}
        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * (1 - t);
          return (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="#e6e1d5"
              strokeWidth="1"
              strokeDasharray="2 5"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        <path d={area} fill="url(#adm-area-fill)" />
        <path
          d={line}
          fill="none"
          stroke="#a87945"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Crosshair */}
        {hoverPt && (
          <>
            <line
              x1={hoverPt.x}
              x2={hoverPt.x}
              y1={PAD.top - 6}
              y2={H - PAD.bottom}
              stroke="#c9b489"
              strokeWidth="1"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={hoverPt.y}
              y2={hoverPt.y}
              stroke="#c9b489"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}

        {/* Zones de survol */}
        {points.length > 0 &&
          xy.map((p, i) => {
            const half = (W - PAD.left - PAD.right) / points.length / 2;
            const x0 = i === 0 ? PAD.left : p.x - half;
            const x1 = i === xy.length - 1 ? W - PAD.right : p.x + half;
            return (
              <rect
                key={i}
                x={x0}
                y={0}
                width={Math.max(x1 - x0, 4)}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            );
          })}
      </svg>

      {/* Axe X */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 8px 0',
          fontSize: 10.5,
          color: '#b3ac9e',
        }}
      >
        {xy.map((p, i) =>
          i % labelEvery === 0 || i === xy.length - 1 ? (
            <span key={i}>{p.label}</span>
          ) : null
        )}
      </div>

      {/* Tooltip */}
      {hoverPt && (
        <div
          className="adm-chart-tip"
          style={{ left: `${(hoverPt.x / W) * 100}%`, top: `${(hoverPt.y / H) * 220}px` }}
        >
          <div className="adm-chart-tip-label">{hoverPt.label}</div>
          <div className="adm-chart-tip-value">{formatEUR(hoverPt.value)}</div>
        </div>
      )}
    </div>
  );
};

/** Mini sparkline (KPI hero) */
export const Sparkline = ({ points = [], height = 44 }) => {
  if (points.length < 2) return null;
  const maxVal = Math.max(...points.map((p) => p.value), 1);
  const w = 300;
  const h = height;
  const stepX = w / (points.length - 1);
  const pts = points.map((p, i) => ({
    x: i * stepX,
    y: h - 3 - (h - 8) * (p.value / maxVal),
  }));
  let d = '';
  pts.forEach((pt, i) => {
    if (i === 0) {
      d += `M ${pt.x} ${pt.y}`;
      return;
    }
    const p0 = pts[i - 1];
    const cx = (p0.x + pt.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id="adm-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a373" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4a373" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="url(#adm-spark-fill)" />
      <path d={d} fill="none" stroke="#d4a373" strokeWidth="1.75" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};
