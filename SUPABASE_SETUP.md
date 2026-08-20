# Supabase setup

Este projeto funciona com localStorage enquanto o Supabase nao estiver configurado. Para ativar o banco:

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/schema.sql`.
3. No Dashboard, confirme que o bucket `love-photos` existe e esta publico.
4. Configure a chave da OMDb como secret da Edge Function:

```powershell
supabase secrets set OMDB_API_KEY=sua-chave-da-omdb
```

5. Publique a funcao de busca:

```powershell
supabase functions deploy movie-search
```

6. Copie a URL do projeto e a anon/public key do Supabase para `src/js/supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: 'https://seu-projeto.supabase.co',
  anonKey: 'sua-anon-public-key',
  storageBucket: 'love-photos',
  edgeBaseUrl: 'https://seu-projeto.supabase.co/functions/v1'
};
```

Depois disso, memorias, fotos, filmes, notas e atributos dos perfis passam a ser carregados do Supabase.

## Atualizar bucket de midias

Se o projeto ja existia antes do suporte a midias de iPhone, rode `supabase/migrations/20260820_iphone_media_types.sql` no SQL Editor. Essa migracao aumenta o limite do bucket `love-photos` para 50 MB e libera HEIC/HEIF, MOV e M4V.

## Observacao de seguranca

As policies em `supabase/schema.sql` estao abertas para leitura e escrita publica porque o site ainda nao tem login. Se o site for publicado em um link publico, qualquer pessoa com acesso ao app pode alterar dados usando a anon/public key. O proximo passo recomendado e adicionar autenticacao ou uma senha simples protegendo as escritas.
