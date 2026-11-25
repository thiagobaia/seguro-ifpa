"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export type QuestionType = "multiple_choice";

export type QuestionOption = {
  id: string;
  text: string;
  isOther?: boolean;
};

export type EditorQuestion = {
  id: string;
  itemId?: string;
  title: string;
  question?: string;
  description?: string;
  type: QuestionType;
  options: QuestionOption[];
  required: boolean;
};

export type GoogleFormsQuestionEditorProps = {
  initialQuestions?: EditorQuestion[];
  questionType?: QuestionType;
  questionOptions?: QuestionOption[];
  onChange?: (questions: EditorQuestion[]) => void;
};

type ItemPrompt = { id: string; text: string };
type ChecklistItemBlock = { id: string; title: string; prompts: ItemPrompt[] };

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const fallbackOptions: QuestionOption[] = [
  { id: "fallback-conforme", text: "Conforme" },
  { id: "fallback-nao-conforme", text: "Não conforme" },
  { id: "fallback-na", text: "Não se aplica" },
];

function itemFromQuestions(itemId: string, questions: EditorQuestion[]): ChecklistItemBlock {
  const first = questions[0];
  return {
    id: itemId,
    title: first?.title ?? "",
    prompts: questions.map((question) => ({
      id: question.id,
      text: question.question?.trim() || question.title,
    })),
  };
}

function initialItemBlocks(initialQuestions?: EditorQuestion[]): ChecklistItemBlock[] {
  if (!initialQuestions?.length) {
    return [{ id: makeId(), title: "", prompts: [{ id: makeId(), text: "" }] }];
  }
  const grouped = new Map<string, EditorQuestion[]>();
  initialQuestions.forEach((question) => {
    const key = question.itemId || `legacy-${question.id}`;
    const group = grouped.get(key) ?? [];
    group.push(question);
    grouped.set(key, group);
  });
  return Array.from(grouped, ([itemId, questions]) => itemFromQuestions(itemId, questions));
}

const inputClass = "min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export function GoogleFormsQuestionEditor({ initialQuestions, questionType, questionOptions, onChange }: GoogleFormsQuestionEditorProps) {
  const resolvedType = questionType ?? initialQuestions?.[0]?.type ?? "multiple_choice";
  const resolvedOptions = questionOptions?.length ? questionOptions : initialQuestions?.[0]?.options?.length ? initialQuestions[0].options : fallbackOptions;
  const [items, setItems] = useState<ChecklistItemBlock[]>(() => initialItemBlocks(initialQuestions));

  useEffect(() => {
    const questions = items.flatMap((item) => item.prompts.map((prompt): EditorQuestion => ({
      id: prompt.id,
      itemId: item.id,
      title: item.title,
      question: prompt.text,
      description: "",
      type: resolvedType,
      options: resolvedOptions,
      required: true,
    })));
    onChange?.(questions);
  }, [items, resolvedType, resolvedOptions, onChange]);

  function updateItemTitle(itemId: string, title: string) {
    setItems((current) => current.map((item) => item.id === itemId ? { ...item, title } : item));
  }

  function updatePrompt(itemId: string, promptId: string, text: string) {
    setItems((current) => current.map((item) => item.id === itemId
      ? { ...item, prompts: item.prompts.map((prompt) => prompt.id === promptId ? { ...prompt, text } : prompt) }
      : item));
  }

  function addPrompt(itemId: string) {
    setItems((current) => current.map((item) => item.id === itemId
      ? { ...item, prompts: [...item.prompts, { id: makeId(), text: "" }] }
      : item));
  }

  function addItem() {
    setItems((current) => [...current, { id: makeId(), title: "", prompts: [{ id: makeId(), text: "" }] }]);
  }

  function removeItem(itemId: string) {
    setItems((current) => current.length > 1 ? current.filter((item) => item.id !== itemId) : [{ id: makeId(), title: "", prompts: [{ id: makeId(), text: "" }] }]);
  }

  return <section className="mt-5 min-w-0" aria-labelledby="verification-items-title">
    <h2 id="verification-items-title" className="mb-4 text-xl font-bold text-emerald-950 sm:text-2xl">Itens de verificação</h2>
    <div className="grid gap-4">
      {items.map((item, itemIndex) => <article key={item.id} className="grid min-w-0 gap-5 rounded-xl bg-slate-50 p-4 sm:p-5" aria-label={`Item ${itemIndex + 1}`}>
        <header className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Item {String(itemIndex + 1).padStart(2, "0")}</span>
          <button type="button" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-white hover:text-rose-700" onClick={() => removeItem(item.id)} aria-label={`Remover item ${itemIndex + 1}`}><Trash2 size={14} /> Remover</button>
        </header>
        <div className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-1.5"><label className="text-sm font-medium text-slate-700" htmlFor={`item-title-${item.id}`}>Título da Pergunta<span className="text-emerald-700">*</span></label><input id={`item-title-${item.id}`} className={inputClass} placeholder="Ex.: Capacete em boas condições" value={item.title} onChange={(event) => updateItemTitle(item.id, event.target.value)} required /></div>
          {item.prompts.map((prompt, promptIndex) => <div key={prompt.id} className="grid min-w-0 gap-1.5"><label className="text-sm font-medium text-slate-700" htmlFor={`item-prompt-${prompt.id}`}>Pergunta - {promptIndex + 1}<span className="text-emerald-700">*</span></label><input id={`item-prompt-${prompt.id}`} className={inputClass} placeholder="Ex.: Capacete" value={prompt.text} onChange={(event) => updatePrompt(item.id, prompt.id, event.target.value)} required /></div>)}
          <button type="button" onClick={() => addPrompt(item.id)} className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><Plus size={17} aria-hidden="true" /> <span>Adicionar pergunta</span></button>
        </div>
      </article>)}
    </div>
    <button type="button" onClick={addItem} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><Plus size={18} aria-hidden="true" /> <span>Adicionar item</span></button>
  </section>;
}
