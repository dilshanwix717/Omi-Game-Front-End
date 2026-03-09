'use client';

import { useCallback, useRef } from 'react';
import gsap from 'gsap';
import { soundManager } from '@/lib/sounds';

export function useAnimations() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const playShuffleAnimation = useCallback(async (deckElement?: HTMLElement | null) => {
    if (!deckElement) return;
    soundManager.playShuffle();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    tl.to(deckElement, { rotation: 5, duration: 0.1, ease: 'power1.inOut' })
      .to(deckElement, { rotation: -5, duration: 0.1, ease: 'power1.inOut' })
      .to(deckElement, { rotation: 3, duration: 0.1, ease: 'power1.inOut' })
      .to(deckElement, { rotation: -3, duration: 0.1, ease: 'power1.inOut' })
      .to(deckElement, { rotation: 0, duration: 0.15, ease: 'power2.out' });

    return new Promise<void>((resolve) => tl.eventCallback('onComplete', resolve));
  }, []);

  const playDealAnimation = useCallback(async (
    cardElements: HTMLElement[],
    targets: { x: number; y: number }[],
  ) => {
    soundManager.playDeal();

    const tl = gsap.timeline();
    timelineRef.current = tl;

    cardElements.forEach((card, i) => {
      const target = targets[i % targets.length];
      tl.fromTo(
        card,
        { opacity: 0, x: 0, y: 0, scale: 0.5 },
        { opacity: 1, x: target.x, y: target.y, scale: 1, duration: 0.3, ease: 'back.out(1.4)' },
        i * 0.08,
      );
    });

    return new Promise<void>((resolve) => tl.eventCallback('onComplete', resolve));
  }, []);

  const playCardToCenter = useCallback(async (
    cardElement: HTMLElement,
    centerX: number,
    centerY: number,
  ) => {
    soundManager.playCard();

    return new Promise<void>((resolve) => {
      gsap.to(cardElement, {
        x: centerX,
        y: centerY,
        scale: 1.1,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(cardElement, { scale: 1, duration: 0.15 });
          resolve();
        },
      });
    });
  }, []);

  const playCollectAnimation = useCallback(async (
    cardElements: HTMLElement[],
    winnerPosition: { x: number; y: number },
  ) => {
    soundManager.playWinHand();

    const tl = gsap.timeline({ delay: 0.5 });
    timelineRef.current = tl;

    cardElements.forEach((card, i) => {
      tl.to(
        card,
        {
          x: winnerPosition.x,
          y: winnerPosition.y,
          opacity: 0,
          scale: 0.3,
          rotation: (i - 1.5) * 15,
          duration: 0.4,
          ease: 'power2.in',
        },
        i * 0.05,
      );
    });

    return new Promise<void>((resolve) => tl.eventCallback('onComplete', resolve));
  }, []);

  const playRoundCollect = useCallback(async (container?: HTMLElement | null) => {
    if (!container) return;

    return new Promise<void>((resolve) => {
      gsap.to(container, {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(container, { opacity: 1, scale: 1 });
          resolve();
        },
      });
    });
  }, []);

  const cancelAnimations = useCallback(() => {
    timelineRef.current?.kill();
  }, []);

  return {
    playShuffleAnimation,
    playDealAnimation,
    playCardToCenter,
    playCollectAnimation,
    playRoundCollect,
    cancelAnimations,
  };
}
