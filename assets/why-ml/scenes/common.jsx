// Shared components and constants

const COLORS = {
  bg: '#f4f1ea',
  bgAlt: '#ebe6db',
  ink: '#1a1815',
  inkSoft: '#5c574e',
  inkMuted: '#8a8478',
  rule: '#d4cfc2',
  accent: 'oklch(58% 0.09 200)',   // muted teal
  spam: 'oklch(58% 0.13 30)',      // soft red-orange
  ham: 'oklch(62% 0.09 150)',      // sage green
  paper: '#fdfbf6',
};

const FONTS = {
  sans: '"Inter", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  serif: '"Instrument Serif", Georgia, serif',
};

// A simple envelope card. Can be tagged spam/ham/unknown.
function Envelope({
  x, y, width = 220, height = 130,
  subject = '',
  preview = '',
  label = null, // 'spam' | 'ham' | null
  rotation = 0,
  scale = 1,
  opacity = 1,
  shadow = true,
}) {
  const labelColor = label === 'spam' ? COLORS.spam : label === 'ham' ? COLORS.ham : null;
  const labelText = label === 'spam' ? 'SPAM' : label === 'ham' ? 'NOT SPAM' : null;

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      transformOrigin: 'center',
      opacity,
      background: COLORS.paper,
      border: `1px solid ${COLORS.rule}`,
      borderRadius: 4,
      boxShadow: shadow ? '0 6px 20px rgba(40,30,15,0.10), 0 1px 2px rgba(40,30,15,0.06)' : 'none',
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 6,
      fontFamily: FONTS.sans,
      overflow: 'hidden',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        color: COLORS.inkMuted, textTransform: 'uppercase',
      }}>
        Inbox · 9:42
      </div>
      <div style={{
        fontSize: 15, fontWeight: 600, color: COLORS.ink,
        lineHeight: 1.25,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {subject}
      </div>
      <div style={{
        fontSize: 12, color: COLORS.inkSoft, lineHeight: 1.35,
        flex: 1,
        overflow: 'hidden',
      }}>
        {preview}
      </div>
      {labelText && (
        <div style={{
          alignSelf: 'flex-start',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          padding: '3px 8px',
          background: labelColor,
          color: COLORS.paper,
          borderRadius: 2,
        }}>
          {labelText}
        </div>
      )}
    </div>
  );
}

// A line of code (mono).
function CodeLine({ children, color = COLORS.ink, indent = 0, opacity = 1 }) {
  return (
    <div style={{
      fontFamily: FONTS.mono,
      fontSize: 18,
      color,
      opacity,
      paddingLeft: indent * 24,
      lineHeight: 1.6,
      whiteSpace: 'pre',
    }}>
      {children}
    </div>
  );
}

// Caption pinned bottom-center
function Caption({ text, opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute',
      left: '50%', bottom: 60,
      transform: 'translateX(-50%)',
      opacity,
      fontFamily: FONTS.sans,
      fontSize: 22,
      fontWeight: 500,
      color: COLORS.inkSoft,
      letterSpacing: '-0.01em',
      textAlign: 'center',
    }}>
      {text}
    </div>
  );
}

Object.assign(window, { COLORS, FONTS, Envelope, CodeLine, Caption });
