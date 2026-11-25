import { prisma } from "@/lib/prisma";
import { requireTst } from "@/lib/require-tst";
import { TstDashboard } from "@/components/tst-dashboard";
import type { EditorQuestion } from "@/components/google-forms-question-editor";

export const dynamic = "force-dynamic";

function toEditorQuestions(data: unknown): EditorQuestion[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry, index): EditorQuestion[] => {
    if (typeof entry === "string") {
      return [{
        id: `legacy-${index}`,
        title: entry,
        type: "multiple_choice",
        options: [{ id: `legacy-${index}-yes`, text: "Sim" }, { id: `legacy-${index}-no`, text: "Não" }],
        required: false,
      }];
    }
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const types = ["multiple_choice"] as const;
    if (typeof item.id !== "string" || typeof item.title !== "string" || !types.includes(item.type as typeof types[number])) return [];
    const options = Array.isArray(item.options) ? item.options.flatMap((option): EditorQuestion["options"] => {
      if (!option || typeof option !== "object") return [];
      const value = option as Record<string, unknown>;
      return typeof value.id === "string" && typeof value.text === "string"
        ? [{ id: value.id, text: value.text, ...(value.isOther === true ? { isOther: true } : {}) }]
        : [];
    }) : [];
    return [{ id: item.id, ...(typeof item.itemId === "string" ? { itemId: item.itemId } : {}), title: item.title, question: typeof item.question === "string" ? item.question : "", description: typeof item.description === "string" ? item.description : "", type: item.type as EditorQuestion["type"], options, required: item.required === true }];
  });
}

export default async function TstDashboardPage({ searchParams }: { searchParams: Promise<{ criado?: string; atualizado?: string; excluido?: string; arquivado?: string; erro?: string }> }) {
  const params = await searchParams;
  const session = await requireTst();

  const [requests, reports, checklists, submissions, trainings] = await Promise.all([
    prisma.epiRequest.findMany({ include: { sector: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.safetyReport.findMany({ include: { sector: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.checklist.findMany({ include: { jobFunction: true, sector: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.checklistResponse.findMany({ include: { checklist: { include: { jobFunction: true, sector: true } } }, orderBy: { submittedAt: "desc" }, take: 100 }),
    prisma.training.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  const requestItems = requests.map((item) => ({
    id: item.id,
    title: item.epi,
    detail: `${item.name} · ${item.jobFunction} · ${item.sector.name}`,
    description: item.reason,
    date: item.createdAt.toLocaleDateString("pt-BR"),
    dateTime: item.createdAt.toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    workerName: item.name,
    registration: item.registration,
    jobFunction: item.jobFunction,
    sectorName: item.sector.name,
    epiName: item.epi,
  }));
  const reportItems = reports.map((item) => ({
    id: item.id,
    title: item.occurrence,
    detail: `${item.sector.name} · ${item.anonymous ? "Anônima" : "Sem identificação coletada"}`,
    description: item.description,
    date: item.createdAt.toLocaleDateString("pt-BR"),
    dateTime: item.createdAt.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" }),
    sectorName: item.sector.name,
    anonymous: item.anonymous,
  }));
  const checklistItems = checklists.map((item) => ({
    id: item.id,
    title: item.title,
    detail: `${item.jobFunction.name} · ${item.sector.name}`,
    date: item.createdAt.toLocaleDateString("pt-BR"),
    functionName: item.jobFunction.name,
    sectorName: item.sector.name,
    questions: toEditorQuestions(item.items),
  }));
  const submissionItems = submissions.map((item) => ({
    id: item.id,
    title: item.checklist.title,
    functionName: item.checklist.jobFunction.name,
    sectorName: item.checklist.sector.name,
    date: item.submittedAt.toLocaleString("pt-BR"),
    registration: Array.isArray(item.answers) ? String((item.answers as { questionId?: string; value?: unknown }[]).find((answer) => answer.questionId === "worker-registration")?.value ?? "") : "",
    archived: Boolean(item.archivedAt),
    questions: toEditorQuestions(item.checklist.items),
    answers: Array.isArray(item.answers) ? item.answers as unknown as { questionId?: string; question?: string; type?: string; value?: unknown; item?: unknown; checked?: boolean }[] : [],
  }));
  const trainingItems = trainings.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.createdAt.toLocaleDateString("pt-BR"),
    files: Array.isArray(item.files) ? item.files.flatMap((file) => typeof file === "object" && file !== null && "name" in file && "url" in file && typeof file.name === "string" && typeof file.url === "string" ? [{ name: file.name, url: file.url }] : []) : [],
  }));

  return <TstDashboard
    userName={session.user.name}
    requests={requestItems}
    reports={reportItems}
    checklists={checklistItems}
    trainings={trainingItems}
    submissions={submissionItems}
    created={params.criado}
    updated={params.atualizado}
    deleted={params.excluido}
    archived={params.arquivado}
    error={params.erro}
  />;
}
