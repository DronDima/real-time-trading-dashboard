import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';

import { Offer } from '../../models/offer';
import { tradingSessionAdapter, tradingSessionFeature } from './trading-session.reducer';

const selectRouterState = createFeatureSelector<RouterReducerState>('router');
const { selectRouteParam } = getRouterSelectors(selectRouterState);

const { selectTradingSessionState, selectLoading, selectError, selectCurrentSessionId } =
  tradingSessionFeature;

const { selectEntities: selectOfferEntities } = tradingSessionAdapter.getSelectors(
  selectTradingSessionState
);

export const selectSessionsMap = createSelector(
  selectTradingSessionState,
  state => state.sessions
);

export const selectOffersBySessionMap = createSelector(
  selectTradingSessionState,
  state => state.offersBySession
);

export const selectIsSessionLoaded = (sessionId: number) =>
  createSelector(selectSessionsMap, sessions => sessions[sessionId] != null);

export const selectCurrentSession = createSelector(
  selectSessionsMap,
  selectCurrentSessionId,
  (sessions, currentSessionId) => {
    if (currentSessionId == null) {
      return null;
    }

    return sessions[currentSessionId] ?? null;
  }
);

export const selectOffersForCurrentSession = createSelector(
  selectOffersBySessionMap,
  selectOfferEntities,
  selectCurrentSessionId,
  (offersBySession, offerEntities, currentSessionId): Offer[] => {
    if (currentSessionId == null) {
      return [];
    }

    const offerIds = offersBySession[currentSessionId] ?? [];
    return offerIds
      .map(id => offerEntities[id])
      .filter((offer): offer is Offer => offer != null);
  }
);

export const selectCurrentSessionViewModel = createSelector(
  selectCurrentSession,
  selectOffersForCurrentSession,
  (session, offers) => {
    if (session == null) {
      return null;
    }

    return {
      ...session,
      offers
    };
  }
);

export const selectSessionLoading = selectLoading;

export const selectSessionError = selectError;

export const selectRouteSessionId = createSelector(selectRouteParam('id'), id => {
  const sessionId = id ? Number(id) : null;
  return sessionId != null && !Number.isNaN(sessionId) ? sessionId : null;
});
