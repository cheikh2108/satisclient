import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - SatisClient",
  description: "Conditions générales régissant l'utilisation de la plateforme SatisClient.",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-sans">
      {/* Nav */}
      <nav className="border-b border-[#e8e3d9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#3a5a40] flex items-center justify-center">
              <span className="text-white font-bold text-xs">SC</span>
            </div>
            <span className="font-bold text-[#0a0a0a] tracking-tight">SatisClient</span>
          </Link>
          <Link href="/" className="text-sm text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">
            Retour à l&apos;accueil
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-sm text-[#8a8a8a] mb-2">Version en vigueur depuis le 1er octobre 2025</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-[#6a6a6a] leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme SatisClient, accessible à l&apos;adresse app.satisclient.sn, et de ses API associées. En créant un compte ou en utilisant le service, vous acceptez sans réserve l&apos;intégralité des présentes conditions.
          </p>
        </div>

        <div className="space-y-10">

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">1. Objet</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient est une plateforme SaaS (Software as a Service) de gestion de la satisfaction client. Elle permet aux organisations abonnées de collecter des feedbacks, gérer des réclamations, analyser la satisfaction par établissement et exporter des rapports. L&apos;accès à la plateforme est fourni sous forme d&apos;abonnement mensuel ou annuel selon la formule choisie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">2. Création de compte et accès</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L&apos;accès à SatisClient nécessite la création d&apos;un compte organisation. L&apos;abonné désigne un ou plusieurs administrateurs responsables de la gestion des accès au sein de leur organisation. Un essai gratuit de sept (7) jours est proposé à la création du compte, sans carte bancaire.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L&apos;abonné est responsable de :
            </p>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> La confidentialité des identifiants de connexion de tous ses utilisateurs</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Toute action effectuée depuis les comptes de son organisation</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> La conformité de son utilisation avec la législation applicable</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> L&apos;exactitude des informations fournies lors de la création du compte</li>
            </ul>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              SatisClient se réserve le droit de suspendre tout compte présentant des activités anormales ou contraires aux présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">3. Formules et limites d&apos;utilisation</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Chaque formule d&apos;abonnement confère à l&apos;abonné un droit d&apos;usage de la plateforme dans les limites définies par ladite formule (nombre d&apos;établissements, d&apos;utilisateurs, de feedbacks mensuels). Le dépassement durable de ces limites pourra entraîner une invitation à migrer vers une formule supérieure.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              La formule Institution fait l&apos;objet d&apos;un contrat spécifique négocié entre SatisClient et l&apos;abonné, définissant les conditions particulières d&apos;accès, de déploiement et de support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">4. Propriété intellectuelle</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              SatisClient reste l&apos;unique propriétaire de la plateforme, de son code source, de ses algorithmes, de son interface graphique, de ses marques et de toute documentation associée. Aucun transfert de propriété intellectuelle n&apos;est opéré au bénéfice de l&apos;abonné par l&apos;effet des présentes CGU.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient concède à l&apos;abonné une licence d&apos;utilisation non exclusive, non transférable et limitée à la durée de l&apos;abonnement actif, pour les seuls besoins internes de son organisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">5. Données clients</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L&apos;abonné reste l&apos;unique responsable des données qu&apos;il collecte et traite via SatisClient, notamment les feedbacks de ses propres clients et les informations liées aux réclamations. SatisClient agit en qualité de sous-traitant de ces données au sens du RGPD et de la loi sénégalaise sur la protection des données personnelles.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              L&apos;abonné s&apos;engage à informer ses propres clients de la collecte de leurs données via la plateforme et à disposer des bases légales nécessaires à ce traitement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">6. Disponibilité du service</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              SatisClient s&apos;engage à maintenir une disponibilité cible de 99,5 % du service sur une base mensuelle, hors maintenances planifiées notifiées 48 heures à l&apos;avance. Cet engagement suppose une infrastructure et des procédures opérationnelles adaptées ; les modalités de mesure et de compensation peuvent être précisées dans le contrat d&apos;abonnement.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              En cas d&apos;indisponibilité non planifiée supérieure à 4 heures sur une période de 24 heures, l&apos;abonné pourra solliciter un avoir sur sa prochaine facture au prorata du temps d&apos;interruption. Cette disposition ne s&apos;applique pas aux perturbations causées par des éléments hors du contrôle de SatisClient (attaques DDoS, panne d&apos;infrastructures tierces, force majeure).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">7. Facturation et paiement</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Les abonnements sont facturés mensuellement ou annuellement selon le choix de l&apos;abonné, en FCFA ou dans la devise convenue au moment de la souscription. Le paiement est dû à réception de la facture.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              En cas de défaut de paiement après un délai de 15 jours suivant la relance, SatisClient se réserve le droit de suspendre l&apos;accès au service dans l&apos;attente de la régularisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">8. Résiliation</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L&apos;abonné peut résilier son abonnement à tout moment en adressant sa demande à <a href="mailto:contact@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">contact@satisclient.sn</a> avec un préavis de trente (30) jours calendaires.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              À réception de la demande de résiliation, SatisClient garantit à l&apos;abonné la possibilité d&apos;exporter l&apos;intégralité de ses données (feedbacks, réclamations, rapports) dans un format ouvert (JSON ou CSV) pendant le préavis. Après expiration du préavis, les données sont supprimées conformément à la politique de confidentialité.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient peut résilier de plein droit le contrat en cas de violation grave des présentes CGU, après mise en demeure restée sans effet pendant 15 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">9. Limitation de responsabilité</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient ne saurait être tenu responsable des dommages indirects, manque à gagner ou pertes de données résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser la plateforme, sauf en cas de faute lourde ou dolosive. La responsabilité de SatisClient est en tout état de cause limitée au montant des sommes versées par l&apos;abonné au cours des 12 derniers mois précédant le sinistre.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">10. Modifications des CGU</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient se réserve le droit de modifier les présentes CGU. Les modifications substantielles sont notifiées par email aux abonnés avec un préavis de 30 jours. L&apos;utilisation continue du service après ce délai vaut acceptation des nouvelles conditions. En cas de refus des nouvelles conditions, l&apos;abonné peut résilier son contrat sans frais pendant le délai de notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">11. Droit applicable et juridiction compétente</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Les présentes CGU sont soumises au droit sénégalais. Tout litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes sera soumis à la compétence exclusive des tribunaux de Dakar, Sénégal, après tentative de résolution amiable dans un délai de 60 jours.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              Pour les abonnés établis dans d&apos;autres pays de la CEDEAO, les parties conviennent d&apos;explorer en priorité les mécanismes de règlement alternatif des différends disponibles au niveau régional.
            </p>
          </section>

          <section className="bg-[#f5f0e8] rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">Contact</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Pour toute question relative aux présentes conditions ou à votre abonnement :
            </p>
            <div className="mt-3 space-y-1 text-sm text-[#4a4a4a]">
              <p><strong>Email :</strong> <a href="mailto:contact@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">contact@satisclient.sn</a></p>
              <p><strong>Questions légales :</strong> <a href="mailto:legal@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">legal@satisclient.sn</a></p>
              <p><strong>Adresse :</strong> SatisClient, Dakar, Sénégal</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e3d9] py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8a8a8a]">SatisClient &copy; {new Date().getFullYear()} — Tous droits réservés</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">Confidentialité</Link>
            <Link href="/" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">Accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
