import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { InvitationService } from '../../core/services/invitation.service';
import { SettingsService } from '../../core/services/settings.service';
import { CsvImportService } from '../../core/services/csv-import.service';
import { NotificationService } from '../../core/services/notification.service';
import { Invitation, InvitationWrite, ParsedGuestRow } from '../../core/models/invitation.model';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { SkeletonComponent } from '../../core/components/skeleton.component';

interface DraftGuest { firstName: string; lastName: string; email: string; }
interface Draft {
  label: string;
  allowsPlusOne: boolean;
  guests: DraftGuest[];
}

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [FormsModule, DatePipe, ConfirmDialogComponent, SkeletonComponent],
  template: `
    <header class="topbar">
      <div>
        <h1>Guest List</h1>
        <p class="sub">Manage invitations, send links, and track RSVPs.</p>
      </div>
      <div class="actions">
        <button class="ghost" (click)="downloadTemplate()">Download CSV Template</button>
        <button class="ghost" (click)="csvInput.click()">Import CSV</button>
        <button class="ghost" (click)="exportExcel()">Export Excel</button>
        <button class="primary" (click)="openAdd()">+ Add Invitation</button>
        <input #csvInput type="file" accept=".csv" hidden (change)="onCsvSelected($event)">
      </div>
    </header>

    @if (invitations() === undefined) {
      <app-skeleton height="48px" radius="8px" />
      @for (i of [1,2,3,4]; track i) {
        <div style="margin-top:8px"><app-skeleton height="56px" radius="8px" /></div>
      }
    } @else if (invitations()!.length === 0) {
      <div class="empty">
        <h2>No invitations yet</h2>
        <p>Click <strong>+ Add Invitation</strong> to get started, or import a CSV.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Guests</th>
              <th>RSVP</th>
              <th>Sent</th>
              <th>Opened</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (inv of invitations(); track inv.token) {
              <tr>
                <td>
                  <div class="label">{{ inv.label }}</div>
                  @if (inv.allowsPlusOne) { <span class="chip">+1 OK</span> }
                </td>
                <td>
                  @for (g of inv.guests; track g.id) {
                    <div class="guest">{{ g.firstName }} {{ g.lastName }}</div>
                  }
                </td>
                <td>
                  <div class="rsvp-summary">
                    <span class="dot success">{{ statusCount(inv, 'attending') }}</span>
                    <span class="dot error">{{ statusCount(inv, 'declined') }}</span>
                    <span class="dot amber">{{ statusCount(inv, 'pending') }}</span>
                  </div>
                </td>
                <td>{{ inv.sentAt ? (inv.sentAt.toDate() | date: 'MMM d') : '—' }}</td>
                <td>{{ inv.openedAt ? '✓' : '—' }}</td>
                <td class="row-actions">
                  <button (click)="openQr(inv)" title="QR code">⌗</button>
                  <button (click)="sendEmail(inv)" title="Send email">✉</button>
                  <button (click)="openEdit(inv)" title="Edit">✎</button>
                  <button (click)="askDelete(inv)" title="Delete" class="danger">×</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (modal() === 'edit' || modal() === 'add') {
      <div class="overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ modal() === 'add' ? 'Add invitation' : 'Edit invitation' }}</h2>
          <label>Label
            <input type="text" [(ngModel)]="draft.label" placeholder="The Smith Family" />
          </label>
          <label class="checkbox">
            <input type="checkbox" [(ngModel)]="draft.allowsPlusOne" />
            Allows a plus-one
          </label>

          <div class="guests-edit">
            <div class="row-head"><strong>Guests</strong>
              <button class="link" (click)="addGuestToDraft()">+ Add guest</button>
            </div>
            @for (g of draft.guests; track $index) {
              <div class="guest-row">
                <input type="text" placeholder="First name" [(ngModel)]="g.firstName" />
                <input type="text" placeholder="Last name" [(ngModel)]="g.lastName" />
                <input type="email" placeholder="Email" [(ngModel)]="g.email" />
                <button class="link danger" (click)="removeGuestFromDraft($index)">×</button>
              </div>
            }
          </div>

          <div class="modal-actions">
            <button class="ghost" (click)="closeModal()">Cancel</button>
            <button class="primary" [disabled]="!canSaveDraft() || saving()" (click)="saveDraft()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (modal() === 'qr' && current()) {
      <div class="overlay" (click)="closeModal()">
        <div class="modal qr" (click)="$event.stopPropagation()">
          <h2>{{ current()!.label }}</h2>
          @if (qrUrl()) {
            <img [src]="qrUrl()" alt="QR code" />
          } @else {
            <app-skeleton width="280px" height="280px" radius="12px" />
          }
          <p class="link-text">{{ inviteLink() }}</p>
          <div class="modal-actions">
            <button class="ghost" (click)="copyLink()">Copy link</button>
            <button class="primary" (click)="closeModal()">Close</button>
          </div>
        </div>
      </div>
    }

    @if (modal() === 'csv-preview') {
      <div class="overlay" (click)="closeModal()">
        <div class="modal large" (click)="$event.stopPropagation()">
          <h2>Import preview</h2>
          <p class="sub">{{ validCsvRows() }} valid · {{ invalidCsvRows() }} with errors</p>
          <div class="csv-preview">
            <table>
              <thead>
                <tr><th>#</th><th>Label</th><th>Name</th><th>Email</th><th>+1</th><th>Status</th></tr>
              </thead>
              <tbody>
                @for (r of csvRows(); track r.rowNumber) {
                  <tr [class]="r.errors.length ? 'bad' : 'good'">
                    <td>{{ r.rowNumber }}</td>
                    <td>{{ r.label }}</td>
                    <td>{{ r.firstName }} {{ r.lastName }}</td>
                    <td>{{ r.email }}</td>
                    <td>{{ r.allowsPlusOne ? 'yes' : 'no' }}</td>
                    <td>{{ r.errors.length ? r.errors.join('; ') : 'OK' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (importing()) {
            <p>Importing {{ importedSoFar() }} of {{ toImport() }}…</p>
          }
          <div class="modal-actions">
            <button class="ghost" (click)="closeModal()" [disabled]="importing()">Cancel</button>
            <button class="primary" (click)="runCsvImport()" [disabled]="importing() || validCsvRows() === 0">
              Import {{ validCsvRows() }} invitations
            </button>
          </div>
        </div>
      </div>
    }

    @if (toDelete()) {
      <app-confirm-dialog
        title="Delete invitation?"
        [message]="'This will permanently remove ' + toDelete()!.label + ' and its guests.'"
        confirmLabel="Delete"
        (confirmed)="confirmDelete()"
        (cancelled)="toDelete.set(null)"
      />
    }
  `,
  styles: [
    `
      :host { display: block; max-width: 1300px; }
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 24px;
      }
      h1 { font-family: var(--font-serif); font-size: 32px; margin-bottom: 4px; }
      .sub { color: var(--color-fg-soft); margin: 0; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; }
      button {
        padding: 10px 16px;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-divider);
        background: var(--color-card);
        font-size: 14px;
        font-weight: 500;
        color: var(--color-fg);
      }
      .primary { background: var(--color-fg); color: white; border-color: var(--color-fg); }
      .primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .ghost:hover { background: rgba(25, 37, 25, 0.04); }
      .danger { color: var(--color-error); }

      .empty {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 56px 32px;
        text-align: center;
        box-shadow: var(--shadow-card);
      }
      .empty h2 { font-family: var(--font-serif); margin-bottom: 8px; }
      .empty p { color: var(--color-fg-soft); }

      .table-wrap {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-card);
        overflow-x: auto;
      }
      table { width: 100%; border-collapse: collapse; min-width: 720px; }
      th, td { text-align: left; padding: 14px 18px; border-bottom: 1px solid var(--color-divider); }
      th { font-size: 12px; text-transform: uppercase; color: var(--color-fg-soft); letter-spacing: 0.05em; }
      td .label { font-weight: 500; margin-bottom: 2px; }
      .chip {
        display: inline-block;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(201, 168, 108, 0.18);
        color: var(--color-amber);
      }
      .guest { font-size: 13px; color: var(--color-fg-soft); }
      .rsvp-summary { display: flex; gap: 8px; }
      .dot {
        font-size: 12px;
        padding: 4px 9px;
        border-radius: 99px;
        font-weight: 600;
      }
      .dot.success { background: rgba(58, 125, 68, 0.12); color: var(--color-success); }
      .dot.error { background: rgba(155, 47, 47, 0.12); color: var(--color-error); }
      .dot.amber { background: rgba(160, 101, 42, 0.12); color: var(--color-amber); }
      .row-actions { display: flex; gap: 4px; }
      .row-actions button {
        padding: 6px 10px;
        font-size: 16px;
        line-height: 1;
      }

      .overlay {
        position: fixed; inset: 0;
        background: rgba(25, 37, 25, 0.5);
        backdrop-filter: blur(4px);
        z-index: 100;
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
      }
      .modal {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 28px;
        max-width: 520px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-modal);
      }
      .modal.large { max-width: 820px; }
      .modal.qr { max-width: 380px; text-align: center; }
      .modal h2 { font-family: var(--font-serif); font-size: 24px; margin-bottom: 18px; }
      label {
        display: block;
        margin-bottom: 14px;
        font-size: 13px;
        color: var(--color-fg-soft);
      }
      label input[type=text], label input[type=email] {
        display: block;
        width: 100%;
        margin-top: 4px;
        padding: 10px 12px;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        background: var(--color-bg);
      }
      label.checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-fg);
        font-size: 14px;
      }
      .guests-edit { margin-top: 14px; }
      .row-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
      .link {
        background: transparent;
        border: none;
        color: var(--color-gold);
        padding: 0;
        font-size: 13px;
      }
      .guest-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1.4fr auto;
        gap: 6px;
        margin-bottom: 6px;
      }
      .guest-row input {
        padding: 8px 10px;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        background: var(--color-bg);
        font-size: 13px;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 22px;
      }
      .link-text {
        font-size: 12px;
        word-break: break-all;
        color: var(--color-fg-soft);
        background: var(--color-bg);
        padding: 10px;
        border-radius: var(--radius-md);
      }
      .csv-preview { max-height: 360px; overflow: auto; margin: 12px 0; }
      .csv-preview table { min-width: auto; font-size: 13px; }
      tr.bad td { background: rgba(155, 47, 47, 0.06); }
      tr.good td { background: rgba(58, 125, 68, 0.05); }

      @media (max-width: 600px) {
        .topbar { flex-direction: column; align-items: stretch; }
        .actions { flex-direction: column; }
        .guest-row { grid-template-columns: 1fr 1fr; }
      }
    `,
  ],
})
export class GuestListComponent {
  private svc = inject(InvitationService);
  private csvSvc = inject(CsvImportService);
  private settingsSvc = inject(SettingsService);
  private notify = inject(NotificationService);

  readonly invitations = toSignal(this.svc.list(), { initialValue: undefined });
  readonly settings = toSignal(this.settingsSvc.get(), { initialValue: undefined });

  readonly modal = signal<'none' | 'add' | 'edit' | 'qr' | 'csv-preview'>('none');
  readonly current = signal<Invitation | null>(null);
  readonly toDelete = signal<Invitation | null>(null);
  readonly saving = signal(false);
  readonly qrUrl = signal<string | null>(null);

  draft: Draft = this.emptyDraft();

  // CSV import state
  readonly csvRows = signal<ParsedGuestRow[]>([]);
  readonly importing = signal(false);
  readonly importedSoFar = signal(0);
  readonly toImport = signal(0);

  readonly validCsvRows = computed(() => this.csvRows().filter((r) => r.errors.length === 0).length);
  readonly invalidCsvRows = computed(() => this.csvRows().filter((r) => r.errors.length > 0).length);

  statusCount(inv: Invitation, s: 'attending' | 'declined' | 'pending'): number {
    return inv.guests.filter((g) => g.rsvp === s).length;
  }

  openAdd() {
    this.current.set(null);
    this.draft = this.emptyDraft();
    this.modal.set('add');
  }

  openEdit(inv: Invitation) {
    this.current.set(inv);
    this.draft = {
      label: inv.label,
      allowsPlusOne: inv.allowsPlusOne,
      guests: inv.guests.map((g) => ({
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email ?? '',
      })),
    };
    this.modal.set('edit');
  }

  async openQr(inv: Invitation) {
    this.current.set(inv);
    this.qrUrl.set(null);
    this.modal.set('qr');
    try {
      const url = await this.svc.generateQrDataUrl(inv.token);
      this.qrUrl.set(url);
    } catch (e: unknown) {
      this.notify.error('Could not generate QR code');
    }
  }

  inviteLink(): string {
    return this.current() ? this.svc.inviteUrl(this.current()!.token) : '';
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.inviteLink());
      this.notify.success('Link copied');
    } catch {
      this.notify.error('Copy failed — select manually');
    }
  }

  closeModal() {
    this.modal.set('none');
    this.current.set(null);
    this.qrUrl.set(null);
    this.csvRows.set([]);
  }

  addGuestToDraft() {
    this.draft.guests.push({ firstName: '', lastName: '', email: '' });
  }

  removeGuestFromDraft(i: number) {
    this.draft.guests.splice(i, 1);
  }

  canSaveDraft(): boolean {
    return (
      this.draft.label.trim().length > 0 &&
      this.draft.guests.length > 0 &&
      this.draft.guests.every((g) => g.firstName.trim() && g.lastName.trim())
    );
  }

  async saveDraft() {
    if (!this.canSaveDraft()) return;
    this.saving.set(true);
    try {
      const payload: InvitationWrite = {
        label: this.draft.label.trim(),
        allowsPlusOne: this.draft.allowsPlusOne,
        guests: this.draft.guests.map((g) => ({
          firstName: g.firstName.trim(),
          lastName: g.lastName.trim(),
          email: g.email.trim() || undefined,
        })),
      };
      if (this.modal() === 'edit' && this.current()) {
        // Preserve guest IDs + rsvp state on edit
        const merged = this.current()!.guests.map((existing, i) => ({
          ...existing,
          firstName: payload.guests[i]?.firstName ?? existing.firstName,
          lastName: payload.guests[i]?.lastName ?? existing.lastName,
          email: payload.guests[i]?.email,
        }));
        // Add any newly added guests
        for (let i = this.current()!.guests.length; i < payload.guests.length; i++) {
          merged.push({
            id: crypto.randomUUID().slice(0, 10),
            firstName: payload.guests[i].firstName,
            lastName: payload.guests[i].lastName,
            email: payload.guests[i].email,
            rsvp: 'pending',
            menuChoices: {},
            dietary: [],
          });
        }
        await this.svc.update(this.current()!.token, {
          label: payload.label,
          allowsPlusOne: payload.allowsPlusOne,
          guests: merged.slice(0, payload.guests.length),
        });
        this.notify.success('Invitation updated');
      } else {
        await this.svc.create(payload);
        this.notify.success('Invitation created');
      }
      this.closeModal();
    } catch (e: unknown) {
      this.notify.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  askDelete(inv: Invitation) {
    this.toDelete.set(inv);
  }

  async confirmDelete() {
    const inv = this.toDelete();
    if (!inv) return;
    try {
      await this.svc.delete(inv.token);
      this.notify.success('Invitation deleted');
    } catch (e: unknown) {
      this.notify.error('Delete failed');
    }
    this.toDelete.set(null);
  }

  async sendEmail(inv: Invitation) {
    const s = this.settings();
    if (!s) {
      this.notify.error('Wedding settings missing — fill them in first.');
      return;
    }
    try {
      await this.svc.sendInviteEmail(inv, {
        coupleNames: s.coupleNames,
        weddingDate: s.weddingDate.toDate(),
      });
      this.notify.success(`Email sent to ${inv.guests[0].email}`);
    } catch (e: unknown) {
      this.notify.error(e instanceof Error ? e.message : 'Email failed');
    }
  }

  exportExcel() {
    const list = this.invitations();
    if (!list || list.length === 0) {
      this.notify.info('Nothing to export yet');
      return;
    }
    this.svc.exportToExcel(list);
  }

  downloadTemplate() {
    const blob = new Blob([this.csvSvc.templateCsv()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async onCsvSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = this.csvSvc.parse(text);
    this.csvRows.set(parsed);
    this.modal.set('csv-preview');
    input.value = '';
  }

  async runCsvImport() {
    const invs = this.csvSvc.parsedRowsToInvitations(this.csvRows());
    if (invs.length === 0) return;
    this.importing.set(true);
    this.toImport.set(invs.length);
    this.importedSoFar.set(0);
    try {
      for (const inv of invs) {
        await this.svc.create(inv);
        this.importedSoFar.update((n) => n + 1);
      }
      this.notify.success(`Imported ${invs.length} invitations`);
      this.closeModal();
    } catch (e: unknown) {
      this.notify.error('Import failed partway through');
    } finally {
      this.importing.set(false);
    }
  }

  private emptyDraft(): Draft {
    return {
      label: '',
      allowsPlusOne: false,
      guests: [{ firstName: '', lastName: '', email: '' }],
    };
  }
}
