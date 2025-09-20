import { useEffect, useMemo, useState } from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { nl } from 'date-fns/locale';
import { EntryFormValues } from './EntryForm';
import { MonthKey } from '../types';
import { formatMonthLabel } from '../utils/date';

const DATE_FORMAT = 'yyyy-MM-dd';

type Props = {
  monthKey: MonthKey;
  availableMonths: string[];
  onChangeMonth: (monthKey: MonthKey) => void;
  onCreate: (entries: EntryFormValues[]) => void;
  suggestedDistance?: number;
};

type DayOption = {
  iso: string;
  label: string;
  weekday: string;
  inMonth: boolean;
};

export function BulkEntryPlanner({ monthKey, availableMonths, onChangeMonth, onCreate, suggestedDistance }: Props) {
  const [title, setTitle] = useState('Kantoor');
  const [distance, setDistance] = useState(() => (suggestedDistance ?? 0).toString());
  const [notes, setNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    setSelectedDays([]);
  }, [monthKey]);

  useEffect(() => {
    if (suggestedDistance && Number(distance) === 0) {
      setDistance(suggestedDistance.toString());
    }
  }, [suggestedDistance, distance]);

  const daysInMonth = useMemo<DayOption[]>(() => {
    const [year, month] = monthKey.split('-').map(Number);
    if (!year || !month) {
      return [];
    }

    const firstDay = startOfMonth(new Date(year, month - 1, 1));
    const lastDay = endOfMonth(firstDay);
    const calendarStart = startOfWeek(firstDay, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(lastDay, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map((date) => ({
      iso: format(date, DATE_FORMAT),
      label: format(date, 'dd MMM', { locale: nl }),
      weekday: format(date, 'EEE', { locale: nl }),
      inMonth: date.getMonth() === firstDay.getMonth(),
    }));
  }, [monthKey]);

  const toggleDay = (day: DayOption) => {
    if (!day.inMonth) {
      return;
    }

    setSelectedDays((prev) => (prev.includes(day.iso) ? prev.filter((item) => item !== day.iso) : [...prev, day.iso]));
  };

  const selectWorkdays = () => {
    const next = daysInMonth
      .filter((day) => {
        if (!day.inMonth) return false;
        const date = parseISO(day.iso);
        const weekday = date.getDay();
        return weekday >= 1 && weekday <= 5;
      })
      .map((day) => day.iso);
    setSelectedDays(next);
  };

  const selectEveryOtherDay = () => {
    const monthDays = daysInMonth.filter((day) => day.inMonth);
    const next = monthDays.filter((_, index) => index % 2 === 0).map((day) => day.iso);
    setSelectedDays(next);
  };

  const clearSelection = () => setSelectedDays([]);

  const monthOptions = useMemo(() => {
    const unique = [...new Set(availableMonths)];
    return unique.sort((a, b) => (a > b ? -1 : 1));
  }, [availableMonths]);

  const handleSubmit = () => {
    const distanceValue = Number(distance);
    if (!title.trim() || !Number.isFinite(distanceValue) || distanceValue <= 0 || selectedDays.length === 0) {
      return;
    }

    const entries: EntryFormValues[] = selectedDays
      .map((iso) => ({
        date: iso,
        title: title.trim(),
        distance: distanceValue,
        notes: notes.trim() || undefined,
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    onCreate(entries);
    setSelectedDays([]);
  };

  const isSubmitDisabled =
    !title.trim() ||
    selectedDays.length === 0 ||
    !Number.isFinite(Number(distance)) ||
    Number(distance) <= 0;

  return (
    <div className="card">
      <h2>Snelle maandplanning</h2>
      <p className="muted">
        Selecteer de dagen waarop je naar kantoor ging en vul één keer de ritgegevens in. We maken voor elke dag
        automatisch een rit aan.
      </p>

      <div className="field">
        <label htmlFor="plannerMonth">Maand</label>
        <select
          id="plannerMonth"
          value={monthKey}
          onChange={(event) => onChangeMonth(event.target.value as MonthKey)}
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="bulkTitle">Beschrijving rit</label>
        <input
          id="bulkTitle"
          type="text"
          placeholder="Bijv. Utrecht ⇆ Amsterdam (kantoor)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="inline-fields">
        <div className="field">
          <label htmlFor="bulkDistance">Afstand (km)</label>
          <input
            id="bulkDistance"
            type="number"
            min={0.01}
            step="0.01"
            value={distance}
            onChange={(event) => setDistance(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="bulkNotes">Notities (optioneel)</label>
          <input
            id="bulkNotes"
            type="text"
            placeholder="Bijv. parkeren, tol, ..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      <div className="bulk-actions">
        <span>Snelle selectie:</span>
        <div className="bulk-buttons">
          <button type="button" className="secondary" onClick={selectWorkdays}>
            Werkdagen
          </button>
          <button type="button" className="secondary" onClick={selectEveryOtherDay}>
            Om de dag
          </button>
          <button type="button" className="secondary" onClick={clearSelection}>
            Wissen
          </button>
        </div>
      </div>

      <div className="day-grid">
        {daysInMonth.map((day) => {
          const isSelected = selectedDays.includes(day.iso);
          const classes = ['day-button'];
          if (!day.inMonth) {
            classes.push('placeholder');
          }
          if (isSelected) {
            classes.push('selected');
          }

          return (
            <button
              key={day.iso}
              type="button"
              className={classes.join(' ')}
              onClick={() => toggleDay(day)}
              disabled={!day.inMonth}
            >
              <span className="weekday">{day.weekday}</span>
              <span className="date">{day.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bulk-footer">
        <span>
          {selectedDays.length} dag{selectedDays.length === 1 ? '' : 'en'} geselecteerd • Totale afstand:{' '}
          {(Number(distance) * selectedDays.length || 0).toFixed(2)} km
        </span>
        <button type="button" onClick={handleSubmit} disabled={isSubmitDisabled}>
          Maak ritten aan
        </button>
      </div>
    </div>
  );
}
