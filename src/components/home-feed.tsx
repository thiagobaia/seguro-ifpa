"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, Info, MoreHorizontal } from "lucide-react";
import { useUiStore } from "@/components/ui-store-provider";
import type { FeedCategory } from "@/stores/ui-store";
import { deleteBulletin } from "@/app/tst-actions";

export type FeedPost = { id?: string; category: string; date: string; title: string; description: string; validUntil: string | null; image: string | null };
const categories: FeedCategory[] = ["Para você", "Prevenção", "Bem-estar"];
const shortcuts = [
  { number: "01", title: "Checklist de segurança", caption: "Conferir antes de iniciar →", href: "/checklist" },
  { number: "02", title: "Solicitar EPI", caption: "Cuidar da sua proteção →", href: "/solicitar-epi" },
  { number: "03", title: "Canal de denúncias", caption: "Relatar uma situação →", href: "/denuncia" },
];

export function HomeFeed({ posts }: { posts: FeedPost[] }) {
  const category = useUiStore((state) => state.category);
  const setCategory = useUiStore((state) => state.setCategory);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [pendingDeletePost, setPendingDeletePost] = useState<FeedPost | null>(null);
  const visiblePosts = category === "Para você" ? posts : posts.filter((post) => post.category.toLowerCase() === category.toLowerCase());

  return <main className="home-shell">
    <section className="hero-copy"><span className="eyebrow">Espaço do trabalhador</span><h1>Cuidar também é informar.</h1><p>Informação que protege. Cuidado que aproxima.</p></section>
    <div className="home-grid">
      <aside className="left-rail"><h2 className="section-heading">Seu espaço de cuidado</h2><p className="section-subtitle">O que você precisa fazer hoje?</p>
        <div className="quick-list">{shortcuts.map((item) => <Link className="quick-card" href={item.href} key={item.number}><span className="quick-number">{item.number}</span><h3 className="quick-title">{item.title}</h3><span className="quick-caption">{item.caption}</span></Link>)}</div>
        <p className="aside-note">Um ambiente mais seguro começa com todos nós.</p>
      </aside>
      <section aria-label="Feed de informativos"><div className="feed-tabs" role="tablist" aria-label="Filtrar informativos">{categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={`feed-tab${category === item ? " active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="feed-column">{visiblePosts.map((post, index) => <article className="post-card" key={post.id ?? `${post.title}-${index}`}>
          <header className="post-head"><div className="avatar" aria-hidden="true">S</div><div><div className="post-author">Equipe de Segurança</div><div className="post-meta">{post.date} · Informativo</div></div>{post.id ? <div className="relative ml-auto"><button type="button" className="post-more grid h-8 w-8 cursor-pointer place-items-center rounded-full" aria-label="Mais opções do informativo" aria-expanded={openPostId === post.id} onClick={() => setOpenPostId(openPostId === post.id ? null : post.id!)}><MoreHorizontal size={19} /></button>{openPostId === post.id && <div className="absolute right-0 top-10 z-20 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"><button type="button" className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50" onClick={() => { setPendingDeletePost(post); setOpenPostId(null); }}>Excluir post</button></div>}</div> : <MoreHorizontal className="post-more" aria-hidden="true" />}</header>
          {post.image && <Image className="post-image" src={post.image} alt="Equipamentos de proteção individual sobre uma bancada de oficina" width={1200} height={700} priority={index === 0} unoptimized />}
          <div className="post-body"><span className="post-category">{post.category} · Segurança</span><h2>{post.title}</h2><p>{post.description}</p><div className="post-footer"><Link className="share-link" href="/treinamentos">Compartilhar <ArrowUpRight size={14} /></Link><span>{post.validUntil ? `Válido até ${post.validUntil}` : "Conteúdo informativo"}</span></div></div>
        </article>)}{visiblePosts.length === 0 && <div className="post-card text-post"><p>Nenhum informativo nesta categoria por enquanto.</p></div>}</div>
      </section>
      <aside className="right-rail"><section className="focus-card"><span className="eyebrow">Cuidado em foco</span><h2>Segurança é um hábito coletivo.</h2><p>Pequenas atitudes protegem você e quem trabalha ao seu lado.</p><Link className="pill-button" href="/treinamentos">Ver treinamentos <ArrowRight size={14} /></Link></section>
        <section className="routine-card"><h3>Na sua rotina</h3>{["Confira seus equipamentos", "Sinalize situações de risco", "Compartilhe conhecimento"].map((text, i) => <div className="routine-item" key={text}><span>0{i + 1}</span><span>{text}</span></div>)}</section>
      </aside>
    </div>
    {pendingDeletePost && <div className="fixed left-1/2 top-4 z-[100] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-rose-900 bg-[#5b001f] p-4 text-rose-50 shadow-2xl sm:p-5" role="alertdialog" aria-modal="true" aria-labelledby="delete-post-title" aria-describedby="delete-post-description"><div className="flex items-start gap-3"><Info className="mt-0.5 shrink-0 text-rose-200" size={21} aria-hidden="true" /><div className="min-w-0 flex-1"><h2 id="delete-post-title" className="text-sm font-bold sm:text-base">Excluir informativo?</h2><p id="delete-post-description" className="mt-1 text-sm leading-6 text-rose-100">Excluir o informativo “{pendingDeletePost.title}”? Esta ação não pode ser desfeita.</p><div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" className="cursor-pointer rounded-lg border border-rose-300/50 px-3 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-900/50" onClick={() => setPendingDeletePost(null)}>Cancelar</button><form action={deleteBulletin}><input type="hidden" name="id" value={pendingDeletePost.id} /><button type="submit" className="cursor-pointer rounded-lg bg-rose-100 px-3 py-2 text-sm font-bold text-rose-950 transition hover:bg-white">Excluir post</button></form></div></div></div></div>}
  </main>;
}
