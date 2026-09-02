import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaYoutube,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa6";
import parsePhoneNumberFromString from "libphonenumber-js";
import { ReservationList } from "@/contexts/ReservationsContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

export function generateRandomPrefix(length: number = 20) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export function handleFileName(fileName: string) {
  const randomPrefix = generateRandomPrefix();
  const newFileName = `${randomPrefix}${fileName}`;
  const filePath = `uploads/${newFileName}`;

  return { newFileName, filePath };
}

export const platforms = [
  {
    value: "instagram",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: FaFacebook,
  },
  {
    value: "x",
    label: "X",
    icon: FaXTwitter,
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: FaYoutube,
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin,
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: FaTiktok,
  },
];

export const isMobile = /Android|iphone/i.test(navigator.userAgent);

export const validateWhatsappPhone = (value: string) => {
  if (!value) {
    return {
      valid: false,
      message: "Phone number is required",
    };
  }
  const parsed = parsePhoneNumberFromString(value);

  if (!parsed) {
    return {
      valid: false,
      message: "Invalid phone number",
    };
  }

  if (!parsed.isValid()) {
    return {
      valid: false,
      message: "Invalid phone number",
    };
  }

  return {
    valid: true,
    formatted: parsed.number,
    country: parsed.country,
  };
};

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error("Invalid time");
  }

  return hours * 60 + minutes;
};

export function getReservationAvailability(reservations: ReservationList[]) {
  const pendingReservation = reservations.find(
    (res) => res.status === "pending"
  );

  if (pendingReservation) {
    return {
      canReserve: false,
      reason: "pending_reservation_exists",
      reservation: pendingReservation
    }
  }

  const latestAcceptedReservation = reservations.filter((reservation) => reservation.status === "accepted").sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

    return dateB.getTime() - dateA.getTime();
  })[0];

  if (latestAcceptedReservation) {
    const hasPassed = new Date(`${latestAcceptedReservation.date}T${latestAcceptedReservation.time}`) < new Date();

    if (!hasPassed) {
      return {
        canReserve: false,
        reason: "active_reservation",
        reservation: latestAcceptedReservation
      }
    }
  }

  return {
    canReseve: true,
    reason: null,
    reservation: null
  }
}
