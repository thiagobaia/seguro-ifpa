"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTst } from "@/lib/require-tst";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

const questionTypes = ["multiple_choice"] as const;
type ChecklistQuestion = {
  id: string;
  itemId?: string;
  title: string;
  question?: string;
  description?: string;
  type: (typeof questionTypes)[number];
  options: { id: string; text: string; isOther?: boolean }[];
  required: boolean;
};

function parseChecklistQuestions(raw: string): ChecklistQuestion[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Perguntas ausentes");
  return parsed.map((entry): ChecklistQuestion => {
    if (!entry || typeof entry !== "object") throw new Error("Pergunta inválida");
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== "string" || (item.itemId !== undefined && typeof item.itemId !== "string") || typeof item.title !== "string" || !item.title.trim() || typeof item.question !== "string" || !item.question.trim() || !questionTypes.includes(item.type as ChecklistQuestion["type"])) {
      throw new Error("Pergunta inválida");
    }
    const options = Array.isArray(item.options) ? item.options.map((option) => {
      if (!option || typeof option !== "object") throw new Error("Opção inválida");
      const value = option as Record<string, unknown>;
      if (typeof value.id !== "string" || typeof value.text !== "string") throw new Error("Opção inválida");
      return { id: value.id, text: value.text, ...(value.isOther === true ? { isOther: true } : {}) };
    }) : [];
    return {
      id: item.id,
      ...(typeof item.itemId === "string" ? { itemId: item.itemId } : {}),
      title: item.title,
      question: item.question,
      description: typeof item.description === "string" ? item.description : "",
      type: item.type as ChecklistQuestion["type"],
      options,
      required: item.required === true,
    };
  });
}

export async function createChecklist(formData: FormData) {
  await requireTst();
  const title = value(formData, "title");
  const functionName = value(formData, "jobFunction");
  const sectorName = value(formData, "sector");
  let questions: ChecklistQuestion[];
  try {
    questions = parseChecklistQuestions(value(formData, "questions"));
  } catch {
    redirect("/tst?erro=checklist");
  }
  if (!title || !functionName || !sectorName || !questions.length) redirect("/tst?erro=checklist");

  const [jobFunction, sector] = await Promise.all([
    prisma.jobFunction.upsert({ where: { name: functionName }, update: {}, create: { name: functionName } }),
    prisma.sector.upsert({ where: { name: sectorName }, update: {}, create: { name: sectorName } }),
  ]);
  await prisma.checklist.create({ data: { title, jobFunctionId: jobFunction.id, sectorId: sector.id, items: questions } });
  revalidatePath("/tst");
  revalidatePath("/checklist");
  redirect("/tst?criado=checklist#checklists");
}

export async function updateChecklist(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  const title = value(formData, "title");
  const functionName = value(formData, "jobFunction");
  const sectorName = value(formData, "sector");
  let questions: ChecklistQuestion[];
  try {
    questions = parseChecklistQuestions(value(formData, "questions"));
  } catch {
    redirect("/tst?erro=checklist");
  }
  if (!id || !title || !functionName || !sectorName || !questions.length) redirect("/tst?erro=checklist");
  const existing = await prisma.checklist.findUnique({ where: { id } });
  if (!existing) redirect("/tst?erro=checklist");
  const [jobFunction, sector] = await Promise.all([
    prisma.jobFunction.upsert({ where: { name: functionName }, update: {}, create: { name: functionName } }),
    prisma.sector.upsert({ where: { name: sectorName }, update: {}, create: { name: sectorName } }),
  ]);
  await prisma.checklist.update({ where: { id }, data: { title, jobFunctionId: jobFunction.id, sectorId: sector.id, items: questions } });
  revalidatePath("/tst");
  revalidatePath("/checklist");
  redirect("/tst?atualizado=checklist#checklists");
}

export async function deleteChecklist(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) redirect("/tst?erro=checklist");
  const existing = await prisma.checklist.findUnique({ where: { id } });
  if (!existing) redirect("/tst?erro=checklist");
  await prisma.checklist.delete({ where: { id } });
  revalidatePath("/tst");
  revalidatePath("/checklist");
  redirect("/tst?excluido=checklist#checklists");
}

export async function archiveChecklistResponse(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) redirect("/tst?erro=checklist#checklists");
  const response = await prisma.checklistResponse.findUnique({ where: { id } });
  if (!response) redirect("/tst?erro=checklist#checklists");
  if (!response.archivedAt) {
    await prisma.checklistResponse.update({ where: { id }, data: { archivedAt: new Date() } });
  }
  revalidatePath("/tst");
  redirect("/tst?arquivado=checklist#checklists");
}

export async function deleteChecklistResponse(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) redirect("/tst?erro=checklist#checklists");
  const response = await prisma.checklistResponse.findUnique({ where: { id } });
  if (!response) redirect("/tst?erro=checklist#checklists");
  await prisma.checklistResponse.delete({ where: { id } });
  revalidatePath("/tst");
  redirect("/tst?excluido=resposta#checklists");
}

export async function deleteEpiRequest(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) redirect("/tst?erro=exclusao#requests");
  const existing = await prisma.epiRequest.findUnique({ where: { id } });
  if (!existing) redirect("/tst?erro=exclusao#requests");
  await prisma.epiRequest.delete({ where: { id } });
  revalidatePath("/tst");
  redirect("/tst?excluido=solicitacao#requests");
}

export async function deleteSafetyReport(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) redirect("/tst?erro=exclusao#reports");
  const existing = await prisma.safetyReport.findUnique({ where: { id } });
  if (!existing) redirect("/tst?erro=exclusao#reports");
  await prisma.safetyReport.delete({ where: { id } });
  revalidatePath("/tst");
  redirect("/tst?excluido=denuncia#reports");
}

export async function publishBulletin(formData: FormData) {
  await requireTst();
  const title = value(formData, "title");
  const description = value(formData, "description");
  const category = value(formData, "category") || "Prevenção";
  const imageUrl = value(formData, "imageUrl") || null;
  const expiration = value(formData, "expiresAt");
  const expiresAt = new Date(`${expiration}T23:59:59`);
  if (!title || !description || !expiration || Number.isNaN(expiresAt.getTime())) redirect("/tst?erro=informativo");

  await prisma.bulletin.create({ data: { title, description, category, imageUrl, expiresAt } });
  revalidatePath("/home");
  revalidatePath("/tst");
  redirect("/tst?criado=informativo#bulletins");
}

export async function deleteBulletin(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) return;
  const existing = await prisma.bulletin.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.bulletin.delete({ where: { id } });
  revalidatePath("/home");
  revalidatePath("/tst");
}

export async function createTraining(formData: FormData) {
  await requireTst();
  const title = value(formData, "title");
  const fileName = value(formData, "fileName");
  const fileUrl = value(formData, "fileUrl");
  let validUrl = false;
  try { validUrl = Boolean(fileUrl) && ["http:", "https:"].includes(new URL(fileUrl).protocol); } catch { validUrl = false; }
  if (!title || !fileName || !validUrl) redirect("/tst?erro=treinamento#trainings");
  await prisma.training.create({ data: { title, files: [{ name: fileName, url: fileUrl }] } });
  revalidatePath("/treinamentos");
  revalidatePath("/tst");
  redirect("/tst?criado=treinamento#trainings");
}

export async function deleteTraining(formData: FormData) {
  await requireTst();
  const id = value(formData, "id");
  if (!id) redirect("/tst?erro=exclusao#trainings");
  const existing = await prisma.training.findUnique({ where: { id } });
  if (!existing) redirect("/tst?erro=exclusao#trainings");
  await prisma.training.delete({ where: { id } });
  revalidatePath("/treinamentos");
  revalidatePath("/tst");
  redirect("/tst?excluido=treinamento#trainings");
}
