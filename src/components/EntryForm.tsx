import { FormEvent, useMemo, useState } from 'react';
import { format } from 'date-fns';

export type EntryFormValues = {
  date: string;
  title: string;
  distance: number;
  notes?: string;
};

type Props = {
  onAdd: (entry: EntryFormValues) => void;
};

type Errors = Partial<Record<keyof EntryFormValues, string>>;

const today = () => format(new Date(), 'yyyy-MM-dd');

export function EntryForm({ onAdd }: Props) {
  const [date, setDate] = useState(() => today());
  const [title, setTitle] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const isValid = useMemo(() => {
    if (!title.trim()) return false;
    const numeric = Number(distance);
    if (!Number.isFinite(numeric) || numeric <= 0) return false;
    return Boolean(date);
  }, [date, distance, title]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Errors = {};
    const distanceValue = Number(distance);

    if (!title.trim()) {
      nextErrors.title = 'Voeg een korte beschrijving toe';
    }

    if (!date) {
      nextErrors.date = 'Kies een datum';
    }

    if (!Number.isFinite(distanceValue) || distanceValue <= 0) {
      nextErrors.distance = 'Afstand moet een positief getal zijn';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      date,
      title: title.trim(),
      distance: distanceValue,
      notes: notes.trim() || undefined,
    });

    setDate(today());
    setTitle('');
    setDistance('');
    setNotes('');
    setErrors({});
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Rit toevoegen</h2>
      <div className="field">
        <label htmlFor="date">Datum</label>
        <input
          id="date"
          type="date"
          value={date}
          max={today()}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        {errors.date && <p className="error">{errors.date}</p>}
      </div>

      <div className="field">
        <label htmlFor="title">Beschrijving</label>
        <input
          id="title"
          type="text"
          placeholder="Bijv. woon-werk rit"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        {errors.title && <p className="error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="distance">Afstand (km)</label>
        <input
          id="distance"
          type="number"
          min={0.01}
          step="0.01"
          inputMode="decimal"
          placeholder="5.2"
          value={distance}
          onChange={(event) => setDistance(event.target.value)}
          required
        />
        {errors.distance && <p className="error">{errors.distance}</p>}
      </div>

      <div className="field">
        <label htmlFor="notes">Notities (optioneel)</label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Bijv. route, omstandigheden…"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <button type="submit" disabled={!isValid}>
        Opslaan
      </button>
    </form>
  );
}
