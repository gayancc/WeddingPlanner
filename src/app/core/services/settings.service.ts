import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { WeddingSettings } from '../models/invitation.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private firestore = inject(Firestore);

  private ref() {
    return doc(this.firestore, 'settings', 'global');
  }

  get(): Observable<WeddingSettings | undefined> {
    return docData(this.ref()) as Observable<WeddingSettings | undefined>;
  }

  async update(data: Partial<WeddingSettings>): Promise<void> {
    await setDoc(this.ref(), data, { merge: true });
  }
}
