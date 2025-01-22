import { Between } from 'typeorm';

export { adequacyDateFilter };

function adequacyDateFilter(date: Date): any {
  const startDate = new Date(date);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setUTCHours(23, 59, 59, 999);
  return Between(startDate, endDate);
}
