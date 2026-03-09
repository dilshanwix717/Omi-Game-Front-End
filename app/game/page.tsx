"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GameTable from "@/components/GameTable";
import Lobby from "@/components/Lobby";
import InfoButton from "@/components/InfoButton";
import { useGameState } from "@/hooks/useGameState";
import { useSpacetimeDB } from "@/hooks/useSpacetimeDB";
import { soundManager } from "@/lib/sounds";
import type { Card, Suit, Player, Play } from "@/lib/types";

// Demo/offline state for single-player preview
function generateDemoState() {
  const suits: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const ranks = [
    "Ace",
    "King",
    "Queen",
    "Jack",
    "Ten",
    "Nine",
    "Eight",
    "Seven",
  ] as const;

  // Build full 32-card deck
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Deal 8 unique cards to each player — all 32 cards distributed, no repeats
  const hands = [
    deck.slice(0, 8),
    deck.slice(8, 16),
    deck.slice(16, 24),
    deck.slice(24, 32),
  ];

  return { hands };
}

// Helpers for demo mode
function getBestSuit(cards: Card[]): Suit {
  const counts: Record<Suit, number> = {
    Hearts: 0,
    Diamonds: 0,
    Clubs: 0,
    Spades: 0,
  };
  for (const c of cards) counts[c.suit]++;
  return (Object.entries(counts) as [Suit, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}

const RANK_ORDER: Record<string, number> = {
  Seven: 0,
  Eight: 1,
  Nine: 2,
  Ten: 3,
  Jack: 4,
  Queen: 5,
  King: 6,
  Ace: 7,
};

/** Resolve the winner of a hand using the same rules as the server. */
function resolveHandWinner(plays: Play[], trump: Suit): number {
  if (plays.length === 0) return plays[0]?.player_id ?? 0;
  const leadingSuit = plays[0].card.suit;
  let best = plays[0];
  for (const play of plays.slice(1)) {
    const challengerIsTrump = play.card.suit === trump;
    const currentIsTrump = best.card.suit === trump;
    const challengerFollowsLead = play.card.suit === leadingSuit;
    const currentFollowsLead = best.card.suit === leadingSuit;

    let challengerWins = false;
    if (challengerIsTrump && currentIsTrump) {
      challengerWins = RANK_ORDER[play.card.rank] > RANK_ORDER[best.card.rank];
    } else if (challengerIsTrump) {
      challengerWins = true;
    } else if (currentIsTrump) {
      challengerWins = false;
    } else if (challengerFollowsLead && currentFollowsLead) {
      challengerWins = RANK_ORDER[play.card.rank] > RANK_ORDER[best.card.rank];
    } else if (challengerFollowsLead) {
      challengerWins = true;
    }

    if (challengerWins) best = play;
  }
  return best.player_id;
}

/** Pick a card for a bot from its remaining hand, following the leading suit if possible. */
function pickBotCard(hand: Card[], plays: Play[]): Card {
  if (hand.length === 0) throw new Error("Bot has no cards");
  if (plays.length === 0) return hand[Math.floor(Math.random() * hand.length)];

  const leadingSuit = plays[0].card.suit;
  const suitCards = hand.filter((c) => c.suit === leadingSuit);
  const pool = suitCards.length > 0 ? suitCards : hand;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Calculate round points — mirrors the server's calculate_round_score. */
function calculateDemoRoundScore(
  teamAHands: number,
  teamBHands: number,
  trumpSelectorTeamIsA: boolean,
  previousRoundTied: boolean,
): { teamAPoints: number; teamBPoints: number; isTie: boolean } {
  if (teamAHands === 4 && teamBHands === 4) {
    return { teamAPoints: 0, teamBPoints: 0, isTie: true };
  }
  const teamAWins = teamAHands > teamBHands;
  const isKapothi = teamAHands === 8 || teamBHands === 8;
  const trumpTeamWon =
    (teamAWins && trumpSelectorTeamIsA) ||
    (!teamAWins && !trumpSelectorTeamIsA);
  let winnerPoints: number;
  if (isKapothi) {
    winnerPoints = trumpTeamWon ? 2 : 3;
  } else {
    winnerPoints = trumpTeamWon ? (previousRoundTied ? 2 : 1) : 2;
  }
  return {
    teamAPoints: teamAWins ? winnerPoints : 0,
    teamBPoints: teamAWins ? 0 : winnerPoints,
    isTie: false,
  };
}

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") ?? "single";
  const { callReducer } = useSpacetimeDB();
  const game = useGameState();

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Use refs for functions that need to reference each other (to avoid forward-reference issues)
  const gameRef = useRef(game);
  const simulateBotTurnRef = useRef<() => void>(() => {});
  const resolveHandRef = useRef<(plays: Play[]) => void>(() => {});
  // Demo mode: track all four players' hands by seat index (0-3) and trump
  const demoHandsRef = useRef<Card[][]>([[], [], [], []]);
  const demoTrumpRef = useRef<Suit>("Spades");
  // Demo mode: track previous-round-tied flag and points awarded this round
  const demoPrevRoundTiedRef = useRef(false);
  const demoPointsAwardedRef = useRef({ teamA: 0, teamB: 0 });

  // Keep gameRef synced
  useEffect(() => {
    gameRef.current = game;
  });

  // Keep resolveHandRef synced
  useEffect(() => {
    resolveHandRef.current = (plays: Play[]) => {
      const g = gameRef.current;
      if (!g.room) return;

      soundManager.playWinHand();

      // Determine winner using proper Omi rules (highest trump, then highest leading suit)
      const winnerId = resolveHandWinner(plays, demoTrumpRef.current);
      const winner = g.players.find((p) => p.id === winnerId);

      g.addHandRecord({
        id: Date.now(),
        room_id: g.room.id,
        hand_number: g.room.hand_number,
        plays,
        winner_id: winnerId,
        leading_suit: plays[0].card.suit,
      });

      if (g.score && winner) {
        const newScore = { ...g.score };
        if (winner.team === "A") {
          newScore.team_a_hands += 1;
        } else {
          newScore.team_b_hands += 1;
        }

        const nextHand = g.room.hand_number + 1;
        if (nextHand > 8) {
          // Round is over — calculate round points
          // Trump selector is seat 1 (Team B) in demo mode
          const roundResult = calculateDemoRoundScore(
            newScore.team_a_hands,
            newScore.team_b_hands,
            false, // trump selector is Team B
            demoPrevRoundTiedRef.current,
          );
          newScore.team_a_points += roundResult.teamAPoints;
          newScore.team_b_points += roundResult.teamBPoints;
          demoPointsAwardedRef.current = {
            teamA: roundResult.teamAPoints,
            teamB: roundResult.teamBPoints,
          };
          demoPrevRoundTiedRef.current = roundResult.isTie;
          g.updateScore(newScore);
          g.updateRoom({ ...g.room, status: "RoundEnd" });
          g.showToast("Round complete!");
        } else {
          g.updateScore(newScore);
          // Winner of the hand leads the next hand
          g.updateRoom({
            ...g.room,
            hand_number: nextHand,
            current_turn_index: winner.seat_index,
          });
          g.updateCurrentPlays([]);

          if (winner.is_bot) {
            setTimeout(() => simulateBotTurnRef.current(), 800);
          }
        }
      }
    };
  });

  // Keep simulateBotTurnRef synced
  useEffect(() => {
    simulateBotTurnRef.current = () => {
      const g = gameRef.current;
      if (!g.room || g.room.status !== "Playing") return;

      const currentSeat = g.room.current_turn_index;
      const currentPlayer = g.players.find((p) => p.seat_index === currentSeat);
      if (!currentPlayer?.is_bot) return;

      // Pick a card from the bot's actual hand, following leading suit if possible
      const botHand = demoHandsRef.current[currentSeat];
      if (botHand.length === 0) return;

      const playedCard = pickBotCard(botHand, g.currentPlays);

      // Remove played card from bot's hand
      demoHandsRef.current[currentSeat] = botHand.filter(
        (c) => !(c.suit === playedCard.suit && c.rank === playedCard.rank),
      );

      const newPlays = [
        ...g.currentPlays,
        { player_id: currentPlayer.id, card: playedCard },
      ];
      g.updateCurrentPlays(newPlays);

      soundManager.playCard();

      const nextTurn = (currentSeat + 1) % 4;
      g.updateRoom({ ...g.room, current_turn_index: nextTurn });

      if (newPlays.length < 4) {
        const nextPlayer = g.players.find((p) => p.seat_index === nextTurn);
        if (nextPlayer?.is_bot) {
          setTimeout(() => simulateBotTurnRef.current(), 600);
        }
      } else {
        setTimeout(() => resolveHandRef.current(newPlays), 1200);
      }
    };
  });

  // Get username from session
  const username =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("omi_username") ?? "Player")
      : "Player";

  // Initialize demo game state for single-player
  useEffect(() => {
    if (mode !== "single" || gameRef.current.room) return;

    const g = gameRef.current;
    const demoPlayers: Player[] = [
      {
        id: 1,
        username,
        identity: "",
        room_id: 1,
        team: "A",
        seat_index: 0,
        is_bot: false,
        is_connected: true,
      },
      {
        id: 2,
        username: "Bot 1",
        identity: "",
        room_id: 1,
        team: "B",
        seat_index: 1,
        is_bot: true,
        is_connected: true,
      },
      {
        id: 3,
        username: "Bot 2",
        identity: "",
        room_id: 1,
        team: "A",
        seat_index: 2,
        is_bot: true,
        is_connected: true,
      },
      {
        id: 4,
        username: "Bot 3",
        identity: "",
        room_id: 1,
        team: "B",
        seat_index: 3,
        is_bot: true,
        is_connected: true,
      },
    ];
    g.updatePlayers(demoPlayers);
    g.setMyPlayerId(1);
    g.updateRoom({
      id: 1,
      room_code: "DEMO",
      status: "WaitingForDeal",
      mode: "SinglePlayer",
      dealer_index: 0,
      trump_selector_index: 1,
      current_turn_index: 0,
      trump_suit: null,
      previous_round_tied: false,
      hand_number: 0,
    });
    g.updateScore({
      room_id: 1,
      team_a_points: 0,
      team_b_points: 0,
      team_a_hands: 0,
      team_b_hands: 0,
    });
  }, [mode, username]);

  // Handle deal
  const handleDeal = useCallback(() => {
    soundManager.playShuffle();

    if (mode === "single") {
      const g = gameRef.current;
      // Deal all 32 unique cards across 4 players (8 each, no repeats)
      const { hands } = generateDemoState();
      g.updateMyHand(hands[0]);
      // Store all hands (including bots) so bots play from their actual dealt cards
      demoHandsRef.current = [hands[0], hands[1], hands[2], hands[3]];
      const botTrumpSuit = getBestSuit(hands[1]);
      demoTrumpRef.current = botTrumpSuit;
      g.updateRoom({
        ...g.room!,
        status: "Playing",
        trump_suit: botTrumpSuit,
        current_turn_index: 1,
        hand_number: 1,
      });
      g.clearHandHistory();

      setTimeout(() => simulateBotTurnRef.current(), 800);
    } else {
      callReducer("dealer_click_deal", gameRef.current.room?.id);
    }
  }, [mode, callReducer]);

  // Handle trump selection
  const handleSelectTrump = useCallback(
    (suit: Suit) => {
      soundManager.playTrumpSelect();
      if (mode === "single") {
        const g = gameRef.current;
        g.updateRoom({
          ...g.room!,
          trump_suit: suit,
          status: "Playing",
          current_turn_index: g.room!.trump_selector_index,
        });
      } else {
        callReducer("select_trump", gameRef.current.room?.id, suit);
      }
    },
    [mode, callReducer],
  );

  // Handle card play
  const handlePlayCard = useCallback(
    (card: Card) => {
      if (mode === "single") {
        const g = gameRef.current;
        const newHand = g.myHand.filter(
          (c) => !(c.suit === card.suit && c.rank === card.rank),
        );
        g.updateMyHand(newHand);
        // Keep demo hands ref in sync with human player's hand after they play
        demoHandsRef.current[0] = newHand;

        const newPlays = [...g.currentPlays, { player_id: 1, card }];
        g.updateCurrentPlays(newPlays);

        const nextTurn = (g.room!.current_turn_index + 1) % 4;
        g.updateRoom({ ...g.room!, current_turn_index: nextTurn });

        if (newPlays.length < 4) {
          setTimeout(() => simulateBotTurnRef.current(), 600);
        } else {
          setTimeout(() => resolveHandRef.current(newPlays), 1200);
        }
      } else {
        callReducer("play_card", gameRef.current.room?.id, card);
      }
    },
    [mode, callReducer],
  );

  const handleDismissToast = useCallback(() => {
    gameRef.current.dismissToast();
  }, []);

  // Handle continuing to the next round after round summary
  const handleContinue = useCallback(() => {
    if (mode === "single") {
      const g = gameRef.current;
      if (g.score) {
        g.updateScore({ ...g.score, team_a_hands: 0, team_b_hands: 0 });
      }
      g.updateRoom({
        ...g.room!,
        status: "WaitingForDeal",
        trump_suit: null,
        hand_number: 0,
        current_turn_index: 0,
      });
      g.clearHandHistory();
      g.updateCurrentPlays([]);
    } else {
      // In multiplayer, server handles round transition automatically
    }
  }, [mode]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      soundManager.setEnabled(!prev);
      return !prev;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-orange-100">
      <InfoButton />

      {/* Sound Toggle */}
      <button
        onClick={toggleSound}
        className="fixed top-4 right-16 z-50 w-10 h-10 glass rounded-full shadow-md 
                   flex items-center justify-center hover:bg-white/80 transition-colors"
        aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>

      {/* Game View */}
      {game.room?.status === "WaitingForPlayers" ? (
        <div className="min-h-screen flex items-center justify-center">
          <Lobby
            roomCode={game.room.room_code}
            players={game.players}
            myPlayer={game.myPlayer}
            isDealer={game.myPlayer?.seat_index === game.room.dealer_index}
            onDeal={handleDeal}
            onLeave={() => router.push("/")}
          />
        </div>
      ) : (
        <GameTable
          room={game.room}
          players={game.players}
          myPlayer={game.myPlayer}
          myHand={game.myHand}
          currentPlays={game.currentPlays}
          score={game.score}
          handHistory={game.handHistory}
          onPlayCard={handlePlayCard}
          onSelectTrump={handleSelectTrump}
          onDeal={handleDeal}
          toastMessage={game.toastMessage}
          onDismissToast={handleDismissToast}
          onContinue={handleContinue}
          pointsAwarded={demoPointsAwardedRef.current}
        />
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-orange-100 
                      flex items-center justify-center"
        >
          <div className="glass rounded-2xl px-8 py-4">
            <p className="text-gray-500 animate-pulse-soft">Loading game...</p>
          </div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
