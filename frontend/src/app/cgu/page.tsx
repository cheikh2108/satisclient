import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Generales d\'Utilisation - SatisClient',
  description: 'Conditions generales regissant l\'utilisation de la plateforme SatisClient.',
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
            Retour a l'accueil
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-sm text-[#8a8a8a] mb-2">Version en vigueur depuis le 1er octobre 2025</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
            Conditions Generales d'Utilisation
          </h1>
          <p className="text-[#6a6a6a] leading-relaxed">
            Les presentes Conditions Generales d'Utilisation (CGU) regissent l'acces et l'utilisation de la plateforme SatisClient, accessible a l'adresse app.satisclient.sn, et de ses API associees. En creant un compte ou en utilisant le service, vous acceptez sans reserve l'integralite des presentes conditions.
          </p>
        </div>

        <div className="space-y-10">

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">1. Objet</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient est une plateforme SaaS (Software as a Service) de gestion de la satisfaction client. Elle permet aux organisations abonnees de collecter des feedbacks, gerer des reclamations, analyser la satisfaction par site et exporter des rapports. L'acces a la plateforme est fourni sous forme d'abonnement mensuel ou annuel selon la formule choisie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">2. Creation de compte et acces</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L'acces a SatisClient necessite la creation d'un compte organisation. L'abonne designe un ou plusieurs administrateurs responsables de la gestion des acces au sein de leur organisation.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L'abonne est responsable de :
            </p>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> La confidentialite des identifiants de connexion de tous ses utilisateurs</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Toute action effectuee depuis les comptes de son organisation</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> La conformite de son utilisation avec la legislation applicable</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> L'exactitude des informations fournies lors de la creation du compte</li>
            </ul>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              SatisClient se reserve le droit de suspendre tout compte presentant des activites anormales ou contraires aux presentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">3. Formules et limites d'utilisation</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Chaque formule d'abonnement confere a l'abonne un droit d'usage de la plateforme dans les limites definies par ladite formule (nombre de sites, d'utilisateurs, de feedbacks mensuels). Le depassement durable de ces limites pourra entrainer une invitation a migrer vers une formule superieure.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              La formule Institution fait l'objet d'un contrat specifique negocie entre SatisClient et l'abonne, definissant les conditions particulieres d'acces, de deploiement et de support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">4. Propriete intellectuelle</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              SatisClient reste l'unique proprietaire de la plateforme, de son code source, de ses algorithmes, de son interface graphique, de ses marques et de toute documentation associee. Aucun transfert de propriete intellectuelle n'est opere au benefice de l'abonne par l'effet des presentes CGU.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient concede a l'abonne une licence d'utilisation non exclusive, non transferable et limitee a la duree de l'abonnement actif, pour les seuls besoins internes de son organisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">5. Donnees clients</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L'abonne reste l'unique responsable des donnees qu'il collecte et traite via SatisClient, notamment les feedbacks de ses propres clients et les informations liees aux reclamations. SatisClient agit en qualite de sous-traitant de ces donnees au sens du RGPD et de la loi senegalaise sur la protection des donnees personnelles.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              L'abonne s'engage a informer ses propres clients de la collecte de leurs donnees via la plateforme et a disposer des bases legales necessaires a ce traitement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">6. Disponibilite du service</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              SatisClient s'engage a maintenir une disponibilite cible de 99,5 % du service sur une base mensuelle, hors maintenances planifiees notifiees 48 heures a l'avance.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              En cas d'indisponibilite non planifiee superieure a 4 heures sur une periode de 24 heures, l'abonne pourra solliciter un avoir sur sa prochaine facture au prorata du temps d'interruption. Cette disposition ne s'applique pas aux perturbations causees par des elements hors du controle de SatisClient (attaques DDoS, panne d'infrastructures tierces, force majeure).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">7. Facturation et paiement</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Les abonnements sont facturer mensuellement ou annuellement selon le choix de l'abonne, en FCFA ou dans la devise convenue au moment de la souscription. Le paiement est du a reception de la facture.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              En cas de defaut de paiement apres un delai de 15 jours suivant la relance, SatisClient se reserve le droit de suspendre l'acces au service dans l'attente de la regularisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">8. Resiliation</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              L'abonne peut resilier son abonnement a tout moment en adressant sa demande a <a href="mailto:contact@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">contact@satisclient.sn</a> avec un preavis de trente (30) jours calendaires.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              A reception de la demande de resiliation, SatisClient garantit a l'abonne la possibilite d'exporter l'integralite de ses donnees (feedbacks, reclamations, rapports) dans un format ouvert (JSON ou CSV) pendant le preavis. Apres expiration du preavis, les donnees sont supprimees conformement a la politique de confidentialite.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient peut resilier de plein droit le contrat en cas de violation grave des presentes CGU, apres mise en demeure restee sans effet pendant 15 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">9. Limitation de responsabilite</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient ne saurait etre tenu responsable des dommages indirects, manque a gagner ou pertes de donnees resultant de l'utilisation ou de l'impossibilite d'utiliser la plateforme, sauf en cas de faute lourde ou dolosive. La responsabilite de SatisClient est en tout etat de cause limitee au montant des sommes versees par l'abonne au cours des 12 derniers mois precedant le sinistre.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">10. Modifications des CGU</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient se reserve le droit de modifier les presentes CGU. Les modifications substantielles sont notifiees par email aux abonnes avec un preavis de 30 jours. L'utilisation continue du service apres ce delai vaut acceptation des nouvelles conditions. En cas de refus des nouvelles conditions, l'abonne peut resilier son contrat sans frais pendant le delai de notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">11. Droit applicable et juridiction competente</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Les presentes CGU sont soumises au droit senegalais. Tout litige relatif a l'interpretation ou a l'execution des presentes sera soumis a la competence exclusive des tribunaux de Dakar, Senegal, apres tentative de resolution amiable dans un delai de 60 jours.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed">
              Pour les abonnes etablis dans d'autres pays de la CEDEAO, les parties conviennent d'explorer en priorite les mecanismes de reglement alternatif des differends disponibles au niveau regional.
            </p>
          </section>

          <section className="bg-[#f5f0e8] rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">Contact</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Pour toute question relative aux presentes conditions ou a votre abonnement :
            </p>
            <div className="mt-3 space-y-1 text-sm text-[#4a4a4a]">
              <p><strong>Email :</strong> <a href="mailto:contact@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">contact@satisclient.sn</a></p>
              <p><strong>Questions legales :</strong> <a href="mailto:legal@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">legal@satisclient.sn</a></p>
              <p><strong>Adresse :</strong> SatisClient, Dakar, Senegal</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e3d9] py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8a8a8a]">SatisClient &copy; {new Date().getFullYear()} - Tous droits reserves</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">Confidentialite</Link>
            <Link href="/" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">Accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
