import type { EditorQuestion } from "@/components/google-forms-question-editor";
import { ChecklistTemplate, type ChecklistDocumentAnswer } from "@/components/checklist-template";

export type ChecklistAnswer = {
  questionId?: string;
  itemId?: string;
  question?: string;
  value?: unknown;
  item?: unknown;
  checked?: boolean;
};

export type ChecklistSubmission = {
  id: string;
  title: string;
  functionName: string;
  sectorName: string;
  date: string;
  registration?: string;
  archived: boolean;
  answers: ChecklistAnswer[];
  questions?: EditorQuestion[];
};

function answerText(answer?: ChecklistAnswer) {
  if (!answer) return "—";
  if (Array.isArray(answer.value)) return answer.value.map(String).join(", ");
  if (answer.value !== undefined) return String(answer.value);
  if (answer.checked !== undefined) return answer.checked ? "Sim" : "Não";
  return "—";
}

export function ChecklistSubmissionTable({ submission }: { submission: ChecklistSubmission; printMode?: boolean }) {
  const questions = Array.isArray(submission.questions) ? submission.questions : [];
  const allAnswers = Array.isArray(submission.answers) ? submission.answers : [];
  const nameAnswer = allAnswers.find((answer) => answer.questionId === "worker-name");
  const registrationAnswer = allAnswers.find((answer) => answer.questionId === "worker-registration");
  const answers = allAnswers.filter((answer) => answer.questionId !== "worker-name" && answer.questionId !== "worker-registration");
  const documentAnswers: ChecklistDocumentAnswer[] = answers.map((answer, index) => ({
    questionId: answer.questionId ?? questions[index]?.id,
    value: answer.value ?? (answer.checked === undefined ? undefined : answer.checked ? "Sim" : "Não"),
    checked: answer.checked,
  }));

  return <ChecklistTemplate
    title={submission.title}
    functionName={submission.functionName}
    sectorName={submission.sectorName}
    workerName={answerText(nameAnswer)}
    registration={submission.registration || answerText(registrationAnswer)}
    submittedAt={submission.date}
    questions={questions}
    answers={documentAnswers}
  />;
}
