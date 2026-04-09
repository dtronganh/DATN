export function formatVND(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

export function calculateTime(targetDate: Date, now: Date = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const difference = targetDate.getTime() - now.getTime();

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  };
}

export function formatDate(date: string | Date, locale: string = 'vi-VN'): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return parsed.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function preprocessProductDescriptionMarkdown(md: string): string {
  const lines = md.split('\n');
  const result: string[] = [];
  const tableRows: string[] = [];
  let i = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      result.push(`<table class="spec-table"><tbody>${tableRows.join('')}</tbody></table>`);
      tableRows.length = 0;
    }
  };

  const isSpecKey = (line: string) => /^\*\*(?!\*)[^*\n]+(?<!\*)\*\*$/.test(line.trim());

  const getValueAt = (idx: number): { value: string; nextIdx: number } | null => {
    let j = idx;
    while (j < lines.length && !lines[j].trim()) j++;
    if (j >= lines.length) return null;
    const line = lines[j].trim();
    if (line.startsWith('#') || line.startsWith('|') || isSpecKey(line) || line.startsWith('****')) return null;

    const valueLines: string[] = [];
    while (j < lines.length) {
      const l = lines[j].trim();
      if (!l) break;
      if (isSpecKey(l) || l.startsWith('#') || l.startsWith('|')) break;
      valueLines.push(l);
      j++;
    }
    if (!valueLines.length) return null;
    return { value: valueLines.join('<br>'), nextIdx: j };
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (isSpecKey(line)) {
      const key = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
      const res = getValueAt(i + 1);
      if (res) {
        tableRows.push(`<tr><td><strong>${key}</strong></td><td>${res.value}</td></tr>`);
        i = res.nextIdx;
        continue;
      }
    }

    flushTable();
    result.push(lines[i]);
    i++;
  }

  flushTable();
  return result.join('\n');
}

