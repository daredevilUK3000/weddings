import type { WitnessAttendanceType } from "@/lib/types/database";

// Per the sharing correction (amends brief §6.2/§9.3): sharing is derived
// from attendance type, not a manual per-item checklist. Date/time/location
// are always shown to every witness (baseline, not modeled as a flag here).
// The only manual override is `vows` — everything else below is fixed by
// attendance type. Budget, vendor details, private notes, and Clara
// conversation history are never shared, under any attendance type — that
// exclusion has no flag because it's not configurable.

export interface SharedContentFlags {
  livestreamLink: boolean;
  ceremonyStory: boolean;
  programme: boolean;
  certificate: boolean;
  vows: boolean;
}

const ATTENDANCE_DEFAULTS: Record<WitnessAttendanceType, Omit<SharedContentFlags, "vows">> = {
  in_person: {
    livestreamLink: false,
    ceremonyStory: false,
    programme: false,
    certificate: false,
  },
  online: {
    livestreamLink: true,
    ceremonyStory: false,
    programme: false,
    certificate: false,
  },
  remote_contribution: {
    livestreamLink: false,
    ceremonyStory: true,
    programme: false,
    certificate: false,
  },
  witnessing_afterward: {
    livestreamLink: false,
    ceremonyStory: false,
    programme: true,
    certificate: true,
  },
};

export function computeSharedContent(
  attendanceType: WitnessAttendanceType,
  canSignCertificate: boolean,
  shareVowsOverride: boolean,
): SharedContentFlags {
  const defaults = ATTENDANCE_DEFAULTS[attendanceType];
  return {
    ...defaults,
    // Signing requires seeing what you're signing, regardless of attendance type.
    certificate: defaults.certificate || canSignCertificate,
    vows: shareVowsOverride,
  };
}

const ATTENDANCE_ROLE_COPY: Record<WitnessAttendanceType, string> = {
  in_person: "attending in person",
  online: "joining you live online",
  remote_contribution: "contributing remotely",
  witnessing_afterward: "witnessing afterward",
};

// Owner-facing summary of what a witness will see, replacing the flat
// "what witnesses can see" checklist framing per the correction's UI note.
export function describeWitnessSharing(
  firstName: string,
  attendanceType: WitnessAttendanceType,
  flags: SharedContentFlags,
): string {
  const extras: string[] = [];
  if (flags.livestreamLink) extras.push("the livestream link");
  if (flags.ceremonyStory) extras.push("your ceremony story");
  if (flags.programme) extras.push("the programme");
  if (flags.certificate) extras.push("the certificate");
  if (flags.vows) extras.push("your vows");

  const base = `${firstName} is ${ATTENDANCE_ROLE_COPY[attendanceType]} — they'll see your date, time, and location`;
  if (extras.length === 0) return `${base}.`;
  return `${base}, plus ${extras.join(", ")}.`;
}
