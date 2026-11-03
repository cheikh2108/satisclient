"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { publicApi, type PublicFeedbackContext } from "@/lib/api/public";
import { BrandMark } from "@/components/brand-logo";

type Step = "loading" | "form" | "success" | "error";

function PublicFeedbackForm() {
  const searchParams = useSearchParams();
  const siteParam = searchParams.get("site") || "";
  const qrParam = searchParams.get("qr");

  const [step, setStep] = useState<Step>("loading");
  const [context, setContext] = useState<PublicFeedbackContext | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wantContact, setWantContact] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const scanSentRef = useRef<string | null>(null);

  const accent = context?.primaryColor || "#3a5a40";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!siteParam) {
        setErrorMessage("Lien invalide : établissement manquant.");
        setStep("error");
        return;
      }

      try {
        const ctx = await publicApi.getFeedbackContext(siteParam, qrParam);
        if (cancelled) return;
        if (qrParam && scanSentRef.current !== qrParam) {
          scanSentRef.current = qrParam;
          void publicApi.registerQrScan(qrParam);
        }
        setContext(ctx);
        setStep("form");
      } catch (err: any) {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message ||
          "Impossible d'ouvrir ce formulaire. Vérifiez le QR code.";
        setErrorMessage(Array.isArray(msg) ? msg.join(", ") : msg);
        setStep("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [siteParam, qrParam]);

  const ratingLabel = useMemo(() => {
    const labels = [
      "",
      "Très insatisfait",
      "Insatisfait",
      "Moyen",
      "Satisfait",
      "Excellent",
    ];
    return labels[hovered || rating] || "Choisissez une note";
  }, [hovered, rating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context || rating < 1) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const isAnonymous = !name.trim() && !email.trim();
      await publicApi.submitFeedback({
        siteId: context.siteId,
        organizationId: context.organizationId,
        overallRating: rating,
        comment: comment.trim() || undefined,
        isAnonymous,
        respondentName: name.trim() || undefined,
        respondentEmail: email.trim() || undefined,
        feedbackChannel: context.qrCode ? "qr_code" : "web",
        qrCode: context.qrCode || undefined,
        needsResponse: wantContact,
      });
      setStep("success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Envoi impossible. Réessayez dans un instant.";
      setSubmitError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "loading") {
    return (
      <Shell accent={accent}>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: accent }} />
          <p className="text-sm text-[#6a6a6a]">Préparation du formulaire…</p>
        </div>
      </Shell>
    );
  }

  if (step === "error") {
    return (
      <Shell accent={accent}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
          <h1 className="text-lg font-semibold text-[#0a0a0a] mb-2">
            Lien indisponible
          </h1>
          <p className="text-sm text-[#4a4a4a] leading-relaxed">
            {errorMessage}
          </p>
        </div>
      </Shell>
    );
  }

  if (step === "success") {
    return (
      <Shell accent={accent} orgName={context?.organizationName}>
        <div className="rounded-2xl border border-[#e8e3d9] bg-white p-8 text-center shadow-sm">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accent}18` }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: accent }} />
          </div>
          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Merci !</h1>
          <p className="text-[#4a4a4a] leading-relaxed">
            Votre avis a bien été transmis à{" "}
            <span className="font-medium text-[#0a0a0a]">
              {context?.organizationName}
            </span>
            {context?.siteName ? (
              <>
                {" "}
                — <span className="font-medium">{context.siteName}</span>
              </>
            ) : null}
            .
          </p>
          <p className="mt-4 text-sm text-[#8a8a8a]">
            Vous pouvez fermer cette page.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      accent={accent}
      orgName={context?.organizationName}
      logoUrl={context?.logoUrl}
    >
      <div className="rounded-2xl border border-[#e8e3d9] bg-white p-5 sm:p-7 shadow-sm">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-[#8a8a8a] mb-1">
            {context?.organizationName}
          </p>
          <h1 className="text-2xl font-bold text-[#0a0a0a] leading-tight">
            {context?.siteName}
          </h1>
          <p className="mt-2 text-sm text-[#4a4a4a] leading-relaxed">
            {context?.welcomeMessage}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0a0a0a] mb-3">
              Comment évaluez-vous votre expérience ?
            </legend>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= (hovered || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                    className="p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-transform active:scale-95"
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        active ? "fill-current" : "text-[#d6d0c4]"
                      }`}
                      style={active ? { color: accent } : undefined}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-sm text-[#6a6a6a]">
              {ratingLabel}
            </p>
          </fieldset>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-semibold text-[#0a0a0a] mb-2"
            >
              Un commentaire ?{" "}
              <span className="font-normal text-[#8a8a8a]">(optionnel)</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Ce qui s'est bien passé, ou ce qu'on peut améliorer…"
              className="w-full rounded-xl border border-[#e8e3d9] bg-[#fafaf8] px-4 py-3 text-sm text-[#0a0a0a] placeholder:text-[#a8a8a8] focus:outline-none focus:ring-2 focus:border-transparent resize-none"
              style={{ ["--tw-ring-color" as string]: accent }}
            />
          </div>

          {/* Optional contact */}
          <div className="space-y-3 rounded-xl bg-[#f5f0e8] p-4">
            <p className="text-sm font-semibold text-[#0a0a0a]">
              Vos coordonnées{" "}
              <span className="font-normal text-[#8a8a8a]">(optionnel)</span>
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              maxLength={100}
              className="w-full rounded-lg border border-[#e8e3d9] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ ["--tw-ring-color" as string]: accent }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="w-full rounded-lg border border-[#e8e3d9] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ ["--tw-ring-color" as string]: accent }}
            />
            <label className="flex items-start gap-2 text-sm text-[#4a4a4a] cursor-pointer">
              <input
                type="checkbox"
                checked={wantContact}
                onChange={(e) => setWantContact(e.target.checked)}
                className="mt-1 rounded border-[#c8c3b8]"
                style={{ accentColor: accent }}
              />
              <span>Je souhaite être recontacté(e) au sujet de mon avis</span>
            </label>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={rating < 1 || submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 min-h-[48px]"
            style={{ backgroundColor: accent }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer mon avis
              </>
            )}
          </button>
        </form>
      </div>
    </Shell>
  );
}

function Shell({
  children,
  accent = "#3a5a40",
  orgName,
  logoUrl,
}: {
  children: React.ReactNode;
  accent?: string;
  orgName?: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#0a0a0a]">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={orgName || "Logo"}
              className="h-10 w-10 rounded-lg object-cover border border-[#e8e3d9] bg-white"
            />
          ) : (
            <BrandMark size={40} className="h-10 w-10" />
          )}
          <div>
            <p className="text-sm font-semibold tracking-tight">SatisClient</p>
            <p className="text-xs text-[#8a8a8a]">Avis client</p>
          </div>
        </div>
        {children}
        <p className="mt-8 text-center text-[11px] text-[#a8a8a8]">
          Propulsé par SatisClient — vos données sont traitées de façon
          confidentielle
        </p>
      </div>
    </div>
  );
}

export default function PublicFeedbackPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#3a5a40]" />
            <p className="text-sm text-[#6a6a6a]">Chargement…</p>
          </div>
        </Shell>
      }
    >
      <PublicFeedbackForm />
    </Suspense>
  );
}
