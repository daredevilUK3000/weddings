import { createServiceClient } from "@/lib/supabase/service";
import type { SignatureType } from "@/lib/types/database";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const {
    signatureType,
    signatureData,
    consent,
  }: { signatureType?: string; signatureData?: string; consent?: boolean } = await req.json();

  if (signatureType !== "drawn" && signatureType !== "typed") {
    return Response.json({ error: "Invalid signature type" }, { status: 400 });
  }
  if (typeof signatureData !== "string" || !signatureData.trim()) {
    return Response.json({ error: "Signature is required" }, { status: 400 });
  }
  if (consent !== true) {
    return Response.json({ error: "Consent is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: witness } = await supabase
    .from("witnesses")
    .select("id, can_sign_certificate")
    .eq("invite_token", token)
    .single();
  if (!witness) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (!witness.can_sign_certificate) {
    return Response.json({ error: "Not permitted to sign" }, { status: 403 });
  }

  const { error } = await supabase.from("witness_signatures").insert({
    witness_id: witness.id,
    signature_type: signatureType as SignatureType,
    signature_data: signatureData,
    consent: true,
  });
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
