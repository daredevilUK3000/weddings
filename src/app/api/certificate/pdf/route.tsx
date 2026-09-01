import { Document, Page, Text, View, StyleSheet, renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import type { Vibe } from "@/lib/types/database";

const VIBE_THEME: Record<Vibe, { accent: string; heading: string; bg: string }> = {
  spiritual: { accent: "#8a6d3b", heading: "#4a3b25", bg: "#fdf8ee" },
  glam: { accent: "#b8860b", heading: "#1a1a1a", bg: "#fffdf5" },
  minimalist: { accent: "#333333", heading: "#111111", bg: "#ffffff" },
  gothic_romantic: { accent: "#7a1f3d", heading: "#2a0a14", bg: "#f5eef0" },
  funny: { accent: "#e07a1f", heading: "#2a1a0a", bg: "#fffaf0" },
};

function buildStyles(theme: { accent: string; heading: string; bg: string }) {
  return StyleSheet.create({
    page: {
      backgroundColor: theme.bg,
      padding: 64,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    border: {
      borderWidth: 2,
      borderColor: theme.accent,
      padding: 40,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    eyebrow: {
      fontSize: 12,
      letterSpacing: 4,
      color: theme.accent,
      marginBottom: 16,
      textTransform: "uppercase",
    },
    title: {
      fontSize: 28,
      color: theme.heading,
      marginBottom: 24,
      textAlign: "center",
    },
    name: {
      fontSize: 22,
      color: theme.heading,
      marginBottom: 24,
      textAlign: "center",
    },
    vowSummary: {
      fontSize: 12,
      color: theme.heading,
      lineHeight: 1.6,
      marginBottom: 32,
      textAlign: "center",
      maxWidth: 420,
    },
    date: {
      fontSize: 12,
      color: theme.accent,
      marginBottom: 40,
    },
    signatureRow: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 24,
    },
    signatureBlock: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "40%",
    },
    signatureLine: {
      borderBottomWidth: 1,
      borderBottomColor: theme.heading,
      width: "100%",
      marginBottom: 6,
      height: 24,
    },
    signatureLabel: {
      fontSize: 9,
      color: theme.heading,
    },
  });
}

interface CertificateProps {
  name: string;
  date: string | null;
  vowSummary: string;
  vibe: Vibe;
}

function Certificate({ name, date, vowSummary, vibe }: CertificateProps) {
  const theme = VIBE_THEME[vibe];
  const styles = buildStyles(theme);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.eyebrow}>Certificate of Self-Commitment</Text>
          <Text style={styles.title}>This certifies that</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.vowSummary}>{vowSummary}</Text>
          {date ? <Text style={styles.date}>{date}</Text> : null}
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
