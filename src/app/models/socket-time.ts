import { Offer } from "./offer";

type SocketEvent =
  | { type: 'OFFER_CREATED'; payload: Offer }
  | { type: 'OFFER_UPDATED'; payload: Offer }
  | { type: 'OFFER_DELETED'; payload: { id: number } };