"use client";

import { useCallback, useState } from "react";
import { createChecklist, createTraining, publishBulletin } from "@/app/tst-actions";
import { GoogleFormsQuestionEditor, type EditorQuestion, type QuestionOption, type QuestionType } from "@/components/google-forms-question-editor";

type TstToolsProps = { section: "checklists" | "bulletins" | "trainings" };

const checklistFieldOptions: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "Múltipla escolha" },
];

function makeOptionId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function TstTools({ section }: TstToolsProps) {
  const [questionsJson, setQuestionsJson] = useState("[]");
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [questionOptions, setQuestionOptions] = useState<QuestionOption[]>([
    { id: makeOptionId(), text: "Conforme" },
    { id: makeOptionId(), text: "Não conforme" },
    { id: makeOptionId(), text: "Não se aplica" },
  ]);
  const handleQuestionsChange = useCallback((questions: EditorQuestion[]) => {
    setQuestionsJson(JSON.stringify(questions));
  }, []);

  function updateQuestionOption(optionId: string, text: string) {
    setQuestionOptions((current) => current.map((option) => option.id === optionId ? { ...option, text } : option));
  }

  function addQuestionOption(isOther = false) {
    if (isOther && questionOptions.some((option) => option.isOther)) return;
    const nextNumber = questionOptions.filter((option) => !option.isOther).length + 1;
    setQuestionOptions((current) => [...current, { id: makeOptionId(), text: isOther ? "Outro..." : `Opção ${nextNumber}`, ...(isOther ? { isOther: true } : {}) }]);
  }

  function removeQuestionOption(optionId: string) {
    setQuestionOptions((current) => current.length > 1 ? current.filter((option) => option.id !== optionId) : current);
  }

  if (section === "checklists") {
    return <section id="checklists" className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8"><div className="mb-6"><span className="mb-2 block text-[11px] font-bold tracking-widest text-emerald-700">CHECKLISTS</span><h2 className="text-2xl font-bold text-emerald-950 sm:text-3xl">Informações do checklist</h2><p className="mt-1 text-sm leading-5 text-slate-500">Preencha os dados e adicione os itens que serão verificados.</p></div>
      <form action={createChecklist} className="grid grid-cols-1 gap-5">
        <div className="grid min-w-0 gap-2"><label className="text-sm font-medium text-slate-700" htmlFor="checklist-title">Título <span className="text-emerald-700">*</span></label><input className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="checklist-title" name="title" placeholder="Ex.: Conferência diária" required /></div>
        <div className="grid min-w-0 gap-2"><label className="text-sm font-medium text-slate-700" htmlFor="checklist-function">Função <span className="text-emerald-700">*</span></label><input className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="checklist-function" name="jobFunction" type="text" placeholder="Ex.: Operador de produção" required /></div>
        <div className="grid min-w-0 gap-2"><label className="text-sm font-medium text-slate-700" htmlFor="checklist-sector">Setor <span className="text-emerald-700">*</span></label><input className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="checklist-sector" name="sector" type="text" placeholder="Ex.: Produção" required /></div>
        <div className="grid min-w-0 gap-2"><label className="text-sm font-medium text-slate-700" htmlFor="checklist-field">Campo <span className="text-emerald-700">*</span></label><select className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="checklist-field" name="fieldType" value={questionType} onChange={(event) => setQuestionType(event.target.value as QuestionType)} required>{checklistFieldOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
        <div className="grid min-w-0 gap-2 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/30 p-4"><span className="text-sm font-semibold text-slate-700">Opções de resposta</span><div className="grid gap-2">{questionOptions.map((option) => <div key={option.id} className="flex items-center gap-2"><span className="w-4 shrink-0 text-center text-slate-400">{option.isOther ? "↳" : "•"}</span><input className="min-h-9 min-w-0 flex-1 border-0 border-b border-slate-200 bg-transparent px-1 py-1 text-sm text-slate-700 outline-none focus:border-emerald-600" aria-label="Texto da opção global" value={option.text} onChange={(event) => updateQuestionOption(option.id, event.target.value)} required /><button type="button" className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-700" aria-label="Remover opção global" onClick={() => removeQuestionOption(option.id)}>×</button></div>)}</div><div className="flex flex-wrap gap-3 text-xs"><button type="button" className="font-medium text-emerald-700 hover:underline" onClick={() => addQuestionOption()}>+ Adicionar opção</button></div></div>
        <input type="hidden" name="questions" value={questionsJson} />
        <GoogleFormsQuestionEditor questionType={questionType} questionOptions={questionOptions} onChange={handleQuestionsChange} />
        <button className="mt-1 inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" type="submit">Criar checklist</button>
      </form>
    </section>;
  }

  if (section === "trainings") {
    return <section id="trainings" className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-5"><span className="mb-2 block text-[11px] font-bold tracking-widest text-emerald-700">TREINAMENTOS</span><h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Publicar treinamento</h2><p className="mt-1 text-sm leading-5 text-slate-500">Disponibilize materiais de saúde, segurança e bem-estar para os funcionários.</p></div>
      <form action={createTraining} className="grid grid-cols-1 gap-4">
        <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="training-title">Título do treinamento</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="training-title" name="title" placeholder="Ex.: Uso correto de EPIs" required /></div>
        <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="training-file-name">Nome do material</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="training-file-name" name="fileName" placeholder="Ex.: Guia de uso de EPI" required /></div>
        <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="training-file-url">Link do material</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="training-file-url" name="fileUrl" type="url" placeholder="https://..." required /></div>
        <div className="grid min-w-0 gap-2"><button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" type="submit">Publicar treinamento</button></div>
      </form>
    </section>;
  }

  return <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-5"><div><span className="mb-2 block text-[11px] font-bold tracking-widest text-emerald-700">INFORMATIVOS</span><h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Publicar informativo</h2><p className="mt-1 text-sm leading-5 text-slate-500">A publicação sai do feed automaticamente na data escolhida.</p></div></div>
    <form action={publishBulletin} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="grid min-w-0 gap-2 md:col-span-2"><label className="text-sm font-semibold text-slate-700" htmlFor="bulletin-title">Título</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="bulletin-title" name="title" required /></div>
      <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="bulletin-category">Categoria</label><select className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="bulletin-category" name="category"><option>Prevenção</option><option>Bem-estar</option><option>Para você</option></select></div>
      <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="bulletin-expiry">Data de expiração</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="bulletin-expiry" name="expiresAt" type="date" required /></div>
      <div className="grid min-w-0 gap-2 md:col-span-2"><label className="text-sm font-semibold text-slate-700" htmlFor="bulletin-image">Foto (URL)</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="bulletin-image" name="imageUrl" type="url" placeholder="https://…" /></div>
      <div className="grid min-w-0 gap-2 md:col-span-2"><label className="text-sm font-semibold text-slate-700" htmlFor="bulletin-description">Descrição</label><textarea className="min-h-32 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="bulletin-description" name="description" required /></div>
      <div className="grid min-w-0 gap-2 md:col-span-2"><button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" type="submit">Publicar informativo</button></div>
    </form>
  </section>;
}
