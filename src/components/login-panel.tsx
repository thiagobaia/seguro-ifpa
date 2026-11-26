"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthFieldProps = {
  id: string;
  label: string;
  type: "email" | "password";
  autoComplete: string;
  placeholder: string;
  minLength?: number;
};

function AuthField({ id, label, type, autoComplete, placeholder, minLength }: AuthFieldProps) {
  return (
    <div className="field login-field">
      <label htmlFor={id}>{label} <span aria-hidden="true">*</span></label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        required
      />
    </div>
  );
}

export function LoginPanel() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setMessage("Não foi possível entrar. Confira o e-mail e a senha e tente novamente.");
        return;
      }

      router.replace("/tst");
      router.refresh();
    } catch {
      setMessage("Não foi possível conectar ao serviço de autenticação. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login-form-card" aria-labelledby="login-card-title">
      <h2 id="login-card-title">Bem-vindo de volta.</h2>
      <p className="login-card-copy">Entre com seu e-mail e sua senha para acessar a área do técnico.</p>

      {message && <p className="site-alert login-feedback error" role="alert">{message}</p>}

      <form className="login-form" onSubmit={submit}>
        <AuthField id="email" label="E-mail" type="email" autoComplete="email" placeholder="Digite seu e-mail" />
        <AuthField
          id="password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          minLength={8}
        />
        <button className="form-submit login-submit" type="submit" disabled={busy}>
          {busy ? "Aguarde…" : "Entrar"}
        </button>
      </form>

      <a className="login-back" href="/home">← Voltar ao feed</a>
      <p className="login-public-note">O acesso do trabalhador é público. Você não precisa entrar para enviar formulários ou acessar treinamentos.</p>
    </section>
  );
}
