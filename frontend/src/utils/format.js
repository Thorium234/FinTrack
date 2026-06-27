const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric"
});

export function formatCurrency(value) {
  const number = Number(value || 0);
  return CURRENCY_FORMATTER.format(Number.isFinite(number) ? number : 0);
}

export function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

export function formatMonthLabel(month) {
  if (!month) {
    return "Current month";
  }

  const [year, monthIndex] = month.split("-");
  const date = new Date(Number(year), Number(monthIndex) - 1, 1);
  return Number.isNaN(date.getTime()) ? month : MONTH_FORMATTER.format(date);
}

export function toMonthInputValue(month) {
  return month || new Date().toISOString().slice(0, 7);
}

export function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function toPercent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return (Number(numerator) / Number(denominator)) * 100;
}
