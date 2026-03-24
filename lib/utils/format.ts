import { format, parseISO } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function formatIndianNumber(num: number): string {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const [intPart, decPart] = absNum.toFixed(2).split(".");

  let result = "";
  const len = intPart.length;

  if (len <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + "," + result;
    }
  }

  const formatted =
    decPart && decPart !== "00" ? `${result}.${decPart}` : result;
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCurrency(amount: number): string {
  return `₹${formatIndianNumber(amount)}`;
}

export function formatDate(date: Timestamp | Date | string): string {
  const d =
    date instanceof Timestamp
      ? date.toDate()
      : typeof date === "string"
        ? parseISO(date)
        : date;
  return format(d, "dd MMMM yyyy");
}

export function formatMonthYear(date: Timestamp | Date): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, "MMMM yyyy");
}

export function getMonthKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
