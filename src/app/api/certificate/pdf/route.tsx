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
import { formatCeremonyDate } from "@/lib/format-ceremony-date";

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
    padding: 16,
    fontFamily: "Cormorant Garamond",
    justifyContent: "center",
  },
  frameOuter: {
    borderWidth: 1.6,
    borderColor: CHAMPAGNE,
    padding: 5,
  },
  frameInner: {
    borderWidth: 0.9,
    borderColor: CHAMPAGNE,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 30,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  seal: { width: 72, height: 76, marginBottom: 10 },
  brandLine: {
    fontSize: 14,
    letterSpacing: 3.5,
    color: INK,
    marginBottom: 16,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 7,
  },
  ruleLine: { width: 60, height: 0.9, backgroundColor: CHAMPAGNE },
  certTitle: {
    fontSize: 52,
    fontWeight: 600,
    color: CHAMPAGNE,
    letterSpacing: 8,
  },
  certSubtitle: {
    fontSize: 16,
    letterSpacing: 4.5,
    color: INK,
    marginTop: 10,
  },
  certifiesThat: {
    fontSize: 13,
    letterSpacing: 3.5,
    color: INK_SOFT,
  },
  name: {
    fontFamily: "Mrs Saint Delafield",
    fontSize: 62,
    color: CHAMPAGNE,
    marginTop: 4,
    textAlign: "center",
  },
  bodyLine: {
    fontSize: 14,
    letterSpacing: 1.6,
    color: INK,
    textAlign: "center",
    lineHeight: 1.5,
  },
  vowLine: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 18,
    color: CHAMPAGNE,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 420,
  },
  committedLabel: {
    fontSize: 12,
    letterSpacing: 3,
    color: INK_SOFT,
  },
  dateScript: {
    fontFamily: "Mrs Saint Delafield",
    fontSize: 28,
    color: INK,
    marginTop: 2,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "82%",
    marginTop: 6,
  },
  sigBlock: { alignItems: "center", width: "34%" },
  sigScript: {
    fontFamily: "Mrs Saint Delafield",
    fontSize: 21,
    color: INK_SOFT,
  },
  sigLine: {
    borderBottomWidth: 0.6,
    borderBottomColor: CHAMPAGNE,
    width: "100%",
    marginTop: 6,
    marginBottom: 6,
  },
  sigLabel: { fontSize: 9.5, letterSpacing: 2, color: INK_SOFT },
  footerTagline: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: INK_SOFT,
    marginTop: 10,
    textAlign: "center",
    width: "84%",
  },
});

type CornerPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

function Corner({ at }: { at: CornerPosition }) {
  const position =
    at === "topLeft"
      ? { top: 6, left: 6 }
      : at === "topRight"
        ? { top: 6, right: 6 }
        : at === "bottomLeft"
          ? { bottom: 6, left: 6 }
          : { bottom: 6, right: 6 };

  const mirrorX = at === "topRight" || at === "bottomRight";
  const mirrorY = at === "bottomLeft" || at === "bottomRight";
  const scaleOps = [mirrorX ? "scaleX(-1)" : "", mirrorY ? "scaleY(-1)" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Svg
      width={66}
      height={66}
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
