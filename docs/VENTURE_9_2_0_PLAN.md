# Venture 9.2.0 — escopo consolidado

## Base preservada
Venture 9.1.1 com dez emblemas de liga em WebP, ranking mensal previsto para novembro de 2026, XP Ledger, Arena, ranking geral, perfis, duelos e arquivos legados de Flashcards/Taça.

## Novas entregas
- Central de notificações internas com deduplicação por ID, contador, leitura individual e em lote.
- Notificações de resultado ao fechar uma temporada, gravadas no cadastro existente.
- Preparação de Web Push por service worker e permissão do navegador; backend/VAPID não incluídos.
- Comunicados administrativos para cadastros disponíveis no conjunto local sincronizado, com aviso explícito das limitações de segurança.
- Badges Big Mac de liga nos perfis pessoal e público.
- Trilhas preparatórias All Star: Balcão/Atendimento, Drive-Thru, Cozinha e Sobremesas/Quiosque.
- Calendário inicial: outubro de 2026 como pré-temporada; primeira temporada mensal em 01–30 de novembro de 2026.

## Regras de preservação
- Não zerar XP vitalício nem alterar o ranking geral.
- Não apagar cadastros, IDs, missões, medalhas, Arena, duelos ou histórico legado.
- Não reintroduzir Flashcards/Taça semanal na navegação nesta fase.
- Não tratar o sistema de notificações interno como push remoto real.
- Não apresentar a trilha All Star como programa oficial ou elegibilidade confirmada.

## Riscos restantes
A sincronização e as permissões administrativas ainda dependem do cliente/sistema legado. O XP precisa de backend transacional autenticado para garantia autoritativa sob concorrência. O fechamento mensal usa os dados disponíveis no aparelho que executa a rotina; revisar a sincronização antes de divulgar resultados.
