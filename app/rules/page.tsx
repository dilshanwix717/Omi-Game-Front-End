'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SUIT_SYMBOLS } from '@/lib/constants';

type Tab = 'rules' | 'scoring' | 'tutorial';

export default function RulesPage() {
  const [tab, setTab] = useState<Tab>('rules');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'rules', label: 'Rules', icon: '📜' },
    { id: 'scoring', label: 'Scoring', icon: '🏆' },
    { id: 'tutorial', label: 'Tutorial', icon: '🎓' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-orange-100 p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto glass rounded-3xl shadow-xl p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🃏 Omi Rules</h1>
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all
                         ${tab === t.id
                  ? 'bg-teal-400 text-white shadow-md'
                  : 'bg-white/50 text-gray-500 hover:bg-white/80'}`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5 text-gray-700 text-sm leading-relaxed"
          >
            {tab === 'rules' && <RulesContent />}
            {tab === 'scoring' && <ScoringContent />}
            {tab === 'tutorial' && <TutorialContent />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function RulesContent() {
  return (
    <>
      <Section title="Overview">
        <p>
          Omi is a classic Sri Lankan trick-taking card game for <strong>4 players</strong> in
          <strong> 2 teams</strong>. It uses a <strong>32-card deck</strong> (7 through Ace in each suit).
          The goal is to reach <strong>10 points</strong> first.
        </p>
      </Section>

      <Section title="Teams &amp; Seating">
        <p>
          Players sit in alternating positions around the table. Player 1 &amp; Player 3 form
          <span className="text-teal-600 font-medium"> Team A</span>; Player 2 &amp; Player 4 form
          <span className="text-orange-500 font-medium"> Team B</span>. Teammates sit across from each other.
        </p>
      </Section>

      <Section title="Dealing">
        <p>
          The dealer shuffles and deals <strong>4 cards</strong> to each player. The player to
          the dealer&apos;s left selects the trump suit based on these cards. Then the remaining
          <strong> 4 cards</strong> are dealt to each player (8 total per player).
        </p>
      </Section>

      <Section title="Card Ranking">
        <div className="flex items-center gap-2 flex-wrap">
          {['A', 'K', 'Q', 'J', '10', '9', '8', '7'].map((r, i) => (
            <span key={r} className="px-2 py-1 bg-white/60 rounded-lg text-xs font-mono">
              {r}{i < 7 ? ' >' : ''}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">Ace is highest, Seven is lowest</p>
      </Section>

      <Section title="Playing Hands">
        <ul className="list-disc list-inside space-y-1.5">
          <li>The trump selector leads the first hand</li>
          <li>Players must follow the leading suit if they have cards of that suit</li>
          <li>If you don&apos;t have the leading suit, you may play any card (including trump)</li>
          <li>The highest card of the leading suit wins, unless a trump card is played</li>
          <li>Trump cards beat all non-trump cards</li>
          <li>The hand winner leads the next hand</li>
          <li>Each round consists of <strong>8 hands</strong></li>
        </ul>
      </Section>

      <Section title="Suits">
        <div className="flex gap-4">
          {(['Hearts', 'Diamonds', 'Clubs', 'Spades'] as const).map((suit) => (
            <div key={suit} className="flex items-center gap-1.5">
              <span className={`text-xl ${suit === 'Hearts' || suit === 'Diamonds' ? 'text-red-500' : 'text-gray-800'}`}>
                {SUIT_SYMBOLS[suit]}
              </span>
              <span className="text-xs text-gray-500">{suit}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function ScoringContent() {
  return (
    <>
      <Section title="Round Scoring">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 pr-4">Situation</th>
                <th className="text-right py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Trump-selecting team wins', '1'],
                ['Trump-selecting team wins (after previous tie)', '2'],
                ['Non-trump-selecting team wins', '2'],
                ['Kapothi (8-0) by trump team', '2'],
                ['Kapothi (8-0) by non-trump team', '3'],
                ['Tie (4-4 hands)', '0 (next round worth double)'],
              ].map(([situation, points]) => (
                <tr key={situation} className="border-b border-gray-100">
                  <td className="py-2.5 pr-4">{situation}</td>
                  <td className="text-right py-2.5 font-medium">{points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Kapothi (කපෝති)">
        <p>
          When a team wins all 8 hands in a round, it&apos;s called <strong>Kapothi</strong>.
          This is worth extra points — 2 if the trump-selecting team achieves it, or 3 if the
          opposing team does.
        </p>
      </Section>

      <Section title="Winning the Game">
        <p>
          The first team to reach <strong>10 points</strong> wins. The dealer rotates
          clockwise after each round, giving each player a chance to deal and their
          left neighbor a chance to select trump.
        </p>
      </Section>

      <Section title="Tie Rounds">
        <p>
          If both teams win exactly 4 hands each (a tie), no points are awarded.
          However, the <strong>next round&apos;s winner</strong> gets double points
          (2 instead of 1 if the trump team wins).
        </p>
      </Section>
    </>
  );
}

function TutorialContent() {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: '1. Starting a Game',
      content: 'Enter your name on the home screen and choose "Play vs Computer" to start a single-player game with 3 AI bots. For multiplayer, create a private room and share the code with friends.',
    },
    {
      title: '2. The Deal',
      content: 'When it\'s your turn to deal (shown by the 🎴 icon), click "Deal Cards". The server shuffles and deals 4 cards to each player. The player to your left then selects the trump suit.',
    },
    {
      title: '3. Selecting Trump',
      content: 'If you\'re the trump selector, you\'ll see your first 4 cards and must choose a suit as trump. Pick the suit you have the most cards of, or the one with the highest cards. Trump cards beat all other suits!',
    },
    {
      title: '4. Playing Cards',
      content: 'Cards with a golden glow are playable. Click a highlighted card to play it. You must follow the leading suit if you can. If you can\'t, you may play any card — including a trump card to win the hand.',
    },
    {
      title: '5. Winning Hands',
      content: 'The highest card of the leading suit wins the hand, unless someone plays a trump card. The hand winner leads the next hand. Win 5+ hands to win the round!',
    },
    {
      title: '6. Strategy Tips',
      content: 'Save your trump cards for critical moments. If your teammate is winning the hand, play a low card. Lead with aces of non-trump suits early. Track which cards have been played!',
    },
  ];

  return (
    <>
      <div className="flex gap-1.5 mb-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= step ? 'bg-teal-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Section title={steps[step].title}>
            <p>{steps[step].content}</p>
          </Section>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-gray-500 hover:text-teal-600 disabled:opacity-30 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="px-4 py-2 text-sm bg-teal-400 text-white rounded-xl hover:bg-teal-500 disabled:opacity-30 transition-colors"
        >
          Next →
        </button>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      {children}
    </section>
  );
}
