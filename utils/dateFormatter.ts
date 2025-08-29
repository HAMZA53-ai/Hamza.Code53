export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();

  // Reset time part for date comparison
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isToday = startOfDate.getTime() === startOfToday.getTime();
  
  if (isToday) {
    return date.toLocaleTimeString('ar-AE', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  
  // Check for yesterday
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = startOfDate.getTime() === yesterday.getTime();

  if (isYesterday) {
    return 'الأمس';
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString('ar-AE', { month: 'long', day: 'numeric' });
  }

  return date.toLocaleDateString('ar-AE', { year: 'numeric', month: 'long', day: 'numeric' });
};
