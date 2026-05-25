import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';

import { EventService } from '../../core/services/event.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  MenuCategory,
  MenuItem,
  WeddingEvent,
} from '../../core/models/invitation.model';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog.component';
import { SkeletonComponent } from '../../core/components/skeleton.component';

interface EventDraft {
  name: string; date: string; time: string; venue: string;
  address: string; mapsUrl: string; dressCode: string;
}
interface ItemDraft {
  name: string; description: string; category: MenuCategory;
}

const CATEGORIES: MenuCategory[] = ['starter', 'main', 'dessert', 'vegetarian', 'vegan', 'kids'];

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [FormsModule, DatePipe, ConfirmDialogComponent, SkeletonComponent],
  template: `
    <header class="topbar">
      <div>
        <h1>Events &amp; Menu</h1>
        <p class="sub">Define the day's schedule and per-event menu choices.</p>
      </div>
    </header>

    <div class="grid">
      <!-- Events -->
      <section class="panel">
        <div class="panel-head">
          <h2>Events</h2>
          <button class="primary" (click)="openEvent()">+ Add event</button>
        </div>
        @if (events() === undefined) {
          <app-skeleton height="60px" radius="10px" />
        } @else if (events()!.length === 0) {
          <div class="empty">No events yet. Add the ceremony, reception, etc.</div>
        } @else {
          @for (e of events(); track e.id) {
            <div class="card event-card" [class.selected]="selected()?.id === e.id" (click)="selected.set(e)">
              <div class="card-head">
                <div>
                  <div class="event-name">{{ e.name }}</div>
                  <div class="event-meta">{{ e.startUtc.toDate() | date: 'EEE, MMM d · h:mm a' }}</div>
                </div>
                <div class="card-actions" (click)="$event.stopPropagation()">
                  <button class="link" (click)="openEvent(e)">Edit</button>
                  <button class="link danger" (click)="toDeleteEvent.set(e)">Delete</button>
                </div>
              </div>
              <div class="event-meta">{{ e.venue }}@if (e.dressCode) { · {{ e.dressCode }} }</div>
            </div>
          }
        }
      </section>

      <!-- Menu items -->
      <section class="panel">
        <div class="panel-head">
          <h2>Menu @if (selected(); as e) { <span class="muted">· {{ e.name }}</span> }</h2>
          <button class="primary" (click)="openItem()" [disabled]="!selected()">+ Add item</button>
        </div>
        @if (!selected()) {
          <div class="empty">Select an event to manage its menu items.</div>
        } @else if (filteredItems().length === 0) {
          <div class="empty">No menu items for this event yet.</div>
        } @else {
          @for (i of filteredItems(); track i.id) {
            <div class="card item-card">
              <div>
                <div class="item-name">{{ i.name }} <span class="chip">{{ i.category }}</span></div>
                @if (i.description) {
                  <div class="item-desc">{{ i.description }}</div>
                }
              </div>
              <div class="card-actions">
                <button class="link" (click)="openItem(i)">Edit</button>
                <button class="link danger" (click)="toDeleteItem.set(i)">Delete</button>
              </div>
            </div>
          }
        }
      </section>
    </div>

    @if (eventModal()) {
      <div class="overlay" (click)="eventModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingEvent ? 'Edit event' : 'Add event' }}</h2>
          <label>Name <input type="text" [(ngModel)]="eventDraft.name" placeholder="Reception" /></label>
          <div class="two-col">
            <label>Date <input type="date" [(ngModel)]="eventDraft.date" /></label>
            <label>Time <input type="time" [(ngModel)]="eventDraft.time" /></label>
          </div>
          <label>Venue <input type="text" [(ngModel)]="eventDraft.venue" /></label>
          <label>Address <input type="text" [(ngModel)]="eventDraft.address" /></label>
          <label>Maps URL <input type="url" [(ngModel)]="eventDraft.mapsUrl" placeholder="https://maps.google.com/..." /></label>
          <label>Dress code <input type="text" [(ngModel)]="eventDraft.dressCode" placeholder="Black tie optional" /></label>
          <div class="modal-actions">
            <button class="ghost" (click)="eventModal.set(false)">Cancel</button>
            <button class="primary" [disabled]="!canSaveEvent() || saving()" (click)="saveEvent()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (itemModal()) {
      <div class="overlay" (click)="itemModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editingItem ? 'Edit menu item' : 'Add menu item' }}</h2>
          <label>Name <input type="text" [(ngModel)]="itemDraft.name" placeholder="Beef tenderloin" /></label>
          <label>Category
            <select [(ngModel)]="itemDraft.category">
              @for (c of categories; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </label>
          <label>Description
            <textarea rows="3" [(ngModel)]="itemDraft.description" placeholder="Optional details for guests"></textarea>
          </label>
          <div class="modal-actions">
            <button class="ghost" (click)="itemModal.set(false)">Cancel</button>
            <button class="primary" [disabled]="!itemDraft.name.trim() || saving()" (click)="saveItem()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (toDeleteEvent()) {
      <app-confirm-dialog
        title="Delete event?"
        [message]="'This will also remove all menu items for ' + toDeleteEvent()!.name + '.'"
        confirmLabel="Delete"
        (confirmed)="confirmDeleteEvent()"
        (cancelled)="toDeleteEvent.set(null)"
      />
    }
    @if (toDeleteItem()) {
      <app-confirm-dialog
        title="Delete menu item?"
        [message]="'Remove ' + toDeleteItem()!.name + ' from this event\\'s menu.'"
        confirmLabel="Delete"
        (confirmed)="confirmDeleteItem()"
        (cancelled)="toDeleteItem.set(null)"
      />
    }
  `,
  styles: [
    `
      :host { display: block; max-width: 1300px; }
      h1 { font-family: var(--font-serif); font-size: 32px; margin-bottom: 4px; }
      .sub { color: var(--color-fg-soft); margin: 0 0 28px; }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .panel {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 24px;
        box-shadow: var(--shadow-card);
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
      }
      h2 { font-family: var(--font-serif); font-size: 22px; }
      .muted { font-family: var(--font-sans); font-weight: 400; color: var(--color-fg-soft); font-size: 14px; }
      .empty {
        padding: 32px 16px;
        text-align: center;
        color: var(--color-fg-soft);
        background: var(--color-bg);
        border-radius: var(--radius-md);
      }
      .card {
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        padding: 14px 16px;
        margin-bottom: 10px;
        background: var(--color-card);
        transition: all 160ms;
        cursor: pointer;
      }
      .event-card.selected {
        border-color: var(--color-gold);
        background: rgba(201, 168, 108, 0.06);
      }
      .item-card {
        cursor: default;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .card-head { display: flex; justify-content: space-between; align-items: flex-start; }
      .event-name, .item-name { font-weight: 500; margin-bottom: 4px; }
      .event-meta, .item-desc { color: var(--color-fg-soft); font-size: 13px; }
      .chip {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(201, 168, 108, 0.18);
        color: var(--color-amber);
        text-transform: capitalize;
        margin-left: 6px;
      }
      .card-actions { display: flex; gap: 8px; }
      .link {
        background: transparent;
        border: none;
        color: var(--color-fg);
        padding: 0;
        font-size: 13px;
        text-decoration: underline;
      }
      .link.danger { color: var(--color-error); }
      .primary {
        background: var(--color-fg);
        color: white;
        border: 1px solid var(--color-fg);
        padding: 9px 14px;
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: 500;
      }
      .primary:disabled { opacity: 0.5; cursor: not-allowed; }

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
      .modal h2 { margin-bottom: 18px; }
      label {
        display: block;
        margin-bottom: 14px;
        font-size: 13px;
        color: var(--color-fg-soft);
      }
      label input, label select, label textarea {
        display: block;
        width: 100%;
        margin-top: 4px;
        padding: 10px 12px;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        background: var(--color-bg);
      }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .ghost {
        background: var(--color-card);
        color: var(--color-fg);
        border: 1px solid var(--color-divider);
        padding: 9px 14px;
        border-radius: var(--radius-md);
        font-size: 13px;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 22px;
      }

      @media (max-width: 900px) {
        .grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class EventManagementComponent {
  private svc = inject(EventService);
  private notify = inject(NotificationService);

  readonly events = toSignal(this.svc.listEvents(), { initialValue: undefined });
  readonly allItems = toSignal(this.svc.listAllMenuItems(), { initialValue: [] });

  readonly selected = signal<WeddingEvent | null>(null);
  readonly filteredItems = computed(() => {
    const sel = this.selected();
    if (!sel) return [];
    return this.allItems().filter((i) => i.eventId === sel.id);
  });

  readonly eventModal = signal(false);
  readonly itemModal = signal(false);
  readonly saving = signal(false);

  editingEvent: WeddingEvent | null = null;
  editingItem: MenuItem | null = null;

  eventDraft: EventDraft = this.emptyEventDraft();
  itemDraft: ItemDraft = { name: '', description: '', category: 'main' };

  readonly categories = CATEGORIES;
  readonly toDeleteEvent = signal<WeddingEvent | null>(null);
  readonly toDeleteItem = signal<MenuItem | null>(null);

  openEvent(e?: WeddingEvent) {
    this.editingEvent = e ?? null;
    if (e) {
      const d = e.startUtc.toDate();
      this.eventDraft = {
        name: e.name,
        date: d.toISOString().slice(0, 10),
        time: d.toTimeString().slice(0, 5),
        venue: e.venue,
        address: e.address ?? '',
        mapsUrl: e.mapsUrl ?? '',
        dressCode: e.dressCode ?? '',
      };
    } else {
      this.eventDraft = this.emptyEventDraft();
    }
    this.eventModal.set(true);
  }

  canSaveEvent(): boolean {
    return !!(this.eventDraft.name.trim() && this.eventDraft.date && this.eventDraft.time && this.eventDraft.venue.trim());
  }

  async saveEvent() {
    if (!this.canSaveEvent()) return;
    this.saving.set(true);
    try {
      const start = new Date(`${this.eventDraft.date}T${this.eventDraft.time}`);
      const payload: Omit<WeddingEvent, 'id'> = {
        name: this.eventDraft.name.trim(),
        startUtc: Timestamp.fromDate(start),
        venue: this.eventDraft.venue.trim(),
        address: this.eventDraft.address.trim() || undefined,
        mapsUrl: this.eventDraft.mapsUrl.trim() || undefined,
        dressCode: this.eventDraft.dressCode.trim() || undefined,
        order: this.editingEvent?.order ?? (this.events()?.length ?? 0),
      };
      if (this.editingEvent) {
        await this.svc.updateEvent(this.editingEvent.id, payload);
        this.notify.success('Event updated');
      } else {
        await this.svc.createEvent(payload);
        this.notify.success('Event created');
      }
      this.eventModal.set(false);
    } catch {
      this.notify.error('Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDeleteEvent() {
    const e = this.toDeleteEvent();
    if (!e) return;
    try {
      await this.svc.deleteEvent(e.id);
      if (this.selected()?.id === e.id) this.selected.set(null);
      this.notify.success('Event deleted');
    } catch {
      this.notify.error('Delete failed');
    }
    this.toDeleteEvent.set(null);
  }

  openItem(i?: MenuItem) {
    this.editingItem = i ?? null;
    if (i) {
      this.itemDraft = {
        name: i.name,
        description: i.description ?? '',
        category: i.category,
      };
    } else {
      this.itemDraft = { name: '', description: '', category: 'main' };
    }
    this.itemModal.set(true);
  }

  async saveItem() {
    if (!this.selected() || !this.itemDraft.name.trim()) return;
    this.saving.set(true);
    try {
      const payload: Omit<MenuItem, 'id'> = {
        eventId: this.selected()!.id,
        name: this.itemDraft.name.trim(),
        description: this.itemDraft.description.trim() || undefined,
        category: this.itemDraft.category,
        order: this.editingItem?.order ?? this.filteredItems().length,
      };
      if (this.editingItem) {
        await this.svc.updateMenuItem(this.editingItem.id, payload);
        this.notify.success('Item updated');
      } else {
        await this.svc.createMenuItem(payload);
        this.notify.success('Item created');
      }
      this.itemModal.set(false);
    } catch {
      this.notify.error('Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDeleteItem() {
    const i = this.toDeleteItem();
    if (!i) return;
    try {
      await this.svc.deleteMenuItem(i.id);
      this.notify.success('Item deleted');
    } catch {
      this.notify.error('Delete failed');
    }
    this.toDeleteItem.set(null);
  }

  private emptyEventDraft(): EventDraft {
    return { name: '', date: '', time: '', venue: '', address: '', mapsUrl: '', dressCode: '' };
  }
}
