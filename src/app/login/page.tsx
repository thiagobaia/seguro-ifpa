import { ShieldCheck } from "lucide-react";
import { LoginPanel } from "@/components/login-panel";

export const metadata = {
  title: "Entrar como técnico | Segura IFPA",
  description: "Acesso à área do Técnico de Segurança do Trabalho.",
};

export default function LoginPage() {
  return (
    <>
      <main className="login-page">
        <div className="login-content">
          <header className="login-heading">
            <span className="eyebrow">Acesso restrito</span>
            <h1>Entrar como técnico</h1>
            <p>Acesso exclusivo ao Técnico de Segurança do Trabalho.</p>
          </header>

          <div className="login-layout">
            <LoginPanel />
            <aside className="login-aside">
              <span className="eyebrow">Cuidado em cada etapa</span>
              <h2>Um espaço para quem cuida de todos.</h2>
              <p>Consulte solicitações, acompanhe relatos e compartilhe informações que ajudam a proteger sua equipe.</p>
              <div className="login-aside-signature">
                <ShieldCheck aria-hidden="true" />
                <span><strong>segura</strong><br />Segurança do Trabalho</span>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
