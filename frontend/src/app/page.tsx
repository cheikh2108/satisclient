'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  AlertCircle,
  BarChart3,
  QrCode,
  FileText,
  Bell,
  Check,
  ChevronRight,
  Menu,
  X,
  Building2,
  Clock,
  Users,
  Download,
} from 'lucide-react';

// Hook: observe element visibility
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView();
  const stepsInView = useInView();
  const statsInView = useInView();

  // Hero fade-in on mount
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-hero]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    items.forEach((item, i) => {
      (item as HTMLElement).style.opacity = '0';
      (item as HTMLElement).style.transform = 'translateY(18px)';
      setTimeout(() => {
        (item as HTMLElement).style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        (item as HTMLElement).style.opacity = '1';
        (item as HTMLElement).style.transform = 'translateY(0)';
      }, 80 + i * 100);
    });
  }, []);

  return (
    <>
    <style>{`
      @media (prefers-reduced-motion: no-preference) {
        .spell-fade-up { animation: spellFadeUp 0.5s ease both; }
        @keyframes spellFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .spell-scale { animation: spellScale 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes spellScale { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        .arrow-nudge { transition: transform 0.2s ease; }
        .arrow-nudge-parent:hover .arrow-nudge { transform: translateX(4px); }
      }
    `}</style>
    <div className="min-h-screen bg-white text-[#0a0a0a] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e8e3d9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3a5a40] flex items-center justify-center">
                <span className="text-white font-bold text-xs">SC</span>
              </div>
              <span className="font-bold text-lg text-[#0a0a0a] tracking-tight">SatisClient</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#fonctionnalites" className="text-sm text-[#4a4a4a] hover:text-[#3a5a40] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a40] rounded px-1">
                Fonctionnalités
              </Link>
              <Link href="#tarifs" className="text-sm text-[#4a4a4a] hover:text-[#3a5a40] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a40] rounded px-1">
                Tarifs
              </Link>
              <Link href="#comment" className="text-sm text-[#4a4a4a] hover:text-[#3a5a40] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a40] rounded px-1">
                Comment ça marche
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-[#3a5a40] font-medium hover:text-[#2d4731] transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="bg-[#3a5a40] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2d4731] transition-colors"
              >
                Essai gratuit
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#4a4a4a] cursor-pointer rounded-lg hover:bg-[#f5f0e8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a5a40]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#e8e3d9] py-4 space-y-3">
              <Link href="#fonctionnalites" className="block text-sm text-[#4a4a4a] py-2" onClick={() => setMobileMenuOpen(false)}>
                Fonctionnalités
              </Link>
              <Link href="#tarifs" className="block text-sm text-[#4a4a4a] py-2" onClick={() => setMobileMenuOpen(false)}>
                Tarifs
              </Link>
              <Link href="#comment" className="block text-sm text-[#4a4a4a] py-2" onClick={() => setMobileMenuOpen(false)}>
                Comment ça marche
              </Link>
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" className="text-center border border-[#3a5a40] text-[#3a5a40] px-4 py-2 rounded-lg text-sm font-semibold">
                  Se connecter
                </Link>
                <Link href="/register" className="text-center bg-[#3a5a40] text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Essai gratuit
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl" ref={heroRef}>
            <div data-hero className="inline-flex items-center gap-2 bg-[#f5f0e8] text-[#3a5a40] px-3 py-1.5 rounded-lg text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a5a40]" />
              Conçu pour l'Afrique de l'Ouest francophone
            </div>
            <h1 data-hero className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0a0a0a] mb-6 leading-[1.1]">
              Gérez les feedbacks et réclamations de tous vos sites, depuis une seule plateforme
            </h1>
            <p data-hero className="text-lg sm:text-xl text-[#4a4a4a] mb-8 leading-relaxed max-w-2xl">
              SatisClient centralise les retours clients, automatise le suivi des réclamations et mesure la satisfaction en temps réel. Conçu pour les entreprises operant sur plusieurs sites en Afrique.
            </p>
            <div data-hero className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="arrow-nudge-parent inline-flex items-center justify-center gap-2 bg-[#3a5a40] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d4731] transition-colors"
              >
                Essayer gratuitement 7 jours
                <ChevronRight className="arrow-nudge h-4 w-4" />
              </Link>
              <Link
                href="#fonctionnalites"
                className="inline-flex items-center justify-center border border-[#3a5a40] text-[#3a5a40] px-6 py-3 rounded-lg font-semibold hover:bg-[#f5f0e8] transition-colors"
              >
                Voir la demo
              </Link>
            </div>
          </div>

          {/* UI Mockup */}
          <div className="mt-16 rounded-xl border border-[#e8e3d9] bg-[#f5f0e8] p-4 sm:p-6 overflow-hidden">
            <div className="bg-white rounded-lg border border-[#e8e3d9] overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e8e3d9] bg-[#fafaf8]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#e8e3d9]" />
                  <div className="w-3 h-3 rounded-full bg-[#e8e3d9]" />
                  <div className="w-3 h-3 rounded-full bg-[#e8e3d9]" />
                </div>
                <div className="flex-1 mx-4 bg-[#f5f0e8] rounded px-3 py-1 text-xs text-[#8a8a8a]">
                  app.satisclient.sn/dashboard
                </div>
              </div>
              {/* Fake dashboard */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-5 w-40 bg-[#e8e3d9] rounded mb-1" />
                    <div className="h-3 w-24 bg-[#f5f0e8] rounded" />
                  </div>
                  <div className="h-8 w-24 bg-[#3a5a40] rounded-lg" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Feedbacks', value: '1 248', color: '#3a5a40' },
                    { label: 'Réclamations', value: '23', color: '#c8a96e' },
                    { label: 'Satisfaction', value: '87%', color: '#3a5a40' },
                    { label: 'Sites actifs', value: '8', color: '#4a4a4a' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#fafaf8] border border-[#e8e3d9] rounded-lg p-3">
                      <div className="text-xs text-[#8a8a8a] mb-1">{stat.label}</div>
                      <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 bg-[#fafaf8] border border-[#e8e3d9] rounded-lg p-3 h-24 flex items-end gap-1">
                    {[40, 60, 45, 75, 55, 80, 65, 90, 70, 85, 95, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          backgroundColor: i === 11 ? '#3a5a40' : '#e8e3d9',
                        }}
                      />
                    ))}
                  </div>
                  <div className="bg-[#fafaf8] border border-[#e8e3d9] rounded-lg p-3">
                    <div className="text-xs text-[#8a8a8a] mb-2">Réclamations actives</div>
                    {[
                      { label: 'Urgentes', width: '20%', color: '#ef4444' },
                      { label: 'En cours', width: '55%', color: '#c8a96e' },
                      { label: 'Resolues', width: '80%', color: '#3a5a40' },
                    ].map((item) => (
                      <div key={item.label} className="mb-2">
                        <div className="flex justify-between text-xs text-[#8a8a8a] mb-0.5">
                          <span>{item.label}</span>
                        </div>
                        <div className="h-1.5 bg-[#e8e3d9] rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{ width: item.width, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Clock, value: '7 jours', label: "d'essai gratuit, sans carte bancaire" },
              { icon: Building2, value: '5 minutes', label: 'pour configurer votre premier site' },
              { icon: Users, value: '6 rôles', label: 'utilisateurs avec permissions granulaires' },
              { icon: Download, value: 'PDF & Excel', label: 'Rapports exportables en un clic' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white mb-3">
                  <stat.icon className="h-5 w-5 text-[#3a5a40]" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm text-[#6a6a6a]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
              Ce qui se passe sans SatisClient
            </h2>
            <p className="text-[#6a6a6a] text-lg">
              Les entreprises multi-sites perdent de la visibilite sur la satisfaction de leurs clients. Les problemes s'accumulent, souvent en silence.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Des réclamations sans reponse',
                desc: 'Sans systeme de suivi, les réclamations restent sans reponse faute de responsable identifie et de delai impose.',
              },
              {
                title: 'Impossible de comparer vos agences',
                desc: "Chaque site gere ses retours de maniere independante. Impossible de savoir quelle agence performe mieux ni pourquoi.",
              },
              {
                title: 'Les alertes arrivent trop tard',
                desc: "Vous apprenez qu'un client est mecontent apres qu'il soit parti, quand l'avis negatif est deja public.",
              },
              {
                title: 'Les équipes terrain sans outils',
                desc: "Vos responsables de site n'ont pas de moyen simple pour remonter les problemes ni consulter les tendances de leur emplacement.",
              },
            ].map((problem) => (
              <div
                key={problem.title}
                className="flex gap-4 p-5 rounded-xl border border-[#e8e3d9] hover:border-[#3a5a40] transition-colors"
              >
                <div className="flex-shrink-0 w-1 bg-[#e8e3d9] rounded-full" />
                <div>
                  <h3 className="font-semibold text-[#0a0a0a] mb-1">{problem.title}</h3>
                  <p className="text-sm text-[#6a6a6a] leading-relaxed">{problem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-[#6a6a6a] text-lg">
              Six modules intégrés pour couvrir l'intégralité du cycle de gestion de la satisfaction client.
            </p>
          </div>
          <div ref={featuresInView.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: MessageSquare,
                title: 'Feedbacks multi-canaux',
                desc: 'Collectez les avis via QR code, formulaire web, email ou integration in-app. Tous les retours arrives dans un seul tableau de bord.',
              },
              {
                icon: AlertCircle,
                title: 'Gestion des réclamations',
                desc: 'Workflow complet avec assignation, SLA automatiques et relances. Chaque reclamation a un responsable et une échéance.',
              },
              {
                icon: BarChart3,
                title: 'Analytics temps réel',
                desc: 'Tableaux de bord par site, par periode, par categorie. Comparez les performances entre vos agences en un coup d\'oeil.',
              },
              {
                icon: QrCode,
                title: 'QR codes par emplacement',
                desc: 'Generez un QR code unique pour chaque comptoir, salle ou point de service. Les retours sont automatiquement attribues au bon emplacement.',
              },
              {
                icon: FileText,
                title: 'Rapports PDF et Excel',
                desc: 'Exportez vos donnees de satisfaction en un clic. Formats PDF pour la direction, Excel pour l\'analyse detaillee.',
              },
              {
                icon: Bell,
                title: 'Alertes sur seuils critiques',
                desc: 'Recevez une alerte instantanee quand la satisfaction d\'un site chute sous un seuil defini. Réagissez avant que le probleme s\'aggrave.',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-[#e8e3d9] hover:border-[#3a5a40] hover:shadow-sm transition-all cursor-default spell-fade-up"
                style={{ animationDelay: featuresInView.inView ? `${index * 80}ms` : undefined, animationPlayState: featuresInView.inView ? 'running' : 'paused', opacity: featuresInView.inView ? undefined : 0 }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#f5f0e8] flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-[#3a5a40]" />
                </div>
                <h3 className="font-semibold text-[#0a0a0a] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#6a6a6a] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
              Opérationnel en moins d'une heure
            </h2>
            <p className="text-[#6a6a6a] text-lg">
              Trois étapes pour déployez SatisClient sur l'ensemble de vos sites.
            </p>
          </div>
          <div ref={stepsInView.ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Créez vos sites',
                desc: 'Configurez vos agences, boutiques ou etablissements dans la plateforme. Associez les responsables a chaque site et definissez les categories de feedback pertinentes.',
              },
              {
                step: '02',
                title: 'Déployez vos QR codes',
                desc: 'Chaque emplacement recoit son QR code unique. Imprimez et affichez-les aux points de contact client. Les retours sont attribues automatiquement.',
              },
              {
                step: '03',
                title: 'Analysez et agissez',
                desc: 'Consultez le tableau de bord en temps réel, recevez les alertes critiques et exportez vos rapports mensuels pour le comite de direction.',
              },
            ].map((step, index) => (
              <div key={step.step} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-[#e8e3d9] z-0" style={{ width: 'calc(100% - 2.5rem)', left: '2.5rem' }} />
                )}
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-lg bg-[#3a5a40] text-white font-bold text-sm flex items-center justify-center mb-4 spell-scale"
                    style={{ animationDelay: stepsInView.inView ? `${index * 150}ms` : undefined, animationPlayState: stepsInView.inView ? 'running' : 'paused', opacity: stepsInView.inView ? undefined : 0 }}
                  >
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-[#0a0a0a] text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6a6a6a] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
              Tarifs transparents
            </h2>
            <p className="text-[#6a6a6a] text-lg">
              Sans frais cachés. Changez de formule a tout moment. Annulez quand vous voulez.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Essentiel',
                price: '25 000',
                highlight: false,
                features: [
                  '1 site',
                  '3 utilisateurs',
                  '1 000 feedbacks/mois',
                  'Rapports basiques',
                  'Support email',
                ],
                cta: 'Commencer',
              },
              {
                name: 'Pro',
                price: '60 000',
                highlight: true,
                badge: 'Recommandé',
                features: [
                  '5 sites',
                  '10 utilisateurs',
                  '5 000 feedbacks/mois',
                  'Rapports PDF et Excel',
                  'Support prioritaire',
                  'Alertes configurables',
                ],
                cta: 'Commencer',
              },
              {
                name: 'Business',
                price: '125 000',
                highlight: false,
                features: [
                  '15 sites',
                  '30 utilisateurs',
                  'Feedbacks illimités',
                  'SLA garanti',
                  'Accès API',
                  'Manager dedique',
                ],
                cta: 'Commencer',
              },
              {
                name: 'Institution',
                price: 'À partir de 2 500 000 FCFA/an',
                highlight: false,
                features: [
                  'Sites illimites',
                  'Utilisateurs illimites',
                  'Feedbacks illimites',
                  'Déploiement sur site possible',
                  'Formation incluse',
                  'Support 24/7',
                ],
                cta: 'Nous contacter',
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-[#3a5a40] text-white border-2 border-[#3a5a40]'
                    : 'bg-white border border-[#e8e3d9]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#c8a96e] text-white text-xs font-semibold px-3 py-1 rounded-lg whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? 'text-white' : 'text-[#0a0a0a]'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold tracking-tight ${plan.highlight ? 'text-white' : 'text-[#0a0a0a]'}`}>
                      {plan.price}
                    </span>
                    {!plan.price.includes('FCFA/an') && !plan.price.includes('devis') && (
                      <span className={`text-sm ${plan.highlight ? 'text-[#a8c8ae]' : 'text-[#8a8a8a]'}`}>
                        FCFA/mois
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[#a8c8ae]' : 'text-[#3a5a40]'}`} />
                      <span className={plan.highlight ? 'text-[#e8f0e9]' : 'text-[#4a4a4a]'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta === 'Nous contacter' ? 'mailto:contact@satisclient.sn' : '/register'}
                  className={`block text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-[#3a5a40] hover:bg-[#f5f0e8]'
                      : 'bg-[#3a5a40] text-white hover:bg-[#2d4731]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#8a8a8a] mt-6">
            Tous les plans incluent 7 jours d'essai gratuit. Aucune carte bancaire requise.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#3a5a40]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Prêt à centraliser vos feedbacks ?
          </h2>
          <p className="text-[#a8c8ae] text-lg mb-8">
            Démarrez votre essai gratuit aujourd'hui. Configurez votre premier site en cinq minutes, sans engagement ni carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#3a5a40] px-6 py-3 rounded-lg font-semibold hover:bg-[#f5f0e8] transition-colors"
            >
              Essayer gratuitement 7 jours
              <ChevronRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:contact@satisclient.sn"
              className="inline-flex items-center justify-center border border-[#a8c8ae] text-[#a8c8ae] px-6 py-3 rounded-lg font-semibold hover:bg-[#2d4731] hover:text-white hover:border-white transition-colors"
            >
              Contacter l'equipe
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e8e3d9] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#3a5a40] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SC</span>
                </div>
                <span className="font-bold text-[#0a0a0a] tracking-tight">SatisClient</span>
              </div>
              <p className="text-xs text-[#8a8a8a] max-w-xs">
                Plateforme de gestion de la satisfaction client pour les entreprises d'Afrique de l'Ouest.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/privacy" className="text-sm text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">
                Politique de confidentialite
              </Link>
              <Link href="/cgu" className="text-sm text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">
                CGU
              </Link>
              <a href="mailto:contact@satisclient.sn" className="text-sm text-[#6a6a6a] hover:text-[#3a5a40] transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#e8e3d9]">
            <p className="text-xs text-[#8a8a8a]">
              SatisClient &copy; {new Date().getFullYear()} - Tous droits reserves
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
