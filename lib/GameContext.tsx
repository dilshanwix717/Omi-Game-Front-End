'use client';

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Room, Player, Score, HandRecord, Card, Play } from '@/lib/types';

// ─── State ─────────────────────────────────────────────────────────────────────

interface GameState {
  room: Room | null;
  players: Player[];
  myPlayerId: number | null;
  myHand: Card[];
  currentPlays: Play[];
  score: Score | null;
  handHistory: HandRecord[];
  toastMessage: string | null;
  isConnected: boolean;
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
  isConnected: false,
};

// ─── Actions ───────────────────────────────────────────────────────────────────

type GameAction =
  | { type: 'SET_ROOM'; room: Room }
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'SET_MY_PLAYER_ID'; id: number }
  | { type: 'SET_MY_HAND'; cards: Card[] }
  | { type: 'SET_CURRENT_PLAYS'; plays: Play[] }
  | { type: 'ADD_PLAY'; play: Play }
  | { type: 'SET_SCORE'; score: Score }
  | { type: 'ADD_HAND_RECORD'; record: HandRecord }
  | { type: 'CLEAR_HAND_HISTORY' }
  | { type: 'SET_TOAST'; message: string | null }
  | { type: 'SET_CONNECTED'; connected: boolean }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, room: action.room };
    case 'SET_PLAYERS':
      return { ...state, players: action.players };
    case 'SET_MY_PLAYER_ID':
      return { ...state, myPlayerId: action.id };
    case 'SET_MY_HAND':
      return { ...state, myHand: action.cards };
    case 'SET_CURRENT_PLAYS':
      return { ...state, currentPlays: action.plays };
    case 'ADD_PLAY':
      return { ...state, currentPlays: [...state.currentPlays, action.play] };
    case 'SET_SCORE':
      return { ...state, score: action.score };
    case 'ADD_HAND_RECORD':
      return { ...state, handHistory: [...state.handHistory, action.record] };
    case 'CLEAR_HAND_HISTORY':
      return { ...state, handHistory: [] };
    case 'SET_TOAST':
      return { ...state, toastMessage: action.message };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.connected };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  showToast: (msg: string) => void;
  getMyPlayer: () => Player | undefined;
  getPlayerBySeat: (seat: number) => Player | undefined;
  isMyTurn: () => boolean;
  getPlayableCards: () => Card[];
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const showToast = useCallback((msg: string) => {
    dispatch({ type: 'SET_TOAST', message: msg });
    setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), 2500);
  }, []);

  const getMyPlayer = useCallback(() => {
    return state.players.find((p) => p.id === state.myPlayerId);
  }, [state.players, state.myPlayerId]);

  const getPlayerBySeat = useCallback(
    (seat: number) => state.players.find((p) => p.seat_index === seat),
    [state.players]
  );

  const isMyTurn = useCallback(() => {
    const me = getMyPlayer();
    return me != null && state.room?.current_turn_index === me.seat_index && state.room?.status === 'Playing';
  }, [state.room, getMyPlayer]);

  const getPlayableCards = useCallback(() => {
    if (!isMyTurn()) return [];
    if (state.currentPlays.length === 0) return state.myHand;

    const leadingSuit = state.currentPlays[0].card.suit;
    const hasLeadingSuit = state.myHand.some((c) => c.suit === leadingSuit);

    if (hasLeadingSuit) {
      return state.myHand.filter((c) => c.suit === leadingSuit);
    }
    return state.myHand;
  }, [state.myHand, state.currentPlays, isMyTurn]);

  return (
    <GameContext.Provider
      value={{ state, dispatch, showToast, getMyPlayer, getPlayerBySeat, isMyTurn, getPlayableCards }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
