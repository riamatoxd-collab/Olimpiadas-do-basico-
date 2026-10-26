# Venture 9.2.0 — plano de implementação

## Objetivo
Adicionar notificações internas, preparar Web Push, apresentar badges Big Mac para as dez ligas mensais e abrir uma trilha preparatória All Star, mantendo o ranking geral e os saldos de XP.

## Entregas nesta branch
- Recriação dos módulos js/10-arena-venture.js e js/11-ligas-mensais.js, que eram referenciados no index.html da base 9.1.0, mas não estavam presentes no repositório.
- Ledger de XP no cadastro existente com IDs de recompensa, marcações pendentes/aplicadas e união de registros na mesclagem local.
- Ligas Bronze, Prata, Ouro, Safira, Rubi, Esmeralda, Ametista, Pérola, Obsidiana e Diamante; XP mensal separado do XP vitalício.
- Botão administrativo para fechar a temporada anterior depois de encerrado o mês. O fechamento é manual e depende do conjunto de jogadores sincronizado no aparelho do administrador.
- Centro de notificações interno, contador de não lidas, avisos de temporada/conquista e composer de comunicados globais para administrador.
- Service worker para receber eventos Push e manifest PWA. O envio real com site fechado não funciona até configurar backend de envio, VAPID e armazenamento seguro de inscrições.
- Badges de liga com ícone de hambúrguer no perfil pessoal, perfil público e ranking mensal.
- Hub preparatório All Star com trilhas de Balcão/Atendimento, Drive-Thru, Cozinha e Sobremesas/Quiosque.
- Documentação de testes e configuração de push.

## Calendário inicial
- Pré-temporada: até 31/10/2026.
- Primeira temporada mensal: 01/11/2026 a 30/11/2026.
- O fechamento de novembro poderá ser executado pelo administrador em dezembro, depois de conferir a sincronização.
- Nenhum XP vitalício será zerado no fechamento mensal.

## Regras de liga
- Cada cadastro começa na Liga Bronze, sem alteração do XP acumulado.
- A pontuação mensal soma apenas entradas aplicadas do ledger dentro do mês local do dispositivo.
- Só participantes com XP positivo entram nas zonas de promoção/rebaixamento.
- Para evitar movimentos com poucos participantes, a divisão precisa ter pelo menos cinco participantes ativos.
- O administrador fecha a temporada anterior manualmente. A classificação é calculada com os registros disponíveis no aparelho e sincronizados pelo sistema legado; ainda não é um resultado autoritativo de servidor.

## Limites e riscos conhecidos
- O site continua usando sincronização legada via MQTT/HTTP. O ledger por ID reduz duplicações e facilita a reconciliação, mas não garante transações exactly-once entre aparelhos simultâneos.
- O fechamento mensal é manual para evitar que cada aparelho finalize a temporada de forma independente.
- Avisos internos são persistidos no cadastro e podem ser propagados pela sincronização atual. A entrega depende de os dispositivos sincronizarem. O formulário administrativo usa a autorização local legada, não uma identidade validada no servidor; não enviar conteúdo sensível.
- A permissão do navegador e o service worker podem ser preparados gratuitamente. Push confiável com o site fechado exige endpoint de backend, VAPID e armazenamento/gestão de inscrições; não há chaves nem backend de envio incluídos no repositório.
- O All Star aqui é uma trilha de preparação independente, não uma integração oficial com sistemas internos da Arcos Dorados/McDonald's e não concede classificação oficial.

## Referências consultadas sobre All Star
- Correio Jaguariúna, etapa final de 11/09/2026: https://correiojaguariuna.com.br/loja-mcdonalds-de-jaguariuna-recebe-etapa-final-da-competicao-all-star-no-dia-11-de-setembro/
- O Regional, etapa regional de 08/01/2026: https://oregional.net/unidade-do-mcdonalds-de-jaguariuna-recebe-etapa-regional-da-competicao-all-star-192263
- App McDonald's AllStar (Arcos Dorados), descrição do programa: https://apps.apple.com/br/app/mcdonalds-allstar/id1399163652

## All Star Cozinha — implementação inicial
- Experiência jogável de treinamento guiado e prova competitiva.
- 55 questões baseadas no Book Olimpíadas de Básico — Venture, com referência à página e ao número da questão original: Linha (13), Chapas e Carnes (18), McFritas (9), Produtos Fritos (15). Distratores de múltipla escolha são elaborados para o jogo.
- Perguntas do Guia de Implementação BB VF 2025 são identificadas separadamente das perguntas do Material de Estudo — Produção Linha.
- Em competição, fonte e gabarito ficam ocultos até a revisão final.
- Resultados são guardados em `user.ventureAllStar`, limitados aos 30 registros mais recentes, e não alteram XP.
- O banco de 55 questões usa o Book Olimpíadas de Básico — Venture como fonte de enunciados/respostas; alternativas incorretas são elaboradas para o quiz e não são transcritas do book.
- UHC de carnes vermelhas segue o book enviado: 79°C e máximo de 10 minutos (questões 13 e 14, p. 1). Um material complementar tem valores diferentes, mas não é a fonte adotada para esse parâmetro.
- Ver checklist e mapa de fontes em `docs/ALLSTAR_COZINHA_QUESTOES.md`.

## Otimização de desempenho — revisão inicial
- Scripts Tailwind e MQTT passam a usar `defer`, evitando bloquear a leitura inicial do HTML.
- A biblioteca `html2canvas` sai do carregamento inicial e é carregada sob demanda apenas ao exportar uma imagem do ranking.
- A versão interna do verificador automático foi alinhada para 9.2.0, igual ao HTML e a `version.json`, evitando detectar a própria versão como atualização disponível.
- Heartbeat reduzido de 10s para 15s para manter o indicador online dentro da janela de 25s; a mensagem de heartbeat usa payload parcial não-retido e não executa backup, serialização de todos os cadastros ou atualização completa da interface.
- Atualizações visuais do ranking causadas por heartbeat são agrupadas por uma janela de 5s quando a aba de ranking está aberta.
- A sincronização completa e retida continua disponível para mudanças reais de cadastro/progresso.
- Validação estática dos 19 scripts locais passou sem erros de sintaxe. Ainda falta medir carregamento e responsividade em navegador real; não há benchmark de campo nesta etapa.

## Troca da tela competitiva
- A tela de ranking geral legado foi removida da navegação visual e substituída pela Liga Mensal como competição principal.
- Não foram apagados XP vitalício, cadastros, históricos ou funções legadas; os módulos antigos ficam no código para rollback.
- Histórico de duelos e Jornada de 27 níveis continuam acessíveis como recursos auxiliares.
