import { MobileDock } from "@/components/site-nav";
import { prisma } from "@/lib/prisma";
import { WorkerChecklistCatalog } from "@/components/worker-checklist-catalog";

export const dynamic = "force-dynamic";

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

function readQuestions(data: unknown): ChecklistQuestion[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry, index): ChecklistQuestion[] => {
    if (typeof entry === "string") {
      return [{ id: String(index), title: entry, type: "legacy", options: [], required: false }];
    }
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const validTypes = ["multiple_choice"] as const;
    if (typeof item.id !== "string" || typeof item.title !== "string" || !validTypes.includes(item.type as typeof validTypes[number])) return [];
    const options = Array.isArray(item.options) ? item.options.flatMap((option): { id: string; text: string }[] => {
      if (!option || typeof option !== "object") return [];
      const value = option as Record<string, unknown>;
      return typeof value.id === "string" && typeof value.text === "string" ? [{ id: value.id, text: value.text }] : [];
    }) : [];
    return [{ id: item.id, ...(typeof item.itemId === "string" ? { itemId: item.itemId } : {}), title: item.title, question: typeof item.question === "string" ? item.question : "", description: typeof item.description === "string" ? item.description : "", type: item.type as ChecklistQuestion["type"], options, required: item.required === true }];
  });
}

export default async function ChecklistPage({ searchParams }: { searchParams: Promise<{ funcao?: string; setor?: string; enviado?: string; erro?: string }> }) {
  const params = await searchParams;
  const selectedFunction = params.funcao ?? "";
  const selectedSector = params.setor ?? "";
  const checklists = process.env.DATABASE_URL
    ? await prisma.checklist.findMany({ include: { jobFunction: true, sector: true }, orderBy: { createdAt: "desc" } })
    : [];

  const availableFunctions = [...new Set(checklists.map((item) => item.jobFunction.name))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const sectorSource = selectedFunction
    ? checklists.filter((item) => item.jobFunction.name === selectedFunction)
    : checklists;
  const availableSectors = [...new Set(sectorSource.map((item) => item.sector.name))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const matchingChecklists = selectedFunction
    ? checklists.filter((item) => item.jobFunction.name === selectedFunction && (!selectedSector || item.sector.name === selectedSector))
    : [];
  const catalogItems = matchingChecklists.map((item) => ({
    id: item.id,
    title: item.title,
    functionName: item.jobFunction.name,
    sectorName: item.sector.name,
    questions: readQuestions(item.items),
  }));

  return <><main className="form-shell"><section className="form-panel">
    <span className="eyebrow">Espaço do trabalhador · Antes de começar</span><h1>Checklist de segurança</h1><p>Escolha sua função e, se desejar, filtre por setor. Selecione um checklist da lista para abrir e responder.</p>
    {params.enviado && <p className="notice" role="status">Checklist enviado. Obrigado por fazer sua parte.</p>}
    {params.erro && <p className="notice" role="alert">Não foi possível enviar. Revise as respostas obrigatórias e tente novamente.</p>}
    <form method="get" className="form-grid">
      <div className="field"><label htmlFor="funcao">Função</label><select id="funcao" name="funcao" defaultValue={selectedFunction} required><option value="" disabled>Selecione uma função</option>{availableFunctions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="setor">Filtrar por setor</label><select id="setor" name="setor" defaultValue={selectedSector}><option value="">Todos os setores</option>{availableSectors.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
      <div className="field full"><button className="form-submit" type="submit" disabled={availableFunctions.length === 0}>Ver checklists</button></div>
    </form>
    {availableFunctions.length === 0 && <p className="notice mt-5">Ainda não há funções ou setores cadastrados em checklists.</p>}
    {selectedFunction && catalogItems.length > 0 && <WorkerChecklistCatalog checklists={catalogItems} />}
    {selectedFunction && catalogItems.length === 0 && availableFunctions.length > 0 && <p className="notice mt-5">Não há checklist cadastrado para essa combinação de função e setor. Altere o filtro e tente novamente.</p>}
  </section></main><MobileDock /></>;
}

