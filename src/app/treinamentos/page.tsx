import { BookOpen, BookOpenCheck, CalendarDays, ExternalLink, FileText, Lightbulb } from "lucide-react";
import { MobileDock } from "@/components/site-nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TrainingFile = { name: string; url: string };

function isTrainingFile(value: unknown): value is TrainingFile {
  if (typeof value !== "object" || value === null) return false;
  return "name" in value && typeof value.name === "string"
    && "url" in value && typeof value.url === "string";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function TrainingsPage() {
  const trainings = process.env.DATABASE_URL
    ? await prisma.training.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return (
    <>
      <main className="mx-auto w-full max-w-[1280px] px-5 pb-20 pt-8 sm:px-7 md:px-10 md:pb-24 md:pt-12">
        <header className="mb-8 md:mb-10">
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
            <BookOpen size={15} strokeWidth={2} aria-hidden="true" />
            Espaço do trabalhador
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Treinamentos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Aprenda sobre saúde, segurança e bem-estar no trabalho.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.82fr)] lg:gap-8">
          <section aria-labelledby="training-materials-heading" className="min-w-0">
            <div className="mb-5">
              <h2 id="training-materials-heading" className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Conhecimento que protege
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Consulte os materiais de treinamento disponibilizados pela equipe de Segurança do Trabalho.
              </p>
            </div>

            {trainings.length > 0 ? (
              <div className="grid gap-4">
                {trainings.map((training, index) => {
                  const files = Array.isArray(training.files)
                    ? training.files.filter(isTrainingFile)
                    : [];

                  return (
                    <article key={training.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-800">
                          <BookOpenCheck size={14} aria-hidden="true" />
                          Material de treinamento
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={14} aria-hidden="true" />
                          Publicado em {formatDate(training.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
                        {training.title}
                      </h3>

                      {files.length > 0 ? (
                        <ul className="mt-5 grid gap-2.5" aria-label={`Arquivos de ${training.title}`}>
                          {files.map((file, fileIndex) => (
                            <li key={`${training.id}-${fileIndex}`}>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                              >
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200">
                                  <FileText size={18} aria-hidden="true" />
                                </span>
                                <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-700 group-hover:text-emerald-900">
                                  {file.name}
                                </span>
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-800">
                                  Abrir <ExternalLink size={14} aria-hidden="true" />
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          Nenhum arquivo está disponível para este treinamento no momento.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center sm:px-10">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-800">
                  <BookOpen size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Ainda não há treinamentos publicados</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Quando a equipe de Segurança do Trabalho disponibilizar materiais, eles aparecerão aqui.
                </p>
              </div>
            )}
          </section>

          <aside className="rounded-2xl bg-emerald-50 p-5 sm:p-6 lg:sticky lg:top-24" aria-labelledby="prevention-note-heading">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">Segurança se constrói em equipe</p>
            <span className="mt-5 grid size-11 place-items-center rounded-xl bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100">
              <Lightbulb size={21} aria-hidden="true" />
            </span>
            <h2 id="prevention-note-heading" className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-slate-900">
              Aprender é parte da prevenção.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Conhecimento ajuda a reconhecer riscos e a fazer escolhas mais seguras no dia a dia. Reserve um momento para consultar os materiais disponíveis.
            </p>
            <div className="mt-6 border-t border-emerald-200 pt-4">
              <p className="text-xs font-semibold leading-5 text-emerald-900">
                Informação e cuidado caminham juntos para um ambiente de trabalho mais seguro.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <MobileDock />
    </>
  );
}
