import { MobileDock } from "@/components/site-nav";
import { submitSafetyReport } from "@/app/actions";

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ enviado?: string; erro?: string }> }) {
  const params = await searchParams;
  return <><main className="form-shell"><section className="form-panel">
    <span className="eyebrow">Espaço do trabalhador · Segurança</span><h1>Canal de denúncias</h1><p>Relate uma situação de risco ou acontecimento. Se escolher o envio anônimo, não solicitaremos dados que identifiquem você.</p>
    {params.enviado && <p className="site-alert site-alert-success" role="status">Relato enviado com segurança. Obrigado por sinalizar.</p>}
    {params.erro && <p className="site-alert site-alert-error" role="alert">Preencha os campos obrigatórios para enviar.</p>}
    <form action={submitSafetyReport} className="form-grid">
      <div className="field full"><label htmlFor="sector">Setor relacionado</label><input id="sector" name="sector" required /></div>
      <div className="field full"><label htmlFor="occurrence">Acontecimento</label><input id="occurrence" name="occurrence" placeholder="Ex.: condição insegura, quase acidente" required /></div>
      <div className="field full"><label htmlFor="description">Descrição</label><textarea id="description" name="description" required /></div>
      <div className="field full"><label className="flex items-center gap-2.5 font-semibold"><input className="min-h-[18px] w-[18px] accent-[#176f57]" type="checkbox" name="anonymous" defaultChecked /> Enviar anonimamente</label><span className="post-meta">Quando anônima, a denúncia não guarda identidade, e-mail, IP ou user-agent.</span></div>
      <div className="field full"><button className="form-submit" type="submit">Enviar denúncia</button></div>
    </form>
  </section></main><MobileDock /></>;
}

