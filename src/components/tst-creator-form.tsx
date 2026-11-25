"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Feedback = { kind: "error" | "success"; text: string };

export function TstCreatorForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setFeedback({ kind: "error", text: "As senhas não coincidem. Confira os campos e tente novamente." });
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        setFeedback({ kind: "error", text: "Não foi possível criar a conta. Verifique os dados ou se este e-mail já está cadastrado." });
        return;
      }

      formElement.reset();
      router.replace("/tst");
      router.refresh();
    } catch {
      setFeedback({ kind: "error", text: "Não foi possível criar a conta. Confira a conexão com o banco e tente novamente." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login-form-card" aria-labelledby="creator-card-title">
      <h2 id="creator-card-title">Criar usuário TST</h2>
      <p className="login-card-copy">Crie sua conta com nome, e-mail e senha. O perfil e a credencial são gravados pelo Better Auth no banco da aplicação.</p>

      {feedback && (
        <p className={`login-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.text}
        </p>
      )}

      <form className="login-form" onSubmit={submit}>
        <div className="field login-field">
          <label htmlFor="creator-name">Nome <span aria-hidden="true">*</span></label>
          <input id="creator-name" name="name" type="text" autoComplete="name" placeholder="Nome do técnico" minLength={2} required />
        </div>
        <div className="field login-field">
          <label htmlFor="creator-email">E-mail <span aria-hidden="true">*</span></label>
          <input id="creator-email" name="email" type="email" autoComplete="email" placeholder="nome@instituicao.edu.br" required />
        </div>
        <div className="field login-field">
          <label htmlFor="creator-password">Senha <span aria-hidden="true">*</span></label>
          <input id="creator-password" name="password" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" minLength={8} required />
        </div>
        <div className="field login-field">
          <label htmlFor="creator-confirm-password">Confirme a senha <span aria-hidden="true">*</span></label>
          <input id="creator-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Digite a senha novamente" minLength={8} required />
        </div>
        <button className="form-submit login-submit" type="submit" disabled={busy}>
          {busy ? "Cadastrando…" : "Cadastrar usuário"}
        </button>
      </form>

      <Link className="login-back" href="/login">Ir para entrar</Link>
      <p className="login-public-note">A senha é processada e armazenada como credencial protegida pelo Better Auth; ela não é salva em texto puro no perfil do usuário.</p>
    </section>
  );
}
