// Scene 5: Closing card. 30 - 34s
// "Learn from data, not rules."

  function SceneOutro({ start = 48, end = 52 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const enter = Easing.easeOutCubic(clamp(localTime / 0.6, 0, 1));
        const exit  = clamp((localTime - (duration - 0.6)) / 0.6, 0, 1);
        const op = enter * (1 - exit);
        const scale = 1 + localTime * 0.008;

        return (
          <div style={{
            position: 'absolute', inset: 0,
            background: COLORS.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: op,
          }}>
            <div style={{
              textAlign: 'center',
              transform: `scale(${scale})`,
            }}>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 96,
                fontWeight: 400,
                color: COLORS.ink,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}>
                Learn from <em style={{ fontStyle: 'italic', color: COLORS.accent }}>data</em>,
                <br/>
                not from rules.
              </div>
              <div style={{
                marginTop: 48,
                fontFamily: FONTS.mono,
                fontSize: 14, letterSpacing: '0.32em',
                color: COLORS.inkMuted,
                textTransform: 'uppercase',
                opacity: clamp((localTime - 0.8) / 0.6, 0, 1),
              }}>
                That's machine learning.
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

Object.assign(window, { SceneOutro });
