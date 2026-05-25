import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Guest,
  Invitation,
  MenuItem,
  RsvpStatus,
  WeddingEvent,
} from '../../core/models/invitation.model';
import { InvitationService } from '../../core/services/invitation.service';
import { NotificationService } from '../../core/services/notification.service';

interface GuestFormState {
  rsvp: RsvpStatus;
  menuChoices: Record<string, string>;
  dietary: string[];
  otherDietary: string;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Nut allergy',
  'Halal',
  'Kosher',
];

@Component({
  selector: 'app-rsvp-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="form">
      <h2>Please respond for each guest</h2>

      @for (g of invitation.guests; track g.id) {
        @let state = formState()[g.id];
        <article class="guest-card">
          <h3>Guest · {{ g.firstName }} {{ g.lastName }}</h3>

          <fieldset>
            <legend>Will you be attending?</legend>
            <div class="rsvp-pick">
              <label class="opt" [class.checked]="state.rsvp === 'attending'">
                <input type="radio" [name]="'rsvp-' + g.id" value="attending"
                       [checked]="state.rsvp === 'attending'"
                       (change)="setRsvp(g.id, 'attending')" />
                <span class="title">Joyfully Accepts</span>
                <span class="sub">Can't wait!</span>
              </label>
              <label class="opt" [class.checked]="state.rsvp === 'declined'">
                <input type="radio" [name]="'rsvp-' + g.id" value="declined"
                       [checked]="state.rsvp === 'declined'"
                       (change)="setRsvp(g.id, 'declined')" />
                <span class="title">Regretfully Declines</span>
                <span class="sub">Will be there in spirit</span>
              </label>
            </div>
          </fieldset>

          @if (state.rsvp === 'attending') {
            @for (e of events; track e.id) {
              @if (menuItemsFor(e.id).length > 0) {
                <fieldset>
                  <legend>{{ e.name }} · Menu choice</legend>
                  <div class="menu-pick">
                    @for (item of menuItemsFor(e.id); track item.id) {
                      <label class="menu-opt" [class.checked]="state.menuChoices[e.id] === item.id">
                        <input type="radio" [name]="'menu-' + g.id + '-' + e.id" [value]="item.id"
                               [checked]="state.menuChoices[e.id] === item.id"
                               (change)="setMenu(g.id, e.id, item.id)" />
                        <span class="m-title">{{ item.name }}
                          @if (item.category === 'vegan' || item.category === 'vegetarian') {
                            <span class="m-badge">{{ item.category }}</span>
                          }
                        </span>
                        @if (item.description) { <span class="m-desc">{{ item.description }}</span> }
                      </label>
                    }
                  </div>
                </fieldset>
              }
            }

            <fieldset>
              <legend>Dietary preferences (optional)</legend>
              <div class="diet">
                @for (d of dietaryOptions; track d) {
                  <label class="chk">
                    <input type="checkbox"
                           [checked]="state.dietary.includes(d)"
                           (change)="toggleDietary(g.id, d)" />
                    {{ d }}
                  </label>
                }
              </div>
              <label class="other">
                Other dietary needs
                <input type="text" [ngModel]="state.otherDietary"
                       (ngModelChange)="setOtherDietary(g.id, $event)"
                       placeholder="Please let us know" />
              </label>
            </fieldset>
          }
        </article>
      }

      @if (error()) { <p class="error">{{ error() }}</p> }

      <div class="submit-row">
        <button class="primary" type="button"
                [disabled]="!isComplete() || saving()"
                (click)="submit()">
          {{ saving() ? 'Saving…' : 'Confirm RSVP' }}
        </button>
        @if (!isComplete() && !saving()) {
          <p class="hint">Please complete each guest's RSVP and menu selections.</p>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .form {
        max-width: 720px;
        margin: 0 auto;
        padding: 48px 24px;
      }
      h2 {
        font-family: var(--font-serif);
        text-align: center;
        font-size: 26px;
        margin-bottom: 32px;
      }
      .guest-card {
        background: var(--color-card);
        border-radius: var(--radius-lg);
        padding: 28px;
        margin-bottom: 18px;
        box-shadow: var(--shadow-card);
      }
      h3 {
        font-family: var(--font-serif);
        font-size: 22px;
        margin-bottom: 24px;
        text-align: center;
        color: var(--color-gold);
      }
      fieldset {
        border: none;
        padding: 0;
        margin: 0 0 24px;
      }
      legend {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-fg-soft);
        margin-bottom: 12px;
      }
      .rsvp-pick {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .opt {
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        padding: 18px;
        text-align: center;
        cursor: pointer;
        transition: all 160ms;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-height: 56px;
      }
      .opt input { display: none; }
      .opt .title { font-family: var(--font-serif); font-size: 17px; }
      .opt .sub { font-size: 12px; color: var(--color-fg-soft); }
      .opt.checked {
        border-color: var(--color-gold);
        background: rgba(201, 168, 108, 0.1);
      }
      .menu-pick {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .menu-opt {
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        padding: 14px 18px;
        cursor: pointer;
        transition: all 160ms;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-height: 50px;
      }
      .menu-opt input { display: none; }
      .menu-opt.checked {
        border-color: var(--color-gold);
        background: rgba(201, 168, 108, 0.08);
      }
      .m-title { font-weight: 500; }
      .m-badge {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(58, 125, 68, 0.14);
        color: var(--color-success);
        margin-left: 6px;
        text-transform: uppercase;
      }
      .m-desc { font-size: 13px; color: var(--color-fg-soft); }
      .diet {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 14px;
      }
      .chk {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        padding: 8px 14px;
        border: 1px solid var(--color-divider);
        border-radius: 99px;
        font-size: 13px;
        cursor: pointer;
      }
      .chk input { accent-color: var(--color-gold); }
      .other {
        display: block;
        font-size: 13px;
        color: var(--color-fg-soft);
      }
      .other input {
        display: block;
        width: 100%;
        margin-top: 6px;
        padding: 10px 12px;
        border: 1px solid var(--color-divider);
        border-radius: var(--radius-md);
        background: var(--color-bg);
      }
      .submit-row {
        text-align: center;
        margin-top: 24px;
      }
      .primary {
        background: var(--color-fg);
        color: white;
        border: none;
        padding: 16px 48px;
        border-radius: var(--radius-md);
        font-size: 15px;
        font-weight: 500;
        font-family: var(--font-serif);
        letter-spacing: 0.05em;
        transition: opacity 160ms;
        min-height: 52px;
      }
      .primary:hover { opacity: 0.9; }
      .primary:disabled { opacity: 0.4; cursor: not-allowed; }
      .hint {
        font-size: 13px;
        color: var(--color-fg-soft);
        margin-top: 10px;
      }
      .error {
        color: var(--color-error);
        text-align: center;
        margin-bottom: 16px;
      }
      @media (max-width: 500px) {
        .rsvp-pick { grid-template-columns: 1fr; }
        .guest-card { padding: 22px 18px; }
      }
    `,
  ],
})
export class RsvpFormComponent {
  @Input({ required: true }) invitation!: Invitation;
  @Input({ required: true }) events: WeddingEvent[] = [];
  @Input({ required: true }) menuItems: MenuItem[] = [];
  @Output() submitted = new EventEmitter<void>();

  private svc = inject(InvitationService);
  private notify = inject(NotificationService);

  readonly dietaryOptions = DIETARY_OPTIONS;
  readonly formState = signal<Record<string, GuestFormState>>({});
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly isComplete = computed(() => {
    const state = this.formState();
    return this.invitation.guests.every((g) => {
      const s = state[g.id];
      if (!s || s.rsvp === 'pending') return false;
      if (s.rsvp === 'declined') return true;
      // attending: every event with menu items must have a choice
      return this.events.every((e) => {
        const items = this.menuItemsFor(e.id);
        return items.length === 0 || !!s.menuChoices[e.id];
      });
    });
  });

  ngOnInit() {
    const initial: Record<string, GuestFormState> = {};
    for (const g of this.invitation.guests) {
      initial[g.id] = {
        rsvp: g.rsvp,
        menuChoices: { ...g.menuChoices },
        dietary: [...g.dietary],
        otherDietary: g.otherDietary ?? '',
      };
    }
    this.formState.set(initial);
  }

  menuItemsFor(eventId: string): MenuItem[] {
    return this.menuItems.filter((i) => i.eventId === eventId);
  }

  setRsvp(guestId: string, rsvp: RsvpStatus) {
    this.formState.update((s) => ({
      ...s,
      [guestId]: { ...s[guestId], rsvp },
    }));
  }

  setMenu(guestId: string, eventId: string, itemId: string) {
    this.formState.update((s) => ({
      ...s,
      [guestId]: {
        ...s[guestId],
        menuChoices: { ...s[guestId].menuChoices, [eventId]: itemId },
      },
    }));
  }

  toggleDietary(guestId: string, item: string) {
    this.formState.update((s) => {
      const current = s[guestId].dietary;
      const next = current.includes(item)
        ? current.filter((d) => d !== item)
        : [...current, item];
      return { ...s, [guestId]: { ...s[guestId], dietary: next } };
    });
  }

  setOtherDietary(guestId: string, value: string) {
    this.formState.update((s) => ({
      ...s,
      [guestId]: { ...s[guestId], otherDietary: value },
    }));
  }

  async submit() {
    if (!this.isComplete()) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const state = this.formState();
      const updated: Guest[] = this.invitation.guests.map((g) => {
        const s = state[g.id];
        return {
          ...g,
          rsvp: s.rsvp,
          menuChoices: s.rsvp === 'attending' ? s.menuChoices : {},
          dietary: s.rsvp === 'attending' ? s.dietary : [],
          otherDietary: s.rsvp === 'attending' ? s.otherDietary : '',
        };
      });
      await this.svc.submitRsvp(this.invitation.token, updated);
      this.submitted.emit();
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Could not save your RSVP. Please try again.');
      this.notify.error('RSVP could not be saved');
    } finally {
      this.saving.set(false);
    }
  }
}
