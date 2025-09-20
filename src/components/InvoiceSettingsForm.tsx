import { ChangeEvent } from 'react';
import { format } from 'date-fns';
import { InvoiceSettings } from '../types';

type Props = {
  settings: InvoiceSettings;
  onChange: (settings: InvoiceSettings) => void;
};

export function InvoiceSettingsForm({ settings, onChange }: Props) {
  const updateField = <K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>, key: keyof InvoiceSettings) => {
    const nextValue = Number(event.target.value);
    if (Number.isNaN(nextValue)) {
      updateField(key, 0 as InvoiceSettings[typeof key]);
      return;
    }

    updateField(key, nextValue as InvoiceSettings[typeof key]);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="card">
      <h2>Factuurgegevens</h2>
      <p className="muted">Vul de gegevens in die boven je maandelijkse PDF moeten staan.</p>

      <div className="field">
        <label htmlFor="invoiceDate">Factuurdatum</label>
        <input
          id="invoiceDate"
          type="date"
          value={settings.invoiceDate}
          max={today}
          onChange={(event) => updateField('invoiceDate', event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="invoiceNumber">Factuurnummer</label>
        <input
          id="invoiceNumber"
          type="text"
          placeholder="Bijv. Reiskosten 2025-01"
          value={settings.invoiceNumber}
          onChange={(event) => updateField('invoiceNumber', event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="companyName">Bedrijfsnaam</label>
        <input
          id="companyName"
          type="text"
          placeholder="Bijv. DeGraafIT"
          value={settings.companyName}
          onChange={(event) => updateField('companyName', event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="licensePlate">Kenteken</label>
        <input
          id="licensePlate"
          type="text"
          placeholder="Bijv. G-270-TT"
          value={settings.licensePlate}
          onChange={(event) => updateField('licensePlate', event.target.value.toUpperCase())}
        />
      </div>

      <div className="inline-fields">
        <div className="field">
          <label htmlFor="ratePerKm">Tarief per km</label>
          <input
            id="ratePerKm"
            type="number"
            min={0}
            step="0.01"
            value={settings.ratePerKm.toString()}
            onChange={(event) => handleNumberChange(event, 'ratePerKm')}
          />
        </div>

        <div className="field">
          <label htmlFor="currencySymbol">Valuta</label>
          <input
            id="currencySymbol"
            type="text"
            maxLength={3}
            value={settings.currencySymbol}
            onChange={(event) => updateField('currencySymbol', event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="vatPercentage">Btw %</label>
          <input
            id="vatPercentage"
            type="number"
            min={0}
            step="0.1"
            value={settings.vatPercentage.toString()}
            onChange={(event) => handleNumberChange(event, 'vatPercentage')}
          />
        </div>
      </div>
    </div>
  );
}
