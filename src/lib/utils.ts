import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export function calculateEtsyFees(price: number, quantity: number = 1): {
  listingFee: number;
  transactionFee: number;
  processingFee: number;
  totalFees: number;
} {
  const subtotal = price * quantity;
  const listingFee = 0.2 * quantity; // $0.20 per listing
  const transactionFee = subtotal * 0.065; // 6.5% transaction fee
  const processingFee = subtotal * 0.03 + 0.25; // 3% + $0.25 payment processing

  return {
    listingFee,
    transactionFee,
    processingFee,
    totalFees: listingFee + transactionFee + processingFee,
  };
}

export function calculateNetRevenue(
  price: number,
  quantity: number,
  shippingCollected: number = 0,
  cost: number = 0
): {
  grossRevenue: number;
  fees: ReturnType<typeof calculateEtsyFees>;
  netRevenue: number;
  profit: number;
  margin: number;
} {
  const grossRevenue = price * quantity + shippingCollected;
  const fees = calculateEtsyFees(price, quantity);
  const netRevenue = grossRevenue - fees.totalFees;
  const profit = netRevenue - cost;
  const margin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;

  return {
    grossRevenue,
    fees,
    netRevenue,
    profit,
    margin,
  };
}

export function getDateRange(period: "7d" | "30d" | "90d" | "1y"): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "7d":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(endDate.getDate() - 90);
      break;
    case "1y":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
