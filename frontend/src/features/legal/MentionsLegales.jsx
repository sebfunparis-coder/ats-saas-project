import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LegalPage, Section, P, UL } from './LegalPage';

/**
 * Page Mentions Légales
 */
export function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <LegalPage title="Mentions Légales" updated="1er juillet 2026" path="/mentions-legales">
      <Section title="1. Éditeur du site">
        <P>
          <strong>Nom commercial :</strong> GETWORK (exploitant le site ATS Ultimate)<br />
          <strong>Forme juridique :</strong> Entrepreneur individuel (micro-entreprise)<br />
          <strong>Activité :</strong> Conseil et assistance opérationnelle en ressources humaines, recrutement, intérim et formation (Code NAF 70.22Z)<br />
          <strong>Siège social :</strong> 60 rue François 1er, 75008 Paris, France<br />
          <strong>Immatriculation :</strong> 524 304 714 R.C.S. Paris (inscrit le 20/11/2024)<br />
          <strong>SIRET :</strong> 524 304 714 00032<br />
          <strong>TVA Intracommunautaire :</strong> FR81524304714<br />
          <strong>Responsable de la publication :</strong> Sébastien (GETWORK)<br />
          <strong>Email :</strong> contact@ats-ultimate.com<br />
          <strong>Téléphone :</strong> [NUMÉRO RÉEL À COMPLÉTER]
        </P>
      </Section>

      <Section title="2. Hébergement">
        <P>
          <strong>Hébergeur principal :</strong> Supabase Inc. (Infrastructure AWS Frankfurt — eu-central-1)<br />
          <strong>Adresse :</strong> 970 Toa Payoh North, Singapore 318992 / AWS : 410 Terry Ave N, Seattle, WA 98109, USA<br />
          <strong>Site web :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667EEA' }}>supabase.com</a><br />
          <strong>Région de stockage des données :</strong> Union Européenne (Frankfurt, Allemagne — AWS eu-central-1)<br /><br />
          <strong>Hébergeur frontend :</strong> Vercel Inc. (si déployé via Vercel) ou [hébergeur alternatif]<br />
          <strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667EEA' }}>vercel.com</a>
        </P>
      </Section>

      <Section title="3. Propriété intellectuelle">
        <P>L'ensemble des éléments présents sur le site ATS Ultimate (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) sont la propriété exclusive de GETWORK, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.</P>
        <P>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de GETWORK.</P>
        <P>Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.</P>
      </Section>

      <Section title="4. Responsabilité">
        <P>Les informations diffusées sur le site ATS Ultimate sont présentées à titre indicatif et général. Malgré les mises à jour régulières, la responsabilité de GETWORK ne peut être engagée en cas de modification des dispositions administratives et juridiques survenant après la publication.</P>
        <P>GETWORK décline toute responsabilité :</P>
        <UL items={[
          'Pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site',
          'Pour tous dommages résultant d\'une intrusion frauduleuse d\'un tiers ayant entraîné une modification des informations',
          'Pour tous dommages directs et indirects découlant de l\'utilisation du site',
        ]} />
      </Section>

      <Section title="5. Liens hypertextes">
        <P>Le site ATS Ultimate peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers ces autres ressources vous font quitter le site.</P>
        <P>Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de GETWORK. Aucune autorisation ni demande d'information préalable ne peut être exigée par l'éditeur à l'égard d'un site qui souhaite établir un lien vers le site de l'éditeur.</P>
      </Section>

      <Section title="6. Protection des données personnelles">
        <P>En conformité avec le Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.</P>
        <P>
          Pour plus d'informations, consultez notre <button onClick={() => navigate('/politique-confidentialite')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0 }}>Politique de Confidentialité</button>.
        </P>
      </Section>

      <Section title="7. Cookies">
        <P>
          Le site utilise des cookies pour améliorer l'expérience utilisateur. Pour plus d'informations, consultez notre <button onClick={() => navigate('/politique-cookies')} style={{ color: '#667EEA', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0 }}>Politique de Cookies</button>.
        </P>
      </Section>

      <Section title="8. Droit applicable et juridiction">
        <P>Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.</P>
      </Section>

      <Section title="9. Contact">
        <P>Pour toute question concernant les mentions légales, vous pouvez nous contacter :</P>
        <UL items={[
          'Par email : contact@ats-ultimate.com',
          'Par téléphone : [NUMÉRO RÉEL À COMPLÉTER]',
          'Par courrier : GETWORK, 60 rue François 1er, 75008 Paris, France',
        ]} />
      </Section>
    </LegalPage>
  );
}

export default MentionsLegales;
