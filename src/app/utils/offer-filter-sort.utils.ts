import { Offer } from '../models/offer';

export type SortColumn = 'id' | 'product' | 'price' | 'volume' | 'updatedAt';
export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: SortColumn | null;
  direction: SortDirection;
}

export interface FilterState {
  text: string;
}


export function filterOffers(offers: Offer[], filterText: string): Offer[] {
  const filter = filterText.trim().toLowerCase();
  if (!filter) {
    return offers;
  }

  return offers.filter(offer => {
    return (
      offer.id.toString().includes(filter) ||
      offer.product.toLowerCase().includes(filter) ||
      offer.price.toString().includes(filter) ||
      offer.volume.toString().includes(filter)
    );
  });
}


export function sortOffers(offers: Offer[], column: SortColumn | null, direction: SortDirection): Offer[] {
  if (!column || !direction) {
    return offers;
  }

  return [...offers].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (column) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'product':
        aValue = a.product.toLowerCase();
        bValue = b.product.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterAndSortOffers(
  offers: Offer[],
  filterText: string,
  sortColumn: SortColumn | null,
  sortDirection: SortDirection
): Offer[] {
  let result = filterOffers(offers, filterText);
  result = sortOffers(result, sortColumn, sortDirection);
  return result;
}


export function getNextSortState(
  currentColumn: SortColumn | null,
  currentDirection: SortDirection,
  clickedColumn: SortColumn
): SortState {
  if (currentColumn === clickedColumn) {
    if (currentDirection === 'asc') {
      return { column: clickedColumn, direction: 'desc' };
    } else if (currentDirection === 'desc') {
      return { column: null, direction: null };
    }
  }
  return { column: clickedColumn, direction: 'asc' };
}
