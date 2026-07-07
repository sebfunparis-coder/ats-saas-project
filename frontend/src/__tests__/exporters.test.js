/**
 * T-385 : `printCandidateProfile`/`printInterviewReport` interpolaient des
 * champs utilisateur (nom, notes, compétences...) directement dans du HTML
 * écrit via `document.write()` dans une fenêtre de même origine que l'app
 * authentifiée — un candidat malveillant soumettant un nom contenant
 * `<img src=x onerror=...>` via le formulaire de candidature public voyait
 * son payload s'exécuter dès qu'un recruteur exportait sa fiche en PDF.
 */
import { describe, it, expect, vi } from 'vitest';
import { sanitizeForPrint, printCandidateProfile, printInterviewReport } from '../core/utils/exporters';

describe('T-385 — sanitizeForPrint', () => {
  it('échappe les caractères HTML dangereux dans les champs string', () => {
    const out = sanitizeForPrint({ name: '<img src=x onerror=alert(1)>', age: 30 });
    // La seule propriété qui compte pour la sécurité : plus aucun `<`/`>` brut
    // (le navigateur ne peut donc plus jamais parser ça comme une balise) —
    // le texte "onerror=alert" lui-même devient inerte une fois hors balise.
    expect(out.name).not.toContain('<');
    expect(out.name).not.toContain('>');
    expect(out.name).toContain('&lt;img');
    expect(out.age).toBe(30);
  });

  it('échappe chaque élément d\'un tableau de strings (ex: skills)', () => {
    const out = sanitizeForPrint({ skills: ['React', '<script>alert(1)</script>'] });
    expect(out.skills[1]).not.toContain('<script>');
  });

  it('laisse les champs non-string/non-tableau-de-strings inchangés', () => {
    const nested = { foo: 'bar' };
    const out = sanitizeForPrint({ tags: [1, 2, 3], nested });
    expect(out.tags).toEqual([1, 2, 3]);
    expect(out.nested).toBe(nested);
  });

  it('gère les valeurs null/undefined sans planter', () => {
    expect(sanitizeForPrint(null)).toBe(null);
    expect(sanitizeForPrint(undefined)).toBe(undefined);
  });
});

describe('T-385 — printCandidateProfile neutralise un payload XSS réel', () => {
  it('un nom de candidat malveillant ne produit jamais de balise exécutable dans le HTML écrit', () => {
    let writtenHtml = '';
    const fakeWindow = {
      document: {
        write: (html) => { writtenHtml = html; },
        close: () => {},
      },
    };
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeWindow);

    const maliciousCandidate = {
      name: '<img src=x onerror=alert(document.cookie)>',
      position: 'Dev',
      notes: '"><script>alert(1)</script>',
      skills: ['<svg onload=alert(1)>'],
      tags: [],
    };

    printCandidateProfile(maliciousCandidate, [], []);

    expect(writtenHtml).not.toContain('<img src=x onerror=');
    expect(writtenHtml).not.toContain('<script>alert(1)</script>');
    expect(writtenHtml).not.toContain('<svg onload=');

    openSpy.mockRestore();
  });
});

describe('T-385 — printInterviewReport neutralise un payload XSS réel', () => {
  it('un commentaire d\'évaluation malveillant ne produit jamais de balise exécutable', () => {
    let writtenHtml = '';
    const fakeWindow = { document: { write: (html) => { writtenHtml = html; }, close: () => {} } };
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeWindow);

    const application = { candidateName: 'Jean Test', missionTitle: 'Dev', clientName: 'Acme' };
    const evaluation = {
      globalScore: 80,
      recommendation: 'go',
      notes: '<img src=x onerror=alert(1)>',
      criteria: [{ name: 'Technique', score: 4, notes: '<script>alert(2)</script>' }],
    };

    printInterviewReport(application, evaluation);

    expect(writtenHtml).not.toContain('<img src=x onerror=');
    expect(writtenHtml).not.toContain('<script>alert(2)</script>');

    openSpy.mockRestore();
  });
});
