import { Offer } from "./offer";

export interface OfferBatchPayload {
  created: Offer[];
  updated: Offer[];
  deleted: number[];
}

export type SocketEvent =
  | { type: 'OFFER_CREATED'; payload: Offer }
  | { type: 'OFFER_UPDATED'; payload: Offer }
  | { type: 'OFFER_DELETED'; payload: { id: number } }
  | { type: 'OFFER_BATCH'; payload: OfferBatchPayload };
