import React from 'react';
import { LegalPage, Section, P, H3, UL, LegalTable, Warn } from './LegalPage';

/**
 * Politique anti-discrimination — T-288
 * Obligatoire pour les outils de recrutement soumis au Code du travail.
 * Décrit les obligations légales et les mesures prises dans l'outil.
 */
export function NonDiscriminationPage() {
  return (
    <LegalPage
      title="Politique de non-discrimination"
      updated="1er juillet 2026"
      notice="La non-discrimination dans le recrutement est une obligation légale en France. Cette page décrit vos obligations en tant qu'utilisateur d'ATS Ultimate et les mesures mises en place dans la plateforme pour vous aider à les respecter."
      path="/non-discrimination"
    >
      <Section title="1. Cadre légal">
        <P>En France, la discrimination à l'embauche est interdite par l'Article L. 1132-1 du Code du travail, modifié par la loi n° 2017-256 du 28 février 2017. Elle constitue une infraction pénale passible de :</P>
        <UL items={[
          '3 ans d\'emprisonnement et 45 000 € d\'amende pour une personne physique',
          '225 000 € d\'amende pour une personne morale (Art. 225-2 et 131-38 du Code pénal)',
        ]} />
        <H3>Critères protégés</H3>
        <P>Les décisions de recrutement ne peuvent, en aucun cas, être fondées sur les critères suivants :</P>
        <LegalTable
          headers={['Critère protégé', 'Base légale']}
          rows={[
            ['Origine (nationalité, pays d\'origine, lieu de résidence)', 'Art. L. 1132-1 C. trav.'],
            ['Sexe, identité de genre, expression de genre', 'Art. L. 1132-1 C. trav.'],
            ['Âge', 'Art. L. 1132-1 C. trav.'],
            ['État de santé, maladie, handicap', 'Art. L. 1132-1 C. trav.'],
            ['Situation de famille ou grossesse', 'Art. L. 1132-1 C. trav.'],
            ['Religion, convictions', 'Art. L. 1132-1 C. trav.'],
            ['Opinions politiques', 'Art. L. 1132-1 C. trav.'],
            ['Orientation sexuelle', 'Art. L. 1132-1 C. trav.'],
            ['Activités syndicales ou mutualistes', 'Art. L. 1132-1 C. trav.'],
            ['Apparence physique', 'Art. L. 1132-1 C. trav.'],
            ['Nom de famille, patronyme', 'Art. L. 1132-1 C. trav.'],
            ['Lieu de résidence, domiciliation bancaire', 'Art. L. 1132-1 C. trav.'],
            ['Particulière vulnérabilité résultant de la situation économique', 'Art. L. 1132-1 C. trav.'],
          ]}
        />
      </Section>

      <Section title="2. Vos obligations en tant qu'utilisateur d'ATS Ultimate">
        <H3>2.1 Ce que vous pouvez faire</H3>
        <UL items={[
          'Filtrer et évaluer les candidats sur la base de leurs compétences, expériences, qualifications et aptitudes professionnelles',
          'Poser des questions relatives aux exigences du poste (disponibilités, mobilité géographique si justifiée par le poste, maîtrise de langues requises)',
          'Collecter uniquement les données nécessaires à l\'évaluation professionnelle (CV, lettre de motivation, résultats de tests techniques)',
          'Documenter les motifs objectifs de vos décisions de sélection dans les notes d\'entretien',
        ]} />
        <H3>2.2 Ce que vous ne pouvez pas faire</H3>
        <UL items={[
          'Exiger ou collecter une photo, une date de naissance, la situation familiale, la nationalité dans le formulaire de candidature (sauf exception légale)',
          'Filtrer les candidats par âge, sexe, origine ou tout autre critère protégé',
          'Rédiger des offres d\'emploi mentionnant des critères discriminatoires ("cherche H/F junior" peut être acceptable, "cherche moins de 30 ans" est illégal)',
          'Utiliser des outils d\'IA qui renforcent des biais discriminatoires sans audit préalable',
          'Partager des notes internes contenant des appréciations sur l\'apparence physique ou l\'origine supposée d\'un candidat',
        ]} />
        <Warn>
          Si vous recevez un CV contenant des informations discriminatoires (photo, date de naissance), vous devez vous abstenir de les prendre en compte dans votre décision. Ces informations ne doivent pas être saisies dans le système ATS.
        </Warn>
      </Section>

      <Section title="3. Mesures de conformité dans ATS Ultimate">
        <H3>3.1 Conception du formulaire de candidature</H3>
        <P>ATS Ultimate ne collecte pas par défaut la date de naissance, le sexe, la photo ou la nationalité des candidats. Le formulaire de candidature public (portail carrières) est limité aux champs professionnels.</P>
        <P>Les champs "avatar" (emoji) et "couleur" du formulaire recruteur sont des outils visuels de catégorisation, non liés à l'identité réelle du candidat.</P>
        <H3>3.2 Score IA et biais algorithmiques</H3>
        <P>Le scoring IA d'ATS Ultimate est basé exclusivement sur la <strong>correspondance compétences/expériences</strong> avec les critères de la mission. Il n'utilise pas de données démographiques (âge, sexe, origine). Des audits réguliers vérifient l'absence de biais systémiques dans les scores.</P>
        <P>Toutefois, les données d'entraînement des modèles peuvent contenir des biais historiques. Nous recommandons de ne jamais éliminer un candidat sur la seule base d'un score IA sans examen humain de son dossier.</P>
        <H3>3.3 Rappel légal dans le formulaire recruteur</H3>
        <P>Un encadré de rappel légal est affiché à chaque ouverture du formulaire d'ajout de candidat, conformément aux recommandations de la DGEFP et du Défenseur des droits.</P>
        <H3>3.4 Filtres de recherche</H3>
        <P>Les filtres disponibles dans la CVthèque portent exclusivement sur des critères professionnels : compétences, expérience (en années), disponibilité, localisation (si pertinente au poste), type de contrat souhaité. ATS Ultimate ne propose aucun filtre par âge, sexe ou origine.</P>
      </Section>

      <Section title="4. Données sensibles et RGPD">
        <P>La collecte de certaines données (état de santé, handicap) peut être légalement justifiée dans des cas spécifiques (RQTH, aménagement de poste). Dans ce cas :</P>
        <UL items={[
          'Une base légale explicite doit exister (consentement explicite du candidat ou obligation légale)',
          'Les données ne peuvent être traitées que par les personnes habilitées',
          'Une mention d\'information spécifique doit être fournie au candidat',
          'La durée de conservation doit être limitée à la durée du processus de recrutement',
        ]} />
        <P>Ces données entrent dans la catégorie des <strong>données sensibles</strong> au sens de l'Article 9 du RGPD. Leur traitement sans base légale appropriée est interdit.</P>
      </Section>

      <Section title="5. En cas de signalement ou de litige">
        <H3>Organismes compétents en France</H3>
        <UL items={[
          'Défenseur des droits : www.defenseurdesdroits.fr — traitement des discriminations',
          'Inspection du travail (DREETS) : pour les discriminations à l\'embauche',
          'CNIL (www.cnil.fr) : pour les violations de données personnelles',
          'Prud\'hommes : pour les candidats victimes de discrimination dans un processus de recrutement',
        ]} />
        <P>Si vous suspectez qu'un algorithme ou outil utilisé dans votre organisation produit des discriminations indirectes, le Défenseur des droits peut être saisi pour avis.</P>
        <P>Pour signaler un abus sur la plateforme ATS Ultimate : <a href="mailto:legal@ats-ultimate.com" style={{ color: '#667EEA' }}>legal@ats-ultimate.com</a></P>
      </Section>
    </LegalPage>
  );
}

export default NonDiscriminationPage;
