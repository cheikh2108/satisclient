import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialite - SatisClient',
  description: 'Comment SatisClient collecte, traite et protege vos donnees personnelles.',
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
            Retour a l'accueil
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-sm text-[#8a8a8a] mb-2">Derniere mise a jour : septembre 2025</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
            Politique de confidentialite
          </h1>
          <p className="text-[#6a6a6a] leading-relaxed">
            SatisClient s'engage a proteger les donnees personnelles de ses utilisateurs. La presente politique decrit les donnees que nous collectons, la maniere dont nous les utilisons et les droits dont vous disposez.
          </p>
        </div>

        <div className="space-y-10 prose prose-slate max-w-none">

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">1. Responsable du traitement</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Le responsable du traitement des donnees personnelles collectees via la plateforme SatisClient est la societe SatisClient, dont le siege social est situe a Dakar, Senegal.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              La plateforme est conforme au Reglement General sur la Protection des Donnees (RGPD) applicable aux entreprises traitant des donnees de residents europeens, ainsi qu'a la loi senegalaise n 2008-12 du 25 janvier 2008 sur la protection des donnees a caractere personnel et aux directives de la Commission de Protection des Donnees Personnelles (CDP) du Senegal.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              Pour toute question relative au traitement de vos donnees, vous pouvez contacter notre delegue a la protection des donnees a l'adresse : <a href="mailto:privacy@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">privacy@satisclient.sn</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">2. Donnees collectees</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Nous collectons les categories de donnees suivantes selon le contexte d'utilisation :
            </p>
            <div className="space-y-4">
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Donnees des comptes utilisateurs</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Nom, prenom, adresse email professionnelle, role au sein de l'organisation, mot de passe (stocke de maniere chiffree via bcrypt), date de creation du compte et historique de connexion.
                </p>
              </div>
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Donnees des feedbacks clients</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Contenu du feedback, note de satisfaction, horodatage, site et emplacement associes, sentiment detecte automatiquement. Les feedbacks ne contiennent pas d'information permettant d'identifier directement un client final sauf si ce dernier la fournit volontairement.
                </p>
              </div>
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Donnees des reclamations</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Description de la reclamation, categorie, priorite, responsable assigne, historique des actions, pieces jointes eventuelles, statut et horodatages de chaque etape du workflow.
                </p>
              </div>
              <div className="pl-4 border-l-2 border-[#e8e3d9]">
                <h3 className="font-semibold text-[#0a0a0a] mb-1">Donnees techniques</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Adresse IP, type de navigateur, systeme d'exploitation, pages consultees et duree des sessions, a des fins de securite et d'amelioration du service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">3. Finalites du traitement</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">Vos donnees sont traitees aux fins suivantes :</p>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Fourniture et gestion du service SatisClient</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Gestion de votre compte et authentification securisee</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Generation des rapports d'analyse de satisfaction</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Envoi des alertes et notifications selon vos parametrages</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Amelioration continue de la plateforme</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Securisation de l'acces et prevention des fraudes</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Respect des obligations legales et reglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">4. Duree de conservation</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Les donnees liees a votre compte et a votre utilisation de la plateforme sont conservees pendant toute la duree de votre abonnement actif, puis pendant une periode supplementaire de trois (3) ans a compter de la resiliation du contrat, afin de repondre aux eventuelles obligations legales et contentieuses.
            </p>
            <p className="text-[#4a4a4a] leading-relaxed mt-3">
              Les journaux de securite (logs de connexion) sont conserves 12 mois. Les donnees d'audit sont conservees 5 ans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">5. Partage des donnees</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient ne vend jamais vos donnees a des tiers. Les donnees peuvent etre transmises a :
            </p>
            <ul className="space-y-2 text-[#4a4a4a] mt-3">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Nos sous-traitants techniques (hebergement, envoi d'emails) lies par des contrats de traitement conformes au RGPD</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> Les autorites legales competentes sur requisition judiciaire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">6. Vos droits</h2>
            <p className="text-[#4a4a4a] leading-relaxed mb-3">
              Conformement au RGPD et a la loi senegalaise sur la protection des donnees personnelles, vous disposez des droits suivants :
            </p>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit d'acces :</strong> obtenir une copie des donnees vous concernant</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit de rectification :</strong> corriger des donnees inexactes ou incompletes</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit a l'effacement :</strong> demander la suppression de vos donnees dans les conditions prevues par la loi</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit a la portabilite :</strong> recevoir vos donnees dans un format structure et lisible par machine</li>
              <li className="flex gap-2"><span className="text-[#3a5a40] font-bold flex-shrink-0">-</span> <strong>Droit d'opposition :</strong> vous opposer au traitement de vos donnees pour des motifs legitimes</li>
            </ul>
            <p className="text-[#4a4a4a] leading-relaxed mt-4">
              Pour exercer ces droits, contactez-nous a : <a href="mailto:privacy@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">privacy@satisclient.sn</a>. Nous repondrons dans un delai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">7. Securite des donnees</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient met en oeuvre des mesures de securite techniques et organisationnelles appropriees : chiffrement des donnees en transit (TLS 1.3), chiffrement des mots de passe (bcrypt), controle d'acces role (RBAC), journalisation des actions sensibles et sauvegardes regulieres chiffrees.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">8. Cookies</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient utilise uniquement des cookies strictement necessaires au fonctionnement de la plateforme (session d'authentification, preferences d'interface). Aucun cookie publicitaire ou de suivi tiers n'est utilise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">9. Modifications de cette politique</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              SatisClient se reserve le droit de modifier la presente politique de confidentialite. En cas de modification substantielle, les utilisateurs seront notifies par email au moins 30 jours avant l'entree en vigueur des changements.
            </p>
          </section>

          <section className="bg-[#f5f0e8] rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#0a0a0a] mb-3">Contact</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Pour toute question relative a cette politique ou au traitement de vos donnees personnelles :
            </p>
            <div className="mt-3 space-y-1 text-sm text-[#4a4a4a]">
              <p><strong>Email :</strong> <a href="mailto:privacy@satisclient.sn" className="text-[#3a5a40] underline underline-offset-2">privacy@satisclient.sn</a></p>
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
            <Link href="/cgu" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">CGU</Link>
            <Link href="/" className="text-xs text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">Accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
