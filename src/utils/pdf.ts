import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { InvoiceSettings, KilometerEntry } from '../types';
import { formatDisplayDate, formatMonthLabel } from './date';
import { resolveInvoiceNumber } from './invoice';

function formatInvoiceDate(value: string) {
  try {
    return format(new Date(value), 'dd-MM-yyyy');
  } catch {
    return value;
  }
}

export function downloadMonthlyPdf(entries: KilometerEntry[], monthKey: string, settings: InvoiceSettings) {
  if (!entries.length) {
    return;
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginX = 16;
  let cursorY = 18;

  const formatCurrencyValue = (value: number) =>
    `${settings.currencySymbol}\u00A0${value.toFixed(2).replace('.', ',')}`;
  const formatVatValue = `${settings.vatPercentage.toFixed(1).replace('.', ',')}%`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(31, 58, 147);
  doc.text('Kilometerregistratie', marginX, cursorY);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 70);
  cursorY += 8;
  doc.text(`Specificatie: ${formatMonthLabel(monthKey)}`, marginX, cursorY);

  const totalDistance = entries.reduce((acc, entry) => acc + entry.distance, 0);
  const subtotal = totalDistance * settings.ratePerKm;
  const vatAmount = subtotal * (settings.vatPercentage / 100);
  const totalInclVat = subtotal + vatAmount;

  cursorY += 6;

  const metaLeftX = marginX;
  const metaRightX = 110;
  const lineHeight = 6;

  doc.setFontSize(10);
  doc.setTextColor(84, 99, 110);
  doc.text('Factuurdatum', metaLeftX, cursorY);
  doc.text('Factuurnummer', metaLeftX, cursorY + lineHeight);
  doc.text('Bedrijfsnaam', metaLeftX, cursorY + lineHeight * 2);
  doc.text('Kenteken', metaLeftX, cursorY + lineHeight * 3);

  doc.text('Tarief per km', metaRightX, cursorY);
  doc.text('Totaal aantal km', metaRightX, cursorY + lineHeight);
  doc.text('Btw %', metaRightX, cursorY + lineHeight * 2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatInvoiceDate(settings.invoiceDate), metaLeftX + 35, cursorY);
  doc.text(resolveInvoiceNumber(settings, monthKey), metaLeftX + 35, cursorY + lineHeight);
  doc.text(settings.companyName || '—', metaLeftX + 35, cursorY + lineHeight * 2);
  doc.text(settings.licensePlate || '—', metaLeftX + 35, cursorY + lineHeight * 3);

  const rateLabel = formatCurrencyValue(settings.ratePerKm);
  doc.text(rateLabel, metaRightX + 30, cursorY);
  doc.text(totalDistance.toFixed(2).replace('.', ','), metaRightX + 30, cursorY + lineHeight);
  doc.text(formatVatValue, metaRightX + 30, cursorY + lineHeight * 2);

  cursorY += lineHeight * 4 + 4;

  autoTable(doc, {
    startY: cursorY,
    head: [['Datum', 'Beschrijving rit', 'Aantal', 'Eenheid', 'Tarief', 'Totaal (excl. btw)', 'Btw %', 'Notities']],
    body: entries.map((entry) => [
      formatDisplayDate(entry.date),
      entry.title,
      entry.distance.toFixed(2).replace('.', ','),
      'km',
      rateLabel,
      formatCurrencyValue(entry.distance * settings.ratePerKm),
      formatVatValue,
      entry.notes ?? '',
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [51, 86, 156],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  const summaryStartY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  const summaryX = 120;
  doc.text(`Bedrag (excl. btw): ${formatCurrencyValue(subtotal)}`, summaryX, summaryStartY);
  doc.text(`Btw: ${formatCurrencyValue(vatAmount)}`, summaryX, summaryStartY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 122, 224);
  doc.text(`Totaalbedrag incl. btw: ${formatCurrencyValue(totalInclVat)}`, summaryX, summaryStartY + 14);

  const fileName = `kilometers-${monthKey}-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`;
  doc.save(fileName);
}
