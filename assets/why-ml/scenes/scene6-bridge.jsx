// Scene 6: Bridge between spam example and machine failure example. 30 - 33s.
// "It's not just spam."

function SceneBridge({ start = 30, end = 33 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const enter = Easing.easeOutCubic(clamp(localTime / 0.5, 0, 1));
        const exit  = clamp((localTime - (duration - 0.5)) / 0.5, 0, 1);
        const op = enter * (1 - exit);

        return (
          <div style={{
            position: 'absolute', inset: 0,
            background: COLORS.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: op,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 14, letterSpacing: '0.32em',
                color: COLORS.inkMuted,
                textTransform: 'uppercase',
                marginBottom: 28,
                opacity: clamp(localTime / 0.6, 0, 1),
              }}>
                Another example
              </div>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 96,
                fontWeight: 400,
                color: COLORS.ink,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                transform: `scale(${1 + localTime * 0.006})`,
              }}>
                When will this machine
                <br/>
                <em style={{ fontStyle: 'italic', color: COLORS.accent }}>
                  break down?
                </em>
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

Object.assign(window, { SceneBridge });
