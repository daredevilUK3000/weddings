import { Document, Page, Text, View, StyleSheet, renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import type { Vibe } from "@/lib/types/database";

// WeddingsForOne design tokens (kept in sync with src/app/globals.css).
const INK = "#20201D";
const IVORY = "#F7F3EC";
const WINE = "#513A3A";
const CHAMPAGNE = "#C8AD82";
const INK_SOFT = "#6B6259";

const styles = StyleSheet.create({
  page: {
    backgroundColor: INK,
    padding: 40,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: CHAMPAGNE,
    backgroundColor: IVORY,
    padding: 48,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  monogram: {
    fontFamily: "Times-Roman",
    fontSize: 13,
    letterSpacing: 4,
    color: CHAMPAGNE,
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: "Helvetica",
    fontSize: 11,
    letterSpacing: 3,
    color: WINE,
    marginBottom: 20,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Times-Italic",
    fontSize: 16,
    color: INK_SOFT,
    marginBottom: 18,
    textAlign: "center",
  },
  name: {
    fontFamily: "Times-Bold",
    fontSize: 34,
    color: INK,
    marginBottom: 18,
    textAlign: "center",
  },
  divider: {
    width: 90,
    height: 1,
    backgroundColor: CHAMPAGNE,
    marginBottom: 22,
  },
  vowSummary: {
    fontFamily: "Times-Italic",
    fontSize: 13,
    color: INK,
    lineHeight: 1.6,
    marginBottom: 28,
    textAlign: "center",
    maxWidth: 420,
  },
  date: {
    fontFamily: "Times-Roman",
    fontSize: 12,
    color: WINE,
    marginBottom: 36,
  },
  signatureRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginTop: 20,
  },
  signatureBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "40%",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: CHAMPAGNE,
    width: "100%",
    marginBottom: 6,
    height: 24,
  },
  signatureLabel: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: INK_SOFT,
  },
});

interface CertificateProps {
  name: string;
  date: string | null;
  vowSummary: string;
  vibe: Vibe;
}

function Certificate({ name, date, vowSummary }: CertificateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.monogram}>W · ONE</Text>
          <Text style={styles.eyebrow}>Certificate of Self-Commitment</Text>
          <Text style={styles.title}>This certifies that</Text>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.divider} />
          <Text style={styles.vowSummary}>{vowSummary}</Text>
          {date ? <Text style={styles.date}>committed to themself on {date}</Text> : null}
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Celebrant</Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Witness</Text>
            </View>
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
