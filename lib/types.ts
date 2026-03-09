// Game types shared across the frontend

export type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
export type Rank = 'Ace' | 'King' | 'Queen' | 'Jack' | 'Ten' | 'Nine' | 'Eight' | 'Seven';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Play {
  player_id: number;
  card: Card;
}

export type GameStatus =
  | 'WaitingForPlayers'
  | 'WaitingForDeal'
  | 'WaitingForTrump'
  | 'Playing'
  | 'RoundEnd'
  | 'GameOver';

export type RoomMode = 'Multiplayer' | 'SinglePlayer';

export interface Player {
  id: number;
  username: string;
  identity: string;
  room_id: number;
  team: 'A' | 'B';
  seat_index: number;
  is_bot: boolean;
  is_connected: boolean;
}

export interface Room {
  id: number;
  room_code: string;
  status: GameStatus;
  mode: RoomMode;
  dealer_index: number;
  trump_selector_index: number;
  current_turn_index: number;
  trump_suit: Suit | null;
  previous_round_tied: boolean;
  hand_number: number;
}

export interface PlayerHand {
  player_id: number;
  cards: Card[];
}

export interface HandRecord {
  id: number;
  room_id: number;
  hand_number: number;
  plays: Play[];
  winner_id: number | null;
  leading_suit: Suit | null;
}

export interface Score {
  room_id: number;
  team_a_points: number;
  team_b_points: number;
  team_a_hands: number;
  team_b_hands: number;
}

export type TablePosition = 'bottom' | 'top' | 'left' | 'right';

export interface PlayerPosition {
  player: Player;
  position: TablePosition;
}
