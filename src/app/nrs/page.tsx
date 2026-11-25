import { ExternalLink } from "lucide-react";
import { MobileDock } from "@/components/site-nav";

const numbers = Array.from({ length: 38 }, (_, index) => index + 1);
const officialUrl = "https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs";
const revoked = new Set([2, 27]);

export default function NrsPage() {
  return (
    <>
      <main className="form-shell">
        <section className="form-panel">
          <span className="eyebrow">Consulta · Ministério do Trabalho</span>
          <h1>Normas Regulamentadoras</h1>
          <p>
            Acesse o texto oficial e atualizado de cada norma no portal do Governo Federal. As NRs 2 e 27 constam como revogadas na página oficial.
          </p>
          <div className="training-list nr-list">
            {numbers.map((number) => (
              <a
                className="training-card"
                key={number}
                href={officialUrl}
                target="_blank"
                rel="noreferrer"
              >
                <strong>NR-{number}</strong>
                <span>{revoked.has(number) ? "Revogada" : "Consultar no portal oficial"}</span>
                <ExternalLink size={16} className="ml-auto text-[#176f57]" />
              </a>
            ))}
          </div>
          <p className="post-meta mt-[18px]">
            Confira a lista integral e as revisões diretamente na página oficial do Ministério do Trabalho e Emprego.
          </p>
        </section>
      </main>
      <MobileDock />
    </>
  );
}
