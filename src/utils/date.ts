import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export function makeMonthKey(date: Date | string) {
  const value = typeof date === 'string' ? parseISO(date) : date;
  return format(value, 'yyyy-MM');
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) {
    return monthKey;
  }

  const parsed = new Date(year, month - 1, 1);
  return format(parsed, 'LLLL yyyy', { locale: nl });
}

export function formatDisplayDate(isoDate: string) {
  const parsed = parseISO(isoDate);
  return format(parsed, 'dd-MM-yyyy');
}
