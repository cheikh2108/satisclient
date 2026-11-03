"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Send, Star } from "lucide-react";
import {
  publicApi,
  type PublicSurvey,
  type PublicSurveyQuestion,
} from "@/lib/api/public";
import { BrandMark } from "@/components/brand-logo";

function SurveyForm() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const qr = searchParams.get("qr");
  const [survey, setSurvey] = useState<PublicSurvey | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"loading" | "form" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scanSentRef = useRef<string | null>(null);

  useEffect(() => {
    publicApi
      .getSurvey(params.id, qr)
      .then((data) => {
        if (qr && scanSentRef.current !== qr) {
          scanSentRef.current = qr;
          void publicApi.registerQrScan(qr);
        }
        setSurvey(data);
        setStep("form");
      })
      .catch((err: any) => {
        const message =
          err?.response?.data?.message || "Cette enquête n'est pas disponible.";
        setError(Array.isArray(message) ? message.join(", ") : message);
        setStep("error");
      });
  }, [params.id, qr]);

  const missingRequired = useMemo(
    () =>
      survey?.questions.some(
        (question) =>
          question.required && !String(answers[question.id] ?? "").trim(),
      ) ?? false,
    [answers, survey],
  );

  const updateAnswer = (question: PublicSurveyQuestion, value: unknown) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!survey || missingRequired || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await publicApi.submitSurveyResponse(survey.id, {
        surveyId: survey.id,
        organizationId: survey.organizationId,
        siteId: survey.siteId || undefined,
        isAnonymous: !email.trim(),
        respondentEmail: email.trim() || undefined,
        answers,
      });
      setStep("success");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Impossible d'envoyer vos réponses.";
      setError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setSubmitting(false);
    }
  };

  const accent = survey?.primaryColor || "#3a5a40";
  if (step === "loading")
    return (
      <Shell accent={accent}>
        <Loading />
      </Shell>
    );
  if (step === "error")
    return (
      <Shell accent={accent}>
        <Notice title="Enquête indisponible" message={error} />
      </Shell>
    );
  if (step === "success")
    return (
      <Shell
        accent={accent}
        orgName={survey?.organizationName}
        logoUrl={survey?.logoUrl}
      >
        <div className="rounded-2xl border border-[#e8e3d9] bg-white p-8 text-center shadow-sm">
          <CheckCircle2
            className="mx-auto mb-4 h-12 w-12"
            style={{ color: accent }}
          />
          <h1 className="mb-2 text-2xl font-bold">
            Merci pour votre participation
          </h1>
          <p className="text-[#4a4a4a]">
            Vos réponses ont bien été enregistrées.
          </p>
        </div>
      </Shell>
    );

  return (
    <Shell
      accent={accent}
      orgName={survey?.organizationName}
      logoUrl={survey?.logoUrl}
    >
      <div className="rounded-2xl border border-[#e8e3d9] bg-white p-5 shadow-sm sm:p-7">
        <p className="mb-1 text-xs uppercase tracking-wide text-[#8a8a8a]">
          {survey?.organizationName}
        </p>
        <h1 className="text-2xl font-bold leading-tight">{survey?.title}</h1>
        {survey?.description && (
          <p className="mt-2 text-sm leading-relaxed text-[#4a4a4a]">
            {survey.description}
          </p>
        )}
        {survey?.welcomeMessage && (
          <p className="mt-3 text-sm text-[#6a6a6a]">{survey.welcomeMessage}</p>
        )}

        <form onSubmit={submit} className="mt-7 space-y-6">
          {survey?.questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => updateAnswer(question, value)}
              accent={accent}
            />
          ))}
          {survey?.settings?.requireEmail && (
            <label className="block text-sm font-semibold">
              Votre email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[#e8e3d9] bg-[#fafaf8] px-3 py-2.5 font-normal outline-none"
              />
            </label>
          )}
          {!survey?.settings?.requireEmail && (
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email (optionnel)"
              className="w-full rounded-lg border border-[#e8e3d9] bg-[#fafaf8] px-3 py-2.5 text-sm outline-none"
            />
          )}
          {error && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={missingRequired || submitting}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
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
                Envoyer mes réponses
              </>
            )}
          </button>
        </form>
      </div>
    </Shell>
  );
}

function QuestionField({
  question,
  value,
  onChange,
  accent,
}: {
  question: PublicSurveyQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  accent: string;
}) {
  const type = question.type;
  const options = question.options || [];
  const inputClass =
    "mt-2 w-full rounded-lg border border-[#e8e3d9] bg-[#fafaf8] px-3 py-2.5 text-sm outline-none";
  return (
    <fieldset>
      <legend className="text-sm font-semibold">
        {question.title}{" "}
        {question.required && <span className="text-red-500">*</span>}
      </legend>
      {question.description && (
        <p className="mt-1 text-xs text-[#6a6a6a]">{question.description}</p>
      )}
      {["single_choice", "yes_no"].includes(type) && (
        <div className="mt-3 space-y-2">
          {(type === "yes_no"
            ? [
                { label: "Oui", value: "yes" },
                { label: "Non", value: "no" },
              ]
            : options
          ).map((option) => (
            <label
              key={String(option.value)}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name={question.id}
                checked={String(value ?? "") === String(option.value)}
                onChange={() => onChange(option.value)}
                style={{ accentColor: accent }}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
      {type === "multiple_choice" && (
        <div className="mt-3 space-y-2">
          {options.map((option) => {
            const selected =
              Array.isArray(value) &&
              value.map(String).includes(String(option.value));
            return (
              <label
                key={String(option.value)}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...(Array.isArray(value) ? value : []), option.value]
                        : Array.isArray(value)
                          ? value.filter(
                              (item) => String(item) !== String(option.value),
                            )
                          : [],
                    )
                  }
                  style={{ accentColor: accent }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}
      {["text", "email", "phone", "date"].includes(type) && (
        <input
          type={type === "text" ? "text" : type}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {type === "rating" ? (
        <div
          className="mt-3 flex flex-wrap items-center gap-1"
          role="radiogroup"
          aria-label="Choisissez une note sur 5"
        >
          {[1, 2, 3, 4, 5].map((score) => {
            const selected = Number(value) >= score;
            return (
              <button
                key={score}
                type="button"
                role="radio"
                aria-label={`${score} sur 5`}
                aria-checked={Number(value) === score}
                onClick={() => onChange(score)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ ["--tw-ring-color" as string]: accent }}
              >
                <Star
                  className={`h-8 w-8 ${selected ? "fill-current" : "text-[#d6d0c4]"}`}
                  style={selected ? { color: accent } : undefined}
                />
              </button>
            );
          })}
          <span className="ml-2 text-sm text-[#6a6a6a]">
            {value ? `${value}/5` : "Choisissez une note"}
          </span>
        </div>
      ) : type === "scale" || ["nps", "csat", "ces"].includes(type) ? (
        <input
          type="number"
          min={question.config?.min ?? (type === "nps" ? 0 : 1)}
          max={question.config?.max ?? (type === "nps" ? 10 : 5)}
          value={String(value ?? "")}
          onChange={(event) =>
            onChange(event.target.value ? Number(event.target.value) : "")
          }
          className={inputClass}
        />
      ) : null}
    </fieldset>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-[#3a5a40]" />
    </div>
  );
}
function Notice({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
      <h1 className="mb-2 text-lg font-semibold">{title}</h1>
      <p className="text-sm text-red-700">{message}</p>
    </div>
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
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={orgName || "Logo"}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <BrandMark size={40} className="h-10 w-10" />
          )}
          <div>
            <p className="text-sm font-semibold">SatisClient</p>
            <p className="text-xs text-[#8a8a8a]">Enquête satisfaction</p>
          </div>
        </div>
        {children}
        <p className="mt-8 text-center text-[11px] text-[#a8a8a8]">
          Propulsé par SatisClient
        </p>
      </div>
    </div>
  );
}

export default function PublicSurveyPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <Loading />
        </Shell>
      }
    >
      <SurveyForm />
    </Suspense>
  );
}
