'use client';

import Link from 'next/link';

export default function InfoButton() {
  return (
    <Link
      href="/rules"
      className="fixed top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm 
                 rounded-full shadow-md flex items-center justify-center 
                 text-teal-600 hover:bg-teal-50 transition-colors z-50"
      title="Game Rules"
    >
      <span className="font-bold text-lg">?</span>
    </Link>
  );
}
