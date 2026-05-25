import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collectionData,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { MenuItem, WeddingEvent } from '../models/invitation.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private firestore = inject(Firestore);

  private events() {
    return collection(this.firestore, 'events');
  }
  private menuItems() {
    return collection(this.firestore, 'menuItems');
  }

  listEvents(): Observable<WeddingEvent[]> {
    const q = query(this.events(), orderBy('order', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<WeddingEvent[]>;
  }

  listMenuItems(eventId: string): Observable<MenuItem[]> {
    const q = query(
      this.menuItems(),
      where('eventId', '==', eventId),
      orderBy('order', 'asc'),
    );
    return collectionData(q, { idField: 'id' }) as Observable<MenuItem[]>;
  }

  listAllMenuItems(): Observable<MenuItem[]> {
    const q = query(this.menuItems(), orderBy('order', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<MenuItem[]>;
  }

  async createEvent(data: Omit<WeddingEvent, 'id'>): Promise<string> {
    const ref = await addDoc(this.events(), data);
    return ref.id;
  }

  async updateEvent(id: string, data: Partial<WeddingEvent>): Promise<void> {
    await updateDoc(doc(this.firestore, 'events', id), data);
  }

  async deleteEvent(id: string): Promise<void> {
    // Delete all menu items in this event first
    const itemsQuery = query(this.menuItems(), where('eventId', '==', id));
    const snap = await getDocs(itemsQuery);
    const batch = writeBatch(this.firestore);
    snap.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(this.firestore, 'events', id));
    await batch.commit();
  }

  async createMenuItem(data: Omit<MenuItem, 'id'>): Promise<string> {
    const ref = await addDoc(this.menuItems(), data);
    return ref.id;
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
    await updateDoc(doc(this.firestore, 'menuItems', id), data);
  }

  async deleteMenuItem(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'menuItems', id));
  }
}
