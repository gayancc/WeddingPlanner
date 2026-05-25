import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collectionData,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { nanoid } from 'nanoid';
import * as QRCode from 'qrcode';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';

import {
  Guest,
  Invitation,
  InvitationWrite,
  RsvpStatus,
} from '../models/invitation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private firestore = inject(Firestore);

  private col() {
    return collection(this.firestore, 'invitations');
  }

  list(): Observable<Invitation[]> {
    const q = query(this.col(), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'token' }) as Observable<Invitation[]>;
  }

  async getByToken(token: string): Promise<Invitation | undefined> {
    const ref = doc(this.firestore, 'invitations', token);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    return { token: snap.id, ...(snap.data() as Omit<Invitation, 'token'>) };
  }

  async create(data: InvitationWrite): Promise<string> {
    const token = nanoid(32);
    const guests: Guest[] = data.guests.map((g) => ({
      id: nanoid(10),
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email,
      rsvp: 'pending' as RsvpStatus,
      menuChoices: {},
      dietary: [],
    }));
    const ref = doc(this.firestore, 'invitations', token);
    await setDoc(ref, {
      label: data.label,
      allowsPlusOne: data.allowsPlusOne,
      guests,
      createdAt: serverTimestamp(),
    });
    return token;
  }

  async update(token: string, data: Partial<Invitation>): Promise<void> {
    const ref = doc(this.firestore, 'invitations', token);
    await updateDoc(ref, data);
  }

  async delete(token: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'invitations', token));
  }

  async markOpened(token: string): Promise<void> {
    const ref = doc(this.firestore, 'invitations', token);
    const snap = await getDoc(ref);
    if (snap.exists() && !snap.data()['openedAt']) {
      await updateDoc(ref, { openedAt: serverTimestamp() });
    }
  }

  async markSent(token: string): Promise<void> {
    const ref = doc(this.firestore, 'invitations', token);
    await updateDoc(ref, { sentAt: serverTimestamp() });
  }

  async submitRsvp(
    token: string,
    guests: Guest[],
  ): Promise<void> {
    const ref = doc(this.firestore, 'invitations', token);
    const stamped = guests.map((g) => ({
      ...g,
      respondedAt: Timestamp.now(),
    }));
    await updateDoc(ref, { guests: stamped });
  }

  inviteUrl(token: string): string {
    return `${environment.siteUrl}/i/${token}`;
  }

  async generateQrDataUrl(token: string): Promise<string> {
    return QRCode.toDataURL(this.inviteUrl(token), {
      margin: 2,
      width: 320,
      color: { dark: '#192519', light: '#F7F3EE' },
    });
  }

  async sendInviteEmail(
    invitation: Invitation,
    settings: { coupleNames: string; weddingDate: Date },
  ): Promise<void> {
    if (!invitation.guests[0]?.email) {
      throw new Error('No email address on file for this invitation');
    }
    const qr = await this.generateQrDataUrl(invitation.token);
    const url = this.inviteUrl(invitation.token);
    const toName = invitation.guests.map((g) => `${g.firstName} ${g.lastName}`).join(' & ');

    const result = await emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateId,
      {
        to_email: invitation.guests[0].email,
        to_name: toName,
        invite_url: url,
        qr_code: qr,
        wedding_label: invitation.label,
        couple_names: settings.coupleNames,
        wedding_date: settings.weddingDate.toDateString(),
      },
      { publicKey: environment.emailjs.publicKey },
    );

    if (result.status !== 200) {
      throw new Error(`EmailJS error ${result.status}: ${result.text}`);
    }

    await this.markSent(invitation.token);
  }

  exportToExcel(invitations: Invitation[]): void {
    const rows = invitations.flatMap((inv) =>
      inv.guests.map((g) => ({
        Invitation: inv.label,
        First: g.firstName,
        Last: g.lastName,
        Email: g.email ?? '',
        RSVP: g.rsvp,
        Dietary: g.dietary.join(', '),
        Other: g.otherDietary ?? '',
        Sent: inv.sentAt ? 'yes' : 'no',
        Opened: inv.openedAt ? 'yes' : 'no',
      })),
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Guests');
    XLSX.writeFile(wb, `guest-list-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
