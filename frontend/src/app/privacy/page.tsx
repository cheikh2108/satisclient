import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité - SatisClient',
  description: 'Comment SatisClient collecte, traite et protège vos données personnelles.',
};

export default function PrivacyPage() {
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
          <p className="text-sm text-[#8a8a8a] mb-2">Dernière mise à jour : septembre 2026</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-[#6a6a6a] leading-relaxed">
            SatisClient s&apos;engage à protéger les données personnelles de ses utilisateurs. La présente politique décrit les données que nous collectons, la manière dont nous les utilisons et les droits dont vous disposez.
          </p>
        </div>

        <div className="space-y-10 prose prose-slate max-w-none">

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">1. Responsable du traitement</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Le responsable du traitement des données personnelles collectées via la plateforme SatisClient est la société SatisClient, dont le siège social est situé à Dakar, Sénégal.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              SatisClient conçoit et exploite la plateforme en s&apos;appuyant sur les principes du Règlement Général sur la Protection des Données (RGPD) applicables aux traitements concernant des résidents européens, ainsi que sur la loi sénégalaise n° 2008-12 du 25 janvier 2008 relative à la protection des données à caractère personnel et sur les directives de la Commission de Protection des Données Personnelles (CDP) du Sénégal. Cette politique décrit nos engagements ; elle ne constitue pas à elle seule une attestation de conformité réglementaire.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              Pour toute question relative au traitement de vos données, vous pouvez contacter notre délégué à la protection des données à l&apos;adresse : <a href="mailto:privacy@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">privacy@satisclient.sn</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">2. Données collectées</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Nous collectons les catégories de données suivantes selon le contexte d&apos;utilisation :
            </p>
            <div className="space-y-4">
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Données des comptes utilisateurs</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Nom, prénom, adresse email professionnelle, rôle au sein de l&apos;organisation, mot de passe (stocké de manière chiffrée via bcrypt), date de création du compte et historique de connexion.
                </p>
              </div>
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Données des feedbacks clients</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Contenu du feedback, note de satisfaction, horodatage, établissement et emplacement associés, sentiment détecté automatiquement. Les feedbacks ne contiennent pas d&apos;information permettant d&apos;identifier directement un client final sauf si ce dernier la fournit volontairement.
                </p>
              </div>
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Données des réclamations</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Description de la réclamation, catégorie, priorité, responsable assigné, historique des actions, pièces jointes éventuelles, statut et horodatages de chaque étape du workflow.
                </p>
              </div>
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Données techniques</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Adresse IP, type de navigateur, système d&apos;exploitation, pages consultées et durée des sessions, à des fins de sécurité et d&apos;amélioration du service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">3. Finalités du traitement</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">Vos données sont traitées aux fins suivantes :</p>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Fourniture et gestion du service SatisClient</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Gestion de votre compte et authentification sécurisée</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Génération des rapports d&apos;analyse de satisfaction</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Envoi des alertes et notifications selon vos paramétrages</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Amélioration continue de la plateforme</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Sécurisation de l&apos;accès et prévention des fraudes</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Respect des obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">4. Durée de conservation</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Les données liées à votre compte et à votre utilisation de la plateforme sont conservées pendant toute la durée de votre abonnement actif, puis pendant une période supplémentaire de trois (3) ans à compter de la résiliation du contrat, afin de répondre aux éventuelles obligations légales et contentieuses.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              Les journaux de sécurité (logs de connexion) sont conservés 12 mois. Les données d&apos;audit sont conservées 5 ans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">5. Partage des données</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient ne vend jamais vos données à des tiers. Les données peuvent être transmises à :
            </p>
            <ul className="space-y-2 text-[#4a4a4a] mt-3">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Nos sous-traitants techniques (hébergement, envoi d&apos;emails) liés par des contrats de traitement conformes aux exigences applicables</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Les autorités légales compétentes sur réquisition judiciaire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">6. Vos droits</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Conformément au RGPD et à la loi sénégalaise sur la protection des données personnelles, vous disposez des droits suivants :
            </p>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit d&apos;accès :</strong> obtenir une copie des données vous concernant</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données dans les conditions prévues par la loi</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes</li>
            </ul>
            <p className="text-[#4a4a4a] leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">privacy@satisclient.sn</a>. Nous répondrons dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">7. Sécurité des données</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient met en œuvre des mesures de sécurité techniques et organisationnelles appropriées : chiffrement des données en transit (TLS 1.3), chiffrement des mots de passe (bcrypt), contrôle d&apos;accès par rôle (RBAC), journalisation des actions sensibles et sauvegardes régulières chiffrées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">8. Cookies</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient utilise uniquement des cookies strictement nécessaires au fonctionnement de la plateforme (session d&apos;authentification, préférences d&apos;interface). Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">9. Modifications de cette politique</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient se réserve le droit de modifier la présente politique de confidentialité. En cas de modification substantielle, les utilisateurs seront notifiés par email au moins 30 jours avant l&apos;entrée en vigueur des changements.
            </p>
          </section>

          <section className="bg-[#f5f0e8] rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">Contact</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Pour toute question relative à cette politique ou au traitement de vos données personnelles :
            </p>
            <div className="mt-3 space-y-1 text-sm text-[#4a4a4a]">
              <p><strong>Email :</strong> <a href="mailto:privacy@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">privacy@satisclient.sn</a></p>
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
            <Link href="/cgu" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">CGU</Link>
            <Link href="/" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">Accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
