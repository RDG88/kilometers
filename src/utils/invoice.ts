import { format, parseISO } from 'date-fns';
import { InvoiceSettings } from '../types';
import { formatMonthLabel } from './date';

export function resolveInvoiceNumber(settings: InvoiceSettings, monthKey: string) {
  const custom = settings.invoiceNumber?.trim();
  if (custom) {
    return custom;
  }

  const dateSource = settings.invoiceDate ? settings.invoiceDate : `${monthKey}-01`;

  try {
    const parsed = parseISO(dateSource);
    if (!Number.isNaN(parsed.getTime())) {
      return format(parsed, 'yyyyMMdd');
    }
  } catch (error) {
    // fall through to month label fallback
  }

  return formatMonthLabel(monthKey);
}
