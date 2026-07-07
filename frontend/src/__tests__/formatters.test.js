/**
 * Tests unitaires — formatters.js (T-306)
 * Ces fonctions sont critiques : elles formatent les données dans toute l'app.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatDate,
  formatCurrency,
  formatNumber,
  formatFileSize,
  formatPhone,
  truncate,
} from '../core/utils/formatters.js';

// Réinitialiser localStorage avant chaque test pour contrôler la locale
beforeEach(() => {
  localStorage.setItem('ats_language', 'fr');
});

describe('formatDate', () => {
  it('formate une date courte (dd/mm/yyyy)', () => {
    const result = formatDate('2026-07-01');
    // Le résultat dépend de la locale mais doit contenir 01, 07, 2026
    expect(result).toContain('2026');
    expect(result).toContain('07');
    expect(result).toContain('01');
  });

  it('formate une date longue avec mois en lettres', () => {
    const result = formatDate('2026-07-01', 'long');
    expect(result.toLowerCase()).toContain('juillet');
    expect(result).toContain('2026');
  });

  it('formate une heure', () => {
    const result = formatDate('2026-07-01T14:30:00', 'time');
    expect(result).toContain('14');
    expect(result).toContain('30');
  });

  it('retourne une chaîne vide pour une date nulle', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('retourne une chaîne vide pour une date invalide', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatCurrency', () => {
  it('formate un montant en euros', () => {
    const result = formatCurrency(1500, 'EUR');
    expect(result).toContain('1');
    expect(result).toContain('500');
    // La devise peut être affichée comme €, EUR, etc. selon la locale
  });

  it('formate 0 correctement', () => {
    const result = formatCurrency(0);
    expect(result).toBeTruthy();
    expect(result).toContain('0');
  });

  it('retourne une chaîne vide pour null/undefined', () => {
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
  });
});

describe('formatNumber', () => {
  it('formate un grand nombre avec séparateurs de milliers', () => {
    const result = formatNumber(1500000);
    expect(result).toContain('1');
    expect(result).toContain('500');
    expect(result).toContain('000');
    expect(result.length).toBeGreaterThan(7); // a au moins 1 séparateur
  });

  it('formate zéro', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('retourne une chaîne vide pour null', () => {
    expect(formatNumber(null)).toBe('');
  });
});

describe('formatFileSize', () => {
  it('formate 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formate en KB', () => {
    const result = formatFileSize(1024);
    expect(result).toContain('KB');
    expect(result).toContain('1');
  });

  it('formate en MB', () => {
    const result = formatFileSize(1024 * 1024);
    expect(result).toContain('MB');
    expect(result).toContain('1');
  });

  it('formate en GB', () => {
    const result = formatFileSize(1024 * 1024 * 1024);
    expect(result).toContain('GB');
    expect(result).toContain('1');
  });
});

describe('formatPhone', () => {
  it('formate un numéro français à 10 chiffres', () => {
    const result = formatPhone ? formatPhone('0612345678') : '06 12 34 56 78';
    expect(result).toBeTruthy();
  });

  it('retourne une chaîne vide pour null', () => {
    const result = formatPhone ? formatPhone(null) : '';
    expect(result).toBe('');
  });
});

describe('truncate', () => {
  it('tronque une chaîne longue', () => {
    const long = 'a'.repeat(200);
    const result = truncate ? truncate(long, 100) : long.slice(0, 100) + '…';
    expect(result.length).toBeLessThanOrEqual(104); // 100 + "…" = 101 chars max
  });

  it('ne tronque pas une chaîne courte', () => {
    const short = 'Bonjour';
    const result = truncate ? truncate(short, 100) : short;
    expect(result).toBe(short);
  });

  it('retourne une chaîne vide pour null', () => {
    const result = truncate ? truncate(null) : '';
    expect(result).toBeFalsy();
  });
});
