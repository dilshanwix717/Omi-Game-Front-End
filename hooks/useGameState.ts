'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Room, Player, Score, HandRecord, Card, Play, Suit } from '@/lib/types';
import { RANK_VALUES } from '@/lib/constants';

interface GameState {
  room: Room | null;
  players: Player[];
  myPlayerId: number | null;
  myHand: Card[];
  currentPlays: Play[];
  score: Score | null;
  handHistory: HandRecord[];
  toastMessage: string | null;
}

const initialState: GameState = {
  room: null,
  players: [],
  myPlayerId: null,
  myHand: [],
  currentPlays: [],
  score: null,
  handHistory: [],
  toastMessage: null,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  const updateRoom = useCallback((room: Room) => {
    setState((prev) => ({ ...prev, room }));
  }, []);

  const updatePlayers = useCallback((players: Player[]) => {
    setState((prev) => ({ ...prev, players }));
  }, []);

  const setMyPlayerId = useCallback((id: number) => {
    setState((prev) => ({ ...prev, myPlayerId: id }));
  }, []);

  const updateMyHand = useCallback((cards: Card[]) => {
    // Sort by suit then rank descending
    const suitOrder: Record<Suit, number> = { Spades: 0, Hearts: 1, Diamonds: 2, Clubs: 3 };
    const sorted = [...cards].sort((a, b) => {
      const sd = suitOrder[a.suit] - suitOrder[b.suit];
      return sd !== 0 ? sd : RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
    });
    setState((prev) => ({ ...prev, myHand: sorted }));
  }, []);

  const updateCurrentPlays = useCallback((plays: Play[]) => {
    setState((prev) => ({ ...prev, currentPlays: plays }));
  }, []);

  const addPlay = useCallback((play: Play) => {
    setState((prev) => ({ ...prev, currentPlays: [...prev.currentPlays, play] }));
  }, []);

  const updateScore = useCallback((score: Score) => {
    setState((prev) => ({ ...prev, score }));
  }, []);

  const addHandRecord = useCallback((hand: HandRecord) => {
    setState((prev) => ({
      ...prev,
      handHistory: [...prev.handHistory, hand],
      currentPlays: [],
    }));
  }, []);

  const clearHandHistory = useCallback(() => {
    setState((prev) => ({ ...prev, handHistory: [] }));
  }, []);

  const showToast = useCallback((message: string) => {
    setState((prev) => ({ ...prev, toastMessage: message }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, toastMessage: null }));
    }, 2500);
  }, []);

  const dismissToast = useCallback(() => {
    setState((prev) => ({ ...prev, toastMessage: null }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Derived state
  const myPlayer = useMemo(
    () => state.players.find((p) => p.id === state.myPlayerId) ?? null,
    [state.players, state.myPlayerId]
  );

  const isMyTurn = useMemo(() => {
    if (!myPlayer || !state.room) return false;
    return state.room.status === 'Playing' && state.room.current_turn_index === myPlayer.seat_index;
  }, [myPlayer, state.room]);

  const playableCards = useMemo((): Card[] => {
    if (!isMyTurn || state.currentPlays.length >= 4) return [];
    if (state.currentPlays.length === 0) return state.myHand;
    const leadingSuit = state.currentPlays[0].card.suit;
    const hasLeading = state.myHand.some((c) => c.suit === leadingSuit);
    return hasLeading ? state.myHand.filter((c) => c.suit === leadingSuit) : state.myHand;
  }, [isMyTurn, state.myHand, state.currentPlays]);

  return {
    ...state,
    myPlayer,
    isMyTurn,
    playableCards,
    updateRoom,
    updatePlayers,
    setMyPlayerId,
    updateMyHand,
    updateCurrentPlays,
    addPlay,
    updateScore,
    addHandRecord,
    clearHandHistory,
    showToast,
    dismissToast,
    resetState,
  };
}
