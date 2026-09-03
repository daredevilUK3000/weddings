import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Page,
  Text,
  View,
  Svg,
  Path,
  Circle,
  Image,
  StyleSheet,
  Font,
  renderToStream,
} from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import type { Vibe } from "@/lib/types/database";
import { LEAF_PATH, SPRIG_STEMS, SPRIG_LEAVES, SPRIG_DOTS } from "@/lib/cert-sprig";

// WeddingsForOne design tokens (kept in sync with src/app/globals.css).
const INK = "#20201D";
const IVORY = "#F7F3EC";
const WINE = "#513A3A";
const CHAMPAGNE = "#C8AD82";
const INK_SOFT = "#6B6259";

const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "Cormorant Garamond",
  fonts: [
    { src: path.join(fontsDir, "CormorantGaramond-Regular.ttf") },
    { src: path.join(fontsDir, "CormorantGaramond-Medium.ttf"), fontWeight: 500 },
    { src: path.join(fontsDir, "CormorantGaramond-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(fontsDir, "CormorantGaramond-Italic.ttf"), fontStyle: "italic" },
  ],
});
Font.register({
  family: "Mrs Saint Delafield",
  src: path.join(fontsDir, "MrsSaintDelafield-Regular.ttf"),
});

// react-pdf's <Image> always resolves src via fetch(), which doesn't accept
// local filesystem paths — embed the seal as a data URI instead.
const sealDataUri = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public", "brand", "seal.png"))
  .toString("base64")}`;

const styles = StyleSheet.create({
  page: {
    backgroundColor: IVORY,
    padding: 28,
    fontFamily: "Cormorant Garamond",
    justifyContent: "center",
  },
  frameOuter: {
    borderWidth: 1.1,
    borderColor: CHAMPAGNE,
    padding: 6,
  },
  frameInner: {
    borderWidth: 0.6,
    borderColor: CHAMPAGNE,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 44,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  seal: { width: 48, height: 51, marginBottom: 6 },
  brandLine: {
    fontSize: 11,
    letterSpacing: 3,
    color: INK,
    marginBottom: 14,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  ruleLine: { width: 46, height: 0.75, backgroundColor: CHAMPAGNE },
  certTitle: {
    fontSize: 36,
    fontWeight: 600,
    color: CHAMPAGNE,
    letterSpacing: 6,
  },
  certSubtitle: {
    fontSize: 13,
    letterSpacing: 4,
    color: INK,
    marginTop: 8,
  },
  certifiesThat: {
    fontSize: 11,
    letterSpacing: 3,
    color: INK_SOFT,
  },
  name: {
    fontFamily: "Mrs Saint Delafield",
    fontSize: 44,
    color: CHAMPAGNE,
    marginTop: 2,
    textAlign: "center",
  },
  bodyLine: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: INK,
    textAlign: "center",
    lineHeight: 1.45,
  },
  vowLine: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 15,
    color: CHAMPAGNE,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 380,
  },
  committedLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: INK_SOFT,
  },
  dateScript: {
    fontFamily: "Mrs Saint Delafield",
    fontSize: 20,
    color: INK,
    marginTop: 0,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    marginTop: 4,
  },
  sigBlock: { alignItems: "center", width: "34%" },
  sigScript: {
    fontFamily: "Mrs Saint Delafield",
    fontSize: 16,
    color: INK_SOFT,
  },
  sigLine: {
    borderBottomWidth: 0.6,
    borderBottomColor: CHAMPAGNE,
    width: "100%",
    marginTop: 6,
    marginBottom: 6,
  },
  sigLabel: { fontSize: 8, letterSpacing: 2, color: INK_SOFT },
  footerTagline: {
    fontSize: 9,
    letterSpacing: 2,
    color: INK_SOFT,
    marginTop: 14,
  },
});

type CornerPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

function Corner({ at }: { at: CornerPosition }) {
  const position =
    at === "topLeft"
      ? { top: 8, left: 8 }
      : at === "topRight"
        ? { top: 8, right: 8 }
        : at === "bottomLeft"
          ? { bottom: 8, left: 8 }
          : { bottom: 8, right: 8 };

  const mirrorX = at === "topRight" || at === "bottomRight";
  const mirrorY = at === "bottomLeft" || at === "bottomRight";
  const scaleOps = [mirrorX ? "scaleX(-1)" : "", mirrorY ? "scaleY(-1)" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      style={{ position: "absolute", ...position, transform: scaleOps || undefined }}
    >
      {SPRIG_STEMS.map((d) => (
        <Path key={d} d={d} stroke={CHAMPAGNE} strokeWidth={0.6} fill="none" />
      ))}
      {SPRIG_LEAVES.map((leaf, i) => (
        <Path
          key={i}
          d={LEAF_PATH}
          fill={CHAMPAGNE}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
        />
      ))}
      {SPRIG_DOTS.map((dot, i) => (
        <Circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill={CHAMPAGNE} />
      ))}
    </Svg>
  );
}

function Rule() {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleLine} />
      <Svg width={8} height={8} style={{ marginHorizontal: 8 }}>
        <Path d="M4,0 L8,4 L4,8 L0,4 Z" fill={CHAMPAGNE} />
      </Svg>
      <View style={styles.ruleLine} />
    </View>
  );
}

function formatCeremonyDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDate();
  const suffix =
    dayNum % 10 === 1 && dayNum !== 11
      ? "st"
      : dayNum % 10 === 2 && dayNum !== 12
        ? "nd"
        : dayNum % 10 === 3 && dayNum !== 13
          ? "rd"
          : "th";
  const monthName = date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return `the ${dayNum}${suffix} of ${monthName}`;
}

interface CertificateProps {
  name: string;
  date: string | null;
  vowSummary: string;
  vibe: Vibe;
}

function Certificate({ name, date, vowSummary }: CertificateProps) {
  // The certificate holds one short, quotable line — not a full vow paragraph.
  const displaySummary =
    vowSummary.length > 160 ? `${vowSummary.slice(0, 157).trimEnd()}…` : vowSummary;
  const displayDate = date ? formatCeremonyDate(date) : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frameOuter}>
          <View style={styles.frameInner}>
            <Corner at="topLeft" />
            <Corner at="topRight" />
            <Corner at="bottomLeft" />
            <Corner at="bottomRight" />

            <Image src={sealDataUri} style={styles.seal} />
            <Text style={styles.brandLine}>WEDDINGS FOR ONE</Text>

            <Text style={styles.certTitle}>CERTIFICATE</Text>
            <Text style={styles.certSubtitle}>OF SELF-COMMITMENT</Text>

            <Rule />

            <Text style={styles.certifiesThat}>THIS CERTIFIES THAT</Text>
            <Text style={styles.name}>{name}</Text>

            <Rule />

            <View style={{ alignItems: "center" }}>
              <Text style={styles.bodyLine}>HAS CHOSEN THEMSELF.</Text>
              <Text style={styles.bodyLine}>HAS HONOURED THEIR JOURNEY.</Text>
              <Text style={styles.bodyLine}>AND HAS MADE A SACRED COMMITMENT TO</Text>
              <Text style={styles.vowLine}>&ldquo;{displaySummary}&rdquo;</Text>
            </View>

            {displayDate ? (
              <>
                <Rule />
                <Text style={styles.committedLabel}>COMMITTED TO THEMSELF ON</Text>
                <Text style={styles.dateScript}>{displayDate}</Text>
              </>
            ) : null}

            <Rule />

            <View style={styles.sigRow}>
              <View style={styles.sigBlock}>
                <Text style={styles.sigScript}>The Officiant</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>YOUR OFFICIANT</Text>
              </View>
              <View style={styles.sigBlock}>
                <Text style={styles.sigScript}>The Witness</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>YOU</Text>
              </View>
            </View>

            <Text style={styles.footerTagline}>
              THIS IS YOUR DAY.   THIS IS YOUR VOW.   THIS IS YOUR LIFE.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ceremonyId = searchParams.get("ceremonyId");
  if (!ceremonyId) {
    return Response.json({ error: "ceremonyId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: ceremony } = await supabase
    .from("ceremonies")
    .select("vibe, date, vows, user_id")
    .eq("id", ceremonyId)
    .eq("user_id", user.id)
    .single();

  if (!ceremony) {
    return Response.json({ error: "Ceremony not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();

  const vowSummary = ceremony.vows
    ? ceremony.vows.split("\n\n---\n\n")[0]
    : "I commit to honoring, choosing, and celebrating myself.";

  const stream = await renderToStream(
    <Certificate
      name={profile?.name ?? profile?.email ?? "Celebrant"}
      date={ceremony.date}
      vowSummary={vowSummary}
      vibe={ceremony.vibe}
    />,
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=certificate-of-self-commitment.pdf",
    },
  });
}
