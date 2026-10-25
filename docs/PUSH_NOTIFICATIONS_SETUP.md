# Venture 9.2.0 — ativação de Web Push real

A central interna funciona sem serviço externo. O service worker e o botão de permissão preparam o navegador, mas não há servidor de envio neste pacote. Portanto, não anunciar que push com o site fechado está ativo.

## Etapas necessárias
1. Criar backend de teste (por exemplo, Supabase Free) e tabela privada para inscrições push.
2. Gerar chaves VAPID. Guardar a chave privada apenas em segredo de servidor; nunca no GitHub nem no JavaScript público.
3. Implementar endpoints autenticados para criar/remover inscrições e associá-las a um ID de usuário validado no servidor.
4. Implementar endpoint de envio restrito a administradores verificados no servidor, com limitação de frequência e logs.
5. Configurar no cliente apenas a chave VAPID pública (`window.VENTURE_PUSH_PUBLIC_KEY`) e o endpoint HTTPS de inscrição (`window.VENTURE_PUSH_SUBSCRIBE_URL`).
6. Testar HTTPS, Android/desktop, iOS instalado na tela inicial, revogação de permissão e inscrições expiradas.

Não confiar no nome/ID enviado pelo navegador como autenticação. Não colocar chaves privadas ou tokens no repositório. O broker de sincronização legado não deve ser usado como autoridade de XP ou permissões.
