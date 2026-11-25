"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

function required(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitEpiRequest(formData: FormData) {
  const name = required(formData, "name");
  const registration = required(formData, "registration");
  const sectorName = required(formData, "sector");
  const jobFunction = required(formData, "jobFunction");
  const epi = required(formData, "epi");
  const reason = required(formData, "reason");
  if (!name || !registration || !sectorName || !jobFunction || !epi || !reason) redirect("/solicitar-epi?erro=campos");

  const sector = await prisma.sector.upsert({ where: { name: sectorName }, update: {}, create: { name: sectorName } });
  await prisma.epiRequest.create({ data: { name, registration, sectorId: sector.id, jobFunction, epi, reason } });
  revalidatePath("/tst");
  redirect("/solicitar-epi?enviado=1");
}

export async function submitSafetyReport(formData: FormData) {
  const sectorName = required(formData, "sector");
  const occurrence = required(formData, "occurrence");
  const description = required(formData, "description");
  const anonymous = formData.get("anonymous") === "on";
  if (!sectorName || !occurrence || !description) redirect("/denuncia?erro=campos");

  const sector = await prisma.sector.upsert({ where: { name: sectorName }, update: {}, create: { name: sectorName } });
  // Não armazenamos identidade, conta, e-mail, IP nem user-agent associados à denúncia.
  await prisma.safetyReport.create({ data: { anonymous, sectorId: sector.id, occurrence, description } });
  revalidatePath("/tst");
  redirect("/denuncia?enviado=1");
}

export async function submitChecklistResponse(formData: FormData) {
  const workerName = required(formData, "workerName");
  const registration = required(formData, "registration");
  const functionName = required(formData, "jobFunction");
  const sectorName = required(formData, "sector");
  const checklistId = required(formData, "checklistId");
  const checklist = await prisma.checklist.findUnique({ where: { id: checklistId }, include: { jobFunction: true, sector: true } });
  if (!workerName || !registration || !checklist || checklist.jobFunction.name !== functionName || checklist.sector.name !== sectorName) redirect("/checklist?erro=checklist");

  const storedItems: unknown[] = (Array.isArray(checklist.items) ? checklist.items : []).filter((entry) => {
    if (typeof entry === "string") return entry.trim().toLocaleLowerCase("pt-BR") !== "nome";
    if (!entry || typeof entry !== "object") return true;
    const title = (entry as { title?: unknown }).title;
    return typeof title !== "string" || title.trim().toLocaleLowerCase("pt-BR") !== "nome";
  });
  const isQuestionEditorData = storedItems.some((item) => !!item && typeof item === "object" && "type" in item);
  const answers = isQuestionEditorData
    ? storedItems.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const question = entry as { id?: unknown; itemId?: unknown; title?: unknown; question?: unknown; type?: unknown; required?: unknown };
      if (typeof question.id !== "string") return [];
      const key = `answer-${question.id}`;
      const values = formData.getAll(key).map(String).map((answer) => answer.trim()).filter(Boolean);
      if (question.required === true && values.length === 0) return [];
      const title = typeof question.title === "string" ? question.title : "";
      const prompt = typeof question.question === "string" ? question.question.trim() : "";
      return [{ questionId: question.id, ...(typeof question.itemId === "string" ? { itemId: question.itemId } : {}), question: prompt ? `${title} — ${prompt}` : title, type: typeof question.type === "string" ? question.type : "", value: values[0] ?? "" }];
    })
    : storedItems.map((item, index) => ({ item, checked: formData.get(`item-${index}`) === "on" }));
  if (isQuestionEditorData && answers.length !== storedItems.length) {
    redirect(`/checklist?funcao=${encodeURIComponent(functionName)}&setor=${encodeURIComponent(sectorName)}&erro=respostas`);
  }
  const jsonAnswers = JSON.parse(JSON.stringify([{ questionId: "worker-name", question: "Nome do trabalhador", value: workerName }, { questionId: "worker-registration", question: "Matrícula", value: registration }, ...answers])) as Prisma.InputJsonValue;
  await prisma.checklistResponse.create({ data: { checklistId, answers: jsonAnswers } });
  revalidatePath("/tst");
  redirect(`/checklist?funcao=${encodeURIComponent(functionName)}&setor=${encodeURIComponent(sectorName)}&enviado=1`);
}
