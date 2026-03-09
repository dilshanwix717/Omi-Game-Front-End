"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Card as CardType, Play, Player, Suit } from "@/lib/types";
import { SUIT_SYMBOLS } from "@/lib/constants";
import CardComponent from "./Card";
import PlayerHand from "./PlayerHand";
import ScoreBoard from "./ScoreBoard";
import TrumpSelector from "./TrumpSelector";
import HandHistory from "./HandHistory";
import RoundSummary from "./RoundSummary";
import Toast from "./Toast";
import { soundManager } from "@/lib/sounds";

interface GameTableProps {
  room: {
    status: string;
    current_turn_index: number;
    trump_suit: string | null;
    trump_selector_index: number;
    dealer_index: number;
    hand_number: number;
  } | null;
  players: Player[];
  myPlayer: Player | null;
  myHand: CardType[];
  currentPlays: Play[];
  score: {
    team_a_points: number;
    team_b_points: number;
    team_a_hands: number;
    team_b_hands: number;
  } | null;
  handHistory: {
    id: number;
    room_id: number;
    hand_number: number;
    plays: Play[];
    winner_id: number | null;
    leading_suit: string | null;
  }[];
  onPlayCard: (card: CardType) => void;
  onSelectTrump: (suit: Suit) => void;
  onDeal: () => void;
  toastMessage: string | null;
  onDismissToast: () => void;
  onContinue?: () => void;
  pointsAwarded?: { teamA: number; teamB: number };
  isSpectator?: boolean;
}

type TablePosition = "bottom" | "top" | "left" | "right";

function getPlayerPosition(mySeat: number, playerSeat: number): TablePosition {
  const diff = (playerSeat - mySeat + 4) % 4;
  const positions: TablePosition[] = ["bottom", "left", "top", "right"];
  return positions[diff];
}

export default function GameTable({
  room,
  players,
  myPlayer,
  myHand,
  currentPlays,
  score,
  handHistory,
  onPlayCard,
  onSelectTrump,
  onDeal,
  toastMessage,
  onDismissToast,
  onContinue,
  pointsAwarded,
  isSpectator = false,
}: GameTableProps) {
  const [invalidCard, setInvalidCard] = useState<CardType | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const mySeat = myPlayer?.seat_index ?? 0;
  const isMyTurn =
    room?.status === "Playing" && room?.current_turn_index === mySeat;

  // Determine playable cards
  const getPlayableCards = (): CardType[] => {
    if (!isMyTurn || currentPlays.length >= 4) return [];
    if (currentPlays.length === 0) return myHand;
    const leadingSuit = currentPlays[0].card.suit;
    const hasLeading = myHand.some((c) => c.suit === leadingSuit);
    return hasLeading ? myHand.filter((c) => c.suit === leadingSuit) : myHand;
  };

  const playableCards = getPlayableCards();

  const handlePlayCard = (card: CardType) => {
    const isPlayable = playableCards.some(
      (c) => c.suit === card.suit && c.rank === card.rank,
    );
    if (!isPlayable) {
      setInvalidCard(card);
      soundManager.playError();
      setTimeout(() => setInvalidCard(null), 600);
      return;
    }
    soundManager.playCard();
    onPlayCard(card);
  };

  // Map players to positions
  const positionedPlayers = players.map((p) => ({
    player: p,
    position: getPlayerPosition(mySeat, p.seat_index),
  }));

  const getPlayerAtPosition = (pos: TablePosition) =>
    positionedPlayers.find((pp) => pp.position === pos)?.player;

  const topPlayer = getPlayerAtPosition("top");
  const leftPlayer = getPlayerAtPosition("left");
  const rightPlayer = getPlayerAtPosition("right");

  const isActivePlayer = (seatIndex: number) =>
    room?.status === "Playing" && room.current_turn_index === seatIndex;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-orange-100 overflow-hidden">
      {/* Score */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <ScoreBoard score={score} trumpSuit={room?.trump_suit as Suit | null} />
      </div>

      {/* Toast */}
      <Toast
        message={toastMessage ?? ""}
        visible={!!toastMessage}
        onHide={onDismissToast}
      />

      {/* Spectator Badge */}
      {isSpectator && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 
                        glass px-4 py-1.5 rounded-full text-sm text-gray-600 font-medium"
        >
          👁 Spectating
        </div>
      )}

      {/* Hand History Toggle */}
      <button
        onClick={() => setHistoryOpen(!historyOpen)}
        className="absolute top-4 left-4 z-20 w-10 h-10 glass rounded-full shadow-md
                   flex items-center justify-center text-teal-700 hover:bg-white/80 transition-colors"
        aria-label="Toggle hand history"
      >
        📋
      </button>

      {/* Hand History Panel */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="absolute top-16 left-4 z-30 w-64"
          >
            <HandHistory hands={handHistory} players={players} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Table Area ─────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-[90vw] max-w-3xl h-[65vh] max-h-[500px] 
                        bg-green-700/20 backdrop-blur-sm rounded-[2rem] 
                        shadow-xl border border-white/30"
        >
          {/* ─── Top Player ─────────────────────────────────────── */}
          {topPlayer && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <PlayerLabel
                name={topPlayer.username}
                isBot={topPlayer.is_bot}
                isActive={isActivePlayer(topPlayer.seat_index)}
                team={topPlayer.team}
                isDealer={room?.dealer_index === topPlayer.seat_index}
              />
              <div className="flex gap-0.5">
                {Array.from({
                  length: Math.max(0, myHand.length > 0 ? myHand.length : 4),
                }).map((_, i) => (
                  <CardComponent key={i} faceDown small delay={i * 0.05} />
                ))}
              </div>
            </div>
          )}

          {/* ─── Left Player ────────────────────────────────────── */}
          {leftPlayer && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <PlayerLabel
                name={leftPlayer.username}
                isBot={leftPlayer.is_bot}
                isActive={isActivePlayer(leftPlayer.seat_index)}
                team={leftPlayer.team}
                isDealer={room?.dealer_index === leftPlayer.seat_index}
              />
              <div className="flex flex-col gap-0.5">
                {Array.from({
                  length: Math.max(0, myHand.length > 0 ? myHand.length : 4),
                }).map((_, i) => (
                  <CardComponent key={i} faceDown small delay={i * 0.05} />
                ))}
              </div>
            </div>
          )}

          {/* ─── Right Player ───────────────────────────────────── */}
          {rightPlayer && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <PlayerLabel
                name={rightPlayer.username}
                isBot={rightPlayer.is_bot}
                isActive={isActivePlayer(rightPlayer.seat_index)}
                team={rightPlayer.team}
                isDealer={room?.dealer_index === rightPlayer.seat_index}
              />
              <div className="flex flex-col gap-0.5">
                {Array.from({
                  length: Math.max(0, myHand.length > 0 ? myHand.length : 4),
                }).map((_, i) => (
                  <CardComponent key={i} faceDown small delay={i * 0.05} />
                ))}
              </div>
            </div>
          )}

          {/* ─── Center: Played Cards ───────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="glass rounded-2xl p-4 min-w-[200px] min-h-[120px]
                          flex items-center justify-center gap-3"
            >
              <AnimatePresence mode="popLayout">
                {currentPlays.map((play) => {
                  const player = players.find((p) => p.id === play.player_id);
                  return (
                    <motion.div
                      key={`${play.card.suit}-${play.card.rank}`}
                      initial={{ opacity: 0, scale: 0.3, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className="flex flex-col items-center gap-1"
                    >
                      <CardComponent card={play.card} animate={false} />
                      <span className="text-[10px] text-gray-500 truncate max-w-[60px]">
                        {player?.username}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {currentPlays.length === 0 && room?.status === "Playing" && (
                <p className="text-gray-400 text-sm">Waiting for play...</p>
              )}
            </div>
          </div>

          {/* Trump indicator */}
          {room?.trump_suit && (
            <div className="absolute top-3 right-3 glass rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Trump</span>
              <span
                className={`text-lg ${room.trump_suit === "Hearts" || room.trump_suit === "Diamonds" ? "text-red-500" : "text-gray-800"}`}
              >
                {SUIT_SYMBOLS[room.trump_suit as Suit]}
              </span>
            </div>
          )}

          {/* Hand number */}
          {room?.status === "Playing" && (
            <div className="absolute bottom-3 right-3 glass rounded-xl px-3 py-1.5">
              <span className="text-xs text-gray-500">
                Hand {room.hand_number}/8
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom: My Hand ────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 pb-4 px-4">
        {myPlayer && (
          <div className="flex flex-col items-center gap-2">
            <PlayerLabel
              name={myPlayer.username}
              isBot={false}
              isActive={isMyTurn}
              team={myPlayer.team}
              isDealer={room?.dealer_index === myPlayer.seat_index}
              large
            />
            {room?.status === "Playing" && (
              <PlayerHand
                cards={myHand}
                onPlayCard={handlePlayCard}
                playableCards={playableCards}
                isCurrentTurn={isMyTurn}
                invalidCard={invalidCard}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Overlays ───────────────────────────────────────────── */}

      {/* Deal Button */}
      {room?.status === "WaitingForDeal" && (
        <CenterOverlay>
          <motion.button
            onClick={() => {
              soundManager.playShuffle();
              onDeal();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-teal-400 hover:bg-teal-500 text-white 
                       rounded-2xl shadow-lg text-lg font-semibold transition-colors"
          >
            🃏 Deal Cards
          </motion.button>
        </CenterOverlay>
      )}

      {/* Trump Selection */}
      {room?.status === "WaitingForTrump" &&
        room.trump_selector_index === mySeat && (
          <CenterOverlay>
            <TrumpSelector
              onSelect={(suit) => {
                soundManager.playTrumpSelect();
                onSelectTrump(suit);
              }}
            />
          </CenterOverlay>
        )}

      {/* Waiting for trump (other player selecting) */}
      {room?.status === "WaitingForTrump" &&
        room.trump_selector_index !== mySeat && (
          <CenterOverlay>
            <div className="glass rounded-2xl px-8 py-6 text-center">
              <p className="text-gray-600 animate-pulse-soft">
                Waiting for{" "}
                {
                  players.find(
                    (p) => p.seat_index === room.trump_selector_index,
                  )?.username
                }{" "}
                to select trump...
              </p>
            </div>
          </CenterOverlay>
        )}

      {/* Game Over */}
      {room?.status === "GameOver" && score && (
        <CenterOverlay>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl p-8 text-center max-w-sm"
          >
            <h2 className="text-3xl font-bold mb-2">
              {score.team_a_points >= 10
                ? "🎉 Team A Wins!"
                : "🎉 Team B Wins!"}
            </h2>
            <p className="text-gray-600 mb-4">
              Final Score: {score.team_a_points} – {score.team_b_points}
            </p>
            <p className="text-sm text-gray-400">
              {myPlayer &&
              ((myPlayer.team === "A" && score.team_a_points >= 10) ||
                (myPlayer.team === "B" && score.team_b_points >= 10))
                ? "Congratulations! 🏆"
                : "Better luck next time!"}
            </p>
          </motion.div>
        </CenterOverlay>
      )}

      {/* Round End Summary */}
      <RoundSummary
        visible={room?.status === "RoundEnd" && !!score}
        teamAHands={score?.team_a_hands ?? 0}
        teamBHands={score?.team_b_hands ?? 0}
        teamAPoints={score?.team_a_points ?? 0}
        teamBPoints={score?.team_b_points ?? 0}
        pointsAwarded={pointsAwarded ?? { teamA: 0, teamB: 0 }}
        isKapothi={
          (score?.team_a_hands === 8 || score?.team_b_hands === 8) ?? false
        }
        isTie={
          (score?.team_a_hands === 4 && score?.team_b_hands === 4) ?? false
        }
        onContinue={onContinue ?? (() => {})}
      />

      {/* Waiting for Players */}
      {room?.status === "WaitingForPlayers" && (
        <CenterOverlay>
          <div className="glass rounded-2xl px-8 py-6 text-center">
            <p className="text-gray-600 animate-pulse-soft">
              Waiting for players ({players.length}/4)...
            </p>
          </div>
        </CenterOverlay>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CenterOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/10 backdrop-blur-[2px]">
      {children}
    </div>
  );
}

function PlayerLabel({
  name,
  isBot,
  isActive,
  team,
  isDealer,
  large = false,
}: {
  name: string;
  isBot: boolean;
  isActive: boolean;
  team: string;
  isDealer: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300
                     ${isActive ? "bg-yellow-200/80 shadow-md shadow-yellow-300/30" : "glass"}
                     ${large ? "px-4 py-1.5" : ""}`}
    >
      {isDealer && (
        <span className="text-xs" title="Dealer">
          🎴
        </span>
      )}
      <span
        className={`font-medium truncate max-w-[80px] ${large ? "text-sm" : "text-xs"} 
                        ${team === "A" ? "text-teal-700" : "text-orange-600"}`}
      >
        {name}
      </span>
      {isBot && <span className="text-xs opacity-60">🤖</span>}
    </div>
  );
}
