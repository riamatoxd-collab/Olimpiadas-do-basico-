# Venture 9.2.0 — checklist de testes

## Smoke tests
- [ ] Abrir index.html por HTTPS e confirmar que não há 404 em js/10-arena-venture.js, js/11-ligas-mensais.js, js/12-notificacoes.js e js/13-allstar.js.
- [ ] Login/cadastro: conta existente entra, perfil abre e o XP acumulado não muda.
- [ ] Arena: cinco perguntas, cada resposta só pontua uma vez, repetição diária bloqueada, XP x2 respeitado.
- [ ] Ledger: repetir um rewardId aplicado não adiciona XP; IDs diferentes são preservados na mesclagem.
- [ ] Liga: em outubro aparece pré-temporada; a primeira temporada é novembro de 2026; XP vitalício e ranking geral não são zerados.
- [ ] Perfil pessoal e público mostram o badge de liga Big Mac.
- [ ] Notificações: abrir sino, marcar como lida, fechar modal, contador de não lidas, anúncio administrativo e persistência após recarregar.
- [ ] Browser alerts: negar/conceder permissão; testar service worker; confirmar que a interface explica quando push real ainda não está configurado.
- [ ] All Star: escolher cada trilha, recarregar e confirmar que a escolha persiste sem adicionar XP.
- [ ] Duelo e Taça legada: verificar que o fluxo existente não é removido nem recebe alterações de XP inesperadas.

## Multi-dispositivo
- [ ] Ganhar XP em dois aparelhos offline, reconectar e comparar saldos.
- [ ] Repetir o mesmo desafio em dois aparelhos ao mesmo tempo.
- [ ] Fechar a página durante uma recompensa e verificar a recuperação do ledger.
- [ ] Fechar a temporada apenas uma vez com a conta administradora, depois de comparar os dados sincronizados.

## Antes de publicar
A branch precisa de teste manual no navegador e com dois aparelhos. A sincronização atual não é uma autoridade central; não anunciar prêmios ou resultados oficiais antes de instalar backend transacional.
