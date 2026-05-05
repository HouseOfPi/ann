// Scene 3: Transition / pivot. 15 - 18s
// "There's a better way."

function SceneTransition({ start = 15, end = 18 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const enter = Easing.easeOutCubic(clamp(localTime / 0.5, 0, 1));
        const exit  = clamp((localTime - (duration - 0.4)) / 0.4, 0, 1);
        const opacity = enter * (1 - exit);

        // Subtle horizontal drift
        const drift = (localTime / duration) * 12 - 6;

        return (
          <div style={{
            position: 'absolute', inset: 0,
            background: COLORS.ink,
            color: COLORS.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity,
          }}>
            <div style={{
              textAlign: 'center',
              transform: `translateX(${drift}px)`,
            }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 13, letterSpacing: '0.32em',
                color: 'oklch(72% 0.10 200)',
                textTransform: 'uppercase',
                marginBottom: 28,
                opacity: clamp(localTime / 0.6, 0, 1),
              }}>
                There's a better way
              </div>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 110,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 1.0,
              }}>
                Don't write rules.
                <br/>
                <em style={{ fontStyle: 'italic', color: 'oklch(78% 0.10 200)' }}>
                  Show examples.
                </em>
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

Object.assign(window, { SceneTransition });
