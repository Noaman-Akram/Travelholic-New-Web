import { differenceInCalendarDays } from "date-fns";

export type BookingPricingInput = {
  checkIn: Date;
  checkOut: Date;
  nightlyEGP: number;
  weeklyDiscountPct: number;
  monthlyDiscountPct: number;
  cleaningFeeEGP: number;
  otaPriceEGP?: number;
};

export type BookingPricingResult = {
  nights: number;
  subtotalEGP: number;
  discountEGP: number;
  cleaningFeeEGP: number;
  totalEGP: number;
  appliedDiscountKind: "none" | "weekly" | "monthly";
  savingsVsOtaEGP: number | null;
};

export function calcBookingPricing(
  input: BookingPricingInput,
): BookingPricingResult {
  const nights = Math.max(
    0,
    differenceInCalendarDays(input.checkOut, input.checkIn),
  );
  const subtotal = nights * input.nightlyEGP;

  let discount = 0;
  let kind: BookingPricingResult["appliedDiscountKind"] = "none";
  if (nights >= 30 && input.monthlyDiscountPct > 0) {
    discount = subtotal * (input.monthlyDiscountPct / 100);
    kind = "monthly";
  } else if (nights >= 7 && input.weeklyDiscountPct > 0) {
    discount = subtotal * (input.weeklyDiscountPct / 100);
    kind = "weekly";
  }

  const total = subtotal - discount + input.cleaningFeeEGP;

  const savings =
    input.otaPriceEGP && nights > 0
      ? Math.max(0, (input.otaPriceEGP - input.nightlyEGP) * nights)
      : null;

  return {
    nights,
    subtotalEGP: Math.round(subtotal),
    discountEGP: Math.round(discount),
    cleaningFeeEGP: input.cleaningFeeEGP,
    totalEGP: Math.round(total),
    appliedDiscountKind: kind,
    savingsVsOtaEGP: savings === null ? null : Math.round(savings),
  };
}
