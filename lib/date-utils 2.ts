import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";

// 한국 시간대 오프셋 (UTC+9)
const KST_OFFSET = 9 * 60;

export function getKoreanTime(date: Date | string): Date {
  const utcDate = new Date(date);
  return new Date(utcDate.getTime() + KST_OFFSET * 60000);
}

export function getKoreanStartOfDay(date: Date = new Date()): Date {
  const koreaDate = getKoreanTime(date);
  return new Date(
    koreaDate.getFullYear(),
    koreaDate.getMonth(),
    koreaDate.getDate(),
    0,
    0,
    0
  );
}

export function getKoreanEndOfDay(date: Date = new Date()): Date {
  const koreaDate = getKoreanTime(date);
  return new Date(
    koreaDate.getFullYear(),
    koreaDate.getMonth(),
    koreaDate.getDate(),
    23,
    59,
    59
  );
}

export function formatKoreanTime(
  date: Date | string,
  formatStr: string = "HH:mm"
): string {
  return format(getKoreanTime(date), formatStr, { locale: ko });
}
