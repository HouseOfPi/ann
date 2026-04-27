// Scene 2: The rule-based approach. 3 - 15s
// Show an inbox with a spam email, developer writes if-statements,
// rules pile up, spammer changes tactics, more rules added, chaos.

function SceneRules({ start = 3, end = 15 }) {
  return (
    <Sprite start={start} end={end}>
      {({ localTime, duration }) => {
        const t = localTime;

        // Crossfade in/out
        const fadeIn  = clamp(t / 0.5, 0, 1);
        const fadeOut = 1 - clamp((t - (duration - 0.6)) / 0.6, 0, 1);
        const opacity = Easing.easeOutCubic(fadeIn) * fadeOut;

        // Section header
        const headerOp = clamp((t - 0.0) / 0.5, 0, 1);

        // Email card slides in
        const emailIn = Easing.easeOutCubic(clamp((t - 0.4) / 0.7, 0, 1));
        const emailX  = -260 + emailIn * 260; // ends at 0 offset

        // Code block reveals line by line
        // Lines arrive at t=2.0, 2.6, 3.2, 3.8, 4.4, 5.0, 5.6, 6.2, 6.8
        const lineTimes = [2.0, 2.6, 3.2, 3.8, 4.4, 5.0, 5.6, 6.2, 6.8];
        const lineOps = lineTimes.map((lt) => clamp((t - lt) / 0.3, 0, 1));

        // Spammer adapts moment: at t≈7.5, the email morphs to "F R E E"
        const morphT = clamp((t - 7.5) / 0.4, 0, 1);

        // "Rule misses" indicator
        const missOp = clamp((t - 8.0) / 0.4, 0, 1) * (1 - clamp((t - 10.5) / 0.4, 0, 1));

        // After miss, more lines arrive at t=8.8, 9.4, 10.0
        const moreLineOps = [8.8, 9.4, 10.0].map((lt) => clamp((t - lt) / 0.3, 0, 1));

        // Final "endless rules" feel: code block scrolls, dim
        const chaosT = clamp((t - 10.6) / 1.0, 0, 1);

        return (
          <div style={{
            position: 'absolute', inset: 0,
            opacity,
            background: COLORS.bg,
            fontFamily: FONTS.sans,
          }}>
            {/* Header */}
            <div style={{
              position: 'absolute',
              top: 90, left: 120,
              opacity: headerOp,
              transform: `translateY(${(1 - headerOp) * 8}px)`,
            }}>
              <div style={{
                fontFamily: FONTS.mono,
                fontSize: 14, letterSpacing: '0.28em',
                color: COLORS.accent,
                textTransform: 'uppercase',
                marginBottom: 16,
                fontWeight: 600,
              }}>
                The traditional way
              </div>
              <div style={{
                fontFamily: FONTS.serif,
                fontSize: 72,
                fontWeight: 400,
                color: COLORS.ink,
                letterSpacing: '-0.025em',
                lineHeight: 1.0,
              }}>
                Write a rule for <em style={{ fontStyle: 'italic', color: COLORS.accent }}>every</em> case.
              </div>
            </div>

            {/* Email card on the left */}
            <div style={{
              position: 'absolute',
              left: 120,
              top: 340,
              width: 720,
              opacity: emailIn,
              transform: `translateY(${(1 - emailIn) * 20}px)`,
              background: COLORS.paper,
              border: `1px solid ${COLORS.rule}`,
              borderRadius: 8,
              boxShadow: '0 18px 48px rgba(40,30,15,0.12), 0 2px 4px rgba(40,30,15,0.06)',
              padding: '32px 36px',
              display: 'flex', flexDirection: 'column', gap: 18,
              fontFamily: FONTS.sans,
            }}>
              {/* Mail header bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: 18,
                borderBottom: `1px solid ${COLORS.rule}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 22,
                    background: 'oklch(82% 0.06 60)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: COLORS.paper,
                    fontSize: 16, fontWeight: 700,
                    fontFamily: FONTS.sans,
                  }}>
                    P
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
                      Prizes Department
                    </div>
                    <div style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11, color: COLORS.inkMuted, letterSpacing: '0.04em',
                    }}>
                      prizes@offers-mail.co
                    </div>
                  </div>
                </div>
                <div style={{
                  fontFamily: FONTS.mono,
                  fontSize: 11, color: COLORS.inkMuted, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  9:42 AM
                </div>
              </div>

              {/* Subject line — single line, ellipsis if needed; crossfade morph */}
              <div style={{
                position: 'relative',
                height: 38,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  fontSize: 28, fontWeight: 700, color: COLORS.ink,
                  letterSpacing: '-0.02em', lineHeight: 1.1,
                  opacity: 1 - morphT,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  You're a WINNER — claim your FREE gift
                </div>
                <div style={{
                  position: 'absolute', inset: 0,
                  fontSize: 28, fontWeight: 700, color: COLORS.spam,
                  letterSpacing: '-0.02em', lineHeight: 1.1,
                  opacity: morphT,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  You're a W1NNER — claim ur F R E E gift
                </div>
              </div>

              {/* Preview body */}
              <div style={{
                fontSize: 16, color: COLORS.inkSoft, lineHeight: 1.55,
              }}>
                Click here now. Limited time offer. $$$ guaranteed.
                <br/>Act fast — only 3 left!
              </div>

              {/* Spam tag flickers in when rule catches it */}
              <div style={{
                alignSelf: 'flex-start',
                marginTop: 6,
                fontFamily: FONTS.mono,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
                padding: '6px 12px',
                background: COLORS.spam,
                color: COLORS.paper,
                borderRadius: 3,
                whiteSpace: 'nowrap',
                opacity: clamp((t - 4.6) / 0.3, 0, 1) * (1 - morphT * 0.95),
              }}>
                ✓ FLAGGED · SPAM
              </div>
            </div>

            {/* "Rule missed!" badge — sits to the right of the email card */}
            <div style={{
              position: 'absolute',
              left: 120 + 720 - 60,
              top: 308,
              opacity: missOp,
              transform: `scale(${0.7 + missOp * 0.3}) rotate(-6deg)`,
              transformOrigin: 'center',
              background: COLORS.spam,
              color: COLORS.paper,
              fontFamily: FONTS.mono,
              fontSize: 14, fontWeight: 700, letterSpacing: '0.12em',
              padding: '10px 16px',
              borderRadius: 4,
              boxShadow: '0 12px 28px rgba(180,60,20,0.32)',
            }}>
              ✕ NOT FLAGGED
            </div>

            {/* Code block on the right */}
            <CodeBlock
              x={960} y={300}
              width={840}
              lineOps={lineOps}
              moreLineOps={moreLineOps}
              chaosT={chaosT}
            />

            {/* Bottom caption */}
            <CaptionLine t={t} />
          </div>
        );
      }}
    </Sprite>
  );
}

function CodeBlock({ x, y, width, lineOps, moreLineOps, chaosT }) {
  // The block can scroll up under chaosT to suggest "more rules forever"
  const scroll = chaosT * 80;

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height: 460,
      background: '#1a1815',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(20,15,5,0.30)',
      fontFamily: FONTS.mono,
    }}>
      {/* Window chrome */}
      <div style={{
        height: 32, background: '#262320',
        borderBottom: '1px solid #33302b',
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px',
      }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#5c574e' }}/>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#5c574e' }}/>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: '#5c574e' }}/>
        <div style={{
          marginLeft: 14,
          color: '#8a8478', fontSize: 12, letterSpacing: '0.08em',
        }}>
          spam_filter.py
        </div>
      </div>

      <div style={{
        padding: '20px 24px',
        transform: `translateY(${-scroll}px)`,
        transition: 'none',
      }}>
        <Line op={lineOps[0]} color="#8a8478">{`# Filter spam by checking subject lines`}</Line>
        <Line op={lineOps[1]} color="#e6dfce">
          <span style={{ color: '#c79e6b' }}>def</span>{' '}
          <span style={{ color: '#9bbf80' }}>is_spam</span>(<span style={{ color: '#e6dfce' }}>email</span>):
        </Line>

        <Line op={lineOps[2]} color="#e6dfce" indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"FREE"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.subject:
        </Line>
        <Line op={lineOps[2]} color="#e6dfce" indent={2}>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        <Line op={lineOps[3]} color="#e6dfce" indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"WINNER"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.subject:
        </Line>
        <Line op={lineOps[3]} color="#e6dfce" indent={2}>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        <Line op={lineOps[4]} color="#e6dfce" indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"CLICK HERE"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.body:
        </Line>
        <Line op={lineOps[4]} color="#e6dfce" indent={2}>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        <Line op={lineOps[5]} color="#e6dfce" indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"$$$"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.body:
        </Line>
        <Line op={lineOps[5]} color="#e6dfce" indent={2}>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        <Line op={lineOps[6]} color="#e6dfce" indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"limited time"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.body:
        </Line>
        <Line op={lineOps[6]} color="#e6dfce" indent={2}>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        {/* Lines added after spammer adapts — highlighted */}
        <Line op={moreLineOps[0]} color="#e6dfce" indent={1} highlight>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"F R E E"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.subject:
        </Line>
        <Line op={moreLineOps[0]} color="#e6dfce" indent={2} highlight>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        <Line op={moreLineOps[1]} color="#e6dfce" indent={1} highlight>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"W1NNER"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.subject:
        </Line>
        <Line op={moreLineOps[1]} color="#e6dfce" indent={2} highlight>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        <Line op={moreLineOps[2]} color="#e6dfce" indent={1} highlight>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>"\\u2728 FR\\u00C9E \\u2728"</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.subject:
        </Line>
        <Line op={moreLineOps[2]} color="#e6dfce" indent={2} highlight>
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>

        {/* The endless rules under chaos */}
        <ChaosLines op={chaosT} />
      </div>
    </div>
  );
}

function Line({ children, op = 1, color = '#e6dfce', indent = 0, highlight = false }) {
  return (
    <div style={{
      fontSize: 16,
      color,
      opacity: op,
      paddingLeft: indent * 24,
      paddingRight: 8,
      lineHeight: 1.65,
      whiteSpace: 'pre',
      transform: `translateY(${(1 - op) * 6}px)`,
      background: highlight ? `rgba(217, 130, 90, ${0.10 * op})` : 'transparent',
      marginLeft: -8,
      paddingLeft: indent * 24 + 8,
      borderLeft: highlight ? `2px solid ${COLORS.spam}` : '2px solid transparent',
    }}>
      {children}
    </div>
  );
}

function ChaosLines({ op }) {
  const phrases = [
    '"act now"', '"meds"', '"discount"', '"crypto"',
    '"\\u00DCRGENT"', '"v.i.a.g.r.a"', '"nigerian prince"',
    '"!!1!"', '"f-r-e-e"', '"w!nner"',
  ];
  return (
    <div style={{ opacity: op }}>
      {phrases.map((p, i) => (
        <Line key={i} op={op * clamp((op - i * 0.05), 0, 1)} indent={1}>
          <span style={{ color: '#c79e6b' }}>if</span>{' '}
          <span style={{ color: '#d68b6b' }}>{p}</span>{' '}
          <span style={{ color: '#c79e6b' }}>in</span> email.body:{' '}
          <span style={{ color: '#c79e6b' }}>return</span>{' '}
          <span style={{ color: '#9bbf80' }}>True</span>
        </Line>
      ))}
    </div>
  );
}

function CaptionLine({ t }) {
  // Three captions cycle:
  // 1) "Catch a 'FREE' email — easy, write a rule." 1.5 – 7.0
  // 2) "But spammers adapt..." 7.4 – 10.5
  // 3) "...and the rules never end." 10.6 – end
  const caps = [
    { text: 'Spot the spam keyword. Add an if-statement.', start: 1.5, end: 7.0 },
    { text: 'But spammers adapt. The wording changes.',     start: 7.4, end: 10.5 },
    { text: 'And the rules never end.',                       start: 10.6, end: 12.0 },
  ];
  return (
    <>
      {caps.map((c, i) => {
        const fadeIn = clamp((t - c.start) / 0.4, 0, 1);
        const fadeOut = 1 - clamp((t - (c.end - 0.4)) / 0.4, 0, 1);
        const op = Easing.easeOutCubic(fadeIn) * fadeOut;
        if (op <= 0.001) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', bottom: 60,
            transform: `translateX(-50%) translateY(${(1 - fadeIn) * 8}px)`,
            opacity: op,
            fontFamily: FONTS.sans,
            fontSize: 22, fontWeight: 500,
            color: COLORS.inkSoft,
            letterSpacing: '-0.01em',
            textAlign: 'center',
          }}>
            {c.text}
          </div>
        );
      })}
    </>
  );
}

Object.assign(window, { SceneRules });
