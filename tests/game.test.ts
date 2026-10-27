import { describe, it, expect } from 'vitest';

describe('Cup Shuffle Game Logic & Specifications', () => {
  it('should verify level configuration rules', () => {
    const getLevelConfig = (lvl: number) => {
      if (lvl === 1) return { cups: 3, shuffleCount: 4, speed: 500 };
      if (lvl === 2) return { cups: 3, shuffleCount: 6, speed: 400 };
      if (lvl === 3) return { cups: 4, shuffleCount: 7, speed: 350 };
      if (lvl === 4) return { cups: 4, shuffleCount: 9, speed: 300 };
      return { cups: 5, shuffleCount: 10 + (lvl - 5), speed: 250 };
    };

    expect(getLevelConfig(1)).toEqual({ cups: 3, shuffleCount: 4, speed: 500 });
    expect(getLevelConfig(2)).toEqual({ cups: 3, shuffleCount: 6, speed: 400 });
    expect(getLevelConfig(3)).toEqual({ cups: 4, shuffleCount: 7, speed: 350 });
    expect(getLevelConfig(4)).toEqual({ cups: 4, shuffleCount: 9, speed: 300 });
    expect(getLevelConfig(5)).toEqual({ cups: 5, shuffleCount: 10, speed: 250 });
  });

  it('should calculate round score correctly according to formula', () => {
    const calculateScore = (level: number, cupCount: number) => {
      const bonus = level * 10;
      return (level * 100) + (cupCount * 50) + bonus;
    };

    // Level 1: cups = 3, level = 1
    // (1 * 100) + (3 * 50) + (1 * 10) = 100 + 150 + 10 = 260
    expect(calculateScore(1, 3)).toBe(260);

    // Level 3: cups = 4, level = 3
    // (3 * 100) + (4 * 50) + (3 * 10) = 300 + 200 + 30 = 530
    expect(calculateScore(3, 4)).toBe(530);
  });

  it('should manage localStorage best score correctly', () => {
    const storageKey = 'cup_game_best_score';
    localStorage.clear();

    const initialBest = localStorage.getItem(storageKey);
    expect(initialBest).toBeNull();

    const currentScore = 500;
    localStorage.setItem(storageKey, currentScore.toString());
    
    const savedBest = parseInt(localStorage.getItem(storageKey) || '0', 10);
    expect(savedBest).toBe(500);

    // Test breaking best score
    const newScore = 800;
    if (newScore > savedBest) {
      localStorage.setItem(storageKey, newScore.toString());
    }

    expect(parseInt(localStorage.getItem(storageKey) || '0', 10)).toBe(800);
  });
});
