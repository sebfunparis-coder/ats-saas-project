import React from 'react';
import { LegalPage, Section, P, H3, UL, Warn, LegalTable } from './LegalPage';

/**
 * Conditions Générales de Vente — T-280
 * Obligatoires en droit français (Art. L. 441-6 Code de commerce) pour toute
 * vente BtoB. Doivent être remises à tout acheteur professionnel qui en fait la demande.
 */
export function CGVPage() {
  return (
    <LegalPage
      title="Conditions Générales de Vente"
      updated="1er juillet 2026"
      notice="Les présentes CGV s'appliquent à toute souscription d'un abonnement ATS Ultimate par un professionnel (B2B). Elles prévalent sur les conditions d'achat éventuelles de l'Acheteur, sauf accord écrit préalable de l'Éditeur."
      path="/cgv"
    >
      <Section title="1. Parties et objet">
        <P><strong>Vendeur :</strong> GETWORK (entrepreneur individuel, exploitant le site ATS Ultimate), SIRET 524 304 714 00032, 524 304 714 R.C.S. Paris, 60 rue François 1er, 75008 Paris, contact@ats-ultimate.com</P>
        <P><strong>Acheteur :</strong> tout professionnel (personne morale ou entrepreneur individuel) souscrivant un abonnement ATS Ultimate.</P>
        <P>Les présentes CGV ont pour objet de définir les conditions d'achat, de facturation et de résiliation des abonnements à la plateforme SaaS ATS Ultimate.</P>
      </Section>

      <Section title="2. Offres et tarifs">
        <H3>2.1 Plans disponibles</H3>
        <LegalTable
          headers={['Plan', 'Prix mensuel HT (sans engagement)', 'Prix mensuel HT (engagement annuel)', 'Postes']}
          rows={[
            ['Solo', '29,90 € / mois', '19,90 € / mois (soit 238,80 €/an)', '1 poste'],
            ['Manager · 3 postes', '69,90 € / mois', '49,90 € / mois (soit 598,80 €/an)', '3 postes'],
            ['Manager · 6 postes', '99,90 € / mois', '79,90 € / mois (soit 958,80 €/an)', '6 postes'],
          ]}
        />
        <P>Tous les prix sont indiqués hors taxes (HT). La TVA applicable est celle en vigueur à la date de facturation (20 % en France). Les tarifs peuvent être révisés avec un préavis de 60 jours par email. L'engagement annuel est payé en une seule fois à la souscription.</P>
      </Section>

      <Section title="3. Commande et formation du contrat">
        <P>Le contrat est formé lorsque l'Acheteur complète le formulaire d'inscription en ligne, accepte les présentes CGV et les CGU, et confirme son choix de plan (avec ou sans paiement immédiat selon le plan choisi). Un email de confirmation récapitulatif est envoyé à l'Acheteur dans l'heure suivante.</P>
        <P>Pour les plans Enterprise, une confirmation par bon de commande écrit est requise. Le contrat prend effet à la date de signature ou de validation par email des deux parties.</P>
      </Section>

      <Section title="4. Modalités de paiement">
        <H3>4.1 Facturation</H3>
        <P>Les abonnements mensuels sont facturés à terme à échoir (en début de période). Les abonnements annuels sont facturés en une fois pour l'année à venir. Les factures sont émises électroniquement et disponibles dans l'interface admin.</P>
        <H3>4.2 Moyens de paiement</H3>
        <P>Le paiement s'effectue par carte bancaire (Visa, Mastercard, American Express) via le prestataire Stripe (PCI-DSS niveau 1). Pour les plans Enterprise, virement bancaire possible sur facture (délai de paiement : 30 jours fin de mois).</P>
        <H3>4.3 Retard de paiement</H3>
        <P>Conformément à l'Article L. 441-10 du Code de commerce, tout retard de paiement entraîne automatiquement : (i) des pénalités de retard au taux directeur de la BCE majoré de 10 points, (ii) une indemnité forfaitaire de recouvrement de 40 €. En cas de non-paiement après mise en demeure de 15 jours, l'accès au Service est suspendu puis résilié.</P>
      </Section>

      <Section title="5. Politique de remboursement — T-283">
        <H3>5.1 Droit de rétractation</H3>
        <P>Conformément à l'Article L. 221-18 du Code de la consommation, le droit de rétractation de 14 jours s'applique uniquement aux consommateurs (particuliers). Les professionnels (B2B) ne bénéficient pas de ce droit légal, sauf accord contractuel spécifique.</P>
        <P>Toutefois, à titre commercial et de bonne foi, ATS Ultimate offre aux nouveaux Acheteurs <strong>un remboursement intégral dans les 30 jours suivant la première facturation payante</strong>, si le Service ne correspond pas à leurs attentes, sans justification nécessaire.</P>
        <H3>5.2 Règles générales</H3>
        <UL items={[
          'Aucun remboursement n\'est accordé après les 30 premiers jours suivant la première facturation payante.',
          'Les mois entamés ne sont pas remboursés (pas de prorata temporis pour les abonnements mensuels).',
          'Pour les abonnements annuels : en cas de résiliation avant terme, aucun remboursement prorata n\'est accordé, sauf cas exceptionnel (cessation d\'activité, décision de justice) soumis à l\'appréciation de l\'Éditeur.',
        ]} />
        <H3>5.3 Crédits de service (SLA)</H3>
        <P>Des crédits de service peuvent être accordés en cas de non-respect des engagements de disponibilité définis dans le SLA. Ces crédits ne sont pas convertibles en espèces et ne peuvent excéder 15 % de la facture mensuelle concernée.</P>
        <H3>5.4 Procédure de remboursement</H3>
        <P>Toute demande de remboursement doit être adressée par email à <a href="mailto:facturation@ats-ultimate.com" style={{ color: '#667EEA' }}>facturation@ats-ultimate.com</a> avec le numéro de facture concerné. Les remboursements éligibles sont traités sous 10 jours ouvrés via le même moyen de paiement que l'achat.</P>
      </Section>

      <Section title="6. Durée et résiliation">
        <H3>6.1 Abonnements mensuels</H3>
        <P>Sans engagement de durée minimum. Résiliation possible à tout moment, prenant effet à la fin du mois en cours. La résiliation doit être effectuée via l'interface admin ou par email à contact@ats-ultimate.com avant le dernier jour du mois.</P>
        <H3>6.2 Abonnements annuels</H3>
        <P>Engagement d'un an calendaire à compter de la date de souscription. Tacitement reconduits chaque année. La non-reconduction doit être notifiée au moins 30 jours avant l'échéance.</P>
        <H3>6.3 Résiliation pour faute</H3>
        <P>L'Éditeur peut résilier le contrat sans préavis en cas de violation grave des CGU (usage discriminatoire, attaque informatique, non-paiement persistant). Aucun remboursement n'est dû dans ce cas.</P>
      </Section>

      <Section title="7. Garanties et responsabilités">
        <P>L'Éditeur garantit que le Service sera fourni conformément à sa documentation et avec toute la diligence raisonnable. Il ne garantit pas que le Service sera exempt d'erreurs ou de bugs, mais s'engage à corriger les anomalies bloquantes dans les délais définis par le SLA.</P>
        <P>La responsabilité de l'Éditeur est limitée aux dommages directs prouvés, dans la limite des sommes payées sur les 3 derniers mois. Toute exclusion est détaillée dans les CGU.</P>
      </Section>

      <Section title="8. Droit applicable">
        <P>Les présentes CGV sont soumises au droit français. Tout litige relève de la compétence exclusive des tribunaux de Paris. Pour les Acheteurs établis hors de France, les présentes CGV et les règles de conflits de lois françaises s'appliquent.</P>
      </Section>
    </LegalPage>
  );
}

export default CGVPage;
