/* =========================================================================
OLIMPÍADAS DO BÁSICO — VENTURE (script.js v8.5 — sequência persistente)
Finalização 25/10 + Sistema de Cozinha (Monta-Lanche) + Sons + Print + 1v1
========================================================================= */
const $ = id => document.getElementById(id);
const AVATAR_LIST = ["🍔", "🍟", "🍦", "🔥", "👨‍🍳", "👑", "⚡", "🏆", "🚀", "🥤", "🥓", "🎯"];
let selectedRegAvatar = "🍔";
// Data Oficial de Encerramento: 25/10/2026 às 23:59:59
const EVENT_END_TIMESTAMP = new Date("2026-10-25T23:59:59-03:00").getTime();
// RECEITAS OFICIAIS DO SISTEMA DE COZINHA (MONTA-LANCHE)
const KITCHEN_RECIPES = [
{
id: "smokehouse1", name: "🥓 Brabo SmokeHouse (1 Carne)", xp: 5,
steps: ["Coroa Pão Brioche", "Molho Méquinese (1 oz)", "Cebola Crispy (10 g)", "Bacon em Tiras (3 fatias)", "Queijo Cheddar (1 fatia)", "Carne 4:1 (1 unidade)", "Queijo Cheddar (1 fatia)", "Bacon Triturado (10 g)", "Geleia Agridoce Defumada (2/3 oz)", "Base Pão Brioche"]
},
{
id: "smokehouse2", name: "🔥 Brabo SmokeHouse (2 Carnes)", xp: 5,
steps: ["Coroa Pão Brioche", "Molho Méquinese (1 oz)", "Cebola Crispy (10 g)", "Bacon em Tiras (3 fatias)", "Queijo Cheddar (1 fatia)", "Carne 4:1 (2 unidades)", "Queijo Cheddar (1 fatia)", "Bacon Triturado (10 g)", "Geleia Agridoce Defumada (2/3 oz)", "Base Pão Brioche"]
},
{
id: "bigmac", name: "🍔 Big Mac Oficial", xp: 5,
steps: ["Pão Big Mac (Base + Club + Coroa)", "Molho Big Mac (1/2 oz Base + 1/2 oz Club)", "Alface (12 g Base + 12 g Club = 24 g)", "Picles (2 fatias no Club)", "Queijo Cheddar (1 fatia na Base)", "2 Carnes 10:1 c/ Cebola (3,5 g)"]
},
{
id: "quarteirao", name: "🧀 Quarteirão com Queijo", xp: 5,
steps: ["Pão Quarteirão (Coroa e Base)", "Mostarda (1/40 oz)", "Ketchup (1/2 oz)", "Cebola Fresca (7 g)", "Picles (2 fatias)", "2 Queijos Cheddar em Estrela", "1 Carne 4:1"]
},
{
id: "cheeseburger", name: "🍔 Cheeseburger Padrão", xp: 5,
steps: ["Pão Regular (Coroa e Base)", "Mostarda (1/40 oz)", "Ketchup (1/3 oz)", "Picles (1 fatia)", "Queijo Cheddar (1 fatia)", "1 Carne 10:1 c/ 3,5 g Cebola"]
},
{
id: "mcnifico", name: "🥓 McNífico Bacon", xp: 5,
steps: ["Mostarda (1/40 oz) + Ketchup (1/2 oz)", "Cebola Fresca (7 g)", "Molho Maionese (2/3 oz)", "Alface (28 g) + 2 Tomates", "2 Fatias de Bacon + 1 Queijo Cheddar", "1 Carne 4:1"]
},
{
id: "bigtasty", name: "👑 Big Tasty", xp: 5,
steps: ["Molho Tasty (1 oz Coroa + 1 oz Base)", "Cebola Fresca (10 g)", "Alface (28 g) + 2 Tomates", "3 Queijos Ementhal", "Carne 4:1 (Destacando a TAG)"]
}
];
// BANCO OFICIAL DE 200 QUESTÕES — BOOK VENTURE
const QUESTIONS_DB = [
{ id: 1, level: "Básico", q: "Quantas gramas de alface colocamos no BigMac?", a: "12 gr na base e 12 gr no clube, totalizando 24 gramas.", w: ["14 gr na base e 14 gr no clube, totalizando 28 gramas.", "10 gr na base e 10 gr no clube, totalizando 20 gramas.", "15 gr na base e 15 gr no clube, totalizando 30 gramas."] },
  { id: 2, level: "Básico", q: "Quantas gramas de alface colocamos no McChicken?", a: "28 gramas de alface.", w: ["24 gramas de alface.", "30 gramas de alface.", "14 gramas de alface."] },
  { id: 3, level: "Básico", q: "Quantas gramas (oz) de molho vai no Big Tasty?", a: "1 oz na coroa e 1 oz na base, totalizando 2 oz.", w: ["1/2 oz na coroa e 1/2 oz na base, totalizando 1 oz.", "2/3 oz na coroa e 2/3 oz na base, totalizando 4/3 oz.", "1 oz apenas na base, totalizando 1 oz."] },
  { id: 7, level: "Básico", q: "Por quanto tempo devemos lavar as mãos?", a: "20 segundos.", w: ["15 segundos.", "30 segundos.", "45 segundos."] },
  { id: 8, level: "Básico", q: "Qual o primeiro passo na lavagem das mãos?", a: "Molhar as mãos.", w: ["Aplicar sabonete bactericida.", "Esfregar as palmas por 20s.", "Sanitizar com solução clorada."] },
  { id: 9, level: "Básico", q: "Qual a frequência correta para lavagem das mãos?", a: "A cada 1 hora.", w: ["A cada 30 minutos.", "A cada 2 horas.", "A cada 45 minutos."] },
  { id: 10, level: "Básico", q: "Quais são os EPIs necessários para atuar na estação de chapa?", a: "Avental e mangote.", w: ["Avental, luva de malha e óculos.", "Mangote, luva térmica azul e touca.", "Avental antichamas e bota de borracha."] },
  { id: 11, level: "Básico", q: "Cite bons padrões de higiene essenciais para o trabalho no McDonald's.", a: "Cabelos presos, unhas curtas, sem esmalte e limpas, barba feita, sem adornos e com redinha.", w: ["Cabelos presos, unhas com base incolor, barba aparada, relógio discreto e redinha.", "Cabelos presos, unhas curtas, uso permitido apenas de aliança lisa e barba feita.", "Cabelos com boné sem redinha, unhas curtas, sem esmalte e brinco pequeno."] },
  { id: 12, level: "Básico", q: "Qual a compressão do pão e tempo de tostagem da tostadeira?", a: "Compressão 4, tempo de tostagem 22 segundos.", w: ["Compressão 3, tempo de tostagem 18 segundos.", "Compressão 4, tempo de tostagem 17 segundos.", "Compressão 5, tempo de tostagem 25 segundos."] },
  { id: 13, level: "Básico", q: "Qual a temperatura das UHCs de carnes vermelhas e brancas respectivamente?", a: "Carnes vermelhas 79°C e carnes brancas 85°C.", w: ["Carnes vermelhas 85°C e carnes brancas 79°C.", "Carnes vermelhas 74°C e carnes brancas 82°C.", "Carnes vermelhas 77°C e carnes brancas 90°C."] },
  { id: 14, level: "Básico", q: "Qual o tempo de vida das carnes vermelhas na UHC?", a: "10 minutos.", w: ["15 minutos.", "12 minutos.", "20 minutos."] },
  { id: 15, level: "Básico", q: "Qual o tempo das carnes brancas na UHC?", a: "Crispy 60 minutos, Chicken 30 minutos, Junior e Nuggets 20 minutos.", w: ["Crispy 45 minutos, Chicken 30 minutos, Junior e Nuggets 15 minutos.", "Crispy 60 minutos, Chicken 20 minutos, Junior e Nuggets 30 minutos.", "Crispy 30 minutos, Chicken 20 minutos, Junior e Nuggets 10 minutos."] },
  { id: 16, level: "Básico", q: "Qual o tempo de vida dos ceboleiros em área e quantos conseguimos fazer com 1 pacote de cebola?", a: "4 horas e 7 ceboleiros.", w: ["2 horas e 5 ceboleiros.", "4 horas e 5 ceboleiros.", "6 horas e 8 ceboleiros."] },
  { id: 17, level: "Básico", q: "Qual o tempo de reação do iniciador?", a: "De 3 a 5 segundos.", w: ["De 1 a 3 segundos.", "De 5 a 8 segundos.", "De 5 a 10 segundos."] },
  { id: 18, level: "Básico", q: "Qual pessoa da linha nunca pode sair da estação?", a: "A pessoa do iniciador.", w: ["A pessoa do finalizador.", "A pessoa da condimentação.", "A pessoa da chapa."] },
  { id: 19, level: "Básico", q: "A partir de quantos sanduíches produzidos na hora devemos abrir o lado 2?", a: "125 sanduíches na hora.", w: ["100 sanduíches na hora.", "150 sanduíches na hora.", "90 sanduíches na hora."] },
  { id: 20, level: "Básico", q: "Em qual direção devem ficar a base e a coroa dos pães na linha?", a: "Base sentido UHC e Coroa sentido tostadeira.", w: ["Base sentido tostadeira e Coroa sentido UHC.", "Base e Coroa sentido tostadeira.", "Base e Coroa sentido UHC."] },
  { id: 21, level: "Básico", q: "Quantos pães podemos ativar por vez na tostadeira?", a: "2 pães.", w: ["3 pães.", "4 pães.", "1 pão por vez."] },
  { id: 22, level: "Básico", q: "Quantos sanduíches podemos condimentar por vez?", a: "2 sanduíches.", w: ["3 sanduíches.", "4 sanduíches.", "1 sanduíche por vez."] },
  { id: 23, level: "Básico", q: "Quais as cores dos clipes das gavetas da UHC para McChicken e Nuggets?", a: "McChicken amarelo e Nuggets branco.", w: ["McChicken branco e Nuggets amarelo.", "McChicken verde e Nuggets azul.", "McChicken amarelo e Nuggets verde."] },
  { id: 24, level: "Básico", q: "Qual o tempo de vida do ceboleiro na estação de chapa?", a: "4 horas.", w: ["2 horas.", "6 horas.", "12 horas."] },
  { id: 25, level: "Básico", q: "Quantos panos devemos ter na linha?", a: "3 panos: 1 para tostadeira, 1 para mesa de condimentação e 1 para UHC.", w: ["4 panos: 2 para mesa, 1 para tostadeira e 1 para UHC.", "2 panos: 1 para mesa e 1 para tostadeira.", "3 panos: 2 para utensílios e 1 para mesa."] },
  { id: 26, level: "Básico", q: "Em quantos pedaços devemos cortar a carne de Crispy da Salada Mix?", a: "De 5 a 7 pedaços.", w: ["De 4 a 6 pedaços.", "De 6 a 8 pedaços.", "Em 4 pedaços iguais."] },
  { id: 27, level: "Básico", q: "Por quanto tempo o tomate deve ficar no sanitizante?", a: "15 minutos.", w: ["10 minutos.", "20 minutos.", "5 minutos."] },
  { id: 28, level: "Básico", q: "Por quanto tempo o tomate deve ficar em ambientação antes de ser cortado?", a: "2 horas.", w: ["1 hora.", "3 horas.", "4 horas."] },
  { id: 29, level: "Básico", q: "Qual o tempo de vida do tomate após ser cortado?", a: "2 horas.", w: ["4 horas.", "1 hora.", "3 horas."] },
  { id: 30, level: "Básico", q: "Qual o tempo de ambientação dos molhos Cheddar do Sanduíche e da Batata respectivamente?", a: "2 horas e 4 horas de ambientação.", w: ["4 horas e 2 horas de ambientação.", "2 horas e 2 horas de ambientação.", "1 hora e 3 horas de ambientação."] },
  { id: 31, level: "Básico", q: "Qual o tempo de vida do molho cheddar na pistola?", a: "2 horas de ambientação e 6 horas de tempo de vida, totalizando 8 horas.", w: ["4 horas de ambientação e 4 horas de uso, totalizando 8 horas.", "2 horas de ambientação e 4 horas de uso, totalizando 6 horas.", "1 hora de ambientação e 5 horas de uso, totalizando 6 horas."] },
  { id: 32, level: "Básico", q: "Quais quantidades de Molho Maionese colocamos nos sanduíches McChicken, McChicken Bacon, Chicken Jr e McNífico Bacon?", a: "2/3 oz de molho maionese.", w: ["1/2 oz de molho maionese.", "1 oz de molho maionese.", "1/3 oz de molho maionese."] },
  { id: 33, level: "Básico", q: "Qual quantidade de Molho colocamos no Big Mac?", a: "1 tiro de 1/2 oz de molho na base e 1 no club, totalizando 1 oz de molho Big Mac.", w: ["1 tiro de 1 oz na base e 1 no club, totalizando 2 oz.", "1 tiro de 1/3 oz na base e 1 no club, totalizando 2/3 oz.", "2 tiros de 1/2 oz apenas na base, totalizando 1 oz."] },
  { id: 34, level: "Básico", q: "Quais cores de pegadores temos na linha e qual a sua finalidade?", a: "Pegador vermelho para carnes vermelhas com cebola, azul para carnes vermelhas sem cebola, verde para carnes brancas.", w: ["Pegador azul para carnes com cebola, vermelho para sem cebola, verde para carnes brancas.", "Pegador vermelho para todas as carnes vermelhas, amarelo para frango e verde para saladas.", "Pegador preto para carnes com cebola, azul para sem cebola e bege para carnes brancas."] },
  { id: 35, level: "Básico", q: "Qual procedimento devemos seguir logo após ativar as carnes na chapa?", a: "Sanitizar as mãos.", w: ["Trocar o avental da estação.", "Raspar o platen imediatamente.", "Limpar a borda da UHC."] },
  { id: 36, level: "Básico", q: "Qual ferramenta define os níveis de carnes que devemos ter nas gavetas?", a: "PLS.", w: ["KVS.", "R2P.", "DFS."] },
  { id: 37, level: "Básico", q: "Qual o ângulo de raspagem da chapa?", a: "15°.", w: ["30°.", "45°.", "20°."] },
  { id: 38, level: "Básico", q: "Qual a forma correta de ativar, salgar e remover as carnes?", a: "Da direita para a esquerda, da frente para o fundo.", w: ["Da esquerda para a direita, do fundo para a frente.", "Da direita para a esquerda, do fundo para a frente.", "Da esquerda para a direita, da frente para o fundo."] },
  { id: 39, level: "Básico", q: "Qual o empilhamento máximo de carnes de 10:1 na gaveta?", a: "3 carnes.", w: ["4 carnes.", "2 carnes.", "6 carnes."] },
  { id: 40, level: "Básico", q: "Qual o empilhamento máximo de carnes de 4:1 na gaveta?", a: "1 carne, não podemos empilhar carnes de 4:1.", w: ["2 carnes por fileira na gaveta.", "3 carnes, igual à carne 10:1.", "Até 4 carnes empilhadas."] },
  { id: 41, level: "Básico", q: "Quantas carnes de 10:1 podemos ativar no máximo em cada platen?", a: "6 carnes.", w: ["8 carnes.", "4 carnes.", "9 carnes."] },
  { id: 42, level: "Básico", q: "Quantas carnes de 4:1 podemos ativar no máximo em cada platen?", a: "4 carnes.", w: ["6 carnes.", "2 carnes.", "8 carnes."] },
  { id: 43, level: "Básico", q: "Quantas carnes de 4:1 podemos colocar no máximo em cada gaveta?", a: "4 carnes.", w: ["6 carnes.", "8 carnes.", "12 carnes."] },
  { id: 44, level: "Básico", q: "Quantas carnes de 10:1 podemos colocar no máximo em cada gaveta?", a: "12 carnes.", w: ["9 carnes.", "15 carnes.", "18 carnes."] },
  { id: 45, level: "Básico", q: "Quantas fatias de bacon podemos ativar por vez em cada platen?", a: "6 fatias.", w: ["4 fatias.", "8 fatias.", "10 fatias."] },
  { id: 46, level: "Básico", q: "Qual pegador devemos usar para ativar as carnes brancas?", a: "Pegador preto.", w: ["Pegador verde.", "Pegador bege sem dentes.", "Pegador azul."] },
  { id: 47, level: "Básico", q: "Para que serve o pegador bege sem dentes nos produtos fritos?", a: "Para auxiliar a remoção das carnes dos cestos.", w: ["Para ativar os empanados congelados no óleo.", "Para montar os sanduíches de frango na linha.", "Para retirar as tortas da estufa."] },
  { id: 48, level: "Básico", q: "Quais as rodadas máximas para ativar carnes brancas e tortas?", a: "McChicken e Chicken Jr 6 carnes, Crispy 4 carnes, Nuggets 24 bolinhas e Tortas 16 unidades.", w: ["McChicken e Chicken Jr 8 carnes, Crispy 6 carnes, Nuggets 20 bolinhas e Tortas 12 unidades.", "McChicken e Chicken Jr 4 carnes, Crispy 4 carnes, Nuggets 30 bolinhas e Tortas 16 unidades.", "McChicken e Chicken Jr 6 carnes, Crispy 6 carnes, Nuggets 16 bolinhas e Tortas 8 unidades."] },
  { id: 49, level: "Básico", q: "Qual o tempo de resfriamento das tortas?", a: "20 minutos.", w: ["15 minutos.", "10 minutos.", "30 minutos."] },
  { id: 50, level: "Básico", q: "Qual o tempo de fritura das tortas?", a: "6 minutos.", w: ["3 minutos e 15 segundos.", "5 minutos.", "8 minutos."] },
  { id: 51, level: "Básico", q: "Qual o tempo de vida das tortas prontas?", a: "2 horas.", w: ["4 horas.", "1 hora.", "90 minutos."] },
  { id: 52, level: "Básico", q: "Quais os dois sistemas de ativada que podemos usar nos produtos fritos?", a: "Manutenção e Recuperação.", w: ["Ativação Contínua e Lote Máximo.", "Produção Direta e Garagem.", "Preventiva e Corretiva."] },
  { id: 53, level: "Básico", q: "Por quanto tempo as carnes devem escorrer sobre o óleo antes de ir para a gaveta?", a: "5 a 10 segundos.", w: ["10 a 15 segundos.", "3 a 5 segundos.", "15 a 20 segundos."] },
  { id: 54, level: "Básico", q: "Quais EPIs a pessoa do LOPE deve usar para acessar as câmaras?", a: "Casaco, Calça, Bota, Touca (balaclava) e luvas.", w: ["Avental térmico, mangote, bota e redinha.", "Casaco térmico, óculos, avental e luva de borracha.", "Jaqueta térmica, luva de malha de aço e sapato comum."] },
  { id: 55, level: "Básico", q: "Qual a temperatura da câmara de resfriados, Walk-in?", a: "De 1 a 4°C.", w: ["De 1 a 7°C.", "De 0 a 5°C.", "De 2 a 8°C."] },
  { id: 56, level: "Básico", q: "Qual a temperatura da câmara de congelados, Chicago?", a: "De -18 a -23°C.", w: ["De -10 a -15°C.", "De -15 a -20°C.", "De -22 a -28°C."] },
  { id: 57, level: "Básico", q: "Por quanto tempo o queijo deve ambientar antes de ser estocado na mesa de condimentação?", a: "2 horas.", w: ["1 hora.", "3 horas.", "4 horas."] },
  { id: 58, level: "Básico", q: "Qual a temperatura do queijo após a ambientação de 2 horas?", a: "De 15° a 18°C, ideal 17,5°C.", w: ["De 10° a 14°C, ideal 12,5°C.", "De 18° a 22°C, ideal 20°C.", "De 12° a 16°C, ideal 15°C."] },
  { id: 59, level: "Básico", q: "Como sabemos quantos queijos devemos ambientar para cada hora?", a: "Usando a tabela chart, para saber quantos queijos vamos usar de acordo com as GCs por hora.", w: ["Contando a quantidade restante nas cubas a cada 30 min.", "Retirando sempre 2 blocos fixos por hora.", "Olhando apenas a tela do monitor KVS da linha."] },
  { id: 60, level: "Básico", q: "O que é o CARD LOPE?", a: "É a ficha de tarefas da estação LOPE.", w: ["É a tabela de temperaturas das câmaras frias.", "É o cartão de ponto de partida das carnes na chapa.", "É o guia de montagem dos sacos do Delivery."] },
  { id: 61, level: "Básico", q: "Qual o tempo de vida da cebola reidratada?", a: "24 horas, incluindo 1 hora de hidratação.", w: ["12 horas, incluindo 1 hora de hidratação.", "48 horas, incluindo 2 horas de hidratação.", "24 horas na mesa e 48 horas na câmara."] },
  { id: 62, level: "Básico", q: "Qual o tempo de vida do suco, após aberto?", a: "7 dias sob refrigeração.", w: ["5 dias sob refrigeração.", "3 dias sob refrigeração.", "10 dias sob refrigeração."] },
  { id: 63, level: "Básico", q: "Qual o tempo de vida do mix, após aberto?", a: "7 dias sob refrigeração.", w: ["3 dias sob refrigeração.", "5 dias sob refrigeração.", "24 horas sob refrigeração."] },
  { id: 64, level: "Básico", q: "Qual o tempo dos queijos cheddar e ementhal após abertos?", a: "24 horas sob refrigeração.", w: ["48 horas sob refrigeração.", "12 horas sob refrigeração.", "7 dias sob refrigeração."] },
  { id: 65, level: "Básico", q: "Qual o tempo de vida da alface e da cebola nas cubas?", a: "2 horas.", w: ["4 horas.", "1 hora.", "3 horas."] },
  { id: 66, level: "Básico", q: "Quando usamos cubas médias para alface na mesa de condimentação?", a: "Nas horas pico.", w: ["Durante a abertura e o fechamento da loja.", "Apenas no turno da madrugada.", "Em horários de baixo movimento."] },
  { id: 67, level: "Básico", q: "Qual a temperatura do óleo para carnes brancas e tortas?", a: "180°C.", w: ["168°C.", "175°C.", "185°C."] },
  { id: 68, level: "Básico", q: "Qual a temperatura do óleo para McFritas?", a: "168°C.", w: ["180°C.", "172°C.", "160°C."] },
  { id: 69, level: "Básico", q: "Qual o tempo de fritura para carnes brancas?", a: "McChicken, Chicken Jr e Nuggets 3min e 15s; Crispy e Tortas 6 minutos.", w: ["McChicken, Chicken Jr e Nuggets 3min e 10s; Crispy e Tortas 5 minutos.", "McChicken, Chicken Jr e Nuggets 4 minutos; Crispy e Tortas 6 minutos.", "McChicken e Nuggets 2min e 45s; Crispy e Tortas 5min e 30s."] },
  { id: 70, level: "Básico", q: "Qual o tempo de fritura para McFritas?", a: "3 min e 10 segundos.", w: ["3 min e 15 segundos.", "2 min e 50 segundos.", "3 min e 30 segundos."] },
  { id: 71, level: "Básico", q: "Qual o Duty para McFritas?", a: "30 segundos.", w: ["20 segundos.", "45 segundos.", "15 segundos."] },
  { id: 72, level: "Básico", q: "Qual o tempo de vida das McFritas depois de prontas?", a: "7 minutos.", w: ["5 minutos.", "10 minutos.", "12 minutos."] },
  { id: 73, level: "Básico", q: "Quantas gramas de sal o saleiro das McFritas dispensa?", a: "4 gramas.", w: ["3,5 gramas.", "5 gramas.", "7 gramas."] },
  { id: 74, level: "Básico", q: "Qual EPI devemos usar para operar as estações de McFritas e Produtos Fritos?", a: "Avental e Mangote.", w: ["Apenas luva térmica azul.", "Avental antichamas e óculos.", "Luva preta e touca balaclava."] },
  { id: 75, level: "Básico", q: "Quantos panos devemos manter na estação de McFritas?", a: "2 panos.", w: ["3 panos.", "4 panos.", "1 pano."] },
  { id: 76, level: "Básico", q: "Qual é o tempo MFY (linha) com 1, 2 ou 3 pessoas?", a: "Com 1 pessoa 50 segundos, com 2 pessoas 42 segundos, com 3 pessoas 35 segundos.", w: ["Com 1 pessoa 60s, com 2 pessoas 45s, com 3 pessoas 30s.", "Com 1 pessoa 45s, com 2 pessoas 38s, com 3 pessoas 28s.", "Com 1 pessoa 55s, com 2 pessoas 40s, com 3 pessoas 32s."] },
  { id: 77, level: "Básico", q: "Qual o tempo de R2P (entrega pedido balcão)?", a: "90 segundos.", w: ["120 segundos.", "60 segundos.", "45 segundos."] },
  { id: 78, level: "Básico", q: "Qual o tempo de OEPE (drive)?", a: "120 segundos.", w: ["90 segundos.", "150 segundos.", "100 segundos."] },
  { id: 79, level: "Básico", q: "Qual o tempo de vida secundário da cebola shoyu?", a: "48 horas sob refrigeração na embalagem original e 2 horas na mesa de condimentação.", w: ["24 horas sob refrigeração e 4 horas na mesa.", "7 dias sob refrigeração e 2 horas na mesa.", "48 horas sob refrigeração e 4 horas na mesa."] },
  { id: 80, level: "Básico", q: "De quanto em quanto tempo deve ser retirado queijo para ambientar e por quanto tempo ambienta?", a: "Retiramos a cada hora e ambienta por 2 horas.", w: ["Retiramos a cada 2 horas e ambienta por 1 hora.", "Retiramos a cada 30 minutos e ambienta por 2 horas.", "Retiramos a cada 2 horas e ambienta por 4 horas."] },
  { id: 81, level: "Básico", q: "Qual a validade secundária do amendoim?", a: "10 dias na embalagem original e 5 dias no dispensador.", w: ["15 dias na embalagem original e 7 dias no dispensador.", "7 dias na embalagem original e 24 horas no dispensador.", "30 dias na embalagem original e 5 dias no dispensador."] },
  { id: 82, level: "Básico", q: "Qual a validade secundária do Ovomaltine?", a: "30 dias na embalagem original e 7 dias fracionado ou em dispensador.", w: ["15 dias na embalagem original e 24 horas no dispensador.", "10 dias na embalagem original e 5 dias no dispensador.", "30 dias na embalagem original e 24 horas no dispensador."] },
  { id: 83, level: "Básico", q: "Qual a validade secundária do Ovomaltine Rocks?", a: "15 dias na embalagem original e 24 horas fracionado ou em dispensador.", w: ["30 dias na embalagem original e 7 dias no dispensador.", "10 dias na embalagem original e 48 horas no dispensador.", "7 dias na embalagem original e 12 horas no dispensador."] },
  { id: 84, level: "Básico", q: "Qual a validade secundária das gotas de chocolate?", a: "10 dias na embalagem original e 24 horas fracionado ou em dispensador.", w: ["15 dias na embalagem original e 7 dias no dispensador.", "30 dias na embalagem original e 24 horas no dispensador.", "10 dias na embalagem original e 5 dias no dispensador."] },
  { id: 85, level: "Básico", q: "Qual a validade secundária das coberturas?", a: "7 dias.", w: ["5 dias.", "10 dias.", "14 dias."] },
  { id: 86, level: "Básico", q: "Qual a temperatura do Mix no reservatório da máquina?", a: "De 1 a 4°C.", w: ["De 1 a 7°C.", "De -2 a 2°C.", "De 4 a 8°C."] },
  { id: 87, level: "Básico", q: "Qual a validade secundária do biju?", a: "3 dias na embalagem original e 24 horas no dispensador.", w: ["3 dias na embalagem original e 12 horas no dispensador.", "5 dias na embalagem original e 24 horas no dispensador.", "7 dias na embalagem original e 48 horas no dispensador."] },
  { id: 88, level: "Básico", q: "Qual a validade secundária da casquinha/cascão?", a: "3 dias na embalagem original e 12 horas no dispensador.", w: ["3 dias na embalagem original e 24 horas no dispensador.", "5 dias na embalagem original e 12 horas no dispensador.", "7 dias na embalagem original e 24 horas no dispensador."] },
  { id: 89, level: "Básico", q: "Qual a validade secundária da Cebola Crispy?", a: "7 dias na embalagem original e 2 horas na mesa de condimentação.", w: ["10 dias na embalagem original e 4 horas na mesa.", "5 dias na embalagem original e 2 horas na mesa.", "48 horas na embalagem original e 2 horas na mesa."] },
  { id: 90, level: "Básico", q: "Qual a temperatura de extração do refrigerante?", a: "De 1 a 4°C.", w: ["De 1 a 7°C.", "De 0 a 3°C.", "De 2 a 6°C."] },
  { id: 91, level: "Básico", q: "Qual a temperatura de extração dos sucos?", a: "De 1 a 7°C.", w: ["De 1 a 4°C.", "De 2 a 8°C.", "De 0 a 5°C."] },
  { id: 92, level: "Básico", q: "Por que colocamos gelo nos refrigerantes?", a: "Para manter a temperatura e a carbonatação.", w: ["Apenas para completar o volume padrão do copo.", "Para diluir a concentração do xarope na água.", "Apenas para gelar o copo antes da entrega."] },
  { id: 93, level: "Básico", q: "Quais as cores dos esfregões que devemos usar na cozinha, balcão, salão, banheiros e externa?", a: "Cozinha Vermelho, Balcão e salão Azul, Banheiros e externa Verde.", w: ["Cozinha Azul, Balcão e salão Verde, Banheiros e externa Vermelho.", "Cozinha Vermelho, Balcão e salão Verde, Banheiros e externa Azul.", "Cozinha Amarelo, Balcão e salão Azul, Banheiros e externa Vermelho."] },
  { id: 94, level: "Básico", q: "Qual a quantidade de cobertura que colocamos nos McShakes de Chocolate e Morango?", a: "Chocolate 1 oz e Morango 2 oz.", w: ["Chocolate 2 oz e Morango 1 oz.", "Chocolate 1 oz e Morango 1 oz.", "Chocolate 1,5 oz e Morango 2,5 oz."] },
  { id: 95, level: "Básico", q: "Por quantos segundos devemos bater o McShake?", a: "18 segundos.", w: ["15 segundos.", "22 segundos.", "10 segundos."] },
  { id: 96, level: "Básico", q: "Qual a quantidade de itens nos sacos A, B e C respectivamente?", a: "1 a 3, 4 a 6 e 7 a 9 respectivamente.", w: ["1 a 2, 3 a 5 e 6 a 8 respectivamente.", "1 a 4, 5 a 8 e 9 a 12 respectivamente.", "2 a 4, 5 a 7 e 8 a 10 respectivamente."] },
  { id: 97, level: "Básico", q: "Quando devemos servir o pedido na OAT?", a: "Após todos os itens estarem prontos.", w: ["Assim que o sanduíche cair na OAT, antes das batatas.", "Assim que o cliente efetuar o pagamento no caixa.", "Logo após puxar os copos de refrigerante."] },
  { id: 98, level: "Básico", q: "Qual a ordem sequência correta de montagem das bandejas?", a: "Sanduíches, batatas, bebidas e sobremesas.", w: ["Bebidas, sanduíches, batatas e sobremesas.", "Bebidas, batatas, sanduíches e sobremesas.", "Sanduíches, bebidas, batatas e sobremesas."] },
  { id: 99, level: "Básico", q: "Qual o primeiro passo para fazer o McShake?", a: "Colocar 15 ml de leite no fundo do copo.", w: ["Colocar 1 oz de cobertura no fundo do copo.", "Extrair a base de baunilha até a linha do copo.", "Colocar 30 ml de mix no fundo do copo."] },
  { id: 100, level: "Básico", q: "De que forma identificamos as bebidas zero?", a: "Colocando a letra Z com caneta no copo.", w: ["Colocando dois canudos na tampa do copo.", "Dobrar todas as bolinhas da tampa plástica.", "Colocando um adesivo vermelho na lateral do copo."] },
  { id: 101, level: "Básico", q: "Qual o tamanho da casquinha?", a: "3,5 voltas ou 7,5 cm.", w: ["4,5 voltas ou 8,5 cm.", "3 voltas ou 6,5 cm.", "5 voltas ou 9 cm."] },
  { id: 102, level: "Básico", q: "Qual o 5º item que podemos sugerir para complementar a refeição do cliente?", a: "O café.", w: ["O queijo extra.", "A McFritas Grande.", "O brinquedo do McLanche Feliz."] },
  { id: 103, level: "Básico", q: "Qual o tempo de vida do café coado?", a: "1 hora.", w: ["2 horas.", "30 minutos.", "45 minutos."] },
  { id: 104, level: "Básico", q: "Quais são as 5 estações principais do Drive-Thru?", a: "Face (COD), Caixa Drive, Apoio, Entrega e Conferente.", w: ["Iniciador, Condimentador, Finalizador, Runner e Caixa.", "Face (COD), Totem, Balcão, Runner e Motoboy.", "Caixa Drive, Bebidas, Fritadeira, Chapa e Estoque."] },
  { id: 105, level: "Básico", q: "Qual o objetivo de imprecisão do delivery dos restaurantes?", a: "1%.", w: ["2%.", "0,5%.", "3%."] },
  { id: 106, level: "Básico", q: "A partir de quantas bebidas usamos suporte no drive?", a: "A partir de 2 bebidas.", w: ["A partir de 1 bebida.", "A partir de 3 bebidas.", "A partir de 4 bebidas."] },
  { id: 107, level: "Básico", q: "O que é sistema PEPS?", a: "Primeiro que entra, primeiro que sai.", w: ["Primeiro que estoca, primeiro que serve.", "Produto embalado, produto sanitizado.", "Preparo especial para sanduíches."] },
  { id: 108, level: "Intermediário", q: "Qual a temperatura da mesa de condimentação?", a: "De 49 a 57°C.", w: ["De 40 a 48°C.", "De 57 a 63°C.", "De 46 a 52°C."] },
  { id: 109, level: "Intermediário", q: "Qual o empilhamento máximo dos pães?", a: "Big Mac 26 bandejas, demais 20 bandejas.", w: ["Big Mac 20 bandejas, demais 26 bandejas.", "Big Mac 24 bandejas, demais 18 bandejas.", "Todos os pães no máximo 22 bandejas."] },
  { id: 110, level: "Intermediário", q: "Qual sabonete usamos para lavar as mãos?", a: "Sabonete Bactericida.", w: ["Detergente Neutro Concentrado.", "Sabonete Líquido Comum.", "Desengordurante Peróxido."] },
  { id: 111, level: "Intermediário", q: "Onde encontramos informações sobre alérgenos alimentares?", a: "Na lâmina de bandeja, Saber ou site do McDonald's.", w: ["Apenas no manual impresso da gerência.", "Somente nas caixas na câmara fria.", "No monitor KVS da linha e no pirômetro."] },
  { id: 112, level: "Intermediário", q: "Qual o zoom correto para o KVS da linha?", a: "4X2.", w: ["3X3.", "2X2.", "4X4."] },
  { id: 113, level: "Intermediário", q: "Quais as primeiras estações que devemos posicionar na cozinha?", a: "Chapa e LOPE.", w: ["Iniciador e Finalizador.", "McFritas e Produtos Fritos.", "Condimentação e Bebidas."] },
  { id: 114, level: "Intermediário", q: "Em qual momento o iniciador aperta servido no pedido da linha, quando trabalhamos com 2 pessoas?", a: "Após dar os dois primeiros condimentos ou assim que a pessoa da condimentação assumir.", w: ["Assim que o pão entra na tostadeira vertical.", "Somente depois que o sanduíche é embrulhado na OAT.", "Antes de colocar os pães para caramelizar."] },
  { id: 115, level: "Intermediário", q: "Qual a condimentação correta da Salada Mix?", a: "120 g de alface, 4 tomates cereja, 14 g de cebola shoyu, 4 picles, 16 g de bacon triturado e uma carne.", w: ["100 g de alface, 2 tomates, 7 g de cebola fresca, 2 picles, 2 fatias de bacon e uma carne.", "150 g de alface, 6 tomates cereja, 20 g de cebola shoyu, 2 picles, 10 g de bacon e uma carne.", "120 g de alface, 4 tomates cereja, 14 g de cebola crispy, 2 picles, 16 g de queijo e uma carne."] },
  { id: 116, level: "Intermediário", q: "Qual o tempo de vida primária do tomate?", a: "Produtos hortifruti in natura não têm tempo de validade.", w: ["10 dias, incluindo a data de fabricação.", "7 dias sob refrigeração na Walk-in.", "5 dias a partir do recebimento na loja."] },
  { id: 117, level: "Intermediário", q: "Quantos panos devemos ter na área de chapa e para que servem?", a: "4 panos: 2 para utensílios, 1 para área gordurosa, 1 para áreas não gordurosas.", w: ["3 panos: 1 para tostadeira, 1 para mesa e 1 para UHC.", "4 panos: 1 para utensílios, 2 para área gordurosa e 1 para o chão.", "2 panos: 1 para utensílios e 1 para limpar a chapa."] },
  { id: 118, level: "Intermediário", q: "Qual o tempo de remoção das carnes?", a: "18 segundos.", w: ["15 segundos.", "22 segundos.", "12 segundos."] },
  { id: 119, level: "Intermediário", q: "Qual o tempo de vida secundário do bacon cru?", a: "5 dias, incluindo o tempo de descongelamento de 12 horas.", w: ["4 dias, incluindo 24 horas de descongelamento.", "7 dias, incluindo 12 horas de descongelamento.", "3 dias, incluindo 6 horas de descongelamento."] },
  { id: 120, level: "Intermediário", q: "Qual o tempo de vida da mostarda depois de aberta?", a: "7 dias sob refrigeração.", w: ["5 dias sob refrigeração.", "24 horas sob refrigeração.", "10 dias sob refrigeração."] },
  { id: 121, level: "Intermediário", q: "Qual o tempo de vida do picles após aberto?", a: "3 dias sob refrigeração (com salmoura). Sem salmoura 24 horas.", w: ["7 dias com salmoura e 48 horas sem salmoura.", "5 dias com salmoura e 12 horas sem salmoura.", "48 horas com salmoura e 4 horas sem salmoura."] },
  { id: 122, level: "Intermediário", q: "Qual o tempo de vida primário da cebola e alface?", a: "10 dias, incluindo a data de fabricação.", w: ["7 dias, incluindo a data de fabricação.", "15 dias a partir da entrega.", "5 dias sob refrigeração na Walk-in."] },
  { id: 123, level: "Intermediário", q: "Qual o percentual máximo de compostos polares aceitável para a gordura?", a: "24%.", w: ["20%.", "18%.", "30%."] },
  { id: 124, level: "Intermediário", q: "Quais os sinais de decomposição do óleo?", a: "Espuma Amarelada, Cheiro Forte e ácido, Cor escura e Fumaça excessiva.", w: ["Óleo muito claro, ausência de bolhas e sem cheiro.", "Espuma branca leve, cor dourada brilhante e aroma suave.", "Cristalização nas bordas da cuba e fervura abaixo de 100°C."] },
  { id: 125, level: "Intermediário", q: "Quais são os 6 inimigos do óleo?", a: "Sal, Ar, Água, Altas temperaturas, Resíduos de carbono e Detergente.", w: ["Sal, Açúcar, Gelo, Baixas temperaturas, Luz solar e Papel.", "Ar, Água, Cloro, Óleo novo, Batata congelada e Inox.", "Sal, Pimenta, Cebola, Vapor, Fritura rápida e Filtragem."] },
  { id: 126, level: "Intermediário", q: "Qual o tempo de vida do queijo na mesa de preparação?", a: "4 horas, incluindo 2 horas de ambientação.", w: ["6 horas, incluindo 2 horas de ambientação.", "2 horas no total, sendo 1 hora de ambientação.", "8 horas, incluindo 4 horas de ambientação."] },
  { id: 127, level: "Intermediário", q: "Qual a quantidade de água que devemos usar para hidratar 1 pacote de cebola?", a: "3 litros, de 1 a 4°C.", w: ["4 litros, de 1 a 7°C.", "2 litros, de 5 a 10°C.", "3,5 litros, em temperatura ambiente."] },
  { id: 128, level: "Intermediário", q: "Quantas fatias de queijo podemos colocar em cada espaço da cuba de ambientação para queijos?", a: "1 bloco, 40 fatias, dividido em 2 partes.", w: ["2 blocos, 80 fatias, divididos em 4 partes.", "Meio bloco, 20 fatias, sem dividir.", "1 bloco, 60 fatias, dividido em 3 partes."] },
  { id: 129, level: "Intermediário", q: "A que altura devemos segurar o saleiro das McFritas?", a: "20 cm.", w: ["10 cm.", "30 cm.", "5 cm."] },
  { id: 130, level: "Intermediário", q: "De que forma devemos segurar as pistolas de molho ao condimentar os sanduíches?", a: "Com as duas mãos a 2 cm de altura.", w: ["Com apenas uma mão a 10 cm de altura.", "Com as duas mãos a 15 cm de altura.", "Encostando o bico diretamente no pão."] },
  { id: 131, level: "Intermediário", q: "Qual o peso das McFritas P, M e G?", a: "73 g, 102 g e 146 g, respectivamente.", w: ["43 g, 102 g e 146 g, respectivamente.", "70 g, 100 g e 150 g, respectivamente.", "75 g, 110 g e 140 g, respectivamente."] },
  { id: 132, level: "Intermediário", q: "Quantas vezes devemos misturar as McFritas após salgá-las?", a: "De 2 a 3 vezes para misturar o sal por igual.", w: ["Apenas 1 vez para não quebrar.", "De 5 a 6 vezes vigorosamente.", "Não devemos misturar após salgar."] },
  { id: 133, level: "Intermediário", q: "Qual a temperatura e tempo de aquecimento das chapas?", a: "Platen Superior 218°C / Inferior 177°C - Aquecimento 45 minutos.", w: ["Platen Superior 177°C / Inferior 218°C - Aquecimento 30 minutos.", "Platen Superior 254°C / Inferior 271°C - Aquecimento 45 minutos.", "Platen Superior 200°C / Inferior 168°C - Aquecimento 20 minutos."] },
  { id: 134, level: "Intermediário", q: "Qual a temperatura e tempo de congelamento dos congeladores portáteis?", a: "De -18 a -23°C e 45 minutos de congelamento.", w: ["De -10 a -15°C e 30 minutos de congelamento.", "De 1 a 4°C e 45 minutos de resfriamento.", "De -18 a -23°C e 15 minutos de congelamento."] },
  { id: 135, level: "Intermediário", q: "Onde devem ser descartados os rejeitos?", a: "Lixeira identificada com etiqueta e saco preto.", w: ["Qualquer lixeira do salão com saco transparente.", "Lixeira comum da linha com saco azul.", "Direto nas caixas de papelão da câmara."] },
  { id: 136, level: "Intermediário", q: "Quais os princípios da Cooltura de Serviço?", a: "Agilidade, Generosidade, Humildade, Vocação de Serviço e Inclusão.", w: ["Limpeza, Organização, Preparação, Estocagem e Rapidez.", "Qualidade, Serviço, Limpeza, Valor e Sustentabilidade.", "Simpatia, Velocidade, Precisão, Economia e Liderança."] },
  { id: 137, level: "Intermediário", q: "Qual o propósito da Marca?", a: "Fazer de cada dia uma oportunidade de alimentar pessoas e construir sonhos.", w: ["Servir comida rápida e barata em todos os bairros.", "Ser a maior rede de hambúrgueres do mundo.", "Vender mais combos grandes e adicionais todos os dias."] },
  { id: 138, level: "Intermediário", q: "Qual a declaração de identidade da Marca?", a: "Fazemos as coisas simples, juntos e com paixão.", w: ["Pequenas mudanças, grande impacto no sabor.", "Primeiro que entra, primeiro que sai sempre.", "Olha, serve e ativa com velocidade máxima."] },
  { id: 139, level: "Intermediário", q: "Com quanto tempo de antecedência deve ser feito o plano de chão?", a: "48 horas.", w: ["24 horas.", "12 horas.", "72 horas."] },
  { id: 140, level: "Intermediário", q: "Qual é a promessa do fazer?", a: "Fazer bem, fazer rápido e fazer especial.", w: ["Fazer limpo, fazer quente e fazer barato.", "Olhar, servir e ativar no tempo certo.", "Limpar, lavar, enxaguar e sanitizar."] },
  { id: 141, level: "Intermediário", q: "Qual a condimentação e quantidades de ingredientes do Quarteirão?", a: "1/40 oz de mostarda, 1/2 oz de ketchup, 7 g de cebola fresca, 2 picles, 2 fatias de queijo em estrela, 1 carne 4:1.", w: ["1/40 oz de mostarda, 1/3 oz de ketchup, 3,5 g de cebola hidratada, 1 picles, 1 queijo, 1 carne 4:1.", "1/2 oz de mostarda, 1/2 oz de ketchup, 10 g de cebola fresca, 3 picles, 2 queijos, 1 carne 10:1.", "1/40 oz de mostarda, 1/2 oz de ketchup, 28 g de alface, 2 tomates, 2 queijos, 1 carne 4:1."] },
  { id: 142, level: "Intermediário", q: "Qual a condimentação e quantidades de ingredientes do Cheeseburger?", a: "1/40 oz de mostarda, 1/3 oz de ketchup, 1 picles, 1 fatia de queijo, 1 carne de 10:1 com 3,5 g de cebola.", w: ["1/40 oz de mostarda, 1/3 oz de ketchup, 2 picles, 2 queijos, 1 carne 10:1 com 7 g de cebola.", "1/3 oz de mostarda, 1/3 oz de ketchup, 2 picles, 1 queijo, 1 carne 4:1 com 3,5 g de cebola.", "1/40 oz de mostarda, 1/3 oz de ketchup, 12 g de alface, 1 picles, 1 queijo e 1 carne 10:1."] },
  { id: 143, level: "Intermediário", q: "Qual a condimentação e quantidades de ingredientes do McNífico Bacon?", a: "1/40 oz mostarda, 1/2 oz ketchup, 7 g cebola fresca, 2/3 oz maionese, 28 g alface, 2 tomates, 2 bacons, 1 queijo, 1 carne 4:1.", w: ["1/40 oz mostarda, 1/3 oz ketchup, 3,5 g cebola, 1/2 oz maionese, 12 g alface, 1 tomate, 3 bacons, 2 queijos, 1 carne 4:1.", "1 oz molho tasty, 1/2 oz ketchup, 10 g cebola, 28 g alface, 2 tomates, 2 bacons, 3 queijos ementhal, 1 carne 4:1.", "1/40 oz mostarda, 1/2 oz ketchup, 7 g cebola, 2/3 oz maionese, 24 g alface, 1 tomate, 1 bacon, 2 queijos, 1 carne 10:1."] },
  { id: 144, level: "Intermediário", q: "Qual o distanciamento e espaçamento que devemos manter entre as caixas nas câmaras?", a: "5 cm do chão e das paredes e 2,5 cm entre as caixas.", w: ["10 cm do chão e das paredes e 5 cm entre as caixas.", "3 cm do chão e das paredes e 1 cm entre as caixas.", "8 cm do chão e das paredes e 4 cm entre as caixas."] },
  { id: 145, level: "Intermediário", q: "Qual o empilhamento máximo para as caixas de batata?", a: "6 caixas.", w: ["4 caixas.", "5 caixas.", "8 caixas."] },
  { id: 146, level: "Intermediário", q: "Qual o empilhamento máximo para as caixas de alface?", a: "6 caixas.", w: ["4 caixas.", "5 caixas.", "8 caixas."] },
  { id: 147, level: "Intermediário", q: "Qual o empilhamento máximo para as caixas de mix?", a: "4 caixas.", w: ["6 caixas.", "5 caixas.", "3 caixas."] },
  { id: 148, level: "Intermediário", q: "Qual o empilhamento máximo para caixas de suco?", a: "4 caixas.", w: ["6 caixas.", "5 caixas.", "8 caixas."] },
  { id: 149, level: "Intermediário", q: "Qual o empilhamento máximo para caixas de queijo?", a: "5 caixas.", w: ["4 caixas.", "6 caixas.", "8 caixas."] },
  { id: 150, level: "Intermediário", q: "O que significa a sigla LOPE?", a: "Limpeza, Organização, Preparação e Estocagem.", w: ["Lavagem, Operação, Produção e Entrega.", "Linha Operacional de Produtos e Embalagens.", "Limpeza, Operação, Padronização e Estoque."] },
  { id: 151, level: "Intermediário", q: "Qual é o método de 4 etapas que usamos para lavar utensílios e equipamentos?", a: "Limpar, Lavar, Enxaguar e Sanitizar.", w: ["Molhar, Ensaboar, Escovar e Secar.", "Raspar, Lavar, Secar com pano e Guardar.", "Limpar, Desengordurar, Enxaguar e Polir."] },
  { id: 152, level: "Intermediário", q: "Qual a velocidade de extração dos sorvetes?", a: "De 5 a 7,5 oz em 10 segundos.", w: ["De 3 a 5 oz em 10 segundos.", "De 8 a 10 oz em 10 segundos.", "De 5 a 7,5 oz em 15 segundos."] },
  { id: 153, level: "Intermediário", q: "Qual deve ser a proporção correta de suco concentrado e água?", a: "3 partes de suco para 15 de água.", w: ["1 parte de suco para 5,2 de água.", "2 partes de suco para 10 de água.", "3 partes de suco para 12 de água."] },
  { id: 154, level: "Intermediário", q: "Qual a ordem correta de experimentação dos refrigerantes?", a: "Coca, Fanta, Coca Zero, Sprite Zero, Fanta Guaraná.", w: ["Coca Zero, Sprite Zero, Coca, Fanta, Fanta Guaraná.", "Sprite Zero, Fanta Guaraná, Fanta, Coca, Coca Zero.", "Coca, Coca Zero, Fanta, Fanta Guaraná, Sprite Zero."] },
  { id: 155, level: "Intermediário", q: "Qual a ordem de experimentação dos sucos?", a: "Laranja e uva.", w: ["Uva e laranja.", "Maracujá, laranja e uva.", "Uva, maçã e laranja."] },
  { id: 156, level: "Intermediário", q: "Qual a temperatura do banho-maria e das coberturas?", a: "De 57° a 63°C e de 46° a 52°C, respectivamente.", w: ["De 46° a 52°C e de 57° a 63°C, respectivamente.", "De 49° a 57°C e de 40° a 45°C, respectivamente.", "De 65° a 72°C e de 50° a 58°C, respectivamente."] },
  { id: 157, level: "Intermediário", q: "Quantas pedras de gelo colocamos nos refrigerantes P, M e G?", a: "0,5 pá (5 pedras), 2/3 pá (7 pedras) e 1 pá (10 pedras), respectivamente.", w: ["1/3 pá (3 pedras), 0,5 pá (5 pedras) e 2/3 pá (7 pedras).", "0,5 pá (6 pedras), 1 pá (10 pedras) e 1,5 pá (15 pedras).", "4 pedras no P, 8 pedras no M e 12 pedras no G."] },
  { id: 158, level: "Intermediário", q: "Quais as quantidades corretas de 1 Sundae?", a: "4 voltas e meia de massa (4,5 oz), 2 tiros de cobertura (1 oz) e 7 gramas de amendoim.", w: ["6 voltas de massa (6 oz), 2 tiros de cobertura (1 oz) e 14 g de amendoim.", "3 voltas e meia de massa (3,5 oz), 1 tiro de cobertura e 7 g de amendoim.", "4 voltas e meia de massa (4,5 oz), 1 tiro de cobertura e 10 g de amendoim."] },
  { id: 159, level: "Intermediário", q: "Quais as quantidades corretas de 1 Top Sundae?", a: "6 voltas de massa (6 oz), 2 tiros de cobertura (1 no fundo e 1 em cima = 1 oz), 1 tiro de paçoca (1 oz) e 2 bijus.", w: ["4,5 voltas de massa (4,5 oz), 2 tiros de cobertura, 7 g de amendoim e 1 biju.", "6 voltas de massa (6 oz), 3 tiros de cobertura, 2 tiros de paçoca e 1 biju.", "5 voltas de massa (5 oz), 2 tiros de cobertura, 20 g de paçoca e 2 bijus."] },
  { id: 160, level: "Intermediário", q: "Qual a temperatura ambiente do salão?", a: "De 23 a 27°C.", w: ["De 18 a 22°C.", "De 20 a 24°C.", "De 25 a 30°C."] },
  { id: 161, level: "Intermediário", q: "Quais os materiais necessários que devemos ter no salão para limpeza das mesas e bancos?", a: "1 pano seco e 1 úmido para mesas, 1 pano seco e 1 úmido para bancos e 1 borrifador com sanitizante.", w: ["1 pano úmido único para mesas e bancos e 1 borrifador com detergente.", "2 panos secos para mesas, 1 pano para o chão e álcool 70%.", "3 panos úmidos e 1 balde com água e sabão."] },
  { id: 162, level: "Intermediário", q: "Quais são os 4 grupos de produtos que compõem o pedido do cliente?", a: "Sanduíches, acompanhamentos, bebidas e sobremesas.", w: ["Hambúrgueres, frango, saladas e café.", "Pães, carnes, molhos e embalagens.", "Combos, avulsos, adicionais e brinquedos."] },
  { id: 163, level: "Avançado", q: "Qual a temperatura da tostadeira?", a: "Placa A e B 271°C e Placa C 254°C.", w: ["Placa A e B 254°C e Placa C 271°C.", "Placa A, B e C todas a 260°C.", "Placa A e B 218°C e Placa C 177°C."] },
  { id: 164, level: "Avançado", q: "O que é contaminação cruzada?", a: "É a transferência de microrganismos de um lugar para outro.", w: ["É a multiplicação de bactérias na zona de perigo térmico.", "É a queima excessiva do óleo de fritura acima de 24%.", "É a reação alérgica causada por glúten ou derivados do leite."] },
  { id: 165, level: "Avançado", q: "O que são Alérgenos?", a: "São substâncias que podem causar reações alérgicas no organismo como resposta do sistema imunológico.", w: ["São bactérias que se multiplicam entre 4,4°C e 60°C.", "São resíduos químicos de detergente ou sanitizante.", "São compostos polares formados pela degradação da gordura."] },
  { id: 166, level: "Avançado", q: "Qual a calibragem do dispensador de ketchup?", a: "Ketchup Regular 6 tiros = 2 oz/60 ml, Quarteirão 6 tiros = 3 oz/90 ml.", w: ["Ketchup Regular 4 tiros = 2 oz/60 ml, Quarteirão 4 tiros = 3 oz/90 ml.", "Ketchup Regular 6 tiros = 3 oz/90 ml, Quarteirão 6 tiros = 2 oz/60 ml.", "Ketchup Regular 10 tiros = 1 oz/30 ml, Quarteirão 6 tiros = 2 oz/60 ml."] },
  { id: 167, level: "Avançado", q: "Qual a calibragem do dispensador de mostarda?", a: "47 tiros = 1 oz/30 ml.", w: ["40 tiros = 1 oz/30 ml.", "30 tiros = 1 oz/30 ml.", "47 tiros = 2 oz/60 ml."] },
  { id: 168, level: "Avançado", q: "Qual a calibragem da pistola de molho Big Mac?", a: "4 tiros de 1/2 oz = 2 oz/60 ml.", w: ["6 tiros de 1/2 oz = 3 oz/90 ml.", "4 tiros de 1 oz = 4 oz/120 ml.", "2 tiros de 1/2 oz = 1 oz/30 ml."] },
  { id: 169, level: "Avançado", q: "Qual a velocidade do motor da tostadeira?", a: "A partir de 3300.", w: ["A partir de 2500.", "A partir de 1800.", "A partir de 4200."] },
  { id: 170, level: "Avançado", q: "Qual o procedimento correto de sanitização dos tomates?", a: "1. Retirar pela tabela chart; 2. Lavar em água corrente; 3. Cobrir com sanitizante por 15 min; 4. Enxaguar em água corrente.", w: ["1. Retirar 1 caixa; 2. Cobrir com sanitizante por 10 min; 3. Fatiar sem enxaguar; 4. Guardar.", "1. Lavar com sabonete bactericida; 2. Deixar no cloro por 30 min; 3. Secar com pano; 4. Cortar.", "1. Retirar pelo chart; 2. Deixar no sanitizante por 5 min; 3. Ambientar por 4h; 4. Lavar após fatiar."] },
  { id: 171, level: "Avançado", q: "Qual procedimento devemos seguir ao trabalhar com a tela LOOK & COOK?", a: "OSA: Olha, Serve e Ativa.", w: ["PEPS: Primeiro que Entra, Primeiro que Sai.", "DFS: Medir, Calibrar e Registrar.", "KVS: Iniciar, Condimentar e Embrulhar."] },
  { id: 172, level: "Avançado", q: "Qual o ponto de partida para as carnes vermelhas?", a: "10:1 a partir de 39\" (Next Gen 41\") | 4:1 a partir de 104\" (Next Gen 126\").", w: ["10:1 a partir de 45\" (Next Gen 50\") | 4:1 a partir de 90\" (Next Gen 110\").", "10:1 a partir de 30\" (Next Gen 35\") | 4:1 a partir de 120\" (Next Gen 140\").", "10:1 a partir de 42\" (Next Gen 39\") | 4:1 a partir de 126\" (Next Gen 104\")."] },
  { id: 173, level: "Avançado", q: "Qual o Gap correto para as carnes de 10:1?", a: "225\" por 20 segundos, final 290\".", w: ["290\" por 20 segundos, final 225\".", "250\" por 15 segundos, final 310\".", "450\" por 20 segundos, final 290\"."] },
  { id: 174, level: "Avançado", q: "Qual a temperatura da estufa de tortas?", a: "De 66 a 82°C.", w: ["De 49 a 57°C.", "De 79 a 85°C.", "De 57 a 63°C."] },
  { id: 175, level: "Avançado", q: "Qual a capacidade máxima de tortas na estufa?", a: "32 tortas.", w: ["16 tortas.", "24 tortas.", "40 tortas."] },
  { id: 176, level: "Avançado", q: "O que significa Manutenção e Recuperação na área de produtos fritos?", a: "Manutenção: ativar para manter o nível PLS. Recuperação: ativar para repor o nível PLS com gavetas zeradas.", w: ["Manutenção: limpar e filtrar a fritadeira. Recuperação: trocar o óleo aos 24%.", "Manutenção: fritar metade do cesto. Recuperação: fritar o dobro da rodada máxima.", "Manutenção: manter carnes na UHC por 60 min. Recuperação: voltar carnes frias ao óleo."] },
  { id: 177, level: "Avançado", q: "Qual a concentração correta de cloro no sanitizante presente nos panos e borrifadores?", a: "De 50 a 100 ppm.", w: ["De 100 a 200 ppm.", "De 25 a 50 ppm.", "De 150 a 250 ppm."] },
  { id: 178, level: "Avançado", q: "Qual o rendimento da mostarda pouch?", a: "1235 sanduíches por kg.", w: ["950 sanduíches por kg.", "1500 sanduíches por kg.", "840 sanduíches por kg."] },
  { id: 179, level: "Avançado", q: "Qual o rendimento da Alface?", a: "45,4 sanduíches por kg.", w: ["35,2 sanduíches por kg.", "60,5 sanduíches por kg.", "28,4 sanduíches por kg."] },
  { id: 180, level: "Avançado", q: "Qual o tempo de vida primário dos sucos?", a: "Uva 180 dias e Laranja 150 dias.", w: ["Uva 150 dias e Laranja 180 dias.", "Uva 90 dias e Laranja 90 dias.", "Uva 120 dias e Laranja 100 dias."] },
  { id: 181, level: "Avançado", q: "Quais são as três dimensões que concretizam a Missão do Embaixador na Experiência do Cliente?", a: "Viagem do klient, Experiência Familiar e Construção de Vendas.", w: ["Fazer bem, Fazer rápido e Fazer especial.", "Qualidade, Serviço e Limpeza.", "Sugestão de Vendas, Venda Sugestiva e Adicionais."] },
  { id: 182, level: "Avançado", q: "Em que ano e onde foi fundado o McDonald's?", a: "Em 1955, na cidade de Des Plaines, Illinois, Estados Unidos.", w: ["Em 1948, na cidade de Chicago, Califórnia, EUA.", "Em 1961, na cidade de Nova York, EUA.", "Em 1952, na cidade de Los Angeles, EUA."] },
  { id: 183, level: "Avançado", q: "Onde e em que ano inaugurou o primeiro McDonald's no Brasil?", a: "Em 1979, na rua Hilário de Gouveia, em Copacabana, no Rio de Janeiro.", w: ["Em 1981, na Avenida Paulista, em São Paulo.", "Em 1975, em Ipanema, no Rio de Janeiro.", "Em 1983, no Centro de São Paulo."] },
  { id: 184, level: "Avançado", q: "Quando inaugurou o primeiro McDonald's em São Paulo?", a: "Em 1981, na Av. Paulista.", w: ["Em 1979, na Av. Brigadeiro Faria Lima.", "Em 1985, na Rua Augusta.", "Em 1978, no Shopping Ibirapuera."] },
  { id: 185, level: "Avançado", q: "Qual a condimentação e quantidades de ingredientes do Big Mac?", a: "1 tiro de 1/2 oz de molho Big na base e no club, 12 g de alface na base e 12 g no club (24 g), 2 picles no club, 1 queijo na base e 2 carnes 10:1 com 3,5 g de cebola.", w: ["1 tiro de 1 oz de molho Big na base e no club, 14 g de alface na base e no club (28 g), 2 picles, 2 queijos e 2 carnes 10:1.", "1 tiro de 1/2 oz de molho Big na base e coroa, 24 g de alface na base, 1 picles, 1 queijo e 2 carnes 10:1.", "2 tiros de 1/2 oz de molho Big na base, 12 g de alface no club, 4 picles, 2 queijos e 2 carnes 10:1."] },
  { id: 186, level: "Avançado", q: "Qual a condimentação e quantidades de ingredientes do Big Tasty?", a: "2 tiros de 1 oz molho Tasty (base e coroa), 10 g cebola, 28 g alface, 2 tomates, 3 queijos ementhal, carne 4:1 (1, 2 ou 3) destacando a TAG.", w: ["1 tiro de 1/2 oz molho Tasty (base e coroa), 7 g cebola, 24 g alface, 2 tomates, 2 queijos cheddar, carne 4:1.", "2 tiros de 2/3 oz molho Tasty, 14 g cebola, 28 g alface, 3 tomates, 3 queijos cheddar e carne 10:1.", "1 tiro de 1 oz molho Tasty apenas na coroa, 7 g cebola, 28 g alface, 1 tomate, 2 queijos ementhal e 1 carne 4:1."] },
  { id: 187, level: "Avançado", q: "Quais são os 7 conceitos da UHC?", a: "UHC é o coração da cozinha; Ativar pouco, porém sempre; Usar sistema de garagem; Conhecer tempos das carnes; Acelerar/desacelerar na mesma chamada; Seguir níveis PLS; Não compensar um erro com outro.", w: ["UHC a 90°C; Ativar lotes máximos sempre; Empilhar 4 carnes 4:1; Desligar timers no rush; Ignorar PLS; Misturar gavetas; Usar 1 gaveta.", "Plano de chão; Rota Gerencial; Pré-Plantão; Pós-Plantão; Posicionamento; Checklist; Experimentação.", "Limpar; Lavar; Enxaguar; Sanitizar; Secar ao ar; Etiquetar com 24h; Guardar na câmara."] },
  { id: 188, level: "Avançado", q: "O que é e para que serve a caramelização dos pães?", a: "É a queima de 5% do açúcar do pão e serve para criar uma película que impede que os condimentos penetrem no pão.", w: ["É a queima de 15% do amido do pão para deixá-lo crocante por fora e seco por dentro.", "É o aquecimento a 180°C por 10 segundos apenas para derreter o gergelim da coroa.", "É a perda de 20% da umidade do pão na mesa para absorver melhor os molhos."] },
  { id: 189, level: "Avançado", q: "Quais são as temperaturas da Zona de Risco para crescimento de microrganismos?", a: "De 4,4°C a 60°C.", w: ["De 1°C a 49°C.", "De 10°C a 70°C.", "De 0°C a 45°C."] },
  { id: 190, level: "Avançado", q: "Qual a temperatura de extração do sorvete?", a: "-8 a -9°C.", w: ["-4 a -6°C.", "-12 a -15°C.", "-1 a -4°C."] },
  { id: 191, level: "Avançado", q: "Qual a proporção correta de água e xarope para refrigerantes normais?", a: "1 parte de xarope para 5,2 partes de água.", w: ["3 partes de xarope para 15 partes de água.", "1 parte de xarope para 4,0 partes de água.", "2 partes de xarope para 6,5 partes de água."] },
  { id: 192, level: "Avançado", q: "Quais são os 7 básicos operacionais?", a: "Plano de chão, Rota Gerencial, Pré-Plantão, Pós-Plantão, Posicionamento, Checklist e Experimentação.", w: ["Agilidade, Generosidade, Humildade, Vocação de Serviço, Inclusão, Simpatia e Vendas.", "Chapa, Linha, Fritura, Bebidas, Sobremesas, Balcão e Drive-Thru.", "Limpeza, Organização, Preparação, Estocagem, Recebimento, Contagem e Fechamento."] },
  { id: 193, level: "Avançado", q: "O que é overrun do mix e qual o seu percentual?", a: "Mede a proporção entre mix e ar; seu percentual é de 55 a 65% com ideal 58%.", w: ["Mede o tempo de congelamento do cilindro; percentual de 40 a 50% com ideal 45%.", "Mede a gordura do leite no mix; percentual de 20 a 30% com ideal 24%.", "Mede a velocidade de extração em 10s; percentual de 70 a 80% com ideal 75%."] },
  { id: 194, level: "Avançado", q: "Quais as quantidades corretas de complementos dos sorvetes?", a: "Gotas 50 g, Rocks 20 g, Ovomaltine 20 g, Paçoca 20 g, Ovo Shake 54 g.", w: ["Gotas 30 g, Rocks 30 g, Ovomaltine 30 g, Paçoca 15 g, Ovo Shake 40 g.", "Gotas 20 g, Rocks 50 g, Ovomaltine 54 g, Paçoca 20 g, Ovo Shake 20 g.", "Gotas 40 g, Rocks 15 g, Ovomaltine 25 g, Paçoca 25 g, Ovo Shake 60 g."] },
  { id: 195, level: "Avançado", q: "Qual a temperatura do café coado?", a: "A partir de 77°C.", w: ["A partir de 65°C.", "De 57°C a 63°C.", "A partir de 85°C."] },
  { id: 196, level: "Avançado", q: "Qual a proporção correta de água e café para o café coado?", a: "1.100 ml de água para 1 pacote de 50 g de café.", w: ["1.000 ml de água para 1 pacote de 100 g de café.", "1.500 ml de água para 1 pacote de 50 g de café.", "800 ml de água para 1 pacote de 40 g de café."] },
  { id: 197, level: "Avançado", q: "O que é Best Burger?", a: "É o novo padrão para os hambúrgueres McDonald's. Pequenas mudanças, grande impacto.", w: ["É o sistema de fritura rápida para carnes brancas em 3 minutos.", "É o programa de auditoria semestral de limpeza das chapas.", "É a campanha promocional exclusiva para venda no Drive-Thru."] },
  { id: 198, level: "Avançado", q: "Quais são as técnicas dos influencers vendedores?", a: "Somos Especialistas, Gostamos de Surpreender, Criamos Oportunidades, Vivenciamos as mesmas coisas, Criamos tendência, Somos Afetuosos.", w: ["Sugestão de Vendas, Venda Sugestiva, Adicionais, Combo Grande, Sobremesa e Café.", "Fazer bem, Fazer rápido, Fazer especial, Sorrir, Agradecer e Despedir.", "Olhar nos olhos, Oferecer bacon, Oferecer batata grande, Cobrar rápido e Entregar."] },
  { id: 199, level: "Avançado", q: "Qual o rendimento da batata?", a: "9,11 batatas pequenas por kg.", w: ["7,50 batatas pequenas por kg.", "12,40 batatas pequenas por kg.", "6,80 batatas pequenas por kg."] },
  { id: 200, level: "Avançado", q: "Qual a descrição do padrão ouro de qualidade do suco?", a: "Frio, cor brilhante e sabor doce.", w: ["Com espuma, cor escura e sabor cítrico ácido.", "Em temperatura ambiente, translúcido e sem açúcar.", "Congelado com cristais de gelo e altamente concentrado."] }
];
const STORAGE_USERS_KEY = "mequi_olimpiadas_users_v6";
const STORAGE_CURRENT_KEY = "mequi_olimpiadas_active_user_v6";
const STORAGE_THEME_KEY = "mequi_olimpiadas_theme_v7";
const STORAGE_DUEL_HISTORY = "mequi_olimpiadas_duel_history_v75";
const ADMIN_SECRET_PASS = "342005";
const HEARTS_COOLDOWN_MS = 10 * 60 * 1000;
const SYNC_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v65_cluster_state";
const DUEL_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v71_live_duels";
const TRAINER_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v83_trainer_content";
const TRAINER_HTTP_URL = "https://ntfy.sh/mequi_venture_olimpiadas_2026_trainer_v83";
const TRAINER_STORAGE_KEY = "mequi_venture_trainer_v83";
const DUEL_WIN_XP = 100;
const CLOUD_HTTP_URL = "https://ntfy.sh/mequi_venture_olimpiadas_2026_v63_store";
let mqttClients = [], users = {}, currentUserKey = localStorage.getItem(STORAGE_CURRENT_KEY) || null;
let currentBookFilter = "ALL", currentStreak = 0, currentHearts = 5, currentQuizQuestionId = null, isAdminUnlocked = false;
// A sequência é uma propriedade do colaborador (não é apenas memória da aba).
// O horário da última resposta permite sincronizar inclusive quando a sequência volta a zero.
function streakStateOf(user) {
  if (!user || !Object.prototype.hasOwnProperty.call(user, "quizStreak")) return null;
  const count = Number(user.quizStreak);
  const at = Number(user.quizStreakUpdatedAt);
  return { quizStreak: Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0,
    quizStreakUpdatedAt: Number.isFinite(at) ? Math.max(0, at) : 0 };
}
function mergeQuizStreak(a, b) {
  const left = streakStateOf(a), right = streakStateOf(b);
  if (!left && !right) return {};
  if (!left) return right;
  if (!right) return left;
  if (right.quizStreakUpdatedAt > left.quizStreakUpdatedAt) return right;
  if (left.quizStreakUpdatedAt > right.quizStreakUpdatedAt) return left;
  return (Number(b.updatedAt) || 0) > (Number(a.updatedAt) || 0) ? right : left;
}
function restoreQuizStreak() {
  const user = currentUserKey && users[currentUserKey];
  currentStreak = streakStateOf(user)?.quizStreak || 0;
  const display = $("statStreakDisplay");
  if (display) display.textContent = `${currentStreak} 🔥`;
}
function saveQuizStreak() {
  const user = currentUserKey && users[currentUserKey];
  if (!user) return;
  user.quizStreak = Math.max(0, Math.floor(currentStreak));
  user.quizStreakUpdatedAt = Date.now();
  user.updatedAt = Math.max(Number(user.updatedAt) || 0, user.quizStreakUpdatedAt);
  // Persistir imediatamente evita perder a última resposta se fechar o navegador.
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}
let searchDebounceTimer = null, cloudSyncQueueTimer = null, cooldownIntervalId = null, heartbeatIntervalId = null;
let lastLeaderboardHash = "", lastAdminListHash = "", lastHttpFetchTime = 0;
let pendingDuelInvite = null, activeDuel = null, currentReviewItem = null, photoUploadTarget = "register";
let duelHistoryList = JSON.parse(localStorage.getItem(STORAGE_DUEL_HISTORY) || "[]");
let activeRecipe = KITCHEN_RECIPES[0], currentRecipeStep = 0;
// ========================================================================
// 🎓 CENTRAL DO TREINADOR v8.3 — perguntas extras, aviso e desafio.
// Salva separadamente: não altera os dados legados nem QUESTIONS_DB original.
// ========================================================================
function readTrainerState() {
  try {
    const item = JSON.parse(localStorage.getItem(TRAINER_STORAGE_KEY) || '{}');
    return { questions:item.questions && typeof item.questions === 'object' ? item.questions : {},
      announcement:item.announcement || null, challenge:item.challenge || null };
  } catch (_) { return {questions:{},announcement:null,challenge:null}; }
}
let trainerState = readTrainerState();
let isTrainerUnlocked = false;
let trainerCloudFetchAt = 0;
function trainerSafeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function validateTrainerQuestion(q) {
  return q && typeof q.id === 'string' && /^T-[a-z0-9-]{1,60}$/.test(q.id) &&
    ['Básico','Intermediário','Avançado'].includes(q.level) &&
    typeof q.q === 'string' && q.q.length > 5 && q.q.length <= 550 &&
    typeof q.a === 'string' && q.a.length > 0 && q.a.length <= 220 &&
    Array.isArray(q.w) && q.w.length === 3 && q.w.every(s=>typeof s === 'string' && s.length>0 && s.length<=220);
}
function getQuestionBank() {
  const extras = Object.values(trainerState.questions).filter(q=>q && !q.deleted && validateTrainerQuestion(q));
  return [...QUESTIONS_DB, ...extras];
}
function mergeTrainerState(incoming) {
  if (!incoming || typeof incoming !== 'object') return false;
  let changed = false;
  const questions = incoming.questions && typeof incoming.questions === 'object' ? incoming.questions : {};
  Object.entries(questions).forEach(([id, q]) => {
    if (!/^T-[a-z0-9-]{1,60}$/.test(id) || !q || q.id !== id || (!q.deleted && !validateTrainerQuestion(q))) return;
    const existing=trainerState.questions[id];
    if (!existing || (Number(q.updatedAt)||0) > (Number(existing.updatedAt)||0)) {
      trainerState.questions[id]=q; changed=true;
    }
  });
  for (const key of ['announcement','challenge']) {
    const old=trainerState[key], next=incoming[key];
    if (!next || typeof next !== 'object' || !Number.isFinite(Number(next.updatedAt))) continue;
    if (!old || Number(next.updatedAt)>Number(old.updatedAt)) {trainerState[key]=next; changed=true;}
  }
  if (changed) {
    localStorage.setItem(TRAINER_STORAGE_KEY,JSON.stringify(trainerState));
    renderTrainerPublicContent(); renderTrainerCenter();
    if ($('bookQuestionsContainer')) renderBookList();
  }
  return changed;
}
function publishTrainerState(delta = null) {
  localStorage.setItem(TRAINER_STORAGE_KEY,JSON.stringify(trainerState));
  const data=JSON.stringify(trainerState);
  mqttClients.forEach(c=>{ if(c && c.connected) try {c.publish(TRAINER_MQTT_TOPIC,data,{retain:true});}catch(_){}});
  fetch(TRAINER_HTTP_URL,{method:'POST',body:JSON.stringify({type:'trainer',state:delta || trainerState})}).catch(()=>{});
  renderTrainerPublicContent(); renderTrainerCenter(); renderBookList();
}
async function fetchTrainerHistory(force=false) {
  if (!force && Date.now()-trainerCloudFetchAt<30000) return;
  trainerCloudFetchAt=Date.now();
  try {
    const res=await fetch(`${TRAINER_HTTP_URL}/json?poll=1&since=all`);
    if (!res.ok) return;
    (await res.text()).trim().split('\n').forEach(line=>{
      try {const msg=JSON.parse(line); if (msg.event==='message' && msg.message) {
        const data=JSON.parse(msg.message); if(data.type==='trainer') mergeTrainerState(data.state);
      }} catch (_) {}
    });
  }catch(_){}
}
function trainerChallengeActive() {
  const c=trainerState.challenge;
  return c && !c.deleted && typeof c.id==='string' && /^C-[a-z0-9-]+$/.test(c.id) &&
    typeof c.title==='string' && Number.isInteger(c.target) && c.target>=1 && c.target<=100 &&
    Number.isInteger(c.xp) && c.xp>=0 && c.xp<=100 ? c : null;
}
function mergeTrainerChallenges(a,b) {
  const out={...(a && typeof a==='object'?a:{})};
  Object.entries(b && typeof b==='object'?b:{}).forEach(([k,v])=>{
    if (!v || typeof v!=='object') return;
    const old=out[k]||{};
    out[k]={count:Math.max(Number(old.count)||0, Number(v.count)||0),
      claimedAt:Math.max(Number(old.claimedAt)||0, Number(v.claimedAt)||0)};
  });
  return out;
}
function recordTrainerChallengeCorrect() {
  if (!currentUserKey || !users[currentUserKey]) return;
  const challenge=trainerChallengeActive();
  if (!challenge) return;
  const u=users[currentUserKey];
  if (!u.trainerChallenges) u.trainerChallenges={};
  const progress=u.trainerChallenges[challenge.id] || {count:0,claimedAt:0};
  if (progress.claimedAt) return;
  progress.count=Math.min(challenge.target, Math.max(0,Number(progress.count)||0)+1);
  u.trainerChallenges[challenge.id]=progress;
  if (progress.count>=challenge.target) {
    progress.claimedAt=Date.now(); // grava antes de dar o bônus
    u.updatedAt=Date.now();
    if(challenge.xp) addXp(challenge.xp);
    else scheduleCloudSync(currentUserKey,false);
    showMissionToast(`🎯 Desafio ${challenge.title} concluído! +${challenge.xp} XP`);
  } else {u.updatedAt=Date.now();scheduleCloudSync(currentUserKey,false);}
  renderTrainerPublicContent();
}
function renderTrainerPublicContent() {
  const a=trainerState.announcement, notice=$('trainerPublicNotice');
  if (notice) {
    const shown=a && !a.deleted && typeof a.title==='string' && typeof a.body==='string';
    notice.classList.toggle('hidden',!shown);
    if (shown) {$('trainerNoticeTitle').textContent=a.title;$('trainerNoticeBody').textContent=a.body;}
  }
  const card=$('trainerSpecialChallenge'); if(!card) return;
  const c=trainerChallengeActive(), user=currentUserKey && users[currentUserKey];
  card.classList.toggle('hidden',!c);
  if (!c) return;
  const progress=user?.trainerChallenges?.[c.id]||{};
  const count=Math.min(c.target,Math.max(0,Number(progress.count)||0));
  const claimed=Boolean(progress.claimedAt);
  const pct=Math.round(100*count/c.target);
  card.innerHTML=`<div class="trainer-challenge-head"><span>✨ DESAFIO ESPECIAL DO TREINADOR</span><strong>${claimed?'✅ Concluído':`+${c.xp} XP`}</strong></div>
    <h3>${trainerSafeHtml(c.title)}</h3><p>${trainerSafeHtml(c.description||'Acerte perguntas no simulado para completar.')}</p>
    <div class="trainer-challenge-track"><span style="width:${pct}%"></span></div>
    <div class="trainer-challenge-bottom"><small>${user?`${count} de ${c.target} acertos`:'Faça login para participar'}</small><button type="button" onclick="switchMainTab('quiz')">Ir ao Simulado →</button></div>`;
}
function unlockTrainerCenter() {
  if ($('trainerPassInput').value !== ADMIN_SECRET_PASS) {
    const e=$('trainerAuthError');e.textContent='Senha incorreta. Use a credencial do administrador.';e.classList.remove('hidden'); return;
  }
  isTrainerUnlocked=true;
  $('trainerPassInput').value=''; $('trainerAuthError').classList.add('hidden');
  $('trainerLockScreen').classList.add('hidden'); $('trainerDashboard').classList.remove('hidden');
  renderTrainerCenter();fetchTrainerHistory(true);
}
function lockTrainerCenter() {
  isTrainerUnlocked=false;
  $('trainerDashboard').classList.add('hidden'); $('trainerLockScreen').classList.remove('hidden');
}
function clearTrainerQuestionForm() {
  $('trainerQuestionForm').reset();$('trainerEditQuestionId').value='';
  $('trainerSaveQuestionBtn').textContent='Publicar pergunta';
}
function saveTrainerQuestion(event) {
  event.preventDefault();if(!isTrainerUnlocked)return;
  const options='ABCD'.split('').map(x=>$('trainerAnswer'+x).value.trim());
  const correct='ABCD'.indexOf($('trainerCorrectAnswer').value);
  const q=$('trainerQuestionText').value.trim();
  if(q.length<6 || options.some(x=>!x) || new Set(options.map(x=>x.toLocaleLowerCase('pt-BR'))).size!==4) {
    alert('Preencha uma pergunta válida e quatro alternativas diferentes.');return;
  }
  const oldId=$('trainerEditQuestionId').value;
  const id=oldId || `T-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  trainerState.questions[id]={id,level:$('trainerQuestionLevel').value,q,a:options[correct],w:options.filter((_,i)=>i!==correct),options,correctKey:'ABCD'[correct],updatedAt:Date.now(),deleted:false};
  clearTrainerQuestionForm();publishTrainerState({questions:{[id]:trainerState.questions[id]}});
}
function editTrainerQuestion(id) {
  if(!isTrainerUnlocked)return;
  const item=trainerState.questions[id];if(!item || item.deleted)return;
  $('trainerEditQuestionId').value=id;$('trainerQuestionText').value=item.q;$('trainerQuestionLevel').value=item.level;
  (item.options?.length===4?item.options:[item.a,...item.w]).forEach((x,i)=>{$('trainerAnswer'+'ABCD'[i]).value=x;});
  $('trainerCorrectAnswer').value=item.correctKey||'A';$('trainerSaveQuestionBtn').textContent='Salvar alterações';
  $('trainerQuestionForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function removeTrainerQuestion(id) {
  if(!isTrainerUnlocked || !trainerState.questions[id] || !confirm('Excluir esta pergunta extra?')) return;
  trainerState.questions[id]={...trainerState.questions[id],deleted:true,updatedAt:Date.now()};
  if($('trainerEditQuestionId').value===id)clearTrainerQuestionForm();
  publishTrainerState({questions:{[id]:trainerState.questions[id]}});
}
function saveTrainerAnnouncement(event) {
  event.preventDefault();if(!isTrainerUnlocked)return;
  const title=$('trainerAnnouncementTitle').value.trim(), body=$('trainerAnnouncementBody').value.trim();
  if(!title || !body)return;
  trainerState.announcement={title,body,updatedAt:Date.now(),deleted:false};publishTrainerState({announcement:trainerState.announcement});
}
function removeTrainerAnnouncement() {
  if(!isTrainerUnlocked || !confirm('Retirar o comunicado atual?'))return;
  trainerState.announcement={deleted:true,updatedAt:Date.now()};
  $('trainerAnnouncementTitle').value='';$('trainerAnnouncementBody').value='';publishTrainerState({announcement:trainerState.announcement});
}
function saveTrainerChallenge(event) {
  event.preventDefault();if(!isTrainerUnlocked)return;
  const target=Number($('trainerChallengeTarget').value),xp=Number($('trainerChallengeXp').value);
  const title=$('trainerChallengeTitle').value.trim(),description=$('trainerChallengeDescription').value.trim();
  if(!Number.isInteger(target)||target<1||target>100||!Number.isInteger(xp)||xp<0||xp>100||!title)return alert('Meta de 1 a 100 acertos, bônus de 0 a 100 XP.');
  if(trainerChallengeActive() && !confirm('Publicar um novo desafio encerra o anterior. Continuar?'))return;
  trainerState.challenge={id:`C-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,title,description,target,xp,updatedAt:Date.now(),deleted:false};
  publishTrainerState({challenge:trainerState.challenge});
}
function removeTrainerChallenge() {
  if(!isTrainerUnlocked || !confirm('Encerrar o desafio atual?'))return;
  trainerState.challenge={deleted:true,updatedAt:Date.now()};publishTrainerState({challenge:trainerState.challenge});
}
function renderTrainerCenter() {
  if(!isTrainerUnlocked || !$('trainerQuestionList'))return;
  const items=Object.values(trainerState.questions).filter(x=>x&&!x.deleted&&validateTrainerQuestion(x)).sort((a,b)=>b.updatedAt-a.updatedAt);
  $('trainerQuestionCount').textContent=String(items.length);
  $('trainerAnnouncementStatus').textContent=trainerState.announcement&&!trainerState.announcement.deleted?'Ativo':'Inativo';
  $('trainerChallengeStatus').textContent=trainerChallengeActive()?'Ativo':'Inativo';
  $('trainerQuestionList').innerHTML=items.length?items.map(x=>`<article class="trainer-question-row">
    <div><span>${trainerSafeHtml(x.level)} · Extra</span><strong>${trainerSafeHtml(x.q)}</strong><small>✅ ${trainerSafeHtml(x.a)}</small></div>
    <div class="trainer-row-actions"><button type="button" data-trainer-edit="${x.id}">Editar</button><button type="button" data-trainer-delete="${x.id}">Excluir</button></div>
  </article>`).join(''):'<p class="trainer-help">Nenhuma pergunta extra publicada ainda.</p>';
  const a=trainerState.announcement;
  if(a && !a.deleted) {$('trainerAnnouncementTitle').value=a.title||'';$('trainerAnnouncementBody').value=a.body||'';}
}
document.addEventListener('click',ev=>{
  const edit=ev.target.closest('[data-trainer-edit]');
  const del=ev.target.closest('[data-trainer-delete]');
  if(edit)editTrainerQuestion(edit.dataset.trainerEdit);
  if(del)removeTrainerQuestion(del.dataset.trainerDelete);
});
// =========================================================================
// 🎯 MISSÕES & CONQUISTAS v7.9 — SEM ALTERAR CHAVES DE ARMAZENAMENTO
// Cada usuário recebe o campo opcional missionProgress. Cadastros antigos
// são migrados ao primeiro acesso, preservando XP, acertos e credenciais.
// =========================================================================
const MISSION_DEFINITIONS = [
  { id: "quiz5", cycle: "daily", icon: "🎯", title: "5 acertos no simulado", detail: "Acerte 5 questões hoje", metric: "quizCorrect", target: 5, xp: 40 },
  { id: "kitchen2", cycle: "daily", icon: "🍔", title: "Dupla de lanches", detail: "Monte 2 receitas diferentes hoje", metric: "kitchenRecipes", target: 2, xp: 30 },
  { id: "review1", cycle: "daily", icon: "🧠", title: "Aprender com o erro", detail: "Corrija 1 questão em Minhas Dúvidas", metric: "reviewsCorrect", target: 1, xp: 20 },
  { id: "quiz25", cycle: "weekly", icon: "📚", title: "Maratona de conhecimento", detail: "Acerte 25 questões nesta semana", metric: "quizCorrect", target: 25, xp: 120 },
  { id: "kitchen5", cycle: "weekly", icon: "👨‍🍳", title: "Chef versátil", detail: "Monte 5 receitas diferentes na semana", metric: "kitchenRecipes", target: 5, xp: 90 },
  { id: "review5", cycle: "weekly", icon: "💡", title: "Revisão inteligente", detail: "Corrija 5 dúvidas nesta semana", metric: "reviewsCorrect", target: 5, xp: 60 }
];
const MEDAL_DEFINITIONS = [
  { id:"first_hit", icon:"🌟", title:"Primeiro Acerto", detail:"1 questão correta", test:(u,p)=> (u.correctAnswers||0)>=1 },
  { id:"quiz10", icon:"🎯", title:"Mira Certa", detail:"10 questões corretas", test:(u,p)=> (u.correctAnswers||0)>=10 },
  { id:"quiz50", icon:"🧠", title:"Mestre do Básico", detail:"50 questões corretas", test:(u,p)=> (u.correctAnswers||0)>=50 },
  { id:"first_recipe", icon:"🍔", title:"Primeiro Lanche", detail:"Monte sua primeira receita", test:(u,p)=> p.lifetime.kitchenRecipes.length>=1 },
  { id:"chef5", icon:"👨‍🍳", title:"Chef de Ouro", detail:"Monte 5 receitas diferentes", test:(u,p)=> p.lifetime.kitchenRecipes.length>=5 },
  { id:"reviews3", icon:"💡", title:"Erros Viram Lições", detail:"Corrija 3 dúvidas", test:(u,p)=> p.lifetime.reviewsCorrect>=3 },
  { id:"missions5", icon:"🏅", title:"Caçador de Missões", detail:"Complete 5 missões", test:(u,p)=> Object.keys(p.claims).length>=5 },
  { id:"gold_level", icon:"👑", title:"Padrão Ouro", detail:"Alcance o nível 4 (6.000 XP)", test:(u,p)=> (u.xp||0)>=6000 }
];
let missionViewCycle = "daily";
function missionPeriodKeys(at = new Date()) {
  // Mesmo calendário da campanha em todos os aparelhos (horário de Brasília).
  const parts = new Intl.DateTimeFormat("en-US", { timeZone:"America/Sao_Paulo", year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(at);
  const get = k => parts.find(part => part.type === k).value;
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  const monday = new Date(`${day}T12:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  return { daily:day, weekly:monday.toISOString().slice(0,10) };
}
function emptyMissionCycle(key) {
  return { key, quizCorrect:0, reviewsCorrect:0, kitchenRecipes:[] };
}
function ensureMissionProgress(user) {
  if (!user) return null;
  const keys = missionPeriodKeys();
  const p = user.missionProgress && typeof user.missionProgress === "object" ? user.missionProgress : {};
  p.version = 1;
  for (const cycle of ["daily", "weekly"]) {
    const old = p[cycle];
    // Não retroagir o calendário caso chegue um snapshot futuro de outro celular.
    if (!old || !old.key || old.key < keys[cycle]) p[cycle] = emptyMissionCycle(keys[cycle]);
    else {
      old.quizCorrect = Math.max(0, Number(old.quizCorrect)||0);
      old.reviewsCorrect = Math.max(0, Number(old.reviewsCorrect)||0);
      old.kitchenRecipes = Array.isArray(old.kitchenRecipes) ? [...new Set(old.kitchenRecipes)] : [];
    }
  }
  if (!p.lifetime || typeof p.lifetime !== "object") p.lifetime = {};
  p.lifetime.reviewsCorrect = Math.max(0,Number(p.lifetime.reviewsCorrect)||0);
  p.lifetime.kitchenRecipes = Array.isArray(p.lifetime.kitchenRecipes) ? [...new Set(p.lifetime.kitchenRecipes)] : [];
  p.claims = p.claims && typeof p.claims === "object" && !Array.isArray(p.claims) ? p.claims : {};
  p.badges = p.badges && typeof p.badges === "object" && !Array.isArray(p.badges) ? p.badges : {};
  user.missionProgress = p;
  return p;
}
function mergeMissionCycle(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.key !== b.key) return a.key > b.key ? a : b;
  return {
    key:a.key,
    quizCorrect:Math.max(Number(a.quizCorrect)||0,Number(b.quizCorrect)||0),
    reviewsCorrect:Math.max(Number(a.reviewsCorrect)||0,Number(b.reviewsCorrect)||0),
    kitchenRecipes:[...new Set([...(Array.isArray(a.kitchenRecipes)?a.kitchenRecipes:[]),...(Array.isArray(b.kitchenRecipes)?b.kitchenRecipes:[])])]
  };
}
function mergeMissionProgress(a, b) {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const la = a.lifetime || {}, lb = b.lifetime || {};
  return {
    version:1,
    daily:mergeMissionCycle(a.daily,b.daily),
    weekly:mergeMissionCycle(a.weekly,b.weekly),
    lifetime:{
      reviewsCorrect:Math.max(Number(la.reviewsCorrect)||0, Number(lb.reviewsCorrect)||0),
      kitchenRecipes:[...new Set([...(Array.isArray(la.kitchenRecipes)?la.kitchenRecipes:[]),...(Array.isArray(lb.kitchenRecipes)?lb.kitchenRecipes:[])])]
    },
    claims:{...(a.claims||{}),...(b.claims||{})},
    badges:{...(a.badges||{}),...(b.badges||{})}
  };
}
function missionMetric(cycleData, metric) {
  return metric === "kitchenRecipes" ? cycleData.kitchenRecipes.length : (Number(cycleData[metric])||0);
}
function unlockEarnedMedals(user, progress) {
  const newMedals = [];
  MEDAL_DEFINITIONS.forEach(medal => {
    if (!progress.badges[medal.id] && medal.test(user,progress)) {
      progress.badges[medal.id] = Date.now();
      newMedals.push(medal);
    }
  });
  return newMedals;
}
function showMissionToast(message) {
  const toast = document.createElement("div");
  toast.className = "mission-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
function recordMissionActivity(kind, recipeId = null) {
  if (!currentUserKey || !users[currentUserKey] || users[currentUserKey]._deleted) return;
  const user = users[currentUserKey];
  const p = ensureMissionProgress(user);
  if (kind === "quiz_correct") {
    p.daily.quizCorrect++; p.weekly.quizCorrect++;
  } else if (kind === "review_correct") {
    p.daily.reviewsCorrect++; p.weekly.reviewsCorrect++; p.lifetime.reviewsCorrect++;
  } else if (kind === "kitchen_complete" && KITCHEN_RECIPES.some(r=>r.id === recipeId)) {
    for (const list of [p.daily.kitchenRecipes,p.weekly.kitchenRecipes,p.lifetime.kitchenRecipes]) {
      if (!list.includes(recipeId)) list.push(recipeId);
    }
  } else return;
  const earned = [];
  let bonus = 0;
  MISSION_DEFINITIONS.forEach(m => {
    const cycle = p[m.cycle];
    const claimId = `${m.cycle}:${cycle.key}:${m.id}`;
    if (!p.claims[claimId] && missionMetric(cycle,m.metric) >= m.target) {
      p.claims[claimId] = Date.now();
      bonus += m.xp;
      earned.push(m);
    }
  });
  const medalUnlocks = unlockEarnedMedals(user,p);
  user.updatedAt = Date.now();
  // addXp() mantém o mesmo processo de atualização de nível e ranking.
  if (bonus) addXp(bonus);
  else scheduleCloudSync(currentUserKey,false);
  // A conquista de Padrão Ouro também pode ocorrer com o bônus recém ganho.
  medalUnlocks.push(...unlockEarnedMedals(user,p));
  if (earned.length) showMissionToast(`🎯 ${earned.map(m=>m.title).join(" • ")}! +${bonus} XP`);
  if (medalUnlocks.length) showMissionToast(`🏅 Nova medalha: ${medalUnlocks.map(m=>m.title).join(", ")}`);
  renderMissionHub();
}
function setMissionView(cycle) {
  if (cycle !== "daily" && cycle !== "weekly") return;
  missionViewCycle = cycle;
  if (typeof playTabClickSound === "function") playTabClickSound();
  renderMissionHub();
}
function renderMissionHub() {
  const list = $("missionList");
  if (!list) return;
  const user = currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? users[currentUserKey] : null;
  if (!user) {
    list.innerHTML = '<div class="mission-item text-xs font-bold text-muted-pro">Entre na sua conta para começar as missões!</div>';
    $("medalGrid").innerHTML = "";
    $("medalCount").textContent = `0/${MEDAL_DEFINITIONS.length}`;
    return;
  }
  const p = ensureMissionProgress(user);
  unlockEarnedMedals(user,p); // reconhece acertos/XP obtidos antes desta versão
  const cycle = p[missionViewCycle];
  const items = MISSION_DEFINITIONS.filter(m=>m.cycle===missionViewCycle);
  const completedCount = items.filter(m=>p.claims[`${m.cycle}:${cycle.key}:${m.id}`]).length;
  $("missionCycleLabel").textContent = missionViewCycle === "daily"
    ? `Hoje (${cycle.key.split("-").reverse().join("/")}) • reinicia à meia-noite (Brasília)`
    : `Semana de ${cycle.key.split("-").reverse().join("/")} • reinicia segunda-feira`;
  $("missionCompletedCount").textContent = `${completedCount}/${items.length} completas`;
  for (const name of ["daily","weekly"]) {
    const btn = $(name === "daily" ? "missionViewDaily" : "missionViewWeekly");
    if (btn) {
      btn.classList.toggle("is-active",missionViewCycle===name);
      btn.setAttribute("aria-pressed",String(missionViewCycle===name));
    }
  }
  list.innerHTML = items.map(m => {
    const progress = Math.min(m.target,missionMetric(cycle,m.metric));
    const complete = Boolean(p.claims[`${m.cycle}:${cycle.key}:${m.id}`]);
    const pct = Math.round(100*progress/m.target);
    return `<article class="mission-item ${complete?'is-complete':''}">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex gap-2.5 items-start">
          <span class="text-xl" aria-hidden="true">${m.icon}</span>
          <div><h3 class="text-xs font-black leading-snug">${m.title}</h3><p class="text-[11px] text-muted-pro font-medium mt-0.5">${m.detail}</p></div>
        </div>
        <span class="mission-reward">${complete?'✅ Recebido':`+${m.xp} XP`}</span>
      </div>
      <div class="mt-2.5 flex items-center gap-2">
        <div class="mission-progress-track flex-1" role="progressbar" aria-valuemin="0" aria-valuemax="${m.target}" aria-valuenow="${progress}" aria-label="${m.title}"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
        <span class="text-[10px] font-black text-muted-pro whitespace-nowrap">${progress}/${m.target}</span>
      </div>
    </article>`;
  }).join("");
  const total = MEDAL_DEFINITIONS.filter(m=>p.badges[m.id]).length;
  $("medalCount").textContent = `${total}/${MEDAL_DEFINITIONS.length}`;
  $("medalGrid").innerHTML = MEDAL_DEFINITIONS.map(m => {
    const earned = Boolean(p.badges[m.id]);
    return `<div class="medal-tile ${earned?'is-unlocked':'is-locked'}" aria-label="${m.title}: ${earned?'conquistada':'bloqueada'}">
      <span class="text-2xl" aria-hidden="true">${earned?m.icon:'🔒'}</span>
      <strong>${m.title}</strong><small>${earned?'✅ Conquistada':m.detail}</small>
    </div>`;
  }).join("");
}
// =========================================================================
// ============================================================================
// 👑 PERFIL PREMIUM V8.1 — preferências cosméticas opcionais por usuário
// Não modifica as chaves de localStorage nem as regras de XP existentes.
// ============================================================================
const PREMIUM_FRAMES = [
  {id:"classic", icon:"◻️", label:"Clássica", minXp:0},
  {id:"bronze", icon:"🥉", label:"Bronze", minXp:1000},
  {id:"silver", icon:"🥈", label:"Prata", minXp:3000},
  {id:"gold", icon:"🥇", label:"Ouro", minXp:6000},
  {id:"diamond", icon:"💎", label:"Diamante", minXp:10000},
  {id:"legend", icon:"👑", label:"Lendária", minXp:25000}
];
const PREMIUM_TITLES = [
  {id:"trainee", icon:"🌟", label:"Em treinamento", available:()=>true, requirement:"Disponível para todos"},
  {id:"first", icon:"🎯", label:"Mira Certa", available:(u,p)=>Boolean(p.badges.quiz10), requirement:"Medalha Mira Certa"},
  {id:"chef", icon:"🍔", label:"Chef da Loja", available:(u,p)=>Boolean(p.badges.first_recipe), requirement:"Medalha Primeiro Lanche"},
  {id:"master", icon:"🧠", label:"Mestre do Básico", available:(u,p)=>Boolean(p.badges.quiz50), requirement:"Medalha Mestre do Básico"},
  {id:"gold", icon:"🏅", label:"Padrão Ouro", available:(u,p)=>Boolean(p.badges.gold_level), requirement:"Medalha Padrão Ouro"},
  {id:"legend", icon:"👑", label:"Lenda da Venture", available:u=>(u.xp||0)>=25000, requirement:"Alcance 25.000 XP"}
];
function mergeProfilePremium(a,b) {
  if (!a) return b;
  if (!b) return a;
  const newest = (Number(b.updatedAt)||0) >= (Number(a.updatedAt)||0) ? b : a;
  return {
    frameId:typeof newest.frameId === 'string'?newest.frameId:'classic',
    titleId:typeof newest.titleId === 'string'?newest.titleId:'trainee',
    featuredBadges:Array.isArray(newest.featuredBadges)?newest.featuredBadges.slice(0,3):[],
    updatedAt:Math.max(Number(a.updatedAt)||0, Number(b.updatedAt)||0)
  };
}
function ensurePremiumProfile(user) {
  const saved = user && user.profilePremium && typeof user.profilePremium === 'object' ? user.profilePremium : {};
  return {
    frameId:typeof saved.frameId === 'string' ? saved.frameId : 'classic',
    titleId:typeof saved.titleId === 'string' ? saved.titleId : 'trainee',
    featuredBadges:Array.isArray(saved.featuredBadges)?[...new Set(saved.featuredBadges.filter(id=>MEDAL_DEFINITIONS.some(m=>m.id===id)))].slice(0,3):[],
    updatedAt:Number(saved.updatedAt)||0
  };
}
function premiumDate(value) {
  const stamp = Number(value);
  if (!Number.isFinite(stamp) || stamp < 946684800000 || stamp > Date.now()+86400000) return 'Conquistada';
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(stamp));
}
function updatePremiumSetting(field,value) {
  const user = currentUserKey && users[currentUserKey];
  if (!user || user._deleted) return;
  const progress = ensureMissionProgress(user);
  unlockEarnedMedals(user,progress);
  const selected = ensurePremiumProfile(user);
  if (field === 'frameId') {
    if (!PREMIUM_FRAMES.some(f=>f.id===value && (user.xp||0)>=f.minXp)) return;
    selected.frameId = value;
  } else if (field === 'titleId') {
    if (!PREMIUM_TITLES.some(t=>t.id===value && t.available(user,progress))) return;
    selected.titleId = value;
  } else if (field === 'featuredBadges') {
    if (!MEDAL_DEFINITIONS.some(m=>m.id===value) || !progress.badges[value]) return;
    if (selected.featuredBadges.includes(value)) selected.featuredBadges=selected.featuredBadges.filter(id=>id!==value);
    else if (selected.featuredBadges.length < 3) selected.featuredBadges.push(value);
    else {showMissionToast('🏅 Você pode destacar até 3 medalhas. Remova uma antes de adicionar outra.');return;}
  } else return;
  selected.updatedAt = Date.now();
  user.profilePremium = selected;
  user.updatedAt = selected.updatedAt;
  scheduleCloudSync(currentUserKey,false);
  renderPremiumProfile();
}
function renderPremiumProfile() {
  const hero = $('premiumHero');
  if (!hero || $('tab-profile').classList.contains('hidden')) return;
  const user = currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? users[currentUserKey] : null;
  if (!user) {switchMainTab('more');return;}
  const progress = ensureMissionProgress(user);
  unlockEarnedMedals(user,progress);
  const saved = ensurePremiumProfile(user);
  const xp = Math.max(0,Number(user.xp)||0);
  const frame = PREMIUM_FRAMES.find(f=>f.id===saved.frameId && xp>=f.minXp) || PREMIUM_FRAMES[0];
  const title = PREMIUM_TITLES.find(t=>t.id===saved.titleId && t.available(user,progress)) || PREMIUM_TITLES[0];
  const level = getLevelInfo(xp);
  const portrait = $('premiumAvatar');
  portrait.replaceChildren();
  if (isPhotoAvatar(user.avatar)) {
    const img = document.createElement('img'); img.src = user.avatar; img.alt='Foto do colaborador'; portrait.appendChild(img);
  } else portrait.textContent = user.avatar || '🍔';
  $('premiumAvatarFrame').className = `premium-avatar-frame frame-${frame.id}`;
  $('premiumName').textContent = user.name || 'Colaborador';
  $('premiumRole').textContent = user.role || user.station || 'Atendente';
  $('premiumEquippedTitle').textContent = `${title.icon} ${title.label}`;
  $('premiumLevel').textContent = `Nível ${level.level}`;
  $('premiumXp').textContent = `${xp.toLocaleString('pt-BR')} XP`;
  const ratio = Math.min(100,Math.max(0,100*(xp-level.min)/(level.max-level.min)));
  $('premiumXpBar').style.width = `${ratio}%`;
  $('premiumNextLevel').textContent = level.level < 7 ? `Faltam ${(level.max-xp).toLocaleString('pt-BR')} XP para o nível ${level.level+1}` : 'Você alcançou a patente máxima! 👑';
  $('premiumStatXp').textContent = xp.toLocaleString('pt-BR');
  $('premiumStatHits').textContent = (Number(user.correctAnswers)||0).toLocaleString('pt-BR');
  $('premiumStatRecipes').textContent = String(progress.lifetime.kitchenRecipes.length);
  $('premiumStatMissions').textContent = String(Object.keys(progress.claims).length);
  $('premiumStatsFoot').textContent = `${(Array.isArray(user.mistakes)?user.mistakes.length:0)} dúvida(s) para revisar · ${progress.lifetime.reviewsCorrect} revisão(ões) concluída(s) desde a versão 7.9.`;
  $('premiumFrameSummary').textContent = frame.label;
  $('premiumTitleSummary').textContent = title.label;
  $('premiumFrameChoices').innerHTML = PREMIUM_FRAMES.map(f=>{
    const available = xp >= f.minXp, current=frame.id===f.id;
    return `<button type="button" class="premium-choice ${current?'is-selected':''} ${available?'':'is-locked'}" ${available?`onclick="updatePremiumSetting('frameId','${f.id}')"`:'disabled'} aria-pressed="${current}"><span class="choice-icon">${f.icon}</span><strong>${f.label} ${current?'✓':''}</strong><small>${available?'Desbloqueada':`${f.minXp.toLocaleString('pt-BR')} XP para liberar`}</small></button>`;
  }).join('');
  $('premiumTitleChoices').innerHTML = PREMIUM_TITLES.map(t=>{
    const available=t.available(user,progress), current=title.id===t.id;
    return `<button type="button" class="premium-choice ${current?'is-selected':''} ${available?'':'is-locked'}" ${available?`onclick="updatePremiumSetting('titleId','${t.id}')"`:'disabled'} aria-pressed="${current}"><span class="choice-icon">${t.icon}</span><strong>${t.label} ${current?'✓':''}</strong><small>${available?'Desbloqueado':t.requirement}</small></button>`;
  }).join('');
  const earned=MEDAL_DEFINITIONS.filter(m=>progress.badges[m.id]);
  $('premiumMedalSummary').textContent = `${earned.length} de ${MEDAL_DEFINITIONS.length} conquistadas`;
  const featuredIds=saved.featuredBadges.filter(id=>progress.badges[id]);
  // Em contas antigas, já mostramos até 3 medalhas conquistadas, sem mudar as preferências.
  const featured = featuredIds.length ? featuredIds : earned.slice(0,3).map(m=>m.id);
  $('premiumFeatured').innerHTML = [0,1,2].map(i=>{
    const item=MEDAL_DEFINITIONS.find(m=>m.id===featured[i]);
    return `<div class="premium-featured-item">${item?`<span aria-hidden="true">${item.icon}</span>${item.title}`:'<span aria-hidden="true">🔒</span>Vazio'}</div>`;
  }).join('');
  $('premiumMedalGrid').innerHTML = MEDAL_DEFINITIONS.map(m=>{
    const available=Boolean(progress.badges[m.id]), pinned=featuredIds.includes(m.id);
    return `<article class="premium-medal ${available?'is-earned':'is-locked'}"><span class="medal-emoji" aria-hidden="true">${available?m.icon:'🔒'}</span><strong>${m.title}</strong><small>${available?premiumDate(progress.badges[m.id]):m.detail}</small>${available?`<button type="button" class="${pinned?'is-featured':''}" onclick="updatePremiumSetting('featuredBadges','${m.id}')">${pinned?'★ Em destaque':'☆ Destacar'}</button>`:''}</article>`;
  }).join('');
  const activity = [
    ...MEDAL_DEFINITIONS.filter(m=>progress.badges[m.id]).map(m=>({time:Number(progress.badges[m.id])||0,icon:m.icon,label:`Medalha: ${m.title}`})),
    ...Object.entries(progress.claims).map(([key,time])=>{
      const parts=key.split(':');const mission=MISSION_DEFINITIONS.find(m=>m.id===parts[2]&&m.cycle===parts[0]);
      return mission?{time:Number(time)||0,icon:'🎯',label:`Missão: ${mission.title}`} : null;
    }).filter(Boolean)
  ].sort((a,b)=>b.time-a.time).slice(0,7);
  $('premiumHistory').innerHTML = activity.length ? activity.map(item=>`<div class="premium-history-entry"><span aria-hidden="true">${item.icon}</span><div><strong>${item.label}</strong><small>${premiumDate(item.time)}</small></div></div>`).join('') : '<p class="premium-stats-foot">Suas próximas medalhas e missões aparecerão aqui.</p>';
}
// 🎵 MOTOR DE ÁUDIO COMPACTO (JINGLE + CLIQUES + ERRO + GIRO 3D)
// =========================================================================
let globalAudioCtx = null;
function getAudio() {
const Ctx = window.AudioContext || window.webkitAudioContext;
if (!Ctx) return null;
if (!globalAudioCtx) globalAudioCtx = new Ctx();
if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();
return globalAudioCtx;
}
document.addEventListener("click", getAudio, { once: true });
document.addEventListener("touchstart", getAudio, { once: true });
function playTone(notes, type = "triangle", vol = 0.4) {
try {
const ctx = getAudio();
if (!ctx) return;
const now = ctx.currentTime;
notes.forEach(n => {
const osc = ctx.createOscillator(), gain = ctx.createGain();
osc.type = type;
osc.frequency.setValueAtTime(n.f, now + (n.s || 0));
if (n.fEnd) osc.frequency.exponentialRampToValueAtTime(n.fEnd, now + (n.s || 0) + n.d);
gain.gain.setValueAtTime(vol, now + (n.s || 0));
gain.gain.exponentialRampToValueAtTime(0.001, now + (n.s || 0) + n.d);
osc.connect(gain); gain.connect(ctx.destination);
osc.start(now + (n.s || 0)); osc.stop(now + (n.s || 0) + n.d + 0.02);
});
} catch (e) {}
}
function playMcDonaldsJingle() {
const seq = [{ f: 523.25, s: 0, d: 0.16 }, { f: 587.33, s: 0.19, d: 0.16 }, { f: 659.25, s: 0.38, d: 0.2 }, { f: 880, s: 0.65, d: 0.26 }, { f: 783.99, s: 0.96, d: 0.65 }];
playTone(seq, "triangle", 0.7);
playTone(seq.map(x => ({ ...x, f: x.f * 2 })), "sine", 0.22);
}
function playHitSuccessSound() { playTone([{ f: 587.33, s: 0, d: 0.09 }, { f: 880, s: 0.08, d: 0.22 }], "sine", 0.45); }
function playWrongAnswerSound() { playTone([{ f: 220, s: 0, d: 0.14 }, { f: 155, s: 0.16, d: 0.24 }], "sawtooth", 0.32); }
function playTabClickSound() { playTone([{ f: 520, fEnd: 880, s: 0, d: 0.06 }], "triangle", 0.28); }
function playCardFlipSound() { playTone([{ f: 260, fEnd: 620, s: 0, d: 0.12 }], "sine", 0.32); }
// =========================================================================
// ⏳ CRONÔMETRO DE FINALIZAÇÃO (25/10) + 🍔 SISTEMA DE COZINHA (AUTO-INJETADOS)
// =========================================================================
function injectCountdownAndKitchenUI() {
// 1. Botão de testar som no topo
const themeBtn = $("tab-more");
if (themeBtn && !$("soundTestBtn")) {
const sb = document.createElement("button");
sb.id = "soundTestBtn"; sb.title = "Tocar Jingle"; sb.innerHTML = "🔊";
sb.className = "sound-test-button"; sb.textContent = "🔊 Testar som do aplicativo";
sb.onclick = playMcDonaldsJingle;
themeBtn.appendChild(sb);
}
// 2. Banner de Contagem Regressiva para 25/10 no topo do main e no Print do Ranking
const mainEl = $("tab-prizes");
if (mainEl && !$("countdownBannerTop")) {
const banner = document.createElement("div");
banner.id = "countdownBannerTop";
banner.className = "pro-card rounded-3xl p-3.5 mb-4 border-2 border-[#FFC72C] flex items-center justify-between gap-2 shadow-md";
banner.innerHTML = `
<div class="flex items-center gap-2.5">
<span class="text-2xl float-slow">🏁</span>
<div>
<span class="text-[10px] font-black uppercase text-red-500 tracking-wider block">Finalização Oficial • 25/10</span>
<p class="font-black text-xs">Reta Final da Caneca Oficial Méqui ☕</p>
</div>
</div>
<div id="countdownTimerText" class="gold-gradient text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm shrink-0">--d --h --m</div>
`;
mainEl.insertBefore(banner, mainEl.firstChild);
}
const printArea = $("rankingPrintArea");
if (printArea && !$("rankingPrintCountdown")) {
const pb = document.createElement("div");
pb.id = "rankingPrintCountdown";
pb.className = "subtle-box rounded-2xl p-2.5 text-center text-xs font-black border border-amber-500/40";
pb.innerHTML = `⏳ Encerramento Oficial: <span class="text-red-500">25/10</span> • <span id="printCountdownSpan">--</span>`;
printArea.insertBefore(pb, printArea.children[1]);
}
// 3. Sistema de Cozinha ("Monta-Lanche") dentro da aba Simulado
const kitchenMount = $("training-mode-kitchen");
if (kitchenMount && !$("kitchenSystemCard")) {
const kitchenCard = document.createElement("div");
kitchenCard.id = "kitchenSystemCard";
kitchenCard.className = "pro-card rounded-3xl p-5 border-2 border-red-500/40 space-y-3";
kitchenCard.innerHTML = `
<div class="flex items-center justify-between gap-2 border-b border-slate-500/20 pb-3">
<div class="flex items-center gap-2.5">
<div class="w-11 h-11 rounded-2xl mc-gradient text-[#FFC72C] flex items-center justify-center text-2xl font-black shrink-0 shadow">🍔</div>
<div>
<span class="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Sistema de Cozinha • +5 XP</span>
<h3 class="font-black text-sm mt-0.5">Bancada Monta-Lanche (Linha 49°C a 57°C)</h3>
</div>
</div>
</div>
<div class="flex gap-2">
<select id="kitchenRecipeSelect" onchange="selectKitchenRecipe(this.value)" class="flex-1 px-3 py-2 rounded-xl subtle-box text-xs font-extrabold focus:outline-none">
${KITCHEN_RECIPES.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}
</select>
<button onclick="resetKitchenGame()" class="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-xs btn-tap">Reiniciar 🔄</button>
</div>
<div class="subtle-box p-3 rounded-2xl space-y-1.5">
<div class="flex justify-between text-[11px] font-black">
<span class="text-amber-500">📋 Montagem Atual (Ordem Oficial):</span>
<span id="kitchenProgressBadge" class="text-emerald-500">0/0</span>
</div>
<div id="kitchenTrayBuilt" class="flex flex-wrap gap-1.5 min-h-[34px] items-center text-[11px] font-bold text-muted-pro">
Toque no 1º ingrediente abaixo para iniciar a montagem!
</div>
</div>
<div id="kitchenChoicesGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
<div id="kitchenFeedback" class="hidden p-3 rounded-2xl text-xs font-extrabold text-center"></div>
`;
// Insere logo abaixo do card principal do Simulado
kitchenMount.appendChild(kitchenCard);
initKitchenGame();
}
updateEventCountdown();
setInterval(updateEventCountdown, 1000);
}
function updateEventCountdown() {
const diff = EVENT_END_TIMESTAMP - Date.now();
const topEl = $("countdownTimerText"), printEl = $("printCountdownSpan");
if (diff <= 0) {
const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const champ = list[0] ? list[0].name : "1º Colocado";
if (topEl) topEl.textContent = `🏆 ENCERRADO! Campeão: ${champ}`;
if (printEl) printEl.textContent = `ENCERRADO EM 25/10 • 🏆 Campeão(ã): ${champ}`;
return;
}
const d = Math.floor(diff / 86400000);
const h = Math.floor((diff % 86400000) / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
const s = Math.floor((diff % 60000) / 1000);
const str = `Faltam ${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
if (topEl) topEl.textContent = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
if (printEl) printEl.textContent = str;
}
// =========================================================================
// 🍔 LÓGICA DO SISTEMA DE COZINHA ("MONTA-LANCHE")
// =========================================================================
function selectKitchenRecipe(id) {
playTabClickSound();
activeRecipe = KITCHEN_RECIPES.find(r => r.id === id) || KITCHEN_RECIPES[0];
resetKitchenGame();
}
function initKitchenGame() {
activeRecipe = KITCHEN_RECIPES[0];
resetKitchenGame();
}
function resetKitchenGame() {
currentRecipeStep = 0;
const fb = $("kitchenFeedback");
if (fb) fb.classList.add("hidden");
renderKitchenState();
}
function renderKitchenState() {
const tray = $("kitchenTrayBuilt"), badge = $("kitchenProgressBadge"), grid = $("kitchenChoicesGrid");
if (!tray || !grid) return;
const total = activeRecipe.steps.length;
badge.textContent = `${currentRecipeStep}/${total} etapas`;
if (currentRecipeStep === 0) {
tray.innerHTML = `<span class="text-xs text-muted-pro">Clique nos ingredientes abaixo na sequência oficial de montagem:</span>`;
} else {
tray.innerHTML = activeRecipe.steps.slice(0, currentRecipeStep).map((st, i) =>
`<span class="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-extrabold text-[10px]">${i + 1}. ${st} ✅</span>`
).join("");
}
const remaining = activeRecipe.steps.slice(currentRecipeStep);
const shuffled = [...remaining].sort(() => 0.5 - Math.random());
grid.innerHTML = "";
shuffled.forEach(stepName => {
const btn = document.createElement("button");
btn.className = "option-btn p-3 rounded-2xl font-extrabold text-xs text-left flex items-center justify-between gap-2";
btn.innerHTML = `<span>🥗 ${stepName}</span><span class="text-[10px] text-amber-500 font-black">+</span>`;
btn.onclick = () => handleKitchenStepClick(btn, stepName);
grid.appendChild(btn);
});
}
function handleKitchenStepClick(btn, chosenStep) {
const expected = activeRecipe.steps[currentRecipeStep];
const fb = $("kitchenFeedback");
if (chosenStep === expected) {
currentRecipeStep++;
if (currentRecipeStep >= activeRecipe.steps.length) {
renderKitchenState();
addXp(activeRecipe.xp);
recordMissionActivity("kitchen_complete",activeRecipe.id);
fb.classList.remove("hidden");
fb.className = "p-3.5 rounded-2xl text-xs font-extrabold text-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/40";
fb.innerHTML = `🎉 <strong>Padrão Ouro Best Burger!</strong> Você montou o <strong>${activeRecipe.name}</strong> perfeitamente e ganhou <strong>+${activeRecipe.xp} XP</strong>!`;
} else {
playCardFlipSound();
renderKitchenState();
}
} else {
playWrongAnswerSound();
btn.className = "anim-shake-wrong p-3 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs text-left";
fb.classList.remove("hidden");
fb.className = "p-3 rounded-2xl text-xs font-extrabold text-center bg-red-500/15 text-red-500 border border-red-500/30";
fb.innerHTML = `❌ Ordem incorreta! O próximo item oficial é: <span class="underline">${expected}</span>`;
}
}
// =========================================================================
// FOTOS DA GALERIA, PRINT DO RANKING E TEMA
// =========================================================================
function isPhotoAvatar(val) { return typeof val === "string" && val.startsWith("data:image/"); }
function renderAvatarBadge(avatarVal, sizeClasses = "w-10 h-10", textClasses = "text-xl", extraClasses = "pro-card") {
const val = avatarVal || "🍔";
return isPhotoAvatar(val)
? `<img src="${val}" alt="Foto" class="${sizeClasses} rounded-2xl object-cover border-2 border-[#FFC72C] shadow-sm shrink-0" />`
: `<div class="${sizeClasses} rounded-2xl ${extraClasses} flex items-center justify-center ${textClasses} shrink-0">${val}</div>`;
}
function triggerPhotoUpload(targetMode) {
playTabClickSound();
photoUploadTarget = targetMode;
const input = $("hiddenGalleryInput");
if (input) { input.value = ""; input.click(); }
}
function handleGalleryFileSelected(event) {
const file = event.target.files && event.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = e => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement("canvas");
canvas.width = 110; canvas.height = 110;
const minDim = Math.min(img.width, img.height);
canvas.getContext("2d").drawImage(img, (img.width - minDim) / 2, (img.height - minDim) / 2, minDim, minDim, 0, 0, 110, 110);
const dataUrl = canvas.toDataURL("image/jpeg", 0.74);
playHitSuccessSound();
if (photoUploadTarget === "register") {
selectedRegAvatar = dataUrl; renderAvatarSelector();
} else if (currentUserKey && users[currentUserKey]) {
users[currentUserKey].avatar = dataUrl; users[currentUserKey].updatedAt = Date.now();
closeAvatarModal(); scheduleCloudSync(currentUserKey, true);
}
};
img.src = e.target.result;
};
reader.readAsDataURL(file);
}
async function captureAndShareRankingImage() {
playTabClickSound();
const printArea = $("rankingPrintArea"), btn = $("btnPrintRanking");
if (!printArea || typeof html2canvas === "undefined") return shareMyScoreWhatsApp();
const orig = btn.innerHTML;
btn.innerHTML = `<span>⏳ Gerando Print...</span>`; btn.disabled = true;
try {
const canvas = await html2canvas(printArea, { scale: 2, useCORS: true, backgroundColor: document.body.classList.contains("dark-mode") ? "#131b2e" : "#ffffff" });
canvas.toBlob(async blob => {
btn.innerHTML = orig; btn.disabled = false;
if (!blob) return;
const file = new File([blob], "Ranking_Olimpiadas_Mequi.png", { type: "image/png" });
const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const top3 = list.slice(0, 3).map((u, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.name}: ${u.xp || 0} XP`).join("\n");
const caption = `🏆 *RANKING OFICIAL — OLIMPÍADAS DO BÁSICO (FINALIZA 25/10)*\n\n${top3}\n\n🔗 Link: ${window.location.origin}${window.location.pathname}`;
if (navigator.canShare && navigator.canShare({ files: [file] })) {
try { await navigator.share({ files: [file], title: "Ranking Méqui", text: caption }); return; } catch (e) {}
}
const a = document.createElement("a"); a.download = "Ranking_Olimpiadas_Mequi.png"; a.href = URL.createObjectURL(blob); a.click();
window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
}, "image/png");
} catch (e) { btn.innerHTML = orig; btn.disabled = false; shareMyScoreWhatsApp(); }
}
function initTheme() {
if (localStorage.getItem(STORAGE_THEME_KEY) === "dark") {
document.body.classList.add("dark-mode");
if ($("themeToggleBtn")) $("themeToggleBtn").textContent = "☀️";
}
}
function toggleDarkMode() {
playTabClickSound();
const isDark = document.body.classList.toggle("dark-mode");
localStorage.setItem(STORAGE_THEME_KEY, isDark ? "dark" : "light");
if ($("themeToggleBtn")) $("themeToggleBtn").textContent = isDark ? "☀️" : "🌙";
}
function showXpToast(amount) {
const c = $("xpToastContainer");
if (!c) return;
const t = document.createElement("div");
t.className = "xp-toast gold-gradient text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-xl border-2 border-white";
t.textContent = `+${amount} XP ⚡`;
c.appendChild(t); setTimeout(() => t.remove(), 1250);
}
// =========================================================================
// SINCRONIZAÇÃO EM TEMPO REAL E RESGATE DE CONTAS
// =========================================================================
function startHeartbeat() {
if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
heartbeatIntervalId = setInterval(() => {
if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
users[currentUserKey].lastSeen = Date.now();
scheduleCloudSync(currentUserKey, false);
}
}, 10000);
}
function rescuePreviousLocalRegistrations() {
["mequi_olimpiadas_users_v3", "mequi_olimpiadas_users_v4", "mequi_olimpiadas_users_v5", "mequi_olimpiadas_users_v6"].forEach(k => {
try {
const parsed = JSON.parse(localStorage.getItem(k) || "null");
if (parsed && typeof parsed === "object") {
Object.keys(parsed).forEach(uk => {
const u = parsed[uk];
if (!u || !u.name) return;
users[uk] = mergeSingleUser(users[uk], {
...u, role: u.role || u.station || "Atendente", avatar: u.avatar || "🍔",
hearts: u.hearts !== undefined ? u.hearts : 5, heartsLockUntil: u.heartsLockUntil || 0,
mistakes: Array.isArray(u.mistakes) ? u.mistakes : [], lastSeen: u.lastSeen || 0, updatedAt: u.updatedAt || Date.now()
});
});
}
} catch (e) {}
});
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}
function mergeSingleUser(ex, inc) {
if (!ex) return inc;
const streak = mergeQuizStreak(ex, inc);
if ((inc.adminOverrideAt || 0) > (ex.adminOverrideAt || 0)) return { ...inc, ...streak, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards} };
if ((ex.adminOverrideAt || 0) > (inc.adminOverrideAt || 0)) return { ...ex, ...streak, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards} };
if (inc._deleted && (inc.updatedAt || 0) >= (ex.updatedAt || 0)) return { ...inc, ...streak, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards} };
const newer = (inc.updatedAt || 0) >= (ex.updatedAt || 0);
return {
...ex, ...inc, ...streak, _deleted: false,
role: inc.role || ex.role || "Atendente",
avatar: (newer && inc.avatar) ? inc.avatar : (ex.avatar || inc.avatar || "🍔"),
xp: Math.max(ex.xp || 0, inc.xp || 0),
correctAnswers: Math.max(ex.correctAnswers || 0, inc.correctAnswers || 0),
hearts: newer && inc.hearts !== undefined ? inc.hearts : (ex.hearts !== undefined ? ex.hearts : 5),
heartsLockUntil: newer && inc.heartsLockUntil !== undefined ? inc.heartsLockUntil : (ex.heartsLockUntil || 0),
mistakes: newer && Array.isArray(inc.mistakes) ? inc.mistakes : (Array.isArray(ex.mistakes) ? ex.mistakes : []),
missionProgress: mergeMissionProgress(ex.missionProgress,inc.missionProgress),
profilePremium: mergeProfilePremium(ex.profilePremium,inc.profilePremium),
trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges),
duelRewards:{...ex.duelRewards,...inc.duelRewards},
lastSeen: Math.max(ex.lastSeen || 0, inc.lastSeen || 0),
updatedAt: Math.max(ex.updatedAt || 0, inc.updatedAt || 0)
};
}
function mergeUserDictionaries(loc, rem) {
const m = { ...loc };
if (rem && typeof rem === "object") {
Object.keys(rem).forEach(k => { if (rem[k] && rem[k].name) m[k] = mergeSingleUser(m[k], rem[k]); });
}
return m;
}
function refreshUIIfNeeded() {
restoreQuizStreak();
updateHeaderUI(); syncActiveUserHeartsState(); updateMistakesBadge(); populateDuelOpponentList(); renderDuelHistory(); renderMissionHub(); renderTrainerPublicContent(); renderPremiumProfile(); if (publicProfileSelectedKey) renderPublicProfile();
const sorted = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const hash = JSON.stringify(sorted.map(u => `${u.name}:${u.xp}:${u.correctAnswers}:${(u.avatar || "").slice(-15)}:${u.role}:${u.lastSeen || 0}:${u.profilePremium?.updatedAt||0}:${Object.keys(u.missionProgress?.badges||{}).length}`));
if (hash !== lastLeaderboardHash) { lastLeaderboardHash = hash; renderLeaderboard(); }
if (isAdminUnlocked && hash !== lastAdminListHash) { lastAdminListHash = hash; renderAdminUsersList(); }
}
function initClusterSync() {
["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"].forEach(url => {
try {
const client = mqtt.connect(url, { clientId: "mq78_" + Math.random().toString(16).slice(2, 10), clean: true, connectTimeout: 5000, reconnectPeriod: 6000 });
client.on("connect", () => {
if ($("syncStatusText")) $("syncStatusText").textContent = "● Conectado em Tempo Real (Finaliza 25/10)";
client.subscribe(SYNC_MQTT_TOPIC); client.subscribe(DUEL_MQTT_TOPIC); client.subscribe(TRAINER_MQTT_TOPIC);
});
client.on("message", (topic, msg) => {
try {
const data = JSON.parse(msg.toString());
if (topic === SYNC_MQTT_TOPIC) {
users = mergeUserDictionaries(users, data);
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
refreshUIIfNeeded();
} else if (topic === DUEL_MQTT_TOPIC) handleIncomingDuelPacket(data);
else if (topic === TRAINER_MQTT_TOPIC) mergeTrainerState(data);
} catch (e) {}
});
mqttClients.push(client);
} catch (e) {}
});
}
function publishDuelPacket(pkt) {
const p = JSON.stringify(pkt);
if (['question','answer','finish'].includes(pkt.type)) handleIncomingDuelPacket(pkt);
mqttClients.forEach(c => { if (c && c.connected) try { c.publish(DUEL_MQTT_TOPIC, p); } catch (e) {} });
}
function scheduleCloudSync(keyToPush, immediate = false) {
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
refreshUIIfNeeded();
clearTimeout(cloudSyncQueueTimer);
cloudSyncQueueTimer = setTimeout(() => {
const full = JSON.stringify(users);
mqttClients.forEach(c => { if (c && c.connected) try { c.publish(SYNC_MQTT_TOPIC, full, { retain: true }); } catch (e) {} });
if (keyToPush && users[keyToPush]) {
fetch(CLOUD_HTTP_URL, { method: "POST", body: JSON.stringify({ type: "single", k: keyToPush, u: users[keyToPush] }) }).catch(() => {});
}
}, immediate ? 150 : 3000);
}
async function fetchCloudHistorySafe(force = false) {
if (!force && Date.now() - lastHttpFetchTime < 20000) return;
lastHttpFetchTime = Date.now();
try {
const res = await fetch(`${CLOUD_HTTP_URL}/json?poll=1&since=all`);
if (res.ok) {
const lines = (await res.text()).trim().split("\n");
lines.forEach(l => {
try {
const pkt = JSON.parse(l);
if (pkt.event === "message" && pkt.message) {
const d = JSON.parse(pkt.message);
if (d.type === "single" && d.k && d.u) users[d.k] = mergeSingleUser(users[d.k], d.u);
}
} catch (e) {}
});
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
refreshUIIfNeeded();
}
} catch (e) {}
}
function forceSyncNow() {
playTabClickSound();
if (currentUserKey && users[currentUserKey]) scheduleCloudSync(currentUserKey, true);
fetchCloudHistorySafe(true);
}
// =========================================================================
// PATENTES, PERFIL E AUTENTICAÇÃO
// =========================================================================
function getLevelInfo(xp) {
if (xp >= 25000) return { level: 7, title: "👑 Nível 7 — Lenda dos Arcos Dourados", min: 25000, max: 40000 };
if (xp >= 15000) return { level: 6, title: "🔥 Nível 6 — Mestre das Olimpíadas", min: 15000, max: 25000 };
if (xp >= 10000) return { level: 5, title: "💎 Nível 5 — Diamante Best Burger", min: 10000, max: 15000 };
if (xp >= 6000) return { level: 4, title: "🥇 Nível 4 — Padrão Ouro Venture", min: 6000, max: 10000 };
if (xp >= 3000) return { level: 3, title: "🥈 Nível 3 — Especialista de Prata", min: 3000, max: 6000 };
if (xp >= 1000) return { level: 2, title: "🥉 Nível 2 — Chapa de Bronze", min: 1000, max: 3000 };
return { level: 1, title: "🔰 Nível 1 — Iniciante", min: 0, max: 1000 };
}
function renderAvatarSelector() {
const grid = $("regAvatarGrid");
if (!grid) return;
const custom = isPhotoAvatar(selectedRegAvatar);
grid.innerHTML = `<div class="col-span-6 mb-1">
<button type="button" onclick="triggerPhotoUpload('register')" class="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed ${custom ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/5'} flex items-center justify-center gap-2 text-xs font-extrabold btn-tap">
${custom ? `<img src="${selectedRegAvatar}" class="w-8 h-8 rounded-xl object-cover" /> <span class="text-emerald-500">✅ Foto Selecionada</span>` : `<span>📸 Enviar Foto da Galeria / PC</span>`}
</button></div>` + AVATAR_LIST.map(ic => `<button type="button" onclick="selectRegAvatar('${ic}')" class="avatar-option p-2 rounded-2xl border-2 subtle-box text-xl flex items-center justify-center ${ic === selectedRegAvatar ? 'selected' : ''}">${ic}</button>`).join("");
}
function selectRegAvatar(ic) { playTabClickSound(); selectedRegAvatar = ic; renderAvatarSelector(); }
function openAvatarModal() {
playTabClickSound();
if (!currentUserKey || !users[currentUserKey]) return;
const cur = users[currentUserKey].avatar || "🍔";
$("changeAvatarGrid").innerHTML = `<div class="col-span-4 mb-1">
<button type="button" onclick="triggerPhotoUpload('profile')" class="w-full py-3 rounded-2xl text-slate-950 font-black text-xs btn-anim-yellow flex items-center justify-center gap-2">📸 Escolher Foto da Galeria / PC</button>
</div>` + AVATAR_LIST.map(ic => `<button type="button" onclick="changeUserAvatar('${ic}')" class="p-3 rounded-2xl border-2 ${ic === cur ? 'border-red-600 bg-red-500/15' : 'subtle-box'} text-2xl flex items-center justify-center btn-tap">${ic}</button>`).join("");
$("avatarPickerModal").classList.remove("hidden");
}
function closeAvatarModal() { playTabClickSound(); $("avatarPickerModal").classList.add("hidden"); }
function changeUserAvatar(ic) {
playTabClickSound();
if (!currentUserKey || !users[currentUserKey]) return;
users[currentUserKey].avatar = ic; users[currentUserKey].updatedAt = Date.now();
closeAvatarModal(); scheduleCloudSync(currentUserKey, true);
}
function switchAuthTab(mode) {
playTabClickSound(); $("authError").classList.add("hidden");
$("loginForm").classList.toggle("hidden", mode !== "login");
$("registerForm").classList.toggle("hidden", mode === "login");
$("tabLoginBtn").className = mode === "login" ? "flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-[#DA291C] text-white" : "flex-1 py-2.5 text-xs font-extrabold rounded-xl text-muted-pro";
$("tabRegisterBtn").className = mode !== "login" ? "flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-[#DA291C] text-white" : "flex-1 py-2.5 text-xs font-extrabold rounded-xl text-muted-pro";
}
function showAuthError(msg) { playWrongAnswerSound(); const e = $("authError"); e.textContent = msg; e.classList.remove("hidden"); }
function handleRegister() {
const name = $("regName").value.trim().toUpperCase(), role = $("regRole").value, pass = $("regPass").value.trim();
if (name.length < 2) return showAuthError("Digite seu nome válido.");
if (pass.length < 4) return showAuthError("A senha precisa ter pelo menos 4 dígitos.");
const key = name.toLowerCase();
users[key] = {
name, role, avatar: selectedRegAvatar, password: pass, _deleted: false,
xp: users[key] && !users[key]._deleted ? (users[key].xp || 0) : 0,
correctAnswers: users[key] && !users[key]._deleted ? (users[key].correctAnswers || 0) : 0,
hearts: 5, heartsLockUntil: 0, mistakes: users[key]?.mistakes || [],
quizStreak: users[key]?.quizStreak || 0, quizStreakUpdatedAt: users[key]?.quizStreakUpdatedAt || 0,
missionProgress:users[key]?.missionProgress, profilePremium:users[key]?.profilePremium, trainerChallenges:users[key]?.trainerChallenges || {}, duelRewards:users[key]?.duelRewards || {}, lastSeen: Date.now(), updatedAt: Date.now()
};
currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
$("authModal").classList.add("hidden"); playHitSuccessSound();
restoreQuizStreak(); syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
}
async function handleLogin() {
  const rawName = $("loginName").value.trim();
  const pass = $("loginPass").value.trim();
  if (!rawName) return showAuthError("Digite seu nome para entrar!");
  const key = rawName.toLowerCase();
  const btn = $("btnLoginSubmit");
  btn.textContent = "ENTRANDO...";
  btn.disabled = true;
  if (!users[key]) {
    await fetchCloudHistorySafe(true);
  }
  btn.textContent = "ENTRAR NO TREINAMENTO 🚀";
  btn.disabled = false;
  if (pass === ADMIN_SECRET_PASS) {
    if (!users[key]) {
      users[key] = {
        name: rawName.toUpperCase(),
        role: "Treinador",
        avatar: "👑",
        password: pass,
        xp: 0,
        correctAnswers: 0,
        hearts: 5,
        heartsLockUntil: 0,
        mistakes: [],
        lastSeen: Date.now(),
        updatedAt: Date.now()
      };
    }
    users[key]._deleted = false;
    currentUserKey = key;
    localStorage.setItem(STORAGE_CURRENT_KEY, key);
    $("authModal").classList.add("hidden");
    playHitSuccessSound();
    restoreQuizStreak();
    syncActiveUserHeartsState();
    loadNextQuizQuestion();
    scheduleCloudSync(key, true);
    return;
  }
  if (!users[key] || users[key]._deleted) {
    return showAuthError("Conta não encontrada neste aparelho! Clique em 'CRIAR CONTA' acima (ou use a senha ADM).");
  }
  if (users[key].password && users[key].password !== pass) {
    return showAuthError("Senha incorreta! Tente novamente.");
  }
  currentUserKey = key;
  localStorage.setItem(STORAGE_CURRENT_KEY, key);
  $("authModal").classList.add("hidden");
  playHitSuccessSound();
  restoreQuizStreak();
  syncActiveUserHeartsState();
  loadNextQuizQuestion();
  scheduleCloudSync(key, true);
}
function logoutUser() {
  playTabClickSound();
  currentUserKey = null;
  currentStreak = 0;
  const streakDisplay = $("statStreakDisplay");
  if (streakDisplay) streakDisplay.textContent = "0 🔥";
  if (isTrainerUnlocked) lockTrainerCenter();
  localStorage.removeItem(STORAGE_CURRENT_KEY);
  $("loginPass").value = "";
  $("authModal").classList.remove("hidden");
}
function addXp(amount) {
  if (!currentUserKey || !users[currentUserKey]) {
    playHitSuccessSound();
    return;
  }
  const oldXp = users[currentUserKey].xp || 0;
  const newXp = Math.max(0, oldXp + amount);
  users[currentUserKey].xp = newXp;
  users[currentUserKey].updatedAt = Date.now();
  showXpToast(amount);
  const oldLevel = getLevelInfo(oldXp).level;
  const newLevel = getLevelInfo(newXp).level;
  if (newLevel > oldLevel) {
    playMcDonaldsJingle();
  } else {
    playHitSuccessSound();
  }
  scheduleCloudSync(currentUserKey, false);
}
function updateHeaderUI() {
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey];
  const info = getLevelInfo(u.xp || 0);
  const avatarEl = $("userAvatarDisplay");
  if (avatarEl) {
    if (isPhotoAvatar(u.avatar)) {
      avatarEl.innerHTML = `<img src="${u.avatar}" alt="Foto" class="w-full h-full object-cover" />`;
    } else {
      avatarEl.textContent = u.avatar || "🍔";
    }
  }
  $("userNameDisplay").textContent = u.name;
  $("userRoleBadge").textContent = u.role || u.station || "Atendente";
  $("userXpDisplay").textContent = `${u.xp || 0} XP`;
  $("userRankTitle").textContent = info.title;
  $("currentLevelNum").textContent = `Nível ${info.level}`;
  $("statHitsDisplay").textContent = `${u.correctAnswers || 0} ✅`;
  const progress = Math.min(100, Math.round((((u.xp || 0) - info.min) / (info.max - info.min)) * 100));
  $("xpProgressBar").style.width = `${Math.max(6, progress)}%`;
  if (info.level < 7) {
    $("nextLevelTarget").textContent = `Faltam ${info.max - (u.xp || 0)} XP para o Nível ${info.level + 1}`;
  } else {
    $("nextLevelTarget").textContent = `Patente Máxima Alcançada! 👑`;
  }
}
// =========================================================================
// CADERNO "REVISAR MINHAS DÚVIDAS"
// =========================================================================
function getActiveUserMistakes() {
  if (currentUserKey && users[currentUserKey]) {
    if (!Array.isArray(users[currentUserKey].mistakes)) users[currentUserKey].mistakes = [];
    return users[currentUserKey].mistakes;
  }
  return JSON.parse(localStorage.getItem("mequi_guest_mistakes") || "[]");
}
function recordMistakeQuestion(qId) {
  const list = getActiveUserMistakes();
  if (!list.includes(qId)) {
    list.push(qId);
    saveMistakesList(list);
  }
}
function removeMistakeQuestion(qId) {
  const list = getActiveUserMistakes().filter(id => id !== qId);
  saveMistakesList(list);
}
function saveMistakesList(list) {
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].mistakes = list;
    users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem("mequi_guest_mistakes", JSON.stringify(list));
  }
  updateMistakesBadge();
}
function updateMistakesBadge() {
  const badge = $("mistakesCountBadge");
  if (!badge) return;
  const existingIds = new Set(getQuestionBank().map(q=>q.id));
  const count = getActiveUserMistakes().filter(id=>existingIds.has(id)).length;
  badge.textContent = `${count} pendente${count === 1 ? "" : "s"}`;
  badge.className = count > 0
    ? "text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white"
    : "text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500";
}
function openReviewModal() {
  playTabClickSound();
  const existingIds = new Set(getQuestionBank().map(q=>q.id));
  const mistakes = getActiveUserMistakes().filter(id=>existingIds.has(id));
  if (mistakes.length === 0) {
    return alert("🎉 Parabéns! Você não tem nenhuma dúvida pendente. Quando errar alguma questão no Simulado, ela ficará salva aqui para revisão!");
  }
  $("reviewMistakesModal").classList.remove("hidden");
  loadNextReviewQuestion();
}
function closeReviewModal() {
  playTabClickSound();
  $("reviewMistakesModal").classList.add("hidden");
}
function loadNextReviewQuestion() {
  playTabClickSound();
  const existingIds = new Set(getQuestionBank().map(q=>q.id));
  const mistakes = getActiveUserMistakes().filter(id=>existingIds.has(id));
  if (mistakes.length === 0) {
    playMcDonaldsJingle();
    alert("✅ Sensacional! Você revisou e zerou todas as suas dúvidas pendentes!");
    closeReviewModal();
    return;
  }
  const randomId = mistakes[Math.floor(Math.random() * mistakes.length)];
  const item = getQuestionBank().find(q => q.id === randomId) || getQuestionBank()[0];
  currentReviewItem = item;
  $("reviewMetaBadge").textContent = `Questão #${item.id} • ${item.level}`;
  $("reviewRemainingBadge").textContent = `Faltam zerar: ${mistakes.length}`;
  $("reviewQuestionText").textContent = item.q;
  $("reviewFeedbackBox").classList.add("hidden");
  $("nextReviewBtn").classList.add("hidden");
  const shuffled = [...item.w, item.a].sort(() => 0.5 - Math.random());
  const letters = ["A", "B", "C", "D"];
  const container = $("reviewOptionsContainer");
  container.innerHTML = "";
  shuffled.forEach((optText, idx) => {
    const letter = letters[idx];
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `
      <span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span>
      <span class="flex-1 leading-snug">${trainerSafeHtml(optText)}</span>
    `;
    btn.onclick = () => checkReviewAnswer(btn, optText, item.a, item.id);
    container.appendChild(btn);
  });
}
function checkReviewAnswer(selectedBtn, chosen, correct, qId) {
  const allBtns = document.querySelectorAll("#reviewOptionsContainer button");
  allBtns.forEach(b => b.disabled = true);
  const fb = $("reviewFeedbackBox");
  fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3";
    removeMistakeQuestion(qId);
    recordMissionActivity("review_correct");
    playHitSuccessSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
    fb.textContent = "✅ Aprendido! Essa questão saiu da sua lista de dúvidas!";
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    playWrongAnswerSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500 border border-red-500/30";
    fb.innerHTML = `❌ O gabarito oficial é:<br><span class="underline mt-1 inline-block">${correct}</span>`;
  }
  $("nextReviewBtn").classList.remove("hidden");
}
// =========================================================================
// DUELO ONLINE 1 vs 1 COM STATUS ONLINE E HISTÓRICO DE VENCEDORES
// =========================================================================
function populateDuelOpponentList() {
  const select = $("duelOpponentSelect");
  if (!select) return;
  const currentVal = select.value;
  const now = Date.now();
  const list = Object.entries(users)
    .filter(([k, u]) => u && u.name && !u._deleted && k !== currentUserKey)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));
  // Evita interpretar como HTML os nomes/cargos recebidos de outros celulares.
  select.replaceChildren(new Option("Selecione quem você quer desafiar...", ""));
  list.forEach(([k, u]) => {
    const isOnline = (now - (u.lastSeen || 0)) < 25000;
    const indicator = isOnline ? "🟢 [Online]" : "⚪ [Offline]";
    select.add(new Option(`${indicator} ${u.name} (${u.role || 'Atendente'})`, k));
  });
  if (currentVal && users[currentVal]) select.value = currentVal;
}
function sendLiveDuelInvite() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) {
    return alert("Faça login na sua conta antes de desafiar alguém!");
  }
  const targetKey = $("duelOpponentSelect").value;
  if (!targetKey || !users[targetKey]) {
    return alert("Selecione na lista qual colega da loja você quer convidar para o duelo!");
  }
  const me = users[currentUserKey];
  const opp = users[targetKey];
  const duelId = "duel_" + Date.now() + "_" + Math.random().toString(16).substring(2, 6);
  activeDuel = {
    duelId: duelId,
    isHost: true,
    hostKey: currentUserKey,
    hostName: me.name,
    hostAvatar: me.avatar || "🍔",
    guestKey: targetKey,
    guestName: opp.name,
    guestAvatar: opp.avatar || "🍟",
    scoreHost: 0,
    scoreGuest: 0,
    round: 0,
    status: "waiting"
  };
  openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden");
  $("duelQuestionArea").classList.add("hidden");
  $("duelWinnerBox").classList.add("hidden");
  $("duelWaitingText").textContent = `Convite enviado! Aguardando ${opp.name} aceitar no celular dele(a)...`;
  publishDuelPacket({
    type: "invite",
    duelId: duelId,
    hostKey: currentUserKey,
    hostName: me.name,
    hostAvatar: me.avatar || "🍔",
    guestKey: targetKey,
    guestName: opp.name,
    guestAvatar: opp.avatar || "🍟"
  });
}
function sendDuelInviteWhatsApp() {
  playTabClickSound();
  if (!activeDuel) return;
  const link = `${window.location.origin}${window.location.pathname}`;
  const text = `⚔️ *DESAFIO 1 vs 1 — OLIMPÍADAS DO BÁSICO*\n🔥 *${activeDuel.hostName}* está te chamando para um Duelo ao vivo agora!\n\n📲 Abra o aplicativo para aceitar o convite: ${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
function handleIncomingDuelPacket(pkt) {
  if (!pkt || !pkt.type) return;
  if (pkt.type === "invite" && pkt.guestKey === currentUserKey) {
    if (activeDuel) return;
    pendingDuelInvite = pkt;
    playHitSuccessSound();
    $("inviteFromNameDisplay").textContent = pkt.hostName;
    $("duelInvitePopup").classList.remove("hidden");
    return;
  }
  if (!activeDuel || pkt.duelId !== activeDuel.duelId) return;
  if (activeDuel.status === "finished") return;
  if (pkt.type === "decline") {
    playWrongAnswerSound();
    alert(`❌ ${activeDuel.guestName} recusou o convite de duelo no momento.`);
    leaveActiveDuel(false);
    return;
  }
  if (pkt.type === "accept" && activeDuel.isHost && activeDuel.status === "waiting") {
    activeDuel.status = "playing";
    hostStartNextDuelRound();
    return;
  }
  if (pkt.type === "question") {
    if (Number(pkt.round) <= Number(activeDuel.round || 0)) return;
    activeDuel.status = "playing";
    activeDuel.round = pkt.round;
    activeDuel.scoreHost = pkt.scoreHost;
    activeDuel.scoreGuest = pkt.scoreGuest;
    activeDuel.currentQuestion = pkt.question;
    activeDuel.roundResolved = false;
    activeDuel.lockedPlayers = {};
    playCardFlipSound();
    renderDuelRoundUI();
    return;
  }
  if (pkt.type === "answer" && activeDuel.status === "playing" && !activeDuel.roundResolved && pkt.round === activeDuel.round && [activeDuel.hostKey,activeDuel.guestKey].includes(pkt.playerKey)) {
    if (activeDuel.lockedPlayers?.[pkt.playerKey]) return;
    if (pkt.isCorrect) {
      activeDuel.roundResolved = true;
      if (pkt.playerKey === activeDuel.hostKey) activeDuel.scoreHost++;
      else activeDuel.scoreGuest++;
      updateDuelScoreboardUI();
      playHitSuccessSound();
      showDuelBanner(`⚡ ${pkt.playerName} acertou primeiro e marcou +1 ponto!`, "emerald");
      if (activeDuel.isHost) {
        setTimeout(() => {
          if (!activeDuel) return;
          if (activeDuel.scoreHost >= 5 || activeDuel.scoreGuest >= 5) {
            const winnerName = activeDuel.scoreHost >= 5 ? activeDuel.hostName : activeDuel.guestName;
            const winnerKey = activeDuel.scoreHost >= 5 ? activeDuel.hostKey : activeDuel.guestKey;
            publishDuelPacket({
              type: "finish",
              duelId: activeDuel.duelId,
              winnerName: winnerName,
              winnerKey: winnerKey,
              scoreHost: activeDuel.scoreHost,
              scoreGuest: activeDuel.scoreGuest
            });
          } else {
            hostStartNextDuelRound();
          }
        }, 1900);
      }
    } else {
      activeDuel.lockedPlayers[pkt.playerKey] = true;
      playWrongAnswerSound();
      if (pkt.playerKey === currentUserKey) {
        showDuelBanner(`❌ Você errou! Aguardando tentativa do oponente...`, "red");
      } else {
        showDuelBanner(`🔥 ${pkt.playerName} errou! Responda com calma para ganhar o ponto!`, "amber");
      }
      if (activeDuel.lockedPlayers[activeDuel.hostKey] && activeDuel.lockedPlayers[activeDuel.guestKey]) {
        activeDuel.roundResolved = true;
        showDuelBanner(`😅 Nenhum dos dois acertou! Próxima pergunta...`, "red");
        if (activeDuel.isHost) {
          setTimeout(() => { if (activeDuel) hostStartNextDuelRound(); }, 1900);
        }
      }
    }
    return;
  }
  if (pkt.type === "finish") {
    // A partida só encerra ao alcançar 5 pontos. Legado sem winnerKey não pontua.
    const winnerKey = pkt.scoreHost >= 5 && pkt.scoreHost > pkt.scoreGuest ? activeDuel.hostKey
      : pkt.scoreGuest >= 5 && pkt.scoreGuest > pkt.scoreHost ? activeDuel.guestKey : null;
    if (!winnerKey || pkt.winnerKey !== winnerKey || activeDuel.status === 'finished') return;
    activeDuel.status = 'finished';
    const eligibleWinner = winnerKey === currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted;
    let xpAwarded=false;
    if (eligibleWinner) {
      const user=users[currentUserKey];
      user.duelRewards=user.duelRewards && typeof user.duelRewards==='object'?user.duelRewards:{};
      if(!user.duelRewards[activeDuel.duelId]) {
        user.duelRewards[activeDuel.duelId]=Date.now();
        user.updatedAt=Date.now();
        addXp(DUEL_WIN_XP); xpAwarded=true;
      }
    }
    activeDuel.scoreHost = pkt.scoreHost;
    activeDuel.scoreGuest = pkt.scoreGuest;
    updateDuelScoreboardUI();
    playMcDonaldsJingle();
    $("duelQuestionArea").classList.add("hidden");
    $("duelWinnerBox").classList.remove("hidden");
    $("duelWinnerTitle").textContent = `🏆 ${pkt.winnerName} Venceu!`;
    $("duelWinnerSub").textContent = `Placar final: ${activeDuel.hostName} (${pkt.scoreHost}) x (${pkt.scoreGuest}) ${activeDuel.guestName}. ${eligibleWinner?(xpAwarded?'🏆 Você ganhou +100 XP!':'Recompensa já registrada.'):'O vencedor ganha +100 XP.'}`;
    saveDuelHistoryRecord({
      p1: activeDuel.hostName,
      p2: activeDuel.guestName,
      score1: pkt.scoreHost,
      score2: pkt.scoreGuest,
      winner: pkt.winnerName,
      duelId:activeDuel.duelId, rewardXp:DUEL_WIN_XP,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    return;
  }
  if (pkt.type === "leave" && pkt.playerKey !== currentUserKey) {
    alert("O seu oponente saiu da Arena de Duelo.");
    leaveActiveDuel(false);
  }
}
function saveDuelHistoryRecord(record) {
  if(record.duelId && duelHistoryList.some(h=>h.duelId===record.duelId))return;
  duelHistoryList.unshift(record);
  if (duelHistoryList.length > 5) duelHistoryList.pop();
  localStorage.setItem(STORAGE_DUEL_HISTORY, JSON.stringify(duelHistoryList));
  renderDuelHistory();
}
function renderDuelHistory() {
  const container = $("duelHistoryContainer");
  if (!container) return;
  if (duelHistoryList.length === 0) {
    container.innerHTML = `<div class="p-3 rounded-xl subtle-box text-xs text-center text-muted-pro">Nenhum duelo finalizado recentemente. Desafie alguém na aba Simulado!</div>`;
    return;
  }
  container.innerHTML = duelHistoryList.map(h => `
    <div class="flex items-center justify-between p-2.5 rounded-xl subtle-box text-xs font-bold">
      <div class="flex items-center gap-2">
        <span>⚔️</span>
        <span><strong>${h.p1}</strong> (${h.score1}) x (${h.score2}) <strong>${h.p2}</strong></span>
      </div>
      <div class="text-right">
        <span class="text-amber-500 font-black">🏆 ${h.winner}</span>
        <span class="block text-[9px] text-muted-pro">${h.date}</span>
      </div>
    </div>
  `).join("");
}
function acceptDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  activeDuel = {
    duelId: pendingDuelInvite.duelId,
    isHost: false,
    hostKey: pendingDuelInvite.hostKey,
    hostName: pendingDuelInvite.hostName,
    hostAvatar: pendingDuelInvite.hostAvatar || "🍔",
    guestKey: pendingDuelInvite.guestKey,
    guestName: pendingDuelInvite.guestName,
    guestAvatar: pendingDuelInvite.guestAvatar || "🍟",
    scoreHost: 0,
    scoreGuest: 0,
    round: 0,
    status: "playing"
  };
  pendingDuelInvite = null;
  openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden");
  $("duelWaitingText").textContent = "Conectando e sorteando a 1ª pergunta...";
  publishDuelPacket({ type: "accept", duelId: activeDuel.duelId });
}
function declineDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  publishDuelPacket({ type: "decline", duelId: pendingDuelInvite.duelId });
  pendingDuelInvite = null;
}
function openDuelArenaUI() {
  if (!activeDuel) return;
  $("duelArenaModal").classList.remove("hidden");
  updateDuelScoreboardUI();
}
function updateDuelScoreboardUI() {
  if (!activeDuel) return;
  const p1Av = $("duelP1Avatar");
  const p2Av = $("duelP2Avatar");
  if (p1Av) p1Av.innerHTML = isPhotoAvatar(activeDuel.hostAvatar) ? `<img src="${activeDuel.hostAvatar}" class="w-9 h-9 rounded-xl object-cover border border-[#FFC72C] mx-auto" />` : activeDuel.hostAvatar;
  if (p2Av) p2Av.innerHTML = isPhotoAvatar(activeDuel.guestAvatar) ? `<img src="${activeDuel.guestAvatar}" class="w-9 h-9 rounded-xl object-cover border border-[#FFC72C] mx-auto" />` : activeDuel.guestAvatar;
  $("duelP1Name").textContent = activeDuel.hostName;
  $("duelP1Score").textContent = activeDuel.scoreHost;
  $("duelP2Name").textContent = activeDuel.guestName;
  $("duelP2Score").textContent = activeDuel.scoreGuest;
  $("duelRoundBadge").textContent = `Rodada #${activeDuel.round || 1}`;
}
function hostStartNextDuelRound() {
  if (!activeDuel || !activeDuel.isHost) return;
  const nextRound = (activeDuel.round || 0) + 1;
  const bank=getQuestionBank();
  const randomItem=bank[Math.floor(Math.random()*bank.length)];
  const shuffledOptions = [...randomItem.w, randomItem.a].sort(() => 0.5 - Math.random());
  publishDuelPacket({
    type: "question",
    duelId: activeDuel.duelId,
    round: nextRound,
    scoreHost: activeDuel.scoreHost,
    scoreGuest: activeDuel.scoreGuest,
    question: { id: randomItem.id, level: randomItem.level, q: randomItem.q, a: randomItem.a, options: shuffledOptions }
  });
}
function renderDuelRoundUI() {
  if (!activeDuel || !activeDuel.currentQuestion) return;
  $("duelWaitingBox").classList.add("hidden");
  $("duelWinnerBox").classList.add("hidden");
  $("duelQuestionArea").classList.remove("hidden");
  $("duelStatusBanner").classList.add("hidden");
  updateDuelScoreboardUI();
  const qObj = activeDuel.currentQuestion;
  $("duelQuestionText").textContent = `(#${qObj.id}) ${qObj.q}`;
  const letters = ["A", "B", "C", "D"];
  const container = $("duelOptionsContainer");
  container.innerHTML = "";
  qObj.options.forEach((optText, idx) => {
    const letter = letters[idx];
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `
      <span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span>
      <span class="flex-1 leading-snug">${trainerSafeHtml(optText)}</span>
    `;
    btn.onclick = () => submitDuelAnswer(btn, optText, qObj.a);
    container.appendChild(btn);
  });
}
function submitDuelAnswer(selectedBtn, chosen, correct) {
  if (!activeDuel || activeDuel.roundResolved) return;
  if (activeDuel.lockedPlayers && activeDuel.lockedPlayers[currentUserKey]) return;
  const allBtns = document.querySelectorAll("#duelOptionsContainer button");
  allBtns.forEach(b => b.disabled = true);
  const isCorrect = (chosen === correct);
  selectedBtn.className = isCorrect
    ? "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3"
    : "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
  const myName = (users[currentUserKey] && users[currentUserKey].name) || "Jogador";
  publishDuelPacket({
    type: "answer",
    duelId: activeDuel.duelId,
    playerKey: currentUserKey,
    playerName: myName,
    isCorrect: isCorrect,
    round: activeDuel.round
  });
}
function showDuelBanner(msg, color) {
  const banner = $("duelStatusBanner");
  banner.classList.remove("hidden");
  banner.className = color === "emerald"
    ? "p-3 rounded-2xl text-xs font-extrabold text-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
    : color === "amber"
      ? "p-3 rounded-2xl text-xs font-extrabold text-center bg-amber-500/20 text-amber-500 border border-amber-500/40"
      : "p-3 rounded-2xl text-xs font-extrabold text-center bg-red-500/20 text-red-500 border border-red-500/40";
  banner.textContent = msg;
}
function leaveActiveDuel(notifyOther = true) {
  playTabClickSound();
  if (activeDuel && notifyOther) {
    publishDuelPacket({ type: "leave", duelId: activeDuel.duelId, playerKey: currentUserKey });
  }
  activeDuel = null;
  $("duelArenaModal").classList.add("hidden");
}
// =========================================================================
// CORAÇÕES E RECARGA DE 10 MINUTOS
// =========================================================================
function getActiveHeartsLockUntil() {
  if (currentUserKey && users[currentUserKey]) return users[currentUserKey].heartsLockUntil || 0;
  return parseInt(localStorage.getItem("mequi_guest_hearts_lock") || "0", 10);
}
function setActiveHeartsState(heartsVal, lockUntilVal) {
  currentHearts = heartsVal;
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].hearts = heartsVal;
    users[currentUserKey].heartsLockUntil = lockUntilVal;
    users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem("mequi_guest_hearts", String(heartsVal));
    localStorage.setItem("mequi_guest_hearts_lock", String(lockUntilVal));
  }
  updateHeartsDisplay();
}
function syncActiveUserHeartsState() {
  const now = Date.now();
  let lockUntil = getActiveHeartsLockUntil();
  if (currentUserKey && users[currentUserKey]) {
    currentHearts = users[currentUserKey].hearts !== undefined ? users[currentUserKey].hearts : 5;
  } else {
    currentHearts = parseInt(localStorage.getItem("mequi_guest_hearts") || "5", 10);
  }
  if (lockUntil > 0 && now >= lockUntil) {
    setActiveHeartsState(5, 0);
    lockUntil = 0;
  }
  updateHeartsDisplay();
  checkAndRenderCooldownScreen();
}
function formatTimeRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function checkAndRenderCooldownScreen() {
  const lockUntil = getActiveHeartsLockUntil();
  const now = Date.now();
  const cooldownBox = $("quizCooldownBox");
  const activeArea = $("quizActiveArea");
  const timerDisplay = $("cooldownTimerDisplay");
  if (lockUntil > now) {
    cooldownBox.classList.remove("hidden");
    activeArea.classList.add("hidden");
    timerDisplay.textContent = formatTimeRemaining(lockUntil - now);
    if (!cooldownIntervalId) {
      cooldownIntervalId = setInterval(() => {
        const rem = getActiveHeartsLockUntil() - Date.now();
        if (rem <= 0) {
          clearInterval(cooldownIntervalId);
          cooldownIntervalId = null;
          setActiveHeartsState(5, 0);
          cooldownBox.classList.add("hidden");
          activeArea.classList.remove("hidden");
          loadNextQuizQuestion();
          if (currentUserKey) scheduleCloudSync(currentUserKey, true);
        } else {
          timerDisplay.textContent = formatTimeRemaining(rem);
        }
      }, 1000);
    }
    return true;
  } else {
    if (cooldownIntervalId) {
      clearInterval(cooldownIntervalId);
      cooldownIntervalId = null;
    }
    if (currentHearts <= 0) setActiveHeartsState(5, 0);
    cooldownBox.classList.add("hidden");
    activeArea.classList.remove("hidden");
    return false;
  }
}
function changeQuizLevelFilter() {
  playTabClickSound();
  loadNextQuizQuestion();
}
function updateHeartsDisplay() {
  const safeHearts = Math.max(0, Math.min(5, currentHearts));
  const el = $("quizHeartsInfo");
  if (el) el.textContent = "❤️".repeat(safeHearts) + "🖤".repeat(5 - safeHearts);
}
function loadNextQuizQuestion() {
  playTabClickSound();
  syncActiveUserHeartsState();
  if (checkAndRenderCooldownScreen()) return;
  const levelFilter = $("quizLevelFilter").value;
  const pool = levelFilter === "ALL" ? getQuestionBank() : getQuestionBank().filter(item => item.level === levelFilter);
  const randomItem = pool[Math.floor(Math.random() * pool.length)];
  currentQuizQuestionId = randomItem.id;
  $("quizQuestionMeta").textContent = `Questão #${randomItem.id} • Nível ${randomItem.level}`;
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
  $("quizQuestionText").textContent = randomItem.q;
  $("quizFeedback").classList.add("hidden");
  $("nextQuizBtn").classList.add("hidden");
  const wrongChoices = (randomItem.w && randomItem.w.length === 3)
    ? [...randomItem.w]
    : getQuestionBank().filter(item => item.id !== randomItem.id).sort(() => 0.5 - Math.random()).slice(0, 3).map(item => item.a);
  const shuffledOptions = [...wrongChoices, randomItem.a].sort(() => 0.5 - Math.random());
  const letters = ["A", "B", "C", "D"];
  const container = $("quizOptions");
  container.innerHTML = "";
  shuffledOptions.forEach((optText, idx) => {
    const letter = letters[idx];
    const btn = document.createElement("button");
    btn.style.animationDelay = `${idx * 40}ms`;
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `
      <span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span>
      <span class="flex-1 leading-snug">${trainerSafeHtml(optText)}</span>
    `;
    btn.onclick = () => checkQuizAnswer(btn, optText, randomItem.a, letter);
    container.appendChild(btn);
  });
}
function checkQuizAnswer(selectedBtn, chosen, correct, letter) {
  const allBtns = document.querySelectorAll("#quizOptions button");
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.innerText.includes(correct) && chosen !== correct) {
      b.className = "w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/15 font-extrabold text-xs flex items-center gap-3";
    }
  });
  const fb = $("quizFeedback");
  fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3 shadow-md";
    currentStreak++;
    saveQuizStreak();
    if (currentUserKey && users[currentUserKey]) {
      users[currentUserKey].correctAnswers = (users[currentUserKey].correctAnswers || 0) + 1;
    }
    addXp(25);
    recordMissionActivity("quiz_correct");
    recordTrainerChallengeCorrect();
    fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
    fb.textContent = `✅ Alternativa ${letter} Correta! Você ganhou +25 XP!`;
    $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️";
    $("nextQuizBtn").classList.remove("hidden");
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    currentStreak = 0;
    saveQuizStreak();
    playWrongAnswerSound();
    if (currentQuizQuestionId) recordMistakeQuestion(currentQuizQuestionId);
    const newHearts = Math.max(0, currentHearts - 1);
    if (newHearts <= 0) {
      const lockUntil = Date.now() + HEARTS_COOLDOWN_MS;
      setActiveHeartsState(0, lockUntil);
      if (currentUserKey) scheduleCloudSync(currentUserKey, true);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500 border border-red-500/30";
      fb.innerHTML = `💔 <strong>Você perdeu todos os seus 5 corações!</strong><br>Gabarito: <span class="underline">${correct}</span>.<br><span class="mt-1 inline-block">⏳ Aguarde 10 minutos (ou abra a Bancada Monta-Lanche na aba Treinos)!</span>`;
      $("nextQuizBtn").textContent = "VER CRONÔMETRO DE RECARGA (10 MIN) ⏳";
      $("nextQuizBtn").classList.remove("hidden");
    } else {
      setActiveHeartsState(newHearts, 0);
      if (currentUserKey) scheduleCloudSync(currentUserKey, false);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500 border border-red-500/30";
      fb.innerHTML = `❌ Quase! Você perdeu 1 coração (Restam ${newHearts} ❤️) e a questão foi salva em <strong>Minhas Dúvidas</strong>.<br>Gabarito: <span class="underline mt-1 inline-block">${correct}</span>`;
      $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️";
      $("nextQuizBtn").classList.remove("hidden");
    }
  }
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
}
// =========================================================================
// FLASHCARDS 3D, BOOK E RANKING
// =========================================================================
function loadRandomFlashcard() {
  playCardFlipSound();
  const inner = $("fcFlipInner");
  if (!inner) return;
  inner.classList.remove("is-flipped");
  setTimeout(() => {
    const bank=getQuestionBank();
    const item=bank[Math.floor(Math.random()*bank.length)];
    $("fcMeta").textContent = `Questão #${item.id} (${item.level}) • Toque para girar 3D 🔄`;
    $("fcQuestion").textContent = item.q;
    $("fcAnswer").textContent = item.a;
  }, 150);
}
function flipFlashcard() {
  playCardFlipSound();
  const inner = $("fcFlipInner");
  if (inner) inner.classList.toggle("is-flipped");
}
let bookVisibleCount = 20;
function debouncedBookSearch() {
  bookVisibleCount = 20;
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => { renderBookList(); }, 150);
}
function setBookFilter(level) {
  playTabClickSound();
  currentBookFilter = level;
  bookVisibleCount = 20;
  ["ALL", "Básico", "Intermediário", "Avançado"].forEach(lvl => {
    const btn = $(`filter-${lvl}`);
    if (btn) {
      btn.className = lvl === level
        ? "px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 text-white shadow-sm shrink-0 btn-tap"
        : "px-3.5 py-1.5 rounded-xl text-xs font-extrabold subtle-box shrink-0 btn-tap";
    }
  });
  renderBookList();
}
function renderBookList() {
  const search = $("searchBookInput").value.toLowerCase();
  const container = $("bookQuestionsContainer");
  const filtered = getQuestionBank().filter(item => {
    const matchesLevel = currentBookFilter === "ALL" || item.level === currentBookFilter;
    const matchesText = !search || item.q.toLowerCase().includes(search) || item.a.toLowerCase().includes(search) || String(item.id).includes(search);
    return matchesLevel && matchesText;
  });
  $("bookCountBadge").textContent = `${filtered.length} questões`;
  container.innerHTML = filtered.slice(0, bookVisibleCount).map(item => `
    <div class="pro-card rounded-2xl p-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Questão #${item.id} • ${item.level}</span>
        <button onclick="revealBookAnswer(this)" class="text-[11px] font-extrabold text-amber-500 hover:underline btn-tap">Ver Resposta</button>
      </div>
      <p class="font-extrabold text-xs leading-relaxed">${trainerSafeHtml(item.q)}</p>
      <p class="hidden mt-2.5 pt-2.5 border-t border-slate-500/20 text-xs font-bold text-emerald-500">✅ ${trainerSafeHtml(item.a)}</p>
    </div>
  `).join("") + (filtered.length > bookVisibleCount ?
    `<button class="book-load-more" type="button" onclick="loadMoreBookQuestions()">Mostrar mais questões (${Math.min(20, filtered.length-bookVisibleCount)} de ${filtered.length-bookVisibleCount} restantes) ↓</button>` : "");
}
function loadMoreBookQuestions() {
  bookVisibleCount += 20;
  renderBookList();
}
function revealBookAnswer(btn) {
  playCardFlipSound();
  const answerEl = btn.parentElement.nextElementSibling.nextElementSibling;
  if (answerEl.classList.contains("hidden")) {
    answerEl.classList.remove("hidden");
    btn.textContent = "Ocultar";
  } else {
    answerEl.classList.add("hidden");
    btn.textContent = "Ver Resposta";
  }
}
// ============================================================================
// 👥 V8.2 — PERFIS PÚBLICOS SOMENTE LEITURA
// O modal lê os dados sincronizados que já existem em users. NÃO grava nos
// perfis dos colegas e não mostra senha, identificadores internos ou dados de login.
// ============================================================================
let publicProfileSelectedKey = null;
let publicProfileReturnFocus = null;
function escapePublicHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function safePublicAvatarValue(value) {
  if (typeof value === 'string' && value.length < 160000 && /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  return AVATAR_LIST.includes(value) ? value : '🍔';
}
function openPublicProfile(key) {
  const user = Object.prototype.hasOwnProperty.call(users,key) ? users[key] : null;
  if (!user || !user.name || user._deleted) return;
  if (key === currentUserKey) {switchMainTab('profile');return;}
  const modal = $('publicProfileModal');
  if (!modal) return;
  if (typeof playTabClickSound === 'function') playTabClickSound();
  publicProfileReturnFocus = document.activeElement;
  publicProfileSelectedKey = key;
  renderPublicProfile();
  modal.classList.remove('hidden');
  document.body.classList.add('public-profile-open');
  $('publicProfileClose').focus();
}
function closePublicProfile() {
  const modal = $('publicProfileModal');
  if (!modal || modal.classList.contains('hidden')) return;
  modal.classList.add('hidden');
  publicProfileSelectedKey = null;
  document.body.classList.remove('public-profile-open');
  if (publicProfileReturnFocus && publicProfileReturnFocus.isConnected) publicProfileReturnFocus.focus();
  publicProfileReturnFocus = null;
}
function publicProfileSetText(id,value) { const el=$(id); if (el) el.textContent=String(value); }
function renderPublicProfile() {
  const key = publicProfileSelectedKey;
  const user = key && Object.prototype.hasOwnProperty.call(users,key) ? users[key] : null;
  if (!user || user._deleted) {closePublicProfile();return;}
  const progress = ensureMissionProgress(user);
  const saved = ensurePremiumProfile(user);
  const xp = Math.max(0,Number(user.xp)||0);
  const level = getLevelInfo(xp);
  const frame = PREMIUM_FRAMES.find(f=>f.id===saved.frameId && xp>=f.minXp) || PREMIUM_FRAMES[0];
  const title = PREMIUM_TITLES.find(t=>t.id===saved.titleId && t.available(user,progress)) || PREMIUM_TITLES[0];
  const portrait = $('publicProfileAvatar');
  portrait.replaceChildren();
  const avatar = safePublicAvatarValue(user.avatar);
  if (avatar.startsWith('data:image/')) {
    const img=document.createElement('img'); img.src=avatar; img.alt='Foto do jogador'; portrait.appendChild(img);
  } else portrait.textContent=avatar;
  $('publicProfileFrame').className = `premium-avatar-frame frame-${frame.id}`;
  publicProfileSetText('publicProfileName',user.name);
  publicProfileSetText('publicProfileRole',user.role||user.station||'Atendente');
  publicProfileSetText('publicProfileTitle',`${title.icon} ${title.label}`);
  publicProfileSetText('publicProfileLevel',`Nível ${level.level}`);
  publicProfileSetText('publicProfileXp',`${xp.toLocaleString('pt-BR')} XP`);
  $('publicProfileXpBar').style.width = `${Math.max(0,Math.min(100,100*(xp-level.min)/(level.max-level.min)))}%`;
  publicProfileSetText('publicProfileNextLevel',level.level<7?`Faltam ${(level.max-xp).toLocaleString('pt-BR')} XP para o nível ${level.level+1}`:'Patente máxima alcançada! 👑');
  publicProfileSetText('publicProfileStatXp',xp.toLocaleString('pt-BR'));
  publicProfileSetText('publicProfileStatHits',Math.max(0,Number(user.correctAnswers)||0).toLocaleString('pt-BR'));
  publicProfileSetText('publicProfileStatRecipes',progress.lifetime.kitchenRecipes.length);
  publicProfileSetText('publicProfileStatMissions',Object.keys(progress.claims).length);
  const earned = MEDAL_DEFINITIONS.filter(m=>Boolean(progress.badges[m.id]));
  const selected = saved.featuredBadges.filter(id=>progress.badges[id]);
  const featured = selected.length?selected:earned.slice(0,3).map(m=>m.id);
  const featuredBox=$('publicProfileFeatured'); featuredBox.replaceChildren();
  for(let i=0;i<3;i++){
    const medal=MEDAL_DEFINITIONS.find(m=>m.id===featured[i]);
    const cell=document.createElement('div'); cell.className='premium-featured-item';
    const ico=document.createElement('span'); ico.setAttribute('aria-hidden','true'); ico.textContent=medal?medal.icon:'🔒';
    cell.append(ico,document.createTextNode(medal?medal.title:'Vazio'));featuredBox.appendChild(cell);
  }
  publicProfileSetText('publicProfileMedalCount',`${earned.length}/${MEDAL_DEFINITIONS.length}`);
  const medalsBox=$('publicProfileMedals');medalsBox.replaceChildren();
  MEDAL_DEFINITIONS.forEach(m=>{
    const unlocked=Boolean(progress.badges[m.id]);
    const item=document.createElement('div');item.className=`public-medal ${unlocked?'is-earned':'is-locked'}`;
    const icon=document.createElement('span');icon.textContent=unlocked?m.icon:'🔒';icon.setAttribute('aria-hidden','true');
    const name=document.createElement('strong');name.textContent=m.title;
    const hint=document.createElement('small');hint.textContent=unlocked?`Conquistada · ${premiumDate(progress.badges[m.id])}`:m.detail;
    item.append(icon,name,hint);medalsBox.appendChild(item);
  });
  const online=(Date.now()-(Number(user.lastSeen)||0)) < 25000;
  publicProfileSetText('publicProfileDuelHint',online?'🟢 Jogador online: você pode enviar um desafio agora.':'⚪ Jogador offline: o convite só chega quando ambos estiverem com o site aberto.');
  $('publicProfileChallenge').disabled=Boolean(activeDuel);
  $('publicProfileChallenge').textContent=activeDuel?'⚔️ Termine seu duelo atual':'⚔️ Desafiar para duelo';
}
function challengeFromPublicProfile() {
  const key=publicProfileSelectedKey;
  if (!key || !users[key] || users[key]._deleted || key===currentUserKey) return;
  if (activeDuel) return alert('Finalize o duelo atual antes de iniciar outro.');
  if (!currentUserKey || !users[currentUserKey]) return alert('Entre em sua conta para desafiar um colega.');
  const select=$('duelOpponentSelect');
  if (!select) return;
  populateDuelOpponentList();
  select.value=key;
  if (select.value!==key) return alert('Não foi possível selecionar o colega. Atualize o Ranking.');
  closePublicProfile();
  sendLiveDuelInvite(); // usa o motor do duelo existente, inclusive o convite no WhatsApp
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-open-profile]');
  if (button) {event.preventDefault();openPublicProfile(button.dataset.profileKey);}
});
document.addEventListener('keydown',event=>{
  const modal=$('publicProfileModal');
  if (!modal || modal.classList.contains('hidden')) return;
  if(event.key==='Escape'){event.preventDefault();closePublicProfile();return;}
  if(event.key==='Tab'){
    const focusable=[...modal.querySelectorAll('button:not(:disabled)')].filter(el=>el.offsetParent!==null);
    if (!focusable.length) return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }
});
function renderLeaderboard() {
  const podiumContainer = $("podiumTop3Container");
  const container = $("leaderboardContainer");
  const rows = Object.entries(users).filter(([key,u]) => u && u.name && !u._deleted).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
  const list = rows.map(([,u]) => u);
  if (list.length === 0) {
    if (podiumContainer) podiumContainer.innerHTML = "";
    if (container) container.innerHTML = `<div class="p-6 text-center text-xs font-bold text-muted-pro subtle-box rounded-2xl border-dashed">Nenhum colaborador cadastrado ainda. Crie sua conta para estrear o Pódio!</div>`;
    return;
  }
  const first = list[0];
  const second = list[1] || null;
  const third = list[2] || null;
  if (podiumContainer) {
    podiumContainer.innerHTML = `
      <div class="flex flex-col items-center">
        ${second ? `
          <div class="mb-1">${renderAvatarBadge(safePublicAvatarValue(second.avatar), "w-11 h-11", "text-xl", "subtle-box border-2 border-slate-300")}</div>
          <p class="font-black text-[10px] text-center truncate w-full px-1">${escapePublicHtml(second.name)}</p>
          <span class="text-[10px] font-extrabold text-red-500">${second.xp || 0} XP</span>
          <button type="button" class="podium-profile-link" data-open-profile data-profile-key="${escapePublicHtml(rows[1][0])}" data-html2canvas-ignore="true">Ver perfil ↗</button>
          <div class="w-full h-16 mt-2 rounded-t-2xl bg-gradient-to-b from-slate-300 to-slate-400 text-slate-900 flex flex-col items-center justify-center font-black shadow-inner">
            <span class="text-lg">🥈</span>
            <span class="text-[10px]">2º Lugar</span>
          </div>
        ` : `<div class="w-full h-16 mt-10 rounded-t-2xl subtle-box opacity-40 flex items-center justify-center text-xs font-bold">2º</div>`}
      </div>
      <div class="flex flex-col items-center">
        <span class="text-lg mb-0.5 float-slow">👑 ☕</span>
        <div class="mb-1">${renderAvatarBadge(safePublicAvatarValue(first.avatar), "w-14 h-14", "text-2xl", "gold-gradient text-slate-950 border-2 border-white shadow-lg")}</div>
        <p class="font-black text-xs text-center truncate w-full px-1">${escapePublicHtml(first.name)}</p>
        <span class="text-[11px] font-black text-amber-500">${first.xp || 0} XP</span>
          <button type="button" class="podium-profile-link" data-open-profile data-profile-key="${escapePublicHtml(rows[0][0])}" data-html2canvas-ignore="true">Ver perfil ↗</button>
        <div class="w-full h-24 mt-2 rounded-t-2xl gold-gradient text-slate-950 flex flex-col items-center justify-center font-black shadow-lg border-t-2 border-white">
          <span class="text-2xl">🥇</span>
          <span class="text-[11px] uppercase tracking-wider">1º Lugar</span>
        </div>
      </div>
      <div class="flex flex-col items-center">
        ${third ? `
          <div class="mb-1">${renderAvatarBadge(safePublicAvatarValue(third.avatar), "w-11 h-11", "text-xl", "subtle-box border-2 border-amber-700/50")}</div>
          <p class="font-black text-[10px] text-center truncate w-full px-1">${escapePublicHtml(third.name)}</p>
          <span class="text-[10px] font-extrabold text-red-500">${third.xp || 0} XP</span>
          <button type="button" class="podium-profile-link" data-open-profile data-profile-key="${escapePublicHtml(rows[2][0])}" data-html2canvas-ignore="true">Ver perfil ↗</button>
          <div class="w-full h-14 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-600 to-amber-800 text-white flex flex-col items-center justify-center font-black shadow-inner">
            <span class="text-base">🥉</span>
            <span class="text-[10px]">3º Lugar</span>
          </div>
        ` : `<div class="w-full h-14 mt-12 rounded-t-2xl subtle-box opacity-40 flex items-center justify-center text-xs font-bold">3º</div>`}
      </div>
    `;
  }
  if (container) {
    const now = Date.now();
    container.innerHTML = list.map((u, idx) => {
      const medal = idx === 0 ? "🥇 ☕" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`;
      const info = getLevelInfo(u.xp || 0);
      const role = u.role || u.station || "Atendente";
      const isOnline = (now - (u.lastSeen || 0)) < 25000;
      const onlineDot = isOnline
        ? `<span class="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block ml-1 shadow-sm" title="Online agora"></span>`
        : `<span class="w-2.5 h-2.5 bg-slate-400/50 rounded-full inline-block ml-1" title="Offline"></span>`;
      return `
        <div class="rank-player-row flex items-center justify-between p-3.5 rounded-2xl ${idx === 0 ? 'bg-amber-500/15 border-2 border-amber-500/50 shadow-sm' : 'subtle-box'}">
          <div class="flex items-center gap-3">
            <span class="font-black text-xs w-7 text-center">${medal}</span>
            ${renderAvatarBadge(safePublicAvatarValue(u.avatar), "w-10 h-10", "text-xl", "pro-card")}
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <p class="font-black text-xs">${escapePublicHtml(u.name)} ${onlineDot}</p>
                <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 uppercase">${escapePublicHtml(role)}</span>
              </div>
              <p class="text-[10px] text-muted-pro font-bold mt-0.5">${info.title}</p>
            </div>
          </div>
          <div class="rank-player-actions">
            <span class="font-black text-xs text-red-500">${u.xp || 0} XP</span>
            <span class="block text-[10px] text-muted-pro font-semibold">${u.correctAnswers || 0} acertos</span>
            <button type="button" class="rank-profile-button" data-open-profile data-profile-key="${escapePublicHtml(rows[idx][0])}" data-html2canvas-ignore="true" aria-label="Ver perfil de ${escapePublicHtml(u.name)}">👁 Ver perfil</button>
          </div>
        </div>
      `;
    }).join("");
  }
}
function shareMyScoreWhatsApp() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey];
  const info = getLevelInfo(u.xp || 0);
  const copyUser = { ...u, avatar: isPhotoAvatar(u.avatar) ? "🍔" : (u.avatar || "🍔") };
  const encodedUser = btoa(encodeURIComponent(JSON.stringify(copyUser)));
  const syncUrl = `${window.location.origin}${window.location.pathname}?syncUser=${encodeURIComponent(encodedUser)}`;
  const text = `🏆 *OLIMPÍADAS DO BÁSICO — VENTURE (FINALIZA 25/10)*\n👤 Colaborador: *${u.name}*\n🎖️ Cargo: ${u.role || 'Atendente'}\n⚡ Pontuação: *${u.xp || 0} XP* (${info.title})\n✅ Acertos: ${u.correctAnswers || 0}\n\n🔗 *Link de Sincronia no Ranking:* ${syncUrl}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
// =========================================================================
// PAINEL ADM (SENHA: 342005)
// =========================================================================
function unlockAdminPanel() {
  const pass = $("adminPassInput").value.trim();
  const err = $("adminAuthError");
  if (pass === ADMIN_SECRET_PASS) {
    isAdminUnlocked = true;
    playHitSuccessSound();
    err.classList.add("hidden");
    $("adminLockScreen").classList.add("hidden");
    $("adminDashboard").classList.remove("hidden");
    renderAdminUsersList();
    fetchCloudHistorySafe(true);
  } else {
    playWrongAnswerSound();
    err.classList.remove("hidden");
  }
}
function lockAdminPanel() {
  playTabClickSound();
  isAdminUnlocked = false;
  $("adminPassInput").value = "";
  $("adminDashboard").classList.add("hidden");
  $("adminLockScreen").classList.remove("hidden");
}
function renderAdminUsersList() {
  const container = $("adminUsersList");
  const entries = Object.entries(users).filter(([k, u]) => u && u.name && !u._deleted).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
  $("adminStatsSummary").textContent = `Total: ${entries.length} colaborador(es) cadastrado(s)`;
  if (entries.length === 0) {
    container.innerHTML = `<p class="text-xs text-muted-pro text-center py-4 font-bold">Nenhum colaborador cadastrado.</p>`;
    return;
  }
  const now = Date.now();
  container.innerHTML = entries.map(([key, u], index) => {
    const lvl = getLevelInfo(u.xp || 0).level;
    const role = u.role || u.station || "Atendente";
    const isLocked = (u.heartsLockUntil || 0) > now;
    const heartsBadge = isLocked
      ? `<span class="text-[10px] font-bold text-red-500">⏳ Bloqueado (${formatTimeRemaining(u.heartsLockUntil - now)})</span>`
      : `<span class="text-[10px] font-bold text-emerald-500">${u.hearts !== undefined ? u.hearts : 5} ❤️ disponíveis</span>`;
    return `
      <div class="p-4 rounded-2xl subtle-box space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            ${renderAvatarBadge(u.avatar, "w-11 h-11", "text-2xl", "pro-card")}
            <div>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-[#FFC72C]">#${index + 1} • Nível ${lvl} • ${role}</span>
              <h4 class="font-black text-xs mt-1">${u.name}</h4>
              <p class="text-[11px] text-muted-pro font-semibold">🔑 Senha: <span class="font-extrabold">${u.password || '1234'}</span> • ${heartsBadge}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-black text-red-500">${u.xp || 0} XP</span>
            <span class="block text-[10px] text-muted-pro font-bold">${u.correctAnswers || 0} acertos</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-500/20">
          <button onclick="adminAdjustXp('${key}', 100)" class="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[10px] btn-tap">+100 XP</button>
          <button onclick="adminAdjustXp('${key}', 500)" class="px-2.5 py-1.5 rounded-xl bg-emerald-800 text-white font-black text-[10px] btn-tap">+500 XP</button>
          <button onclick="adminAdjustXp('${key}', -100)" class="px-2.5 py-1.5 rounded-xl bg-amber-600 text-white font-black text-[10px] btn-tap">-100 XP</button>
          <button onclick="adminSetCustomXp('${key}')" class="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-[10px] btn-tap">✏️ Definir XP</button>
          <button onclick="adminRestoreHearts('${key}')" class="px-2.5 py-1.5 rounded-xl bg-pink-600 text-white font-black text-[10px] btn-tap">❤️ Restaurar Vidas</button>
          <button onclick="adminResetUser('${key}')" class="px-2.5 py-1.5 rounded-xl bg-slate-500/20 font-bold text-[10px] btn-tap">Zerar</button>
          <button onclick="adminDeleteUser('${key}')" class="px-2.5 py-1.5 rounded-xl bg-red-500/20 text-red-500 font-bold text-[10px] ml-auto btn-tap">🗑️ Excluir</button>
        </div>
      </div>
    `;
  }).join("");
}
function adminRestoreHearts(key) {
  playHitSuccessSound();
  if (!users[key]) return;
  users[key].hearts = 5;
  users[key].heartsLockUntil = 0;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  if (key === currentUserKey) {
    setActiveHeartsState(5, 0);
    checkAndRenderCooldownScreen();
    loadNextQuizQuestion();
  }
  scheduleCloudSync(key, true);
  renderAdminUsersList();
}
function adminAdjustXp(key, delta) {
  if (!users[key]) return;
  const oldLevel = getLevelInfo(users[key].xp || 0).level;
  users[key].xp = Math.max(0, (users[key].xp || 0) + delta);
  const newLevel = getLevelInfo(users[key].xp || 0).level;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  if (newLevel > oldLevel) {
    playMcDonaldsJingle();
  } else if (delta > 0) {
    playHitSuccessSound();
  } else {
    playTabClickSound();
  }
  scheduleCloudSync(key, true);
}
function adminSetCustomXp(key) {
  playTabClickSound();
  if (!users[key]) return;
  const val = prompt(`Digite o novo valor exato de XP para ${users[key].name}:`, users[key].xp || 0);
  if (val === null) return;
  const parsed = parseInt(val, 10);
  if (!isNaN(parsed)) {
    const oldLevel = getLevelInfo(users[key].xp || 0).level;
    users[key].xp = Math.max(0, parsed);
    const newLevel = getLevelInfo(users[key].xp || 0).level;
    users[key].updatedAt = Date.now();
    users[key].adminOverrideAt = Date.now();
    if (newLevel > oldLevel) {
      playMcDonaldsJingle();
    } else {
      playHitSuccessSound();
    }
    scheduleCloudSync(key, true);
  }
}
function adminResetUser(key) {
  playTabClickSound();
  if (!users[key]) return;
  if (!confirm(`Zerar o XP e os acertos de ${users[key].name}?`)) return;
  users[key].xp = 0;
  users[key].correctAnswers = 0;
  users[key].quizStreak = 0;
  users[key].quizStreakUpdatedAt = Date.now();
  users[key].hearts = 5;
  users[key].heartsLockUntil = 0;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  scheduleCloudSync(key, true);
}
function adminDeleteUser(key) {
  playTabClickSound();
  if (!users[key]) return;
  if (!confirm(`Excluir permanentemente ${users[key].name} do Ranking?`)) return;
  users[key]._deleted = true;
  users[key].updatedAt = Date.now();
  users[key].adminOverrideAt = Date.now();
  scheduleCloudSync(key, true);
}
function adminSaveMember() {
  const name = $("admNewName").value.trim().toUpperCase();
  const role = $("admNewRole").value;
  const pass = $("admNewPass").value.trim() || "1234";
  const xp = parseInt($("admNewXp").value || "0", 10);
  const hits = parseInt($("admNewHits").value || "0", 10);
  if (!name) return alert("Digite o nome do colaborador!");
  const key = name.toLowerCase();
  users[key] = {
    name: name,
    role: role,
    _deleted: false,
    avatar: users[key]?.avatar || "🍔",
    password: pass,
    xp: Math.max(0, xp),
    correctAnswers: Math.max(0, hits),
    hearts: 5,
    heartsLockUntil: 0,
    mistakes: users[key]?.mistakes || [],
    quizStreak: users[key]?.quizStreak || 0,
    quizStreakUpdatedAt: users[key]?.quizStreakUpdatedAt || 0,
    missionProgress:users[key]?.missionProgress,
    profilePremium:users[key]?.profilePremium,
    trainerChallenges:users[key]?.trainerChallenges,
    duelRewards:users[key]?.duelRewards,
    lastSeen: Date.now(),
    updatedAt: Date.now(),
    adminOverrideAt: Date.now()
  };
  playHitSuccessSound();
  scheduleCloudSync(key, true);
  $("admNewName").value = "";
  $("admNewPass").value = "";
  $("admNewXp").value = "";
  $("admNewHits").value = "";
  alert(`Colaborador ${name} (${role}) salvo com sucesso!`);
}
function switchTrainingMode(mode) {
  const valid = ["kitchen", "review", "duel", "flash"];
  if (!valid.includes(mode)) return;
  valid.forEach(name => {
    const panel = $(`training-mode-${name}`);
    const btn = $(`training-nav-${name}`);
    if (panel) panel.classList.toggle("hidden", name !== mode);
    if (btn) {
      btn.classList.toggle("is-active", name === mode);
      btn.setAttribute("aria-pressed", String(name === mode));
    }
  });
}
function switchMainTab(tab) {
  const screens = ["quiz", "training", "missions", "prizes", "more", "profile", "book", "trainer", "admin", "updates"];
  if (!screens.includes(tab)) return;
  playTabClickSound();
  screens.forEach(name => {
    const screen = $(`tab-${name}`);
    if (screen) screen.classList.toggle("hidden", name !== tab);
  });
  const currentNav = ["profile", "book", "trainer", "admin", "updates"].includes(tab) ? "more" : tab;
  ["quiz", "training", "missions", "prizes", "more"].forEach(name => {
    const button = $(`nav-${name}`);
    if (!button) return;
    button.classList.toggle("active-nav", name === currentNav);
    if (name === currentNav) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (tab === "profile") renderPremiumProfile();
  if (tab === "prizes" || tab === "admin") fetchCloudHistorySafe(false);
  if (tab === "trainer") {renderTrainerCenter();fetchTrainerHistory(false);}
  if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "instant" });
}

// =========================================================================
// V8.5 — ATUALIZAÇÃO DE VERSÃO NO GITHUB PAGES (SEM APAGAR DADOS)
// =========================================================================
const APP_VERSION = "8.5";
const APP_UPDATE_INTERVAL_MS = 60000; // Github Pages é estático: checagem periódica, não push instantâneo.
const APP_UPDATE_IDLE_MS = 45000;
let availableAppUpdate = null;
let appUpdateChecking = false;
let appUpdateLastInteraction = Date.now();
let appUpdatePostponedUntil = 0;
let appUpdateFirstDetectedAt = 0;
function appVersionMessage(msg) {
  const target = $("appVersionStatus");
  if (target) target.textContent = msg;
}
function isAppUpdateUnsafe() {
  if (document.hidden || activeDuel || pendingDuelInvite) return true;
  const modals = ["duelInvitePopup", "duelArenaModal", "reviewMistakesModal", "publicProfileModal", "avatarPickerModal"];
  if (modals.some(id => {const el = $(id); return el && !el.classList.contains("hidden");})) return true;
  const input = document.activeElement;
  if (input && input.matches && input.matches("input, textarea, select, [contenteditable='true']") && input.getClientRects().length) return true;
  // Não atualiza automaticamente no meio de uma pergunta sem resposta.
  if ($("tab-quiz") && !$('tab-quiz').classList.contains("hidden") &&
      $("quizQuestionText")?.textContent.trim() && $("nextQuizBtn")?.classList.contains("hidden")) return true;
  // Evita perder respostas em formulários não enviados pelo treinador ou administrador.
  const drafts = document.querySelectorAll("#tab-trainer input, #tab-trainer textarea, #tab-admin input, #loginForm input, #registerForm input");
  if (Array.from(drafts).some(el => el.type !== "checkbox" && String(el.value).trim() && el.value !== el.defaultValue)) return true;
  if (currentRecipeStep > 0 && currentRecipeStep < activeRecipe.steps.length &&
      $("tab-training") && !$('tab-training').classList.contains("hidden") &&
      $("training-mode-kitchen") && !$('training-mode-kitchen').classList.contains("hidden")) return true;
  return Date.now() - appUpdateLastInteraction < APP_UPDATE_IDLE_MS;
}
function postponeAppUpdate() {
  appUpdatePostponedUntil = Date.now() + 10 * 60 * 1000;
  const banner = $("appUpdateBanner");
  if (banner) banner.classList.add("hidden");
  appVersionMessage("Nova versão disponível. Você pode atualizar quando quiser.");
}
function showAvailableAppUpdate(latest) {
  availableAppUpdate = latest;
  if (!appUpdateFirstDetectedAt) appUpdateFirstDetectedAt = Date.now();
  const label = $("appUpdateNewVersion");
  if (label) label.textContent = `v${latest}`;
  if (Date.now() >= appUpdatePostponedUntil) {
    const banner = $("appUpdateBanner");
    if (banner) banner.classList.remove("hidden");
  }
  appVersionMessage(`Nova versão v${latest} disponível. Atualize para receber as novidades.`);
}
async function checkForAppUpdate(manual = false) {
  if (appUpdateChecking || !navigator.onLine) {
    if (manual && !navigator.onLine) appVersionMessage("Sem internet. A versão será verificada quando a conexão voltar.");
    return;
  }
  appUpdateChecking = true;
  if (manual) appVersionMessage("Procurando nova versão...");
  const controller = new AbortController();
  const limit = setTimeout(() => controller.abort(), 9000);
  try {
    // Busca sem cache e com parâmetro único; funciona também em GitHub Pages /nome-do-repo/.
    const versionUrl = new URL("version.json", document.baseURI);
    versionUrl.searchParams.set("_check", String(Date.now()));
    const response = await fetch(versionUrl, {cache:"no-store", signal:controller.signal});
    if (!response.ok) throw new Error("version.json não encontrado (HTTP " + response.status + ")");
    const manifest = await response.json();
    const remoteVersion = typeof manifest.version === "string" ? manifest.version.trim() : "";
    if (!/^\d+\.\d+(?:\.\d+)?$/.test(remoteVersion)) throw new Error("Formato de versão inválido");
    if (remoteVersion === APP_VERSION) {
      if (manual) appVersionMessage(`✅ O aplicativo já está atualizado (v${APP_VERSION}).`);
      return;
    }
    // Confirma que o HTML do release já está publicado, evitando loops durante propagação do deploy.
    const pageUrl = new URL("index.html", document.baseURI);
    pageUrl.searchParams.set("_check", String(Date.now()));
    const pageResponse = await fetch(pageUrl, {cache:"no-store", signal:controller.signal});
    if (!pageResponse.ok) throw new Error("Publicação ainda não disponível");
    const remoteHtml = await pageResponse.text();
    const found = remoteHtml.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
    if (!found || found[1] !== remoteVersion) {
      if (manual) appVersionMessage("Nova publicação em andamento. Tente novamente em instantes.");
      return;
    }
    showAvailableAppUpdate(remoteVersion);
  } catch (err) {
    if (manual) appVersionMessage("Não foi possível verificar agora. Confira se version.json foi publicado no GitHub.");
  } finally {
    clearTimeout(limit);
    appUpdateChecking = false;
  }
}
function installLatestAppVersion() {
  if (!availableAppUpdate) return checkForAppUpdate(true);
  try {
    // Persistir snapshot antes de carregar novos arquivos, sem limpar nenhuma chave antiga.
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (_) {}
  // Evita recarga infinita se um servidor/CDN ainda responder com HTML antigo.
  try {
    sessionStorage.setItem("venture_last_update_attempt", JSON.stringify({version:availableAppUpdate,at:Date.now()}));
  } catch (_) {}
  const url = new URL(window.location.href);
  url.searchParams.set("app_v", availableAppUpdate);
  url.searchParams.set("_fresh", String(Date.now()));
  window.location.replace(url.href);
}
function maybeInstallAppUpdate() {
  if (!availableAppUpdate || Date.now() < appUpdatePostponedUntil || isAppUpdateUnsafe()) return;
  if (Date.now() - appUpdateFirstDetectedAt < 10000) return;
  try {
    const last = JSON.parse(sessionStorage.getItem("venture_last_update_attempt") || "null");
    if (last && last.version === availableAppUpdate && Date.now() - last.at < 120000) return;
  } catch (_) {}
  installLatestAppVersion();
}
function initAppAutoUpdater() {
  const installed = $("appInstalledVersion");
  if (installed) installed.textContent = APP_VERSION;
  const onUserAction = () => {appUpdateLastInteraction = Date.now();};
  document.addEventListener("pointerdown", onUserAction, {passive:true});
  document.addEventListener("keydown", onUserAction, {passive:true});
  document.addEventListener("touchstart", onUserAction, {passive:true});
  document.addEventListener("visibilitychange", () => {if (!document.hidden) {checkForAppUpdate();maybeInstallAppUpdate();}});
  window.addEventListener("focus", () => checkForAppUpdate());
  window.addEventListener("online", () => checkForAppUpdate());
  checkForAppUpdate();
  setInterval(() => {if (!document.hidden) checkForAppUpdate();}, APP_UPDATE_INTERVAL_MS);
  setInterval(maybeInstallAppUpdate, 5000);
}

window.onload = () => {
  initTheme();
  injectCountdownAndKitchenUI();
  renderMissionHub();
  rescuePreviousLocalRegistrations();
  restoreQuizStreak();
  renderAvatarSelector();
  syncActiveUserHeartsState();
  loadNextQuizQuestion();
  loadRandomFlashcard();
  renderBookList();
  refreshUIIfNeeded();
  if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
    $("authModal").classList.add("hidden");
    updateHeaderUI();
  }
  initClusterSync();
  startHeartbeat();
  fetchCloudHistorySafe(true);
  fetchTrainerHistory(true);
  renderTrainerPublicContent();
  initAppAutoUpdater();
};
