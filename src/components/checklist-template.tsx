import { Fragment } from "react";
import { Check } from "lucide-react";
import type { EditorQuestion } from "@/components/google-forms-question-editor";
import { companyMock } from "@/lib/company-mock";

export type ChecklistDocumentAnswer = { questionId?: string; value?: unknown; checked?: boolean };

type ChecklistTemplateProps = {
  title: string;
  functionName?: string;
  sectorName?: string;
  workerName?: string;
  registration?: string;
  submittedAt?: string;
  questions: EditorQuestion[];
  answers?: ChecklistDocumentAnswer[];
};

export function ChecklistTemplate({ title, functionName, sectorName, workerName, registration, submittedAt, questions, answers = [] }: ChecklistTemplateProps) {
  const cell = "border border-slate-500 px-1.5 py-1 text-[10px] leading-4";
  const column = "border border-white px-1 py-1 text-center text-[9px] font-bold leading-3 text-white";
  const checkCell = `${cell} w-[14%] p-1.5 text-center align-middle`;
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const itemGroups = safeQuestions.reduce<Array<{ id: string; title: string; questions: EditorQuestion[] }>>((groups, question, index) => {
    const id = question.itemId || `question-${question.id || index}`;
    const group = groups.find((item) => item.id === id);
    if (group) group.questions.push(question);
    else groups.push({ id, title: question.title || "Item do checklist", questions: [question] });
    return groups;
  }, []);

  return <div data-checklist-document className="mx-auto w-[85%] max-w-[820px] bg-white py-2 font-sans text-slate-900 print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
    <div className="relative mb-5 flex min-h-14 items-center justify-center px-5 text-center">
      <h1 id="checklist-template-title" className="m-0 text-[18px] font-bold text-[#176f57]">{title || "Checklist Segurança do Trabalho"}</h1>
      {submittedAt && <p className="absolute right-5 top-full mt-1 text-right text-[9px] text-slate-500">{submittedAt}</p>}
    </div>

    <section className="mb-3">
      <h2 className="bg-[#176f57] px-1 py-1 text-left text-[11px] font-bold text-white print:bg-[#176f57] print:text-white print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]">Empresa</h2>
      <table className="w-full table-fixed border-collapse">
        <tbody>
          <tr><td className={cell}><strong>Nome:</strong> {companyMock.name}</td><td className={cell}><strong>CNPJ:</strong> {companyMock.taxId}</td></tr>
          <tr><td className={cell}><strong>Endereço:</strong> {companyMock.address}</td><td className={cell}><strong>Telefone:</strong> {companyMock.phone}</td></tr>
        </tbody>
      </table>
    </section>

    <section className="mb-3">
      <h2 className="bg-[#176f57] px-1 py-1 text-left text-[11px] font-bold text-white print:bg-[#176f57] print:text-white print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]">Área</h2>
      <table className="w-full table-fixed border-collapse"><tbody>
        <tr><td className={cell}><strong>Nome:</strong> {workerName || "—"}</td><td className={cell}><strong>Setor:</strong> {sectorName || "—"}</td></tr>
        <tr><td className={cell}><strong>Função:</strong> {functionName || "—"}</td><td className={cell}><strong>Matrícula:</strong> {registration || "—"}</td></tr>
      </tbody></table>
    </section>

    <section>
      <table className="w-full table-fixed border-collapse text-[10px]">
        <tbody>
          {itemGroups.length ? itemGroups.map((group, itemIndex) => {
            const options = group.questions[0]?.options?.filter((option) => option.text.trim()) ?? [];
            const responseOptions = options.length ? options : [
              { id: "default-conforme", text: "Conforme" },
              { id: "default-nao-conforme", text: "Não conforme" },
              { id: "default-na", text: "Não se aplica" },
            ];
            return <Fragment key={group.id}>
              <tr className="bg-[#176f57] print:bg-[#176f57] print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact]"><th className="w-[58%] border border-white px-1 py-1 text-left text-[9px] font-bold leading-3 text-white print:bg-[#176f57] print:text-white">{itemIndex + 1}. {group.title}</th>{responseOptions.map((option) => <th key={option.id} className={`${column} print:bg-[#176f57] print:text-white`}>{option.text}</th>)}</tr>
              {group.questions.map((question, promptIndex) => {
                const response = answers.find((answer) => answer.questionId === question.id);
                const selectedValues = Array.isArray(response?.value) ? response.value.map(String) : response?.value === undefined ? [] : [String(response.value)];
                return <tr key={question.id}><td className={`${cell} font-medium`}>{question.question?.trim() || question.title || `Pergunta ${promptIndex + 1}`}</td>{responseOptions.map((option) => {
                  const isSelected = selectedValues.some((value) => value.trim().toLocaleLowerCase("pt-BR") === option.text.trim().toLocaleLowerCase("pt-BR"));
                  return <td key={`${question.id}-${option.id}`} className={checkCell}><span className="mx-auto inline-flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border-2 border-slate-500 bg-white p-0.5 text-emerald-700">{isSelected ? <Check size={12} strokeWidth={3} aria-label="Marcada" /> : null}</span></td>;
                })}</tr>;
              })}
            </Fragment>;
          }) : <tr><td className={cell} colSpan={4}>Nenhum item cadastrado.</td></tr>}
        </tbody>
      </table>
    </section>
  </div>;
}
