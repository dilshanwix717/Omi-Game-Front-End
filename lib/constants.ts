import type { Suit, Rank } from './types';

export const SUITS: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

export const RANKS: Rank[] = ['Ace', 'King', 'Queen', 'Jack', 'Ten', 'Nine', 'Eight', 'Seven'];

export const RANK_VALUES: Record<Rank, number> = {
  Ace: 7,
  King: 6,
  Queen: 5,
  Jack: 4,
  Ten: 3,
  Nine: 2,
  Eight: 1,
  Seven: 0,
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  Hearts: '♥',
  Diamonds: '♦',
  Clubs: '♣',
  Spades: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
  Hearts: 'text-red-500',
  Diamonds: 'text-red-500',
  Clubs: 'text-gray-900',
  Spades: 'text-gray-900',
};

export const WINNING_POINTS = 10;
export const CARDS_PER_DEAL_PHASE = 4;
export const TOTAL_CARDS_PER_PLAYER = 8;
export const HANDS_PER_ROUND = 8;
export const TOTAL_PLAYERS = 4;

export const TEAM_ASSIGNMENTS = {
  A: [0, 2], // Player 1 & Player 3 (bottom & top)
  B: [1, 3], // Player 2 & Player 4 (left & right)
};
