"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, X } from "lucide-react";
import { submitChecklistResponse } from "@/app/actions";

type ChecklistQuestion = {
  id: string;
  itemId?: string;
  title: string;
  question?: string;
  description?: string;
  type: "multiple_choice" | "legacy";
  options: { id: string; text: string }[];
  required: boolean;
};
type ChecklistQuestionGroup = { id: string; title: string; questions: ChecklistQuestion[] };
type ChecklistItem = { id: string; title: string; functionName: string; sectorName: string; questions: ChecklistQuestion[] };

const fieldClass = "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#176f57] focus:ring-2 focus:ring-[#e8f4ee]";

function groupQuestions(questions: ChecklistQuestion[]): ChecklistQuestionGroup[] {
  const groups = new Map<string, ChecklistQuestionGroup>();
  questions.forEach((question, index) => {
    const id = question.itemId || `question-${question.id || index}`;
    const group = groups.get(id);
    if (group) group.questions.push(question);
    else groups.set(id, { id, title: question.title, questions: [question] });
  });
  return Array.from(groups.values());
}

export function WorkerChecklistCatalog({ checklists }: { checklists: ChecklistItem[] }) {
  const [selected, setSelected] = useState<ChecklistItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  return <>
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Checklists encontrados">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-[#e8f4ee] px-4 py-4 sm:px-5">
        <div><h2 className="text-base font-bold text-[#0e5b46] sm:text-lg">Checklists disponíveis</h2><p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">Selecione um item da lista para abrir e responder.</p></div>
        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#176f57] px-2 text-sm font-bold text-white">{checklists.length}</span>
      </div>
      <div className="grid gap-2 p-3 sm:p-4">
        {checklists.map((item) => <button className="group flex min-h-16 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#176f57] hover:bg-[#e8f4ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176f57] focus-visible:ring-offset-2" type="button" key={item.id} onClick={() => setSelected(item)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8f4ee] text-[#176f57] group-hover:bg-white"><ClipboardCheck size={20} /></span>
          <span className="flex min-w-0 flex-1 flex-col gap-1"><strong className="truncate text-sm font-semibold text-slate-800">{item.title}</strong><small className="truncate text-xs text-slate-500">{item.functionName} · {item.sectorName}</small></span>
          <ArrowRight className="shrink-0 text-[#176f57] transition-transform group-hover:translate-x-1" size={19} aria-hidden="true" />
        </button>)}
      </div>
    </section>

    {selected && <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]" role="dialog" aria-modal="true" aria-labelledby="worker-checklist-title">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#cfe6db] bg-[#e8f4ee] p-4 sm:p-6"><div className="min-w-0"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-[#176f57]">{selected.functionName} · {selected.sectorName}</span><h2 id="worker-checklist-title" className="truncate text-xl font-bold text-[#0e5b46] sm:text-2xl">{selected.title}</h2><p className="mt-1 text-sm text-slate-600">Preencha seus dados e responda às perguntas abaixo.</p></div><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-[#176f57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176f57]" type="button" aria-label="Fechar checklist" onClick={() => setSelected(null)}><X size={20} /></button></header>
        <form action={submitChecklistResponse} className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <input type="hidden" name="jobFunction" value={selected.functionName} /><input type="hidden" name="sector" value={selected.sectorName} /><input type="hidden" name="checklistId" value={selected.id} />
          <div className="mb-5 grid gap-3 sm:grid-cols-2"><div className="grid gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="worker-name">Nome do trabalhador <span className="text-[#176f57]">*</span></label><input className={fieldClass} id="worker-name" name="workerName" type="text" autoComplete="name" placeholder="Digite seu nome completo" required /></div><div className="grid gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="worker-registration">Matrícula <span className="text-[#176f57]">*</span></label><input className={fieldClass} id="worker-registration" name="registration" inputMode="numeric" autoComplete="off" placeholder="Digite sua matrícula" required /></div></div>
          <div className="grid gap-5">
            {groupQuestions(selected.questions).map((group) => <section key={group.id} className="grid gap-3 rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-bold text-slate-800">{group.title || "Item do checklist"}</h3>
              {group.questions.map((question, questionIndex) => {
                const prompt = question.question?.trim();
                const label = prompt || group.title || "Pergunta sem título";
                const description = question.description?.trim();
                if (question.type === "legacy") return <label key={question.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 hover:bg-slate-50"><input className="mt-0.5 h-4 w-4 accent-[#176f57]" type="checkbox" name={`item-${question.id}`} /><span>{label}</span></label>;
                const name = `answer-${question.id}`;
                return <fieldset key={question.id} className="grid gap-2 rounded-lg bg-slate-50 p-3"><legend className="px-1 text-xs font-medium text-slate-600">Pergunta - {questionIndex + 1}</legend><p className="text-sm font-semibold text-slate-700">{label}{question.required ? <span className="text-[#176f57]"> *</span> : null}</p>{description && <p className="text-xs leading-5 text-slate-500">{description}</p>}{question.options.map((option, optionIndex) => <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-[#e8f4ee]"><input className="h-4 w-4 accent-[#176f57]" type="radio" name={name} value={option.text} required={question.required && optionIndex === 0} /><span>{option.text}</span></label>)}</fieldset>;
              })}
            </section>)}
          </div>
          <footer className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"><button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176f57]" type="button" onClick={() => setSelected(null)}>Voltar à lista</button><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#176f57] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0e5b46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176f57] focus-visible:ring-offset-2" type="submit">Enviar checklist</button></footer>
        </form>
      </section>
    </div>}
  </>;
}
