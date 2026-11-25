# Segura IFPA

Aplicação responsiva de Segurança do Trabalho construída com Next.js/React, Zustand, Better Auth, Prisma, Tailwind CSS e Neon Postgres. A página inicial do trabalhador fica em `/home`.

## Requisitos e configuração local

Use Node.js 20.19 ou superior, npm e uma branch de desenvolvimento no Neon. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (conexão pooled) e `DIRECT_URL` (conexão direta para migrations). Gere um segredo exclusivo para Better Auth:

```bash
openssl rand -base64 32
```

Salve o resultado em `BETTER_AUTH_SECRET` e mantenha `BETTER_AUTH_URL=http://localhost:3000` durante o desenvolvimento local. Não versione `.env` nem compartilhe seus valores.

## Instalação e banco

```bash
npm install
npm run db:generate
npm run db:deploy
npm run typecheck
npm run lint
npm run dev
```

Acesse `http://localhost:3000/home`. Antes de usar uma branch nova, aplique as migrations nela. A migration inicial cria `public.user`, `public.account`, `public.session` e `public.verification`, usadas pelo adaptador Prisma do Better Auth.

## Cadastro e autenticação

- `/criador` é o formulário de cadastro: nome, e-mail, senha e confirmação.
- `/login` serve somente para entrar.
- O handler `/api/auth/[...all]` encaminha as operações do Better Auth.
- O Better Auth cria o perfil diretamente em `public.user` e armazena a credencial protegida na tabela `public.account`; senha em texto puro não é gravada.
- `requireTst()` exige apenas uma sessão autenticada. Como o cadastro é aberto, qualquer pessoa que criar uma conta pode acessar `/tst`.
- A autenticação é hospedada pela aplicação, usando Prisma e Neon Postgres. Neon Managed Auth não é usado e identidades preexistentes desse serviço não são importadas automaticamente.

## Notas de segurança e escopo

- Use uma branch Neon de desenvolvimento para validar o fluxo antes de aplicar migrations em dados reais.
- Use um `BETTER_AUTH_SECRET` forte e exclusivo por ambiente; não reutilize secrets antigos.
- Verificação de e-mail, recuperação de senha, SMTP, rate limiting e gestão de papéis por usuário ainda precisam ser configurados antes de produção.
- Informativos expirados são excluídos da consulta do feed. Denúncias não armazenam identidade, conta, e-mail, IP ou user-agent no registro de negócio.
- Uploads e armazenamento durável de arquivos, status de solicitações e notificações permanecem pendentes conforme a especificação.
