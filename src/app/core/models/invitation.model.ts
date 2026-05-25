import { Timestamp } from 'firebase/firestore';

export type RsvpStatus = 'pending' | 'attending' | 'declined';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  isPlusOne?: boolean;
  rsvp: RsvpStatus;
  // Map of eventId -> menuItemId selected by this guest
  menuChoices: Record<string, string>;
  dietary: string[];
  otherDietary?: string;
  respondedAt?: Timestamp;
}

export interface Invitation {
  token: string;            // also the Firestore document ID
  label: string;            // "The Smith Family", "Jane Doe & Guest"
  allowsPlusOne: boolean;
  guests: Guest[];
  createdAt: Timestamp;
  sentAt?: Timestamp;
  openedAt?: Timestamp;
  notes?: string;
}

export interface WeddingEvent {
  id: string;
  name: string;             // "Ceremony", "Reception"
  startUtc: Timestamp;
  venue: string;
  address?: string;
  mapsUrl?: string;
  dressCode?: string;
  order: number;
}

export type MenuCategory = 'starter' | 'main' | 'dessert' | 'vegan' | 'vegetarian' | 'kids';

export interface MenuItem {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  category: MenuCategory;
  order: number;
}

export interface CoupleStory {
  id: string;
  date: string;             // free-text e.g. "June 2019"
  title: string;
  description: string;
  photoUrl?: string;
  order: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface AccommodationItem {
  name: string;
  address: string;
  distance: string;         // "5 min drive"
  phone?: string;
  bookingUrl?: string;
  priceRange?: string;      // "$$ · From $189/night"
}

export interface WeddingSettings {
  coupleNames: string;            // "Alex & Jordan"
  person1Name: string;
  person2Name: string;
  weddingDate: Timestamp;
  venue: string;
  venueAddress: string;
  venueMapsUrl?: string;
  heroPhotoUrl?: string;
  ceremonyTime: string;           // display string "4:00 PM"
  receptionTime: string;
  rsvpDeadline: Timestamp;
  dressCode?: string;
  registryUrl?: string;
  websiteUrl: string;
  contactEmail?: string;

  story: CoupleStory[];
  faq: FaqItem[];
  accommodation: AccommodationItem[];
  galleryPhotoUrls: string[];

  parkingInfo?: string;
  nearestAirport?: string;

  // EmailJS overrides — falls back to environment.ts if empty
  emailjsServiceId?: string;
  emailjsTemplateId?: string;
  emailjsPublicKey?: string;
}

// Shapes used by CSV import
export interface ParsedGuestRow {
  rowNumber: number;
  label: string;
  firstName: string;
  lastName: string;
  email?: string;
  allowsPlusOne: boolean;
  errors: string[];
}

export interface InvitationWrite {
  label: string;
  allowsPlusOne: boolean;
  guests: { firstName: string; lastName: string; email?: string }[];
}
