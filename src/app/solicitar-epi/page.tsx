import { MobileDock } from "@/components/site-nav";
import { submitEpiRequest } from "@/app/actions";

export default async function EpiRequestPage({ searchParams }: { searchParams: Promise<{ enviado?: string; erro?: string }> }) {
  const params = await searchParams;
  return <><main className="form-shell"><section className="form-panel">
    <span className="eyebrow">Espaço do trabalhador · Proteção</span><h1>Solicitar EPI</h1><p>Conte o que você precisa para trabalhar com segurança. A equipe responsável receberá sua solicitação.</p>
    {params.enviado && <p className="notice" role="status">Solicitação enviada. Obrigado por cuidar da sua segurança.</p>}
    {params.erro && <p className="notice" role="alert">Preencha todos os campos para enviar.</p>}
    <form action={submitEpiRequest} className="form-grid">
      <div className="field"><label htmlFor="name">Nome</label><input id="name" name="name" autoComplete="name" required /></div>
      <div className="field"><label htmlFor="registration">Matrícula</label><input id="registration" name="registration" inputMode="numeric" autoComplete="off" required /></div>
      <div className="field"><label htmlFor="sector">Setor</label><input id="sector" name="sector" required /></div>
      <div className="field"><label htmlFor="jobFunction">Função</label><input id="jobFunction" name="jobFunction" required /></div>
      <div className="field"><label htmlFor="epi">EPI desejado</label><input id="epi" name="epi" placeholder="Ex.: luva anticorte" required /></div>
      <div className="field full"><label htmlFor="reason">Motivo da solicitação</label><textarea id="reason" name="reason" required /></div>
      <div className="field full"><button className="form-submit" type="submit">Enviar solicitação</button></div>
    </form>
  </section></main><MobileDock /></>;
}
