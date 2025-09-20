import { formatMonthLabel } from '../utils/date';

type Props = {
  availableMonths: string[];
  selectedMonth: string;
  onSelect: (monthKey: string) => void;
};

export function MonthSelector({ availableMonths, selectedMonth, onSelect }: Props) {
  const sorted = [...new Set(availableMonths)].sort((a, b) => (a > b ? -1 : 1));

  if (!sorted.length) {
    return null;
  }

  return (
    <div className="card">
      <h2>Maandoverzicht</h2>
      <label className="field">
        <span>Kies een maand</span>
        <select value={selectedMonth} onChange={(event) => onSelect(event.target.value)}>
          {sorted.map((month) => (
            <option key={month} value={month}>
              {formatMonthLabel(month)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
