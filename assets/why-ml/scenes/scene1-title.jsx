// Scene 1: Title card. 0 - 3s
// "Why do we need Machine Learning?"

function SceneTitle({ start = 0, end = 3 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const enter = Easing.easeOutCubic(clamp(localTime / 0.8, 0, 1));
        const exit = clamp((localTime - (duration - 0.5)) / 0.5, 0, 1);
        const opacity = enter * (1 - exit);
        const ty = (1 - enter) * 24 - exit * 12;

        // Slow pan/scale for life
        const scale = 1 + localTime * 0.012;

        return (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: COLORS.bg,
          }}>
            <div style={{
              opacity,
              transform: `translateY(${ty}px) scale(${scale})`,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 14, letterSpacing: '0.32em',
                color: COLORS.inkMuted,
                textTransform: 'uppercase',
                marginBottom: 32,
              }}>
                Lesson 01 · Introduction
              </div>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 96,
                fontWeight: 400,
                color: COLORS.ink,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}>
                Why do we need
                <br/>
                <em style={{ fontStyle: 'italic', color: COLORS.accent }}>machine learning?</em>
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

Object.assign(window, { SceneTitle });
