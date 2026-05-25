import { Injectable } from '@angular/core';

import { InvitationWrite, ParsedGuestRow } from '../models/invitation.model';

const HEADER = ['Label', 'FirstName', 'LastName', 'Email', 'AllowPlusOne'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable({ providedIn: 'root' })
export class CsvImportService {
  parse(csvText: string): ParsedGuestRow[] {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    const headers = this.parseLine(lines[0]).map((h) => h.trim());
    const missing = HEADER.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return [
        {
          rowNumber: 1,
          label: '',
          firstName: '',
          lastName: '',
          allowsPlusOne: false,
          errors: [`Missing CSV columns: ${missing.join(', ')}`],
        },
      ];
    }
    const idx = (name: string) => headers.indexOf(name);

    const rows: ParsedGuestRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = this.parseLine(lines[i]);
      const label = (cols[idx('Label')] ?? '').trim();
      const firstName = (cols[idx('FirstName')] ?? '').trim();
      const lastName = (cols[idx('LastName')] ?? '').trim();
      const email = (cols[idx('Email')] ?? '').trim();
      const allowsPlusOneRaw = (cols[idx('AllowPlusOne')] ?? '').trim().toLowerCase();

      const errors: string[] = [];
      if (!label) errors.push('Label is required');
      if (!firstName) errors.push('FirstName is required');
      if (!lastName) errors.push('LastName is required');
      if (email && !EMAIL_RE.test(email)) errors.push('Email format is invalid');

      rows.push({
        rowNumber: i + 1,
        label,
        firstName,
        lastName,
        email: email || undefined,
        allowsPlusOne: ['yes', 'true', '1', 'y'].includes(allowsPlusOneRaw),
        errors,
      });
    }
    return rows;
  }

  parsedRowsToInvitations(rows: ParsedGuestRow[]): InvitationWrite[] {
    const valid = rows.filter((r) => r.errors.length === 0);
    const map = new Map<string, InvitationWrite>();
    for (const r of valid) {
      const existing = map.get(r.label);
      if (existing) {
        existing.guests.push({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
        });
        existing.allowsPlusOne = existing.allowsPlusOne || r.allowsPlusOne;
      } else {
        map.set(r.label, {
          label: r.label,
          allowsPlusOne: r.allowsPlusOne,
          guests: [{ firstName: r.firstName, lastName: r.lastName, email: r.email }],
        });
      }
    }
    return [...map.values()];
  }

  templateCsv(): string {
    return [
      HEADER.join(','),
      'The Smith Family,Alex,Smith,alex@example.com,yes',
      'The Smith Family,Jamie,Smith,,no',
      'Jordan Lee,Jordan,Lee,jordan@example.com,yes',
    ].join('\n');
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') {
          result.push(cur);
          cur = '';
        } else cur += ch;
      }
    }
    result.push(cur);
    return result;
  }
}
