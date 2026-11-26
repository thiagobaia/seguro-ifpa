"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Info,
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Pencil,
  Plus,
  Printer,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TstPagination } from "@/components/tst-pagination";
import { TstReportsTable } from "@/components/tst-reports-table";
import { TstRequestsTable } from "@/components/tst-requests-table";
import { TstTools } from "@/components/tst-tools";
import { TstSignOut } from "@/components/tst-sign-out";
import { IrisLogo } from "@/components/site-nav";
import { GoogleFormsQuestionEditor, type EditorQuestion, type QuestionOption, type QuestionType } from "@/components/google-forms-question-editor";
import { ChecklistSubmissionTable, type ChecklistSubmission } from "@/components/checklist-submission-table";
import { ChecklistTemplate } from "@/components/checklist-template";
import { archiveChecklistResponse, deleteChecklist, deleteChecklistResponse, updateChecklist } from "@/app/tst-actions";

type DashboardSection = "overview" | "requests" | "reports" | "checklists" | "bulletins" | "trainings";
type DashboardRecord = { id: string; title: string; detail: string; description: string; date: string; dateTime?: string; sectorName?: string; anonymous?: boolean; workerName?: string; registration?: string; epiName?: string; jobFunction?: string };
type ChecklistRecord = { id: string; title: string; detail: string; date: string; functionName: string; sectorName: string; questions: EditorQuestion[] };
type TrainingRecord = { id: string; title: string; date: string; files: { name: string; url: string }[] };
type DashboardProps = {
  userName: string;
  requests: DashboardRecord[];
  reports: DashboardRecord[];
  checklists: ChecklistRecord[];
  trainings: TrainingRecord[];
  submissions: ChecklistSubmission[];
  created?: string;
  updated?: string;
  deleted?: string;
  archived?: string;
  error?: string;
};

const navItems: { id: DashboardSection; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Feed", icon: LayoutDashboard },
  { id: "requests", label: "Solicitações de EPI", icon: FileText },
  { id: "reports", label: "Denúncias", icon: ShieldAlert },
  { id: "checklists", label: "Checklist", icon: ClipboardCheck },
  { id: "bulletins", label: "Publicar informativo", icon: Megaphone },
  { id: "trainings", label: "Treinamentos", icon: BookOpen },
];

const tstDockItems: { id: DashboardSection; href: string; label: string; icon: LucideIcon }[] = [
  { id: "bulletins", href: "/tst#bulletins", label: "Publicar", icon: Megaphone },
  { id: "checklists", href: "/tst#checklists", label: "Checklist", icon: ClipboardCheck },
  { id: "requests", href: "/tst#requests", label: "EPI", icon: FileText },
  { id: "reports", href: "/tst#reports", label: "Denúncias", icon: ShieldAlert },
  { id: "trainings", href: "/tst#trainings", label: "Treinamentos", icon: BookOpen },
];

const reportsDockItems: { id: DashboardSection | "nrs"; href: string; label: string; icon: LucideIcon }[] = [
  { id: "overview", href: "/home", label: "Feed", icon: LayoutDashboard },
  { id: "requests", href: "/tst#requests", label: "EPIs", icon: FileText },
  { id: "reports", href: "/tst#reports", label: "Denúncias", icon: ShieldAlert },
  { id: "bulletins", href: "/tst#bulletins", label: "Publicar", icon: Megaphone },
  { id: "nrs", href: "/nrs", label: "NRs", icon: BookOpen },
  { id: "checklists", href: "/tst#checklists", label: "Checklists", icon: ClipboardCheck },
  { id: "trainings", href: "/tst#trainings", label: "Treinamentos", icon: BookOpen },
];

const sectionHeadings: Record<DashboardSection, { title: string; description: string }> = {
  overview: { title: "Feed", description: "Acompanhe as atividades e acesse as ferramentas da equipe de Segurança do Trabalho." },
  requests: { title: "Solicitações de EPI", description: "Consulte as solicitações enviadas pelos trabalhadores." },
  reports: { title: "Denúncias recebidas", description: "Acompanhe os relatos e promova a prevenção." },
  checklists: { title: "Checklist", description: "Crie checklists e consulte os checklists recebidos." },
  bulletins: { title: "Publicar informativo", description: "Prepare uma publicação para o feed dos trabalhadores." },
  trainings: { title: "Treinamentos", description: "Publique materiais de capacitação para os funcionários." },
};

export function TstDashboard({ userName, requests, reports, checklists, trainings, submissions, created, updated, deleted, archived, error }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [viewingReport, setViewingReport] = useState<DashboardRecord | null>(null);
  const [checklistTab, setChecklistTab] = useState<"received" | "archived" | "created">(archived ? "archived" : "created");
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const [pendingDeleteSubmission, setPendingDeleteSubmission] = useState<ChecklistSubmission | null>(null);
  const [pendingDeleteChecklist, setPendingDeleteChecklist] = useState<ChecklistRecord | null>(null);
  const [viewingChecklist, setViewingChecklist] = useState<ChecklistRecord | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<ChecklistSubmission | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistRecord | null>(null);
  const [editQuestionsJson, setEditQuestionsJson] = useState("[]");
  const [editQuestionType, setEditQuestionType] = useState<QuestionType>("multiple_choice");
  const [editQuestionOptions, setEditQuestionOptions] = useState<QuestionOption[]>([
    { id: "edit-option-conforme", text: "Conforme" },
    { id: "edit-option-nao-conforme", text: "Não conforme" },
    { id: "edit-option-na", text: "Não se aplica" },
  ]);
  const handleEditQuestionsChange = useCallback((questions: EditorQuestion[]) => {
    setEditQuestionsJson(JSON.stringify(questions));
  }, []);

  useEffect(() => {
    const sectionFromHash = () => {
      const hash = window.location.hash.replace("#", "") as DashboardSection;
      if (navItems.some((item) => item.id === hash)) {
        setActiveSection(hash);
        setViewingReport(null);
      }
    };
    sectionFromHash();
    window.addEventListener("hashchange", sectionFromHash);
    return () => window.removeEventListener("hashchange", sectionFromHash);
  }, []);

  async function printChecklist() {
    const printTitle = viewingSubmission ? `${viewingSubmission.title} - respostas` : viewingChecklist?.title;
    if (!printTitle) return;
    const template = document.querySelector<HTMLElement>("[data-checklist-view-backdrop] [data-checklist-document]");
    if (!template || !template.textContent?.trim()) {
      window.alert("Não foi possível preparar o checklist para impressão. Feche e abra a visualização novamente.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.alert("Não foi possível abrir a impressão neste navegador.");
      return;
    }
    const stylesheets = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((link) => link.href);
    if (stylesheets.length === 0) {
      printWindow.close();
      window.alert("Não foi possível localizar a formatação do checklist. Tente imprimir novamente.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Checklist</title></head><body class="m-0 bg-white p-4 font-sans text-slate-900 sm:p-6">${template.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.document.title = printTitle;
    printWindow.onafterprint = () => printWindow.close();
    const stylesheetLoads = stylesheets.map((href) => new Promise<boolean>((resolve) => {
      const link = printWindow.document.createElement("link");
      let finished = false;
      const finish = (loaded: boolean) => { if (!finished) { finished = true; resolve(loaded); } };
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => finish(true);
      link.onerror = () => finish(false);
      window.setTimeout(() => finish(false), 5000);
      printWindow.document.head.appendChild(link);
    }));
    const loadedStylesheets = await Promise.all(stylesheetLoads);
    if (loadedStylesheets.some((loaded) => !loaded)) {
      printWindow.close();
      window.alert("Não foi possível carregar a formatação do checklist. Tente imprimir novamente.");
      return;
    }
    if (printWindow.document.fonts) await printWindow.document.fonts.ready;
    const printable = printWindow.document.querySelector<HTMLElement>("[data-checklist-document]");
    if (!printable?.textContent?.trim()) {
      printWindow.close();
      window.alert("O documento de impressão ficou vazio. Tente novamente.");
      return;
    }
    printWindow.focus();
    printWindow.print();
  }

  function navigate(section: DashboardSection) {
    setActiveSection(section);
    setViewingReport(null);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${section}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(checklist: ChecklistRecord) {
    setEditingChecklist(checklist);
    setEditQuestionsJson(JSON.stringify(checklist.questions));
    setEditQuestionType(checklist.questions[0]?.type ?? "multiple_choice");
    setEditQuestionOptions(checklist.questions[0]?.options.length ? checklist.questions[0].options : [
      { id: `edit-option-conforme-${Date.now()}`, text: "Conforme" },
      { id: `edit-option-nao-conforme-${Date.now()}`, text: "Não conforme" },
      { id: `edit-option-na-${Date.now()}`, text: "Não se aplica" },
    ]);
  }

  function addEditOption() {
    setEditQuestionOptions((current) => [...current, { id: `edit-option-${Date.now()}-${current.length}`, text: `Opção ${current.length + 1}` }]);
  }

  function removeEditOption(optionId: string) {
    setEditQuestionOptions((current) => current.length > 1 ? current.filter((option) => option.id !== optionId) : current);
  }

  const heading = activeSection === "reports" && viewingReport
    ? { title: "Detalhes da denúncia", description: "Leia o relato com cuidado e confidencialidade." }
    : sectionHeadings[activeSection];
  const activeSubmissions = submissions.filter((item) => !item.archived);
  const archivedSubmissions = submissions.filter((item) => item.archived);
  const visibleSubmissions = checklistTab === "archived" ? archivedSubmissions : activeSubmissions;

  return <div className={`min-h-screen bg-slate-50 text-slate-800 ${activeSection === "reports" ? "" : "lg:grid lg:grid-cols-[260px_minmax(0,1fr)]"}`}>
    {activeSection === "reports" ? <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 items-center gap-0.5 border-t border-slate-200 bg-white/95 px-1 py-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden" aria-label="Navegação da área técnica">
      {reportsDockItems.map(({ id, href, label, icon: Icon }) => <Link key={id} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-0.5 text-[9px] transition sm:text-[10px] ${activeSection === id ? "bg-emerald-50 font-semibold text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`} aria-current={activeSection === id ? "page" : undefined} onClick={() => { setViewingReport(null); if (id !== "nrs") setActiveSection(id); }}><Icon size={18} strokeWidth={1.9} aria-hidden="true" /><span className="whitespace-nowrap">{label}</span></Link>)}
    </nav> : <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 items-center gap-1 border-t border-slate-200 bg-white/95 px-1 py-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden" aria-label="Navegação do painel TST">
      {tstDockItems.map(({ id, href, label, icon: Icon }) => <Link key={id} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] transition ${activeSection === id ? "bg-emerald-50 font-semibold text-emerald-800" : "text-slate-500 hover:bg-slate-50"}`} aria-current={activeSection === id ? "page" : undefined} onClick={() => setActiveSection(id)}><Icon strokeWidth={1.9} aria-hidden="true" /><span>{label}</span></Link>)}
      <TstSignOut variant="dock" className="text-slate-500" icon={<LogOut strokeWidth={1.9} aria-hidden="true" />} />
    </nav>}
    <aside className={`hidden h-screen w-[260px] flex-col border-r border-slate-200 bg-white px-4 py-5 ${activeSection === "reports" ? "lg:hidden" : "lg:fixed lg:inset-y-0 lg:left-0 lg:flex"}`}>
      <Link href="/tst" className="mb-7 inline-flex w-full items-center justify-center rounded-xl px-2 py-2" aria-label="Iris — painel TST"><IrisLogo /></Link>
      <div className="mb-2 px-3 text-[11px] font-bold tracking-widest text-slate-400">MENU PRINCIPAL</div>
      <nav className="grid gap-1" aria-label="Navegação do painel">
        {navItems.map(({ id, label, icon: Icon }) => id === "overview" ? <Link key={id} className={`flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-medium transition ${activeSection === id ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-800"}`} href="/home"><Icon size={19} strokeWidth={1.9} /><span>{label}</span></Link> : <button key={id} data-tst-section={id} type="button" className={`flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-medium transition ${activeSection === id ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-800"}`} aria-current={activeSection === id ? "page" : undefined} onClick={() => navigate(id)}><Icon size={19} strokeWidth={1.9} /><span>{label}</span>{id === "requests" && requests.length > 0 && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{requests.length}</span>}{id === "reports" && reports.length > 0 && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{reports.length}</span>}</button>)}
      </nav>
      <div className="mt-auto grid gap-2 border-t border-slate-100 pt-4">
        <Link className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-emerald-800" href="/nrs"><BookOpen size={19} /><span>Normas (NRs)</span></Link>
        <TstSignOut className="w-full" />
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800">{userName.trim().charAt(0).toUpperCase() || "T"}</span><span className="flex min-w-0 flex-1 flex-col text-sm text-slate-800 [&_small]:text-xs [&_small]:text-slate-500"><strong>{userName}</strong><small className="text-xs text-slate-500">Equipe TST</small></span></div>
      </div>
    </aside>

    <main className={`min-h-screen min-w-0 pb-24 pt-0 ${activeSection === "reports" ? "lg:pb-0" : "lg:col-start-2 lg:pb-0 lg:pt-0"}`}>
      {activeSection === "reports" ? <header className="sticky top-0 z-30 flex min-h-[72px] items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
          <Link href="/tst#reports" className="inline-flex shrink-0 items-center rounded-xl px-1 py-1" aria-label="Iris — painel TST"><IrisLogo compact /></Link>
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex" aria-label="Navegação da área técnica">
            {[{ id: "overview" as DashboardSection, label: "Feed" }, { id: "requests" as DashboardSection, label: "Solicitações de EPI" }, { id: "reports" as DashboardSection, label: "Denúncias" }, { id: "bulletins" as DashboardSection, label: "Publicar" }, { id: "checklists" as DashboardSection, label: "Checklists" }].map(({ id, label }) => id === "overview" ? <Link key={id} href="/home" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-emerald-800">{label}</Link> : <button key={id} type="button" data-tst-section={id} aria-current={activeSection === id ? "page" : undefined} onClick={() => navigate(id)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${activeSection === id ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-800"}`}>{label}</button>)}
            <Link href="/nrs" className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-emerald-800">NRs</Link>
          </nav>
          <TstSignOut className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100" />
        </div>
      </header> : <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-2 backdrop-blur sm:gap-4 sm:px-6 lg:px-8"><div className="min-w-0"><span className="block truncate text-[9px] font-bold tracking-[.12em] text-emerald-700 sm:text-[10px] sm:tracking-[.16em]">ÁREA RESTRITA · TST</span><span className="block truncate text-[10px] text-slate-500 sm:text-xs">Segurança do Trabalho</span></div><div className="flex shrink-0 items-center gap-1 sm:gap-2"><Link href="/home" className="inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[10px] font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:min-h-9 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"><LayoutDashboard size={14} className="sm:h-4 sm:w-4" /><span>Ir para o feed</span></Link><a href="/tst#overview" className="inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-700 px-2 py-1.5 text-[10px] font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:min-h-9 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"><LayoutDashboard size={14} className="sm:h-4 sm:w-4" /><span>Dashboard</span></a></div></header>}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 px-1 py-1 sm:px-5"><div><span className="mb-2 block text-[11px] font-bold tracking-widest text-emerald-700">{activeSection === "reports" ? "ÁREA DO TÉCNICO / SEGURANÇA DO TRABALHO" : "PAINEL DE CONTROLE"}</span>{activeSection !== "overview" && <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{heading.title}</h1>}<p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{heading.description}</p></div></div>
        {created && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{created === "checklist" ? "Checklist salvo com sucesso." : created === "treinamento" ? "Treinamento publicado com sucesso." : "Informativo publicado com sucesso."}</p>}
        {updated && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">Checklist atualizado com sucesso.</p>}
    {deleted && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{deleted === "resposta" ? "Resposta excluída com sucesso." : deleted === "informativo" ? "Informativo excluído com sucesso." : "Checklist excluído com sucesso."}</p>}
        {archived && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">Resposta arquivada com sucesso.</p>}
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900" role="alert">{error === "checklist" ? "Não foi possível salvar. Confira o título, função, setor e perguntas." : "Não foi possível concluir. Revise os campos e tente novamente."}</p>}

        {activeSection === "overview" && <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="row-span-3 grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><FileText size={20} /></span><span className="text-sm font-medium text-slate-500">Solicitações de EPI</span><strong className="text-2xl font-bold tabular-nums text-slate-900">{requests.length}</strong><small className="text-xs text-slate-500">registros recebidos</small></article>
            <article className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="row-span-3 grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700"><ShieldAlert size={20} /></span><span className="text-sm font-medium text-slate-500">Denúncias</span><strong className="text-2xl font-bold tabular-nums text-slate-900">{reports.length}</strong><small className="text-xs text-slate-500">ocorrências registradas</small></article>
            <article className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="row-span-3 grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-700"><ClipboardCheck size={20} /></span><span className="text-sm font-medium text-slate-500">Checklists</span><strong className="text-2xl font-bold tabular-nums text-slate-900">{checklists.length}</strong><small className="text-xs text-slate-500">checklists cadastrados</small></article>
          </div>
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900 sm:text-lg">Acesso rápido</h2><p className="mt-1 text-sm leading-6 text-slate-500">Escolha uma área para continuar.</p></div></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {navItems.filter((item) => item.id !== "overview").map(({ id, label, icon: Icon }) => <button key={id} className="flex min-h-32 flex-col items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-left text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" type="button" onClick={() => navigate(id)}><span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon size={20} /></span><strong className="text-sm font-semibold text-slate-800">{id === "reports" ? "Canal de denúncias" : label}</strong><small className="text-xs leading-5 text-slate-500">{id === "requests" ? "Visualizar pedidos recebidos" : id === "reports" ? "Ver relatos de ocorrência" : id === "checklists" ? "Criar e gerenciar checklists" : "Compartilhar conteúdo no feed"}</small></button>)}
          </div></section>
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900 sm:text-lg">Atividade recente</h2><p className="mt-1 text-sm leading-6 text-slate-500">Últimas solicitações de EPI recebidas.</p></div><button className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" type="button" onClick={() => navigate("requests")}>Ver todas</button></div><TstPagination items={requests.slice(0, 5)} emptyMessage="Ainda não há solicitações de EPI." /></section>
        </>}

        {activeSection === "requests" && <TstRequestsTable items={requests} />}
        {activeSection === "reports" && <TstReportsTable reports={reports} selectedReport={viewingReport} onViewReport={(report) => setViewingReport(report)} onBack={() => setViewingReport(null)} />}
        {activeSection === "checklists" && <div className="flex min-w-0 flex-col gap-5">
          <div className="flex justify-end"><button type="button" onClick={() => setCreatingChecklist(true)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"><Plus size={17} /> Criar checklist</button></div>
          <nav className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:inline-flex sm:w-auto sm:gap-2" aria-label="Seções de checklist">
            <button type="button" className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${checklistTab === "received" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setChecklistTab("received")}><FileText size={16} /><span>Recebidos</span><span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{activeSubmissions.length}</span></button>
            <button type="button" className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${checklistTab === "archived" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setChecklistTab("archived")}><Archive size={16} /><span>Arquivados</span><span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{archivedSubmissions.length}</span></button>
            <button type="button" className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${checklistTab === "created" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setChecklistTab("created")}><ClipboardCheck size={16} /><span>Criados</span><span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{checklists.length}</span></button>
          </nav>
          {checklistTab === "created" ? <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900 sm:text-lg">Checklists criados</h2><p className="mt-1 text-sm leading-6 text-slate-500">Formulários publicados para os trabalhadores.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">{checklists.length}</span></div>
            {checklists.length ? <div className="grid gap-2">{checklists.map((item) => <article className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-emerald-300 hover:shadow-sm sm:gap-3 sm:p-3" key={item.id}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><ClipboardCheck size={19} /></span><button className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50" type="button" onClick={() => setViewingChecklist(item)}><span className="flex min-w-0 flex-1 flex-col gap-1 [&_strong]:truncate [&_strong]:text-sm [&_strong]:font-semibold [&_strong]:text-slate-800 [&_small]:truncate [&_small]:text-xs [&_small]:text-slate-500"><strong>{item.title}</strong><small className="text-xs text-slate-500">{item.detail}</small></span><span className="hidden shrink-0 text-xs text-slate-500 sm:inline">{item.date}</span></button><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" type="button" aria-label={`Editar ${item.title}`} title="Editar checklist" onClick={() => openEdit(item)}><Pencil size={16} /></button><form action={deleteChecklist} onSubmit={(event) => { event.preventDefault(); setPendingDeleteChecklist(item); }}><input type="hidden" name="id" value={item.id} /><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600" type="submit" aria-label={`Excluir ${item.title}`} title="Excluir checklist"><Trash2 size={16} /></button></form></article>)}</div> : <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum checklist criado.</p>}
          </section> : <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900 sm:text-lg">{checklistTab === "received" ? "Checklists recebidos" : "Checklists arquivados"}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{checklistTab === "received" ? "Envios respondidos pelos trabalhadores na tela principal de Checklists." : "Respostas arquivadas, preservadas para consulta."}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">{visibleSubmissions.length}</span></div>
            {visibleSubmissions.length ? <div className="grid gap-2">{visibleSubmissions.map((item) => <article className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-emerald-300 hover:shadow-sm sm:gap-3 sm:p-3" key={item.id}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><ClipboardCheck size={19} /></span><button className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50" type="button" onClick={() => setViewingSubmission(item)}><span className="flex min-w-0 flex-1 flex-col gap-1 [&_strong]:truncate [&_strong]:text-sm [&_strong]:font-semibold [&_strong]:text-slate-800 [&_small]:truncate [&_small]:text-xs [&_small]:text-slate-500"><strong>{item.title}</strong><small className="text-xs text-slate-500">{item.functionName} · {item.sectorName} · Matrícula: {item.registration || "—"}</small></span></button><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" type="button" aria-label={`Ver envio: ${item.title}`} title="Ver respostas" onClick={() => setViewingSubmission(item)}><FileText size={16} /></button><form action={deleteChecklistResponse} onSubmit={(event) => { event.preventDefault(); setPendingDeleteSubmission(item); }}><input type="hidden" name="id" value={item.id} /><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600" type="submit" aria-label={`Excluir resposta de ${item.title}`} title="Excluir resposta"><Trash2 size={16} /></button></form>{!item.archived && <form action={archiveChecklistResponse} onSubmit={(event) => { if (!window.confirm(`Arquivar a resposta de “${item.title}”? Ela ficará disponível na aba Arquivados.`)) event.preventDefault(); }}><input type="hidden" name="id" value={item.id} /><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600" type="submit" aria-label={`Arquivar ${item.title}`} title="Arquivar"><Archive size={15} /></button></form>}</article>)}</div> : <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{checklistTab === "received" ? "Ainda não há respostas enviadas pelos trabalhadores." : "Ainda não há checklists arquivados."}</p>}
          </section>}
        </div>}
        {activeSection === "bulletins" && <TstTools section="bulletins" />}
        {activeSection === "trainings" && <div className="grid gap-5"><TstTools section="trainings" /><section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-900 sm:text-lg">Materiais publicados</h2><p className="mt-1 text-sm text-slate-500">Conteúdos disponíveis em /treinamentos.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">{trainings.length}</span></div>{trainings.length ? <div className="grid gap-2">{trainings.map((training) => <article key={training.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><BookOpen size={19} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-slate-800">{training.title}</strong><small className="block truncate text-xs text-slate-500">{training.files.length} material(is) · {training.date}</small></span></article>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">Nenhum treinamento publicado.</p>}</section></div>}
      </div>
    </main>

    {pendingDeleteSubmission && <div className="fixed left-1/2 top-4 z-[100] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-rose-900 bg-[#5b001f] p-4 text-rose-50 shadow-2xl sm:p-5" role="alert" aria-live="assertive">
      <div className="flex items-start gap-3"><Info className="mt-0.5 shrink-0 text-rose-200" size={20} /><div className="min-w-0 flex-1"><strong className="block text-base font-semibold">Excluir resposta recebida</strong><p className="mt-1 text-sm leading-6 text-rose-100">A resposta de "{pendingDeleteSubmission.title}" sera apagada definitivamente. Esta acao nao pode ser desfeita.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setPendingDeleteSubmission(null)} className="rounded-lg border border-rose-200/40 bg-rose-950/30 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-900/60">Cancelar</button><form action={deleteChecklistResponse} onSubmit={() => setPendingDeleteSubmission(null)}><input type="hidden" name="id" value={pendingDeleteSubmission.id} /><button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">Excluir resposta</button></form></div></div><button type="button" aria-label="Fechar alerta de exclusao" onClick={() => setPendingDeleteSubmission(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-rose-200 transition hover:bg-rose-900/60 hover:text-white"><X size={19} /></button></div>
    </div>}

    {pendingDeleteChecklist && <div className="fixed left-1/2 top-4 z-[100] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-rose-900 bg-[#5b001f] p-4 text-rose-50 shadow-2xl sm:p-5" role="alert" aria-live="assertive">
      <div className="flex items-start gap-3"><Info className="mt-0.5 shrink-0 text-rose-200" size={20} /><div className="min-w-0 flex-1"><strong className="block text-base font-semibold">Excluir checklist</strong><p className="mt-1 text-sm leading-6 text-rose-100">O checklist "{pendingDeleteChecklist.title}" e seus dados serao apagados definitivamente. Esta acao nao pode ser desfeita.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setPendingDeleteChecklist(null)} className="rounded-lg border border-rose-200/40 bg-rose-950/30 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-900/60">Cancelar</button><form action={deleteChecklist} onSubmit={() => setPendingDeleteChecklist(null)}><input type="hidden" name="id" value={pendingDeleteChecklist.id} /><button type="submit" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">Excluir checklist</button></form></div></div><button type="button" aria-label="Fechar alerta de exclusao" onClick={() => setPendingDeleteChecklist(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-rose-200 transition hover:bg-rose-900/60 hover:text-white"><X size={19} /></button></div>
    </div>}

    {creatingChecklist && <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreatingChecklist(false); }}>
      <section className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]" role="dialog" aria-modal="true" aria-labelledby="create-checklist-title">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-6"><div><span className="mb-1 block text-[11px] font-bold tracking-widest text-emerald-700">NOVO CHECKLIST</span><h2 id="create-checklist-title" className="text-xl font-bold text-slate-900 sm:text-2xl">Criar checklist</h2><p className="mt-1 text-sm text-slate-500">Cadastre as informações e os itens de verificação.</p></div><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" type="button" aria-label="Fechar criação de checklist" onClick={() => setCreatingChecklist(false)}><X size={20} /></button></header>
        <div className="min-h-0 overflow-y-auto p-3 sm:p-6"><TstTools section="checklists" /></div>
      </section>
    </div>}

    {editingChecklist && <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingChecklist(null); }}>
      <section className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]" role="dialog" aria-modal="true" aria-labelledby="edit-checklist-title">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-6"><div><span className="mb-1 block text-[11px] font-bold tracking-widest text-emerald-700">GERENCIAR CHECKLIST</span><h2 id="edit-checklist-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Editar checklist</h2><p className="mt-1 text-sm text-slate-500">Altere os dados e as perguntas salvas.</p></div><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" type="button" aria-label="Fechar janela" onClick={() => setEditingChecklist(null)}><X size={20} /></button></header>
        <form action={updateChecklist} className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <input type="hidden" name="id" value={editingChecklist.id} />
          <input type="hidden" name="questions" value={editQuestionsJson} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="grid min-w-0 gap-2 md:col-span-2"><label className="text-sm font-semibold text-slate-700" htmlFor="edit-checklist-title">Título</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="edit-checklist-title" name="title" defaultValue={editingChecklist.title} required /></div>
            <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="edit-checklist-function">Função</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="edit-checklist-function" name="jobFunction" defaultValue={editingChecklist.functionName} required /></div>
            <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="edit-checklist-sector">Setor</label><input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="edit-checklist-sector" name="sector" defaultValue={editingChecklist.sectorName} required /></div></div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid min-w-0 gap-2"><label className="text-sm font-semibold text-slate-700" htmlFor="edit-checklist-field">Campo <span className="text-emerald-700">*</span></label><select className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" id="edit-checklist-field" value={editQuestionType} onChange={(event) => setEditQuestionType(event.target.value as QuestionType)}><option value="multiple_choice">Múltipla escolha</option></select></div>
            <div className="grid min-w-0 gap-2 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/30 p-4 md:col-span-2"><span className="text-sm font-semibold text-slate-700">Opções de resposta</span><div className="grid gap-2">{editQuestionOptions.map((option) => <div key={option.id} className="flex items-center gap-2"><span className="w-4 shrink-0 text-center text-slate-400">•</span><input className="min-h-9 min-w-0 flex-1 border-0 border-b border-slate-200 bg-transparent px-1 py-1 text-sm text-slate-700 outline-none focus:border-emerald-600" aria-label="Texto da opção de resposta" value={option.text} onChange={(event) => setEditQuestionOptions((current) => current.map((item) => item.id === option.id ? { ...item, text: event.target.value } : item))} required /><button type="button" className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-700" aria-label="Remover opção de resposta" onClick={() => removeEditOption(option.id)}>×</button></div>)}</div><button type="button" className="mt-1 w-fit text-xs font-medium text-emerald-700 hover:underline" onClick={addEditOption}>+ Adicionar opção</button></div>
          </div>
          <div className="mt-5 min-w-0"><GoogleFormsQuestionEditor key={editingChecklist.id} initialQuestions={editingChecklist.questions} questionType={editQuestionType} questionOptions={editQuestionOptions} onChange={handleEditQuestionsChange} /></div>
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 p-4 sm:p-5"><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => setEditingChecklist(null)}>Cancelar</button><button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" type="submit">Salvar alterações</button></footer>
        </form>
      </section>
    </div>}

    {viewingChecklist && <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6" data-checklist-view-backdrop role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingChecklist(null); }}>
      <section className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]" role="dialog" aria-modal="true" aria-labelledby="checklist-template-title"><button className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-[#e8f4ee] hover:text-[#176f57] print:hidden" type="button" aria-label="Fechar janela" onClick={() => setViewingChecklist(null)}><X size={20} /></button>
        <div className="overflow-y-auto p-4 sm:p-6 print:hidden"><ChecklistTemplate title={viewingChecklist.title} functionName={viewingChecklist.functionName} sectorName={viewingChecklist.sectorName} questions={viewingChecklist.questions} /></div>
        <footer className="print:hidden flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 p-4 sm:p-5"><p className="mr-auto text-xs leading-5 text-slate-500">Para baixar em PDF, escolha “Salvar como PDF” na janela de impressão.</p><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={printChecklist}><Printer size={16} /> Imprimir</button><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#176f57] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0e5b46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176f57] focus-visible:ring-offset-2" type="button" onClick={printChecklist}>Baixar em PDF</button></footer>
      </section>
    </div>}    {viewingSubmission && <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6" data-checklist-view-backdrop role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingSubmission(null); }}>
      <section className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]" role="dialog" aria-modal="true" aria-labelledby="view-submission-title">
        <header className="print:hidden flex shrink-0 items-start justify-between gap-4 border-b border-emerald-200 p-4 sm:p-6"><div><span className="mb-1 block text-[11px] font-bold tracking-widest text-emerald-700">RESPOSTA ENVIADA · {viewingSubmission.date}</span><h2 className="text-base font-bold text-emerald-700 sm:text-lg" id="view-submission-title">Visualização do checklist</h2><p className="mt-1 text-sm text-slate-500">{viewingSubmission.title}</p></div><button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" type="button" aria-label="Fechar respostas" onClick={() => setViewingSubmission(null)}><X size={20} /></button></header>
        <div className="overflow-y-auto p-4 sm:p-6"><ChecklistSubmissionTable submission={viewingSubmission} /></div>
        <footer className="print:hidden flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-200 p-4 sm:p-5"><p className="mr-auto text-xs leading-5 text-slate-500">Para baixar em PDF, escolha “Salvar como PDF” na janela de impressão.</p><button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={printChecklist}><Printer size={16} /> Imprimir</button><button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2" type="button" onClick={printChecklist}>Baixar em PDF</button></footer>
      </section>
    </div>}
  </div>;
}







