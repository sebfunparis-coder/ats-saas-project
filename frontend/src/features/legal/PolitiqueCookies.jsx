import React from 'react';
import { openCookiePreferences } from '@/core/utils/cookieConsent';
import { LegalPage, Section, P, H3, UL } from './LegalPage';

/**
 * Page Politique de Cookies
 */
export function PolitiqueCookies() {
  return (
    <LegalPage
      title="Politique de Cookies"
      updated="18 février 2026"
      notice="🍪 Cette page explique comment nous utilisons les cookies et technologies similaires sur notre site web."
      path="/politique-cookies"
    >
      <Section title="1. Qu'est-ce qu'un cookie ?">
        <P>Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lors de la visite d'un site web.</P>
      </Section>

      <Section title="2. Types de cookies utilisés">
        <H3>🔐 Cookies strictement nécessaires</H3>
        <P>
          Ces cookies sont indispensables au fonctionnement du site :<br />
          • Session utilisateur<br />
          • Authentification<br />
          • Sécurité<br />
          <strong>Durée :</strong> Session ou 30 jours
        </P>

        <H3>📊 Cookies analytiques</H3>
        <P>
          Pour comprendre comment vous utilisez le site :<br />
          • Google Analytics (anonymisé)<br />
          • Statistiques de visite<br />
          <strong>Durée :</strong> 13 mois
        </P>

        <H3>🎯 Cookies marketing (optionnels)</H3>
        <P>
          Pour personnaliser les publicités :<br />
          • Remarketing Google Ads<br />
          • Facebook Pixel<br />
          <strong>Durée :</strong> 6 mois
        </P>
      </Section>

      <Section title="3. Gérer vos cookies">
        <P>Vous pouvez accepter, refuser ou personnaliser les cookies analytiques et marketing à tout moment :</P>
        <button
          onClick={openCookiePreferences}
          style={{ padding: '12px 24px', background: '#667EEA', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginBottom: '20px' }}
        >
          ⚙️ Gérer mes préférences de cookies
        </button>
        <P>Vous pouvez également gérer les cookies via les paramètres de votre navigateur :</P>
        <UL items={[
          <><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</>,
          <><strong>Firefox</strong> : Options → Vie privée et sécurité</>,
          <><strong>Safari</strong> : Préférences → Confidentialité</>,
          <><strong>Edge</strong> : Paramètres → Cookies et autorisations</>,
        ]} />
      </Section>

      <Section title="4. Contact">
        <P>Pour toute question : <strong>dpo@ats-ultimate.com</strong></P>
      </Section>
    </LegalPage>
  );
}

export default PolitiqueCookies;
