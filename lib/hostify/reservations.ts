import "server-only";

import { hostify, HOSTIFY_AVAILABLE, HostifyError } from "./client";
import { getHomeBySlug } from "@/lib/data/server";
import { homeHostifyPrimaryId } from "@/lib/data";
import { egpToUsd } from "@/lib/fx/rates";

export type ReservationOutcome =
  | {
      ok: true;
      reservationId: number;
      confirmationCode: string;
    }
  | {
      ok: false;
      error: string;
    };

export type CreateReservationInput = {
  homeSlug: string;
  checkIn: string;             // YYYY-MM-DD
  checkOut: string;            // YYYY-MM-DD
  guests: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    specialRequests?: string;
  };
  /** EGP — converted server-side to USD via live FX. */
  totalEGP: number;
  /** Booking status. "accepted" once payment is collected; "pending" otherwise. */
  status?: "accepted" | "pending";
  /** Free-form note appended after the standard tag. */
  noteSuffix?: string;
};

/**
 * Create a Hostify reservation from a Travelholic-side booking record.
 * Centralised so both the legacy /api/booking route and the post-payment
 * webhook share one implementation.
 */
export async function createHostifyReservation(
  input: CreateReservationInput,
): Promise<ReservationOutcome> {
  if (!HOSTIFY_AVAILABLE()) {
    return { ok: false, error: "hostify-not-configured" };
  }

  try {
    const home = await getHomeBySlug(input.homeSlug);
    const listingId = home ? homeHostifyPrimaryId(home) : undefined;
    if (!home || !listingId) {
      return { ok: false, error: "no-hostify-listing" };
    }

    const totalUsd = await egpToUsd(input.totalEGP);
    const fullName = `${input.guest.firstName} ${input.guest.lastName}`.trim();
    const baseNote = `Booked direct via Travelholic website. Country: ${input.guest.country}.`;
    const note = [
      (input.guest.specialRequests || "").trim(),
      input.noteSuffix?.trim(),
      baseNote,
    ]
      .filter(Boolean)
      .join("\n\n");

    const res = await hostify.createReservation({
      listingId,
      startDate: input.checkIn,
      endDate: input.checkOut,
      guests: input.guests,
      name: fullName,
      email: input.guest.email,
      phone: input.guest.phone,
      totalPrice: totalUsd,
      note,
      source: "Travelholic Direct",
      status: input.status ?? "pending",
    });

    if (res.success && res.reservation) {
      return {
        ok: true,
        reservationId: res.reservation.id,
        confirmationCode: res.reservation.confirmation_code ?? "",
      };
    }
    return { ok: false, error: res.error || res.message || "hostify-rejected" };
  } catch (err) {
    if (err instanceof HostifyError) {
      return { ok: false, error: `hostify-${err.status}` };
    }
    return { ok: false, error: "hostify-error" };
  }
}
