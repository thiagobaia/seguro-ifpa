"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Building2, ChevronDown, ChevronLeft, ChevronRight, Search, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";

type ReportRecord = {
  id: string;
  title: string;
  detail: string;
  description: string;
  date: string;
  dateTime?: string;
  sectorName?: string;
  anonymous?: boolean;
};

type ReportListProps = {
  reports: ReportRecord[];
  selectedReport: ReportRecord | null;
  onViewReport: (report: ReportRecord) => void;
  onDelete: (report: ReportRecord) => void;
  onBack: () => void;
};

export function TstReportsTable({ reports, selectedReport, onViewReport, onDelete, onBack }: ReportListProps) {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const sectors = useMemo(() => Array.from(new Set(reports.map((report) => report.sectorName ?? report.detail.split(" · ")[0]).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")), [reports]);
  const filteredReports = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return reports.filter((report) => {
      const reportSector = report.sectorName ?? report.detail.split(" · ")[0];
      const matchesSector = sector === "all" || reportSector === sector;
      const matchesSearch = !query || `${report.title} ${report.description}`.toLocaleLowerCase("pt-BR").includes(query);
      return matchesSector && matchesSearch;
    });
  }, [reports, search, sector]);
  const pageCount = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleReports = filteredReports.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const distinctSectors = sectors.length;

  function changeSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function changeSector(value: string) {
    setSector(value);
    setPage(0);
  }

  function reportSector(report: ReportRecord) {
    return report.sectorName ?? report.detail.split(" · ")[0] ?? "Não informado";
  }

  function reportIdentity(report: ReportRecord) {
    if (typeof report.anonymous === "boolean") return report.anonymous ? "Anônimo" : "Identificado";
    return report.detail.includes("Anônima") || report.detail.includes("Anônimo") ? "Anônimo" : "Identificado";
  }

  if (selectedReport) {
    const identityIsAnonymous = selectedReport.anonymous ?? reportIdentity(selectedReport) === "Anônimo";
    return <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={onBack} className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg px-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><ArrowLeft size={17} /> Voltar às denúncias</button><button type="button" onClick={() => onDelete(selectedReport)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600" aria-label={`Excluir denúncia: ${selectedReport.title}`}><Trash2 size={16} /> Excluir denúncia</button></div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] lg:items-start">
        <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-emerald-700"><ShieldAlert size={15} /> DENÚNCIA RECEBIDA</span>
          <h2 className="break-words text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{selectedReport.title}</h2>
          <p className="mt-2 text-sm text-slate-500">Recebido em {selectedReport.dateTime ?? selectedReport.date}</p>
          <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div><dt className="text-xs font-medium text-slate-500">Identificação</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{reportIdentity(selectedReport)}</dd></div>
            <div><dt className="text-xs font-medium text-slate-500">Setor</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{reportSector(selectedReport)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs font-medium text-slate-500">Acontecimento</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{selectedReport.title}</dd></div>
          </dl>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-semibold text-slate-800">Descrição do acontecimento</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{selectedReport.description || "Nenhuma descrição adicional foi informada."}</p>
          </div>
        </article>
        <aside className="self-start rounded-xl border border-emerald-100 bg-emerald-50/80 p-5 sm:p-6">
          <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-white/80 text-emerald-800"><ShieldCheck size={21} strokeWidth={1.8} /></span>
          <h2 className="text-base font-bold text-slate-900">{identityIsAnonymous ? "Identidade protegida." : "Confidencialidade do relato."}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{identityIsAnonymous ? "O formulário indica que este relato foi enviado anonimamente. A identidade do trabalhador não é exibida nesta tela." : "Este relato foi enviado sem anonimato. Os dados de identificação não são exibidos nesta visualização; trate o relato com confidencialidade."}</p>
          <p className="mt-4 border-t border-emerald-200/70 pt-3 text-xs leading-5 text-slate-600">Acesso restrito ao Técnico de Segurança do Trabalho.</p>
        </aside>
      </div>
    </div>;
  }

  return <div className="grid min-w-0 gap-5">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <article className="flex min-h-24 items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldAlert size={21} strokeWidth={1.8} /></span>
        <div className="grid gap-1"><strong className="text-2xl font-bold leading-none tabular-nums text-slate-900">{reports.length}</strong><span className="text-sm text-slate-500">Denúncias recebidas</span></div>
      </article>
      <article className="flex min-h-24 items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Building2 size={21} strokeWidth={1.8} /></span>
        <div className="grid gap-1"><strong className="text-2xl font-bold leading-none tabular-nums text-slate-900">{distinctSectors}</strong><span className="text-sm text-slate-500">Setores citados</span></div>
      </article>
    </div>

    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-label="Lista de denúncias">
      <div className="grid gap-3 border-b border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-4">
        <label className="relative block min-w-0">
          <span className="sr-only">Buscar por ocorrência</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Buscar por ocorrência..." className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
        </label>
        <label className="relative block min-w-0">
          <span className="sr-only">Filtrar por setor</span>
          <select value={sector} onChange={(event) => changeSector(event.target.value)} className="min-h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
            <option value="all">Todos os setores</option>
            {sectors.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </label>
      </div>

      {visibleReports.length ? <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[740px] border-collapse text-left">
            <thead className="bg-emerald-50/60 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3 font-semibold">Relato</th><th className="px-4 py-3 font-semibold">Setor</th><th className="px-4 py-3 font-semibold">Identificação</th><th className="px-4 py-3 font-semibold">Recebido em</th><th className="px-5 py-3 text-right font-semibold">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleReports.map((report) => <tr key={report.id} className="transition hover:bg-emerald-50/30">
                <td className="max-w-[360px] px-5 py-3.5"><span className="block truncate text-sm font-semibold text-slate-800">{report.title}</span></td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{reportSector(report)}</td>
                <td className="px-4 py-3.5"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${report.anonymous ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"}`}>{reportIdentity(report)}</span></td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-500">{report.date}</td>
                <td className="px-5 py-3.5 text-right"><div className="inline-flex items-center gap-1"><button type="button" onClick={() => onViewReport(report)} className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" aria-label={`Ver denúncia: ${report.title}`}>Ver <ChevronRight size={15} /></button><button type="button" onClick={() => onDelete(report)} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600" aria-label={`Excluir denúncia: ${report.title}`} title="Excluir denúncia"><Trash2 size={16} /></button></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-3 md:hidden">
          {visibleReports.map((report) => <article key={report.id} className="grid gap-3 rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-sm font-semibold text-slate-800">{report.title}</h2><p className="mt-1 text-xs text-slate-500">{reportSector(report)}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{reportIdentity(report)}</span></div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2"><time className="text-xs text-slate-500">{report.date}</time><div className="inline-flex items-center gap-1"><button type="button" onClick={() => onViewReport(report)} className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" aria-label={`Ver denúncia: ${report.title}`}>Ver <ChevronRight size={15} /></button><button type="button" onClick={() => onDelete(report)} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600" aria-label={`Excluir denúncia: ${report.title}`} title="Excluir denúncia"><Trash2 size={16} /></button></div></div>
          </article>)}
        </div>
      </> : <div className="px-4 py-12 text-center"><p className="text-sm font-semibold text-slate-700">{reports.length ? "Nenhuma denúncia encontrada" : "Ainda não há denúncias registradas."}</p><p className="mt-1 text-sm text-slate-500">{reports.length ? "Tente ajustar a busca ou o filtro de setor." : "As novas ocorrências aparecerão nesta lista."}</p></div>}

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-3 py-3 sm:px-4" aria-label="Paginação das denúncias">
        <span className="text-xs text-slate-500">{filteredReports.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filteredReports.length)} de ${filteredReports.length}` : "0 resultados"}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0} aria-label="Página anterior" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={17} /></button>
          {Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" onClick={() => setPage(index)} aria-label={`Página ${index + 1}`} aria-current={currentPage === index ? "page" : undefined} className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs font-semibold transition ${currentPage === index ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{index + 1}</button>)}
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage + 1 >= pageCount} aria-label="Próxima página" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={17} /></button>
        </div>
      </nav>
    </section>
  </div>;
}
