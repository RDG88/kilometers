import { useMemo, useState } from 'react';
import { EntryForm, EntryFormValues } from './components/EntryForm';
import { BulkEntryPlanner } from './components/BulkEntryPlanner';
import { InvoiceSettingsForm } from './components/InvoiceSettingsForm';
import { MonthSelector } from './components/MonthSelector';
import { MonthlyReport } from './components/MonthlyReport';
import { useLocalStorage } from './hooks/useLocalStorage';
import { InvoiceSettings, KilometerEntry } from './types';
import { makeMonthKey } from './utils/date';
import './App.css';
import { subMonths } from 'date-fns';

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

export default function App() {
  const [entries, setEntries] = useLocalStorage<KilometerEntry[]>('kilometer-entries', []);
  const [selectedMonth, setSelectedMonth] = useState(() => makeMonthKey(new Date()));
  const [invoiceSettings, setInvoiceSettings] = useLocalStorage<InvoiceSettings>('invoice-settings', {
    invoiceDate: new Date().toISOString().slice(0, 10),
    invoiceNumber: '',
    companyName: '',
    licensePlate: '',
    ratePerKm: 0.23,
    currencySymbol: '€',
    vatPercentage: 0,
  });

  const handleSettingsChange = (next: InvoiceSettings) => {
    setInvoiceSettings(next);
  };

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.date === b.date) {
          return b.id.localeCompare(a.id);
        }

        return a.date > b.date ? -1 : 1;
      }),
    [entries],
  );

  const availableMonths = useMemo(() => {
    const months = new Set(sortedEntries.map((entry) => makeMonthKey(entry.date)));
    const now = new Date();
    for (let offset = 0; offset < 18; offset += 1) {
      months.add(makeMonthKey(subMonths(now, offset)));
    }
    months.add(selectedMonth);
    return Array.from(months);
  }, [sortedEntries, selectedMonth]);

  const entriesForSelectedMonth = useMemo(
    () => sortedEntries.filter((entry) => makeMonthKey(entry.date) === selectedMonth),
    [sortedEntries, selectedMonth],
  );

  const lastDistance = useMemo(() => sortedEntries[0]?.distance, [sortedEntries]);

  const handleAdd = (values: EntryFormValues) => {
    const month = makeMonthKey(values.date);
    const next: KilometerEntry = {
      id: createId(),
      ...values,
    };

    setEntries((prev) => [...prev, next]);
    setSelectedMonth(month);
  };

  const handleBulkAdd = (bulkValues: EntryFormValues[]) => {
    if (!bulkValues.length) {
      return;
    }

    const entriesWithId = bulkValues.map((value) => ({
      id: createId(),
      ...value,
    }));

    setEntries((prev) => [...prev, ...entriesWithId]);
    setSelectedMonth(makeMonthKey(bulkValues[bulkValues.length - 1].date));
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>Kilometerregistratie</h1>
        <p className="muted">Houd je ritten bij en exporteer moeiteloos maandelijkse PDF-overzichten.</p>
      </header>

      <main className="main-content">
        <section className="planner-full" aria-label="Snelle maandplanning">
          <BulkEntryPlanner
            monthKey={selectedMonth}
            availableMonths={availableMonths}
            onChangeMonth={setSelectedMonth}
            onCreate={handleBulkAdd}
            suggestedDistance={lastDistance}
          />
        </section>

        <div className="layout secondary-layout" role="region" aria-label="Rit invoeren en factuurgegevens">
          <section className="column">
            <EntryForm onAdd={handleAdd} />
          </section>
          <section className="column invoice-column">
            <InvoiceSettingsForm settings={invoiceSettings} onChange={handleSettingsChange} />
          </section>
        </div>

        <section className="report-section">
          <MonthSelector availableMonths={availableMonths} selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
          <MonthlyReport
            monthKey={selectedMonth}
            entries={entriesForSelectedMonth}
            onDelete={handleDelete}
            settings={invoiceSettings}
          />
        </section>
      </main>
    </div>
  );
}
