"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

export type TstRequestItem = {
  id: string;
  title: string;
  detail: string;
  description: string;
  date: string;
  dateTime?: string;
  workerName?: string;
  registration?: string;
  jobFunction?: string;
  sectorName?: string;
  epiName?: string;
};

export function TstRequestsTable({ items }: { items: TstRequestItem[] }) {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<TstRequestItem | null>(null);

  const sectors = useMemo(() => [...new Set(items.map((item) => item.sectorName || item.detail.split(" · ").at(-1) || ""))].filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR")), [items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const worker = item.workerName || item.detail.split(" · ")[0] || "";
      const epi = item.epiName || item.title;
      const itemSector = item.sectorName || item.detail.split(" · ").at(-1) || "";
      return (!query || `${worker} ${epi} ${itemSector}`.toLocaleLowerCase("pt-BR").includes(query)) && (sector === "all" || itemSector === sector);
    });
  }, [items, search, sector]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const epiTotal = new Set(items.map((item) => item.epiName || item.title)).size;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => { setPageSize(media.matches ? 1 : 10); setPage(0); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => { setPage(0); }, [search, sector]);

  return <div className="grid min-w-0 gap-5">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><strong className="block text-3xl font-semibold text-[#176f57]">{items.length}</strong><span className="mt-1 block text-sm text-slate-500">Solicitações</span></article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><strong className="block text-3xl font-semibold text-[#176f57]">{epiTotal}</strong><span className="mt-1 block text-sm text-slate-500">EPIs solicitados</span></article>
    </div>

    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-label="Tabela de solicitações de EPI">
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(220px,1fr)]">
        <label className="relative block"><span className="sr-only">Buscar por nome ou EPI</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-[#176f57] focus:ring-2 focus:ring-[#e8f4ee]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou EPI..." /></label>
        <label><span className="sr-only">Filtrar por setor</span><select className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#176f57] focus:ring-2 focus:ring-[#e8f4ee]" value={sector} onChange={(event) => setSector(event.target.value)}><option value="all">Todos os setores</option>{sectors.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      {visible.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-sm"><thead><tr className="bg-[#e8f4ee] text-left text-xs font-semibold text-slate-600"><th className="px-3 py-3">Trabalhador</th><th className="px-3 py-3">Setor</th><th className="px-3 py-3">EPI solicitado</th><th className="px-3 py-3">Recebido em</th><th className="px-3 py-3 text-right">Ação</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="px-3 py-4 font-medium text-slate-700">{item.workerName || item.detail.split(" · ")[0] || "—"}</td><td className="px-3 py-4 text-slate-600">{item.sectorName || item.detail.split(" · ").at(-1) || "—"}</td><td className="px-3 py-4 text-slate-600">{item.epiName || item.title}</td><td className="px-3 py-4 whitespace-nowrap text-slate-600">{item.date}</td><td className="px-3 py-4 text-right"><button className="font-semibold text-[#176f57] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176f57]" type="button" onClick={() => setSelected(item)}>Ver detalhes <span aria-hidden="true">→</span></button></td></tr>)}</tbody></table></div> : <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">Nenhuma solicitação encontrada.</p>}
    </section>

    <nav className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500" aria-label="Paginação das solicitações de EPI"><span>{filtered.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} de ${filtered.length}` : "0 solicitações"}</span><div className="flex items-center gap-1"><button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0} aria-label="Página anterior"><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, index) => <button key={index} className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm ${currentPage === index ? "bg-[#176f57] font-semibold text-white" : "text-slate-600 hover:bg-slate-100"}`} type="button" onClick={() => setPage(index)} aria-current={currentPage === index ? "page" : undefined}>{index + 1}</button>)}<button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage + 1 >= pageCount} aria-label="Próxima página"><ChevronRight size={17} /></button></div></nav>

    {selected && <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm sm:p-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="mx-auto flex min-h-full max-w-6xl items-center justify-center"><section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="request-detail-title"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#176f57]">Detalhes da solicitação</p><p className="mt-2 text-sm text-slate-500">Solicitações de EPI <span className="px-1 text-slate-300">›</span> Detalhes</p></div><button className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" type="button" onClick={() => setSelected(null)} aria-label="Fechar detalhes"><X size={19} /></button></div><div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]"><article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><p className="text-xs font-semibold text-[#176f57]">Solicitação #{selected.id.slice(-6).toUpperCase()}</p><h2 id="request-detail-title" className="mt-4 text-3xl font-semibold tracking-tight text-[#183f35]">{selected.epiName || selected.title}</h2><p className="mt-4 text-sm text-slate-500">Recebido em {selected.dateTime || selected.date}</p><dl className="mt-7 grid gap-5"><div><dt className="text-sm text-slate-500">Nome do trabalhador</dt><dd className="mt-1 font-medium text-slate-800">{selected.workerName || selected.detail.split(" · ")[0]}</dd></div><div><dt className="text-sm text-slate-500">Matrícula</dt><dd className="mt-1 font-medium text-slate-800">{selected.registration || "Não informada"}</dd></div><div><dt className="text-sm text-slate-500">Setor</dt><dd className="mt-1 font-medium text-slate-800">{selected.sectorName || selected.detail.split(" · ").at(-1)}</dd></div><div><dt className="text-sm text-slate-500">Função</dt><dd className="mt-1 font-medium text-slate-800">{selected.jobFunction || selected.detail.split(" · ")[1] || "Não informado"}</dd></div><div><dt className="text-sm text-slate-500">EPI desejado</dt><dd className="mt-1 font-medium text-slate-800">{selected.epiName || selected.title}</dd></div><div><dt className="text-sm text-slate-500">Motivo da solicitação</dt><dd className="mt-1 leading-6 text-slate-700">{selected.description || "Não informado."}</dd></div></dl></article><aside className="h-fit rounded-xl bg-[#e8f4ee] p-6 sm:p-7"><h3 className="text-2xl font-semibold leading-tight text-[#183f35]">Informações para cuidar melhor.</h3><p className="mt-6 text-sm leading-6 text-slate-600">Confira o equipamento solicitado e o motivo informado para compreender a necessidade do trabalhador.</p><p className="mt-6 text-sm leading-6 text-slate-600">Acesso restrito ao Técnico de Segurança do Trabalho.</p></aside></div></section></div></div>}
  </div>;
}

