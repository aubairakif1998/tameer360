export function getPakistanDate(date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
}

export function getPakistanMonthRange(asOfDate: string) {
  const [year, month] = asOfDate.split('-').map(Number);
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { monthStart, monthEnd };
}

export function getLast7Days(asOfDate: string): string[] {
  const base = new Date(`${asOfDate}T12:00:00`);
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    days.push(getPakistanDate(d));
  }
  return days;
}
