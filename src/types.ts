export type KilometerEntry = {
  id: string;
  date: string; // ISO date string
  title: string;
  distance: number;
  notes?: string;
};

export type InvoiceSettings = {
  invoiceDate: string; // yyyy-MM-dd
  invoiceNumber: string;
  companyName: string;
  licensePlate: string;
  ratePerKm: number;
  currencySymbol: string;
  vatPercentage: number;
};

export type MonthKey = `${number}-${string}`; // e.g., "2024-03"
