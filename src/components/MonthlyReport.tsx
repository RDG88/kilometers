import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { InvoiceSettings, KilometerEntry } from '../types';
import { formatDisplayDate, formatMonthLabel } from '../utils/date';
import { downloadMonthlyPdf } from '../utils/pdf';
import { resolveInvoiceNumber } from '../utils/invoice';

type Props = {
  monthKey: string;
  entries: KilometerEntry[];
  onDelete: (id: string) => void;
  settings: InvoiceSettings;
};

function formatInvoiceDate(value: string) {
  try {
    return format(new Date(value), 'dd-MM-yyyy');
  } catch {
    return value;
  }
}

export function MonthlyReport({ monthKey, entries, onDelete, settings }: Props) {
  const total = entries.reduce((acc, entry) => acc + entry.distance, 0);
  const subtotal = total * settings.ratePerKm;
  const vatAmount = subtotal * (settings.vatPercentage / 100);
  const totalInclVat = subtotal + vatAmount;
  const formatCurrency = (value: number) => `${settings.currencySymbol}\u00A0${value
    .toFixed(2)
    .replace('.', ',')}`;
  const formatQuantity = (value: number) => value.toFixed(2).replace('.', ',');
  const formatVat = `${settings.vatPercentage.toFixed(1).replace('.', ',')}%`;
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => entries.some((entry) => entry.id === id)));
  }, [entries]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) =>
      sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );
  }, [entries, sortOrder]);

  const allSelected = useMemo(() => entries.length > 0 && selectedIds.length === entries.length, [entries.length, selectedIds.length]);
  const invoiceNumber = resolveInvoiceNumber(settings, monthKey);

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map((entry) => entry.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => onDelete(id));
    setSelectedIds([]);
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (!entries.length) {
    return (
      <div className="card">
        <h2>{formatMonthLabel(monthKey)}</h2>
        <p>Er zijn nog geen ritten opgeslagen voor deze maand.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="action-group">
          <button type="button" className="secondary" onClick={toggleAll}>
            {allSelected ? 'Deselecteer alles' : 'Selecteer alles'}
          </button>
          <button type="button" className="secondary" onClick={handleDeleteSelected} disabled={!selectedIds.length}>
            Verwijder selectie
          </button>
        </div>
        <button type="button" onClick={() => downloadMonthlyPdf(sortedEntries, monthKey, settings)}>
          PDF downloaden
        </button>
      </div>

      <div className="invoice-meta">
        <div>
          <span className="label">Factuurdatum</span>
          <strong>{formatInvoiceDate(settings.invoiceDate)}</strong>
        </div>
        <div>
          <span className="label">Factuurnummer</span>
          <strong>{invoiceNumber}</strong>
        </div>
        <div>
          <span className="label">Bedrijfsnaam</span>
          <strong>{settings.companyName || '—'}</strong>
        </div>
        <div>
          <span className="label">Kenteken</span>
          <strong>{settings.licensePlate || '—'}</strong>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Selecteer alle ritten"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th
                className="sortable"
                aria-sort={sortOrder === 'asc' ? 'ascending' : 'descending'}
              >
                <button type="button" onClick={handleToggleSort}>
                  Datum
                  <span aria-hidden="true">{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                </button>
              </th>
              <th>Beschrijving rit</th>
              <th>Aantal</th>
              <th>Eenheid</th>
              <th>Tarief</th>
              <th>Totaal (excl. btw)</th>
              <th>Btw %</th>
              <th>Notities</th>
              <th aria-label="Acties" />
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Selecteer rit op ${formatDisplayDate(entry.date)}`}
                    checked={selectedIds.includes(entry.id)}
                    onChange={() => toggleId(entry.id)}
                  />
                </td>
                <td>{formatDisplayDate(entry.date)}</td>
                <td>{entry.title}</td>
                <td>{formatQuantity(entry.distance)}</td>
                <td>km</td>
                <td>{formatCurrency(settings.ratePerKm)}</td>
                <td>{formatCurrency(entry.distance * settings.ratePerKm)}</td>
                <td>{formatVat}</td>
                <td className="notes-cell">{entry.notes ?? '—'}</td>
                <td>
                  <button className="link" type="button" onClick={() => onDelete(entry.id)}>
                    Verwijderen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-summary">
        <div>
          <span>Bedrag (excl. btw)</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>Btw</span>
          <strong>{formatCurrency(vatAmount)}</strong>
        </div>
        <div className="highlight">
          <span>Totaalbedrag incl. btw</span>
          <strong>{formatCurrency(totalInclVat)}</strong>
        </div>
      </div>

      <div className="month-summary">
        <span className="month-summary__label">{formatMonthLabel(monthKey)}</span>
        <span className="month-summary__total">{formatQuantity(total)} km totaal</span>
      </div>
    </div>
  );
}
