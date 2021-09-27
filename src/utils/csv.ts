import { parse, stringify } from '@vanillaes/csv';

export function exportToCsv(data: Array<Array<string>>): string {
  return stringify(data);
}

export function importFromCsv(csv: string): Array<Array<string>> {
  return parse(csv);
}
