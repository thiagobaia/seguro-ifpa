import { ShieldCheck } from "lucide-react";
import { TstCreatorForm } from "@/components/tst-creator-form";

export const metadata = {
  title: "Criar usuário TST | Segura IFPA",
  description: "Cadastro local de usuário com Better Auth e Prisma.",
};

export default function CreatorPage() {
  return (
    <>
      <main className="login-page">
        <div className="login-content">
          <header className="login-heading">
            <span className="eyebrow">Cadastro separado</span>
            <h1>Criar acesso TST</h1>
            <p>Crie sua conta com nome, e-mail e senha em uma rota independente da tela de login.</p>
          </header>

          <div className="login-layout">
            <TstCreatorForm />
            <aside className="login-aside">
              <span className="eyebrow">Acesso por sessão</span>
              <h2>Cadastro e entrada usam a autenticação da aplicação.</h2>
              <p>O Better Auth grava o perfil em <code>public.user</code> e mantém a credencial de senha no banco Neon. Qualquer usuário autenticado pode acessar a área TST.</p>
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
