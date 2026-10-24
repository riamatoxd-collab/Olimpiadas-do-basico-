# Web Push — configuração necessária

O arquivo sw.js e a interface de permissão estão preparados, mas não existe um servidor de envio neste repositório. Sem ele, o site pode guardar notificações internas e pedir permissão para notificações do navegador enquanto a página está aberta; não pode enviar push confiável quando o site está fechado.

## Para ativar push real
1. Criar um projeto de backend (por exemplo, Supabase Free) e uma tabela privada para inscrições push.
2. Gerar um par de chaves VAPID. A chave privada deve ficar somente em segredo de servidor, nunca no GitHub nem no JavaScript público.
3. Implementar endpoint autenticado para salvar e remover inscrições, vinculando a conta por autenticação real — não confiar apenas no nome do jogador enviado pelo navegador.
4. Implementar endpoint de envio restrito a administradores; validar autorização no servidor e limitar a frequência.
5. Definir no cliente window.VENTURE_PUSH_PUBLIC_KEY (somente chave pública) e window.VENTURE_PUSH_SUBSCRIBE_URL (URL HTTPS do endpoint de inscrição).
6. Testar em HTTPS, Android/desktop e iOS instalado na tela inicial, incluindo revogação de permissão e inscrições expiradas.

Não publique a chave privada, tokens de administrador ou segredos no repositório. Não use o broker MQTT público como autoridade para autenticação ou premiações.
