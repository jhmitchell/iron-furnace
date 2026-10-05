import { useEffect, useId, useRef, useState } from 'react';
import styles from './AdminStats.module.css';
import { bucketLabel, formatNumber, shortDate } from './format';

/*
  Small, dependency-free SVG charts for the Stats page. Marks follow one spec: columns at
  most 24px wide with 4px rounded tops, 2px lines, hairline gridlines, a 2px surface gap
  between stacked segments. Every chart has a hover/keyboard tooltip and a table view, so
  no value depends on hovering or on telling colors apart.
*/

/** Width of an element, kept up to date. */
const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

/** Rounded-top column path: square at the baseline, 4px radius at the data end. */
const columnPath = (x, y, w, h) => {
  if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

/** Clean axis maximum and 2-3 ticks. */
const niceScale = (max) => {
  if (max <= 4) {
    const top = Math.max(1, Math.ceil(max));
    return { top, ticks: top <= 2 ? [0, top] : [0, Math.ceil(top / 2), top] };
  }
  const exp = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * exp).find((s) => max / s <= 3) || exp * 10;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let t = 0; t <= top + 1e-9; t += step) ticks.push(Math.round(t));
  return { top, ticks };
};

/** Beside the crosshair (right of it, or left near the right edge), so it never covers the mark. */
const Tooltip = ({ x, width, children }) => {
  const flip = x > width - 220;
  return (
    <div className={styles.tooltip} style={{ left: flip ? x - 12 : x + 12, transform: flip ? 'translateX(-100%)' : 'none' }}
      role="status">
      {children}
    </div>
  );
};

/**
 * Columns for the current period, the previous period as a faint line (aligned bucket by
 * bucket), the unfinished current bucket drawn hollow, and event markers along the top.
 */
export const ColumnChart = ({ buckets, values, previous, bucket, todayIndex, markers = [], label, unit }) => {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const titleId = useId();
  const height = 200;
  const pad = { top: 18, right: 8, bottom: 26, left: 34 };
  const n = buckets.length;
  const max = Math.max(1, ...values, ...(previous || []));
  const { top, ticks } = niceScale(max);
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const slot = n ? innerW / n : 0;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const xOf = (i) => pad.left + i * slot + slot / 2;
  const yOf = (v) => pad.top + innerH - (v / top) * innerH;
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))));
  const markerByIndex = {};
  markers.forEach((m) => {
    const i = buckets.findIndex((b, k) => m.date >= b && (k === n - 1 || m.date < buckets[k + 1]));
    if (i >= 0) (markerByIndex[i] = markerByIndex[i] || []).push(m);
  });

  const pick = (clientX) => {
    const box = ref.current.getBoundingClientRect();
    const i = Math.floor((clientX - box.left - pad.left) / slot);
    setActive(i >= 0 && i < n ? i : null);
  };

  const onKey = (event) => {
    if (event.key === 'ArrowRight') setActive((i) => Math.min(n - 1, i === null ? 0 : i + 1));
    else if (event.key === 'ArrowLeft') setActive((i) => Math.max(0, i === null ? n - 1 : i - 1));
    else if (event.key === 'Escape') setActive(null);
    else return;
    event.preventDefault();
  };

  const prevLine = previous && previous.length === n
    ? previous.map((v, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(v)}`).join('')
    : null;

  return (
    <div className={styles.chartWrap} ref={ref}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          className={styles.chartSvg}
          onPointerMove={(e) => pick(e.clientX)}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          <title id={titleId}>{`${label}. Use the arrow keys to read each ${bucket}.`}</title>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={yOf(t)} y2={yOf(t)} className={styles.grid} />
              <text x={pad.left - 6} y={yOf(t)} dy="0.32em" textAnchor="end" className={styles.axisText}>
                {formatNumber(t)}
              </text>
            </g>
          ))}
          {values.map((v, i) => {
            const x = xOf(i) - barW / 2;
            const y = yOf(v);
            const unfinished = i === todayIndex;
            return (
              <path
                key={buckets[i]}
                d={columnPath(x, y, barW, pad.top + innerH - y)}
                className={`${styles.column} ${unfinished ? styles.columnUnfinished : ''} ${active === i ? styles.columnActive : ''}`}
              />
            );
          })}
          {prevLine && <path d={prevLine} className={styles.previousLine} />}
          {Object.keys(markerByIndex).map((i) => (
            <path key={i} d={`M${xOf(+i) - 4},${pad.top - 12}h8l-4,6z`} className={styles.eventMarker} />
          ))}
          {buckets.map((b, i) => (i % labelEvery === 0 ? (
            <text key={b} x={xOf(i)} y={height - 8} textAnchor="middle" className={styles.axisText}>
              {shortDate(b)}
            </text>
          ) : null))}
          {active !== null && (
            <line x1={xOf(active)} x2={xOf(active)} y1={pad.top} y2={pad.top + innerH} className={styles.crosshair} />
          )}
        </svg>
      )}
      {active !== null && width > 0 && (
        <Tooltip x={xOf(active)} width={width}>
          <span>
            <strong className={styles.tooltipValue}>{formatNumber(values[active])}</strong> {unit}
          </span>
          <span className={styles.tooltipMuted}>
            {bucketLabel(buckets[active], bucket)}
            {active === todayIndex ? ' (so far)' : ''}
          </span>
          {previous && (
            <span className={styles.tooltipMuted}>
              <span className={styles.lineKey} aria-hidden="true" />
              {formatNumber(previous[active])} in the period before
            </span>
          )}
          {(markerByIndex[active] || []).map((m) => (
            <span key={m.id} className={styles.tooltipEvent}>Event: {m.title}</span>
          ))}
        </Tooltip>
      )}
    </div>
  );
};

/** Stacked columns (e.g. people vs bots per day); `series` = [{ key, label, color, values }]. */
export const StackedColumns = ({ buckets, series, label }) => {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const titleId = useId();
  const height = 180;
  const pad = { top: 10, right: 8, bottom: 26, left: 40 };
  const n = buckets.length;
  const totals = buckets.map((_, i) => series.reduce((sum, s) => sum + s.values[i], 0));
  const { top, ticks } = niceScale(Math.max(1, ...totals));
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const slot = n ? innerW / n : 0;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const xOf = (i) => pad.left + i * slot + slot / 2;
  const hOf = (v) => (v / top) * innerH;
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))));

  return (
    <div className={styles.chartWrap} ref={ref}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          className={styles.chartSvg}
          onPointerMove={(e) => {
            const i = Math.floor((e.clientX - ref.current.getBoundingClientRect().left - pad.left) / slot);
            setActive(i >= 0 && i < n ? i : null);
          }}
          onPointerLeave={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setActive((i) => Math.min(n - 1, i === null ? 0 : i + 1));
            else if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, i === null ? n - 1 : i - 1));
            else return;
            e.preventDefault();
          }}
          onBlur={() => setActive(null)}
        >
          <title id={titleId}>{label}</title>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH - hOf(t)} y2={pad.top + innerH - hOf(t)} className={styles.grid} />
              <text x={pad.left - 6} y={pad.top + innerH - hOf(t)} dy="0.32em" textAnchor="end" className={styles.axisText}>
                {formatNumber(t)}
              </text>
            </g>
          ))}
          {buckets.map((b, i) => {
            let base = pad.top + innerH;
            const visible = series.filter((s) => s.values[i] > 0);
            return (
              <g key={b} opacity={active === null || active === i ? 1 : 0.55}>
                {visible.map((s, k) => {
                  const h = hOf(s.values[i]);
                  const gap = k > 0 ? 2 : 0; // surface gap between segments
                  const y = base - h;
                  base = y;
                  const isTop = k === visible.length - 1;
                  return (
                    <path
                      key={s.key}
                      d={isTop ? columnPath(xOf(i) - barW / 2, y, barW, Math.max(0, h - gap))
                        : `M${xOf(i) - barW / 2},${y + h - gap}V${y}H${xOf(i) + barW / 2}V${y + h - gap}Z`}
                      fill={s.color}
                    />
                  );
                })}
              </g>
            );
          })}
          {buckets.map((b, i) => (i % labelEvery === 0 ? (
            <text key={b} x={xOf(i)} y={height - 8} textAnchor="middle" className={styles.axisText}>
              {shortDate(b)}
            </text>
          ) : null))}
        </svg>
      )}
      {active !== null && width > 0 && (
        <Tooltip x={xOf(active)} width={width}>
          <span className={styles.tooltipMuted}>{shortDate(buckets[active])}</span>
          {[...series].reverse().map((s) => (
            <span key={s.key} className={styles.tooltipRow}>
              <span className={styles.swatch} style={{ background: s.color }} aria-hidden="true" />
              <strong className={styles.tooltipValue}>{formatNumber(s.values[active])}</strong> {s.label}
            </span>
          ))}
        </Tooltip>
      )}
    </div>
  );
};

/** Tiny trend line for table rows (the row's own numbers say the values). */
export const Sparkline = ({ values }) => {
  if (!values || values.length < 2) return null;
  const w = 72;
  const h = 20;
  const max = Math.max(1, ...values);
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - (v / max) * (h - 4)).toFixed(1)}`);
  return (
    <svg width={w} height={h} className={styles.sparkline} aria-hidden="true" focusable="false">
      <polyline points={points.join(' ')} />
    </svg>
  );
};

/** One horizontal bar split into parts (e.g. phone / computer / tablet). */
export const ShareBar = ({ parts }) => {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  if (!total) return null;
  return (
    <div>
      <div className={styles.shareBar} aria-hidden="true">
        {parts.filter((p) => p.value).map((p) => (
          <span key={p.label} style={{ flexGrow: p.value, background: p.color }} />
        ))}
      </div>
      <ul className={styles.legend}>
        {parts.map((p) => (
          <li key={p.label}>
            <span className={styles.swatch} style={{ background: p.color }} aria-hidden="true" />
            {p.label} <strong>{formatNumber(p.value)}</strong>{' '}
            <span className={styles.muted}>({Math.round((100 * p.value) / total)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Plain bar for a value relative to the largest in its list (table cells). */
export const InlineBar = ({ value, max }) => (
  <span className={styles.inlineBar} aria-hidden="true">
    <span style={{ width: `${max ? Math.max(2, (100 * value) / max) : 0}%` }} />
  </span>
);
