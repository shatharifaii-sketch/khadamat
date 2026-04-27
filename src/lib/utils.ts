import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaYoutube,
  FaLinkedin,
  FaTiktok
} from "react-icons/fa6";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateString(str, num) {
    if (str.length > num) {
        return str.slice(0, num) + "...";
    } else {
        return str;
    }
}

export function generateRandomPrefix(length: number = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
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
    icon: FaInstagram
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: FaFacebook
  },
  {
    value: "x",
    label: "X",
    icon: FaXTwitter
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: FaYoutube
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedin
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: FaTiktok
  }
];