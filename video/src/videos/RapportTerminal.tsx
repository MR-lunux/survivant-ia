// Vidéo 1 — RAPPORT TERMINAL — Refactor BEAT-DRIVEN
// Tu lis le code en pensant en SECONDES. Chaque Beat a une durée en sec.
// Chaque animation a un delay en sec relatif au début du Beat.

import { AbsoluteFill, Audio, staticFile } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { BaseBg, Grain } from "../lib/components/Background";
import { ParticleBackground } from "../lib/components/ParticleBackground";
import { KickerSpin } from "../lib/components/KickerSpin";
import { TopBand, SafeArea } from "../lib/components/SafeArea";
import { HairlineCard, HairlineRule } from "../lib/components/Hairline";
import { Footer } from "../lib/components/Footer";
import {
  BeatStack,
  Beat,
  BeatSignature,
  BeatReveal,
  BeatSlamIn,
  BeatTypeOn,
  BeatCounter,
  BeatProgressBar,
} from "../lib/Beat";
import { RapportTerminalProps, colorFromToken } from "../lib/schemas";

const StatBlock: React.FC<{
  label: string;
  delaySec: number;        // quand le compteur démarre (relatif au Beat)
  durationSec: number;     // combien de temps pour atteindre la valeur
  value: number;
  color: string;
}> = ({ label, delaySec, durationSec, value, color }) => {
  return (
    <div style={{ fontFamily: FONTS.sans, textAlign: "left", width: "100%" }}>
      <div
        style={{
          fontFamily: FONTS.mono,
          color: COLORS.muted,
          fontSize: 26,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontSize: 280,
          fontWeight: 800,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
        }}
      >
        <BeatCounter delay={delaySec} durationSec={durationSec} value={value} />
        <span style={{ fontSize: 130, opacity: 0.6, marginLeft: 8 }}>%</span>
      </div>
    </div>
  );
};

const LeverCard: React.FC<{
  num: string;
  title: string;
  body: string;
}> = ({ num, title, body }) => {
  return (
    <HairlineCard padding="28px 32px">
      <div
        style={{
          fontFamily: FONTS.mono,
          color: COLORS.accent,
          fontSize: 22,
          letterSpacing: "0.2em",
          marginBottom: 10,
        }}
      >
        LEVIER {num}
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          color: COLORS.text,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: 12,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          color: COLORS.textSoft,
          fontSize: 26,
          lineHeight: 1.4,
          fontWeight: 400,
          whiteSpace: "pre-line",
        }}
      >
        {body}
      </div>
    </HairlineCard>
  );
};

export const RapportTerminal: React.FC<RapportTerminalProps> = (props) => {
  const stat1Color = colorFromToken(props.stat1Color);
  const stat2Color = colorFromToken(props.stat2Color);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Audio src={staticFile("audio/rapport-terminal.mp3")} />
      <BaseBg />
      <ParticleBackground />

      <TopBand>
        <KickerSpin label={props.kickerLabel} fontSize={22} />
      </TopBand>

      <BeatStack>
        {/* Beat 1 — Stat 1 (5s) */}
        <Beat duration={5}>
          <SafeArea align="start" justify="center">
            <BeatSlamIn delay={0.2}>
              <StatBlock
                label={props.stat1Label}
                delaySec={0.5}
                durationSec={1.7}
                value={props.stat1Value}
                color={stat1Color}
              />
            </BeatSlamIn>
            <div style={{ height: 30 }} />
            <BeatReveal delay={0.7} from="left" distance={60}>
              <BeatProgressBar
                delay={0.9}
                durationSec={1.7}
                targetProgress={props.stat1Value / 100}
                color={stat1Color}
                glowColor={stat1Color === COLORS.accent ? COLORS.accentGlow : undefined}
              />
            </BeatReveal>
          </SafeArea>
        </Beat>

        {/* Beat 2 — Stat 2 (5s) */}
        <Beat duration={5}>
          <SafeArea align="start" justify="center">
            <BeatSlamIn delay={0.2}>
              <StatBlock
                label={props.stat2Label}
                delaySec={0.5}
                durationSec={1.7}
                value={props.stat2Value}
                color={stat2Color}
              />
            </BeatSlamIn>
            <div style={{ height: 30 }} />
            <BeatReveal delay={0.7} from="left" distance={60}>
              <BeatProgressBar
                delay={0.9}
                durationSec={1.7}
                targetProgress={props.stat2Value / 100}
                color={stat2Color}
                glowColor={stat2Color === COLORS.accent ? COLORS.accentGlow : undefined}
              />
            </BeatReveal>
          </SafeArea>
        </Beat>

        {/* Beat 3 — Statement choc (5s) */}
        <Beat duration={5}>
          <SafeArea align="start" justify="center">
            <BeatReveal delay={0.2} from="bottom" distance={50}>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 80,
                  fontWeight: 800,
                  color: COLORS.text,
                  lineHeight: 1.0,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                }}
              >
                {props.statementLine1}
                <br />
                {props.statementLine2}
                <br />
                <span
                  style={{
                    color: props.statementLine3IsAccent
                      ? COLORS.accent
                      : COLORS.text,
                  }}
                >
                  {props.statementLine3}
                </span>
              </div>
            </BeatReveal>
            <div style={{ height: 50 }} />
            <BeatReveal delay={2.5} from="left" distance={20}>
              <HairlineRule />
            </BeatReveal>
            <div style={{ height: 30 }} />
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 30,
                color: COLORS.muted,
                letterSpacing: "0.05em",
              }}
            >
              <BeatTypeOn
                delay={2.7}
                text={props.statementCaption}
                charsPerFrame={1.6}
              />
            </div>
          </SafeArea>
        </Beat>

        {/* Beat 4 — Pivot (2.5s) */}
        <Beat duration={2.5}>
          <SafeArea align="start" justify="center">
            <BeatReveal delay={0.0} from="left" distance={30}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 24,
                  color: COLORS.accent,
                  letterSpacing: "0.2em",
                  marginBottom: 22,
                  textTransform: "uppercase",
                }}
              >
                {props.pivotKicker}
              </div>
            </BeatReveal>
            <BeatReveal delay={0.3} from="bottom" distance={40}>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 60,
                  fontWeight: 800,
                  color: COLORS.text,
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  whiteSpace: "pre-line",
                }}
              >
                {props.pivotDeclarative}
              </div>
            </BeatReveal>
            <div style={{ height: 8 }} />
            <BeatSignature
              delay={0.9}
              text={props.pivotSignature}
              fontSize={130}
            />
          </SafeArea>
        </Beat>

        {/* Beat 5 — 3 leviers (9s, ~3s par carte) */}
        <Beat duration={9}>
          <SafeArea align="start" justify="start" style={{ paddingTop: 30 }}>
            <BeatReveal delay={0.2} from="bottom" distance={40}>
              <LeverCard
                num="01"
                title={props.lever1Title}
                body={props.lever1Body}
              />
            </BeatReveal>
            <div style={{ height: 22 }} />
            <BeatReveal delay={2.7} from="bottom" distance={40}>
              <LeverCard
                num="02"
                title={props.lever2Title}
                body={props.lever2Body}
              />
            </BeatReveal>
            <div style={{ height: 22 }} />
            <BeatReveal delay={5.2} from="bottom" distance={40}>
              <LeverCard
                num="03"
                title={props.lever3Title}
                body={props.lever3Body}
              />
            </BeatReveal>
          </SafeArea>
        </Beat>

        {/* Beat 6 — Close (3.5s) */}
        <Beat duration={3.5}>
          <SafeArea align="start" justify="center">
            <BeatReveal delay={0.0} from="bottom" distance={20}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 26,
                  color: COLORS.muted,
                  marginBottom: 18,
                  letterSpacing: "0.1em",
                }}
              >
                {props.closePrefix}
              </div>
            </BeatReveal>
            <BeatSlamIn delay={0.4}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 64,
                  fontWeight: 700,
                  color: COLORS.accent,
                  letterSpacing: "-0.01em",
                  textShadow: `0 0 28px ${COLORS.accentGlow}`,
                }}
              >
                {props.closeUrl}
              </div>
            </BeatSlamIn>
            <div style={{ height: 22 }} />
            <BeatReveal delay={0.9} from="left" distance={20}>
              <HairlineRule width="40%" />
            </BeatReveal>
            <div style={{ height: 14 }} />
            <BeatReveal delay={1.2} from="bottom" distance={10}>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  color: COLORS.mutedSoft,
                  letterSpacing: "0.15em",
                }}
              >
                {props.closeFooter}
              </div>
            </BeatReveal>
          </SafeArea>
        </Beat>
      </BeatStack>

      <Footer domain={props.closeUrl} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  );
};
