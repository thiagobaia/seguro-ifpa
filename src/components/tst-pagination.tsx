"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type RecordItem = { id: string; title: string; detail: string; description: string; date: string };

export function TstPagination({ items, emptyMessage }: { items: RecordItem[]; emptyMessage: string }) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => { setPageSize(media.matches ? 1 : 10); setPage(0); };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = useMemo(() => items.slice(currentPage * pageSize, (currentPage + 1) * pageSize), [items, currentPage, pageSize]);
  if (!items.length) return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{emptyMessage}</p>;

  return <div className="grid min-w-0 gap-3">
    {visible.map((item) => <article className="grid min-w-0 gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={item.id}>
      <strong className="text-sm font-semibold text-slate-900">{item.title}</strong><p className="break-words text-sm text-slate-600">{item.detail}</p>{item.description && <p className="break-words text-sm leading-5 text-slate-600">{item.description}</p>}<span className="text-xs text-slate-500">{item.date}</span>
    </article>)}
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500" aria-label="Paginação">
      <button className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0} aria-label="Página anterior"><ChevronLeft size={16} /> Anterior</button>
      <span>Página {currentPage + 1} de {pageCount}</span>
      <button className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" type="button" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage + 1 >= pageCount} aria-label="Próxima página">Próxima <ChevronRight size={16} /></button>
    </nav>
  </div>;
}
