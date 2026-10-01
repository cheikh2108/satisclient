"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  useCreateSurvey,
  useCurrentUser,
  useDeleteSurvey,
  useOrgUsage,
  useSites,
  useSurveys,
  useUpdateSurvey,
} from "@/hooks";
import type { Survey, SurveyQuestion } from "@/lib/api/surveys";

type DraftQuestion = SurveyQuestion;

const questionTypes = [
  { value: "rating", label: "Note sur 5" },
  { value: "nps", label: "NPS sur 10" },
  { value: "single_choice", label: "Choix unique" },
  { value: "multiple_choice", label: "Choix multiples" },
  { value: "yes_no", label: "Oui / Non" },
  { value: "text", label: "Texte libre" },
  { value: "email", label: "Email" },
];

const createQuestion = (order: number): DraftQuestion => ({
  id: `q${Date.now()}-${order}`,
  type: "rating",
  title: "",
  required: true,
  order,
  config: { min: 1, max: 5 },
});

const hasOptions = (type: string) =>
  type === "single_choice" || type === "multiple_choice";

export default function SurveysPage() {
  const { data: currentUser } = useCurrentUser();
  const organizationId = (currentUser as any)?.organizationId as
    string | undefined;
  const { data: surveys = [], isLoading } = useSurveys(organizationId);
  const { data: sitesData } = useSites();
  const { data: usage } = useOrgUsage();
  const createSurvey = useCreateSurvey();
  const updateSurvey = useUpdateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [surveyType, setSurveyType] = useState("one_time");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [campaignPackId, setCampaignPackId] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    createQuestion(1),
  ]);
  const submitLockRef = useRef(false);

  const sites = sitesData?.data || [];
  const packs = (usage?.campaignPacks || []).filter(
    (pack: any) => pack.remaining > 0 && new Date(pack.expiresAt) > new Date(),
  );
  const requiresCampaignPack = surveyType !== "continuous";

  const resetForm = () => {
    setEditingSurvey(null);
    setTitle("");
    setDescription("");
    setSurveyType("one_time");
    setSelectedSites([]);
    setCampaignPackId("");
    setQuestions([createQuestion(1)]);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setTitle(survey.title);
    setDescription(survey.description || "");
    setSurveyType(survey.surveyType || "one_time");
    setSelectedSites(survey.targetSiteIds || []);
    setCampaignPackId("");
    setQuestions(
      survey.questions?.length ? survey.questions : [createQuestion(1)],
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!createSurvey.isPending && !updateSurvey.isPending) {
      setModalOpen(false);
      resetForm();
    }
  };

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  };

  const handleQuestionTypeChange = (index: number, type: string) => {
    const patch: Partial<DraftQuestion> = { type };
    if (hasOptions(type)) {
      patch.options = [
        { label: "Très satisfait", value: "very_satisfied" },
        { label: "Satisfait", value: "satisfied" },
        { label: "Insatisfait", value: "dissatisfied" },
      ];
    } else {
      patch.options = undefined;
    }
    if (type === "nps") patch.config = { min: 0, max: 10 };
    if (type === "rating") patch.config = { min: 1, max: 5 };
    updateQuestion(index, patch);
  };

  const handleSubmit = () => {
    if (submitLockRef.current) return;

    if (!organizationId || !title.trim() || selectedSites.length === 0) {
      addToast({
        type: "error",
        title: "Informations incomplètes",
        description: "Ajoutez un titre et au moins un établissement.",
      });
      return;
    }
    if (questions.some((question) => !question.title.trim())) {
      addToast({
        type: "error",
        title: "Question incomplète",
        description: "Chaque question doit avoir un intitulé.",
      });
      return;
    }
    if (!editingSurvey && requiresCampaignPack && !campaignPackId) {
      addToast({
        type: "error",
        title: "Pack campagne requis",
        description:
          "Les enquêtes ponctuelles et récurrentes consomment un crédit campagne.",
      });
      return;
    }

    const normalizedQuestions = questions.map((question, index) => ({
      ...question,
      title: question.title.trim(),
      order: index + 1,
      options: hasOptions(question.type)
        ? question.options?.filter((option) => option.label.trim())
        : undefined,
    }));

    if (
      normalizedQuestions.some(
        (question) =>
          hasOptions(question.type) && (question.options?.length || 0) < 2,
      )
    ) {
      addToast({
        type: "error",
        title: "Options insuffisantes",
        description: "Les questions à choix nécessitent au moins deux options.",
      });
      return;
    }

    if (editingSurvey) {
      submitLockRef.current = true;
      updateSurvey.mutate(
        {
          id: editingSurvey.id,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            surveyType: surveyType as any,
            targetSiteIds: selectedSites,
            questions: normalizedQuestions,
          },
        },
        {
          onSuccess: closeModal,
          onSettled: () => {
            submitLockRef.current = false;
          },
        },
      );
      return;
    }

    submitLockRef.current = true;
    createSurvey.mutate(
      {
        organizationId,
        title: title.trim(),
        description: description.trim() || undefined,
        surveyType: surveyType as any,
        targetSiteIds: selectedSites,
        campaignPackId: requiresCampaignPack ? campaignPackId : undefined,
        questions: normalizedQuestions,
        settings: { allowAnonymous: true },
      },
      {
        onSuccess: closeModal,
        onSettled: () => {
          submitLockRef.current = false;
        },
      },
    );
  };

  const toggleActive = (survey: Survey) => {
    updateSurvey.mutate({
      id: survey.id,
      payload: { isActive: !survey.isActive },
    });
  };

  const handleDelete = (survey: Survey) => {
    if (window.confirm(`Supprimer l'enquête « ${survey.title} » ?`))
      deleteSurvey.mutate(survey.id);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Enquêtes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Créez et pilotez vos campagnes de satisfaction.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle enquête
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Enquêtes
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {surveys.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Actives
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {surveys.filter((survey) => survey.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Crédits disponibles
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {packs.reduce((sum: number, pack: any) => sum + pack.remaining, 0)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/60 p-8 text-sm text-slate-500">
          Chargement des enquêtes...
        </div>
      ) : surveys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 font-medium text-slate-900 dark:text-white">
            Aucune enquête
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Achetez un pack campagne puis créez votre première enquête.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#111111]">
          <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                    <ClipboardList className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900 dark:text-white">
                      {survey.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {survey.questions?.length || 0} question(s) ·{" "}
                      {survey.targetSiteIds?.length || 0} établissement(s)
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${survey.isActive ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                    >
                      {survey.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Link
                    href={`/public/survey/${survey.id}`}
                    target="_blank"
                    className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Voir
                  </Link>
                  <Link
                    href="/dashboard/qr-codes"
                    className="inline-flex h-9 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    QR code
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => toggleActive(survey)}
                    disabled={updateSurvey.isPending}
                  >
                    <Power className="mr-2 h-4 w-4" />{" "}
                    {survey.isActive ? "Désactiver" : "Activer"}
                  </Button>
                  <Button variant="outline" onClick={() => openEdit(survey)}>
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(survey)}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSurvey ? "Modifier l’enquête" : "Nouvelle enquête"}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Titre"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex. Satisfaction après visite"
              required
            />
            <Select
              label="Type"
              value={surveyType}
              onChange={setSurveyType}
              options={[
                { value: "one_time", label: "Ponctuelle · campagne payante" },
                { value: "recurring", label: "Récurrente · campagne payante" },
                {
                  value: "continuous",
                  label: "Continue · incluse dans l’abonnement",
                },
              ]}
            />
          </div>
          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Décrivez l’objectif de cette enquête"
            rows={3}
          />

          {!editingSurvey && requiresCampaignPack && (
            <Select
              label="Crédit campagne"
              value={campaignPackId}
              onChange={setCampaignPackId}
              required
              placeholder="Sélectionner un crédit"
              options={packs.map((pack: any) => ({
                value: pack.id,
                label: `${pack.packageCode} · ${pack.remaining} crédit(s) restant(s) · expire le ${new Date(pack.expiresAt).toLocaleDateString("fr-FR")}`,
              }))}
              helperText="Un crédit est consommé uniquement si la création réussit. Les packs sont achetés par l’organisation."
            />
          )}

          {!editingSurvey && !requiresCampaignPack && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Cette enquête continue est couverte par l’abonnement de votre
              organisation et ne consomme pas de crédit campagne.
            </p>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Établissements ciblés *
            </p>
            <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-2">
              {sites.map((site: any) => (
                <label
                  key={site.id}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  <Checkbox
                    checked={selectedSites.includes(site.id)}
                    onChange={(event) =>
                      setSelectedSites((current) =>
                        event.target.checked
                          ? [...current, site.id]
                          : current.filter((id) => id !== site.id),
                      )
                    }
                  />
                  {site.name}
                </label>
              ))}
              {sites.length === 0 && (
                <p className="text-sm text-slate-500">
                  Créez d’abord un établissement.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Questions
              </h2>
              <Button
                variant="outline"
                onClick={() =>
                  setQuestions((current) => [
                    ...current,
                    createQuestion(current.length + 1),
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Ajouter une question
              </Button>
            </div>
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Question {index + 1}
                  </p>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setQuestions((current) =>
                          current.filter(
                            (_, questionIndex) => questionIndex !== index,
                          ),
                        )
                      }
                      className="text-xs text-red-600"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Intitulé"
                    value={question.title}
                    onChange={(event) =>
                      updateQuestion(index, { title: event.target.value })
                    }
                    placeholder="Votre question"
                    required
                  />
                  <Select
                    label="Type de réponse"
                    value={question.type}
                    onChange={(value) => handleQuestionTypeChange(index, value)}
                    options={questionTypes}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Checkbox
                    checked={question.required}
                    onChange={(event) =>
                      updateQuestion(index, { required: event.target.checked })
                    }
                  />{" "}
                  Réponse obligatoire
                </label>
                {hasOptions(question.type) && (
                  <Textarea
                    label="Options (une par ligne)"
                    value={(question.options || [])
                      .map((option) => option.label)
                      .join("\n")}
                    onChange={(event) =>
                      updateQuestion(index, {
                        options: event.target.value
                          .split("\n")
                          .map((label) => ({ label, value: label })),
                      })
                    }
                    rows={4}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={createSurvey.isPending || updateSurvey.isPending}
          >
            {createSurvey.isPending || updateSurvey.isPending
              ? "Enregistrement..."
              : editingSurvey
                ? "Enregistrer"
                : "Créer l’enquête"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
