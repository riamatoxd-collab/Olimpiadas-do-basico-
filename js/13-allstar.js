/* Venture 9.2.0 · All Star Cozinha: treinamento e competição.
   Questões baseadas nos PDFs fornecidos pelo usuário. Nota/medalhas All Star não alteram XP oficial. */
(function () {
  "use strict";

  const TRACKS = [
    { id: "balcao", label: "Balcão e atendimento", icon: "🛎️", detail: "Comunicação, precisão dos pedidos e experiência do cliente." },
    { id: "drive", label: "Drive-Thru", icon: "🚗", detail: "Agilidade, confirmação do pedido e coordenação da equipe." },
    { id: "cozinha", label: "Cozinha", icon: "🍔", detail: "Padrões de montagem, qualidade, tempo e segurança alimentar." },
    { id: "sobremesas", label: "Sobremesas e quiosque", icon: "🍦", detail: "Padronização, higiene, apresentação e atendimento." }
  ];

  const AREAS = [
    { id: "cozinha", label: "Cozinha completa", icon: "🍳", detail: "Prova mista com questões de todas as estações disponíveis." },
    { id: "linha", label: "Linha", icon: "🥪", detail: "Higiene, tostagem, monitor e sequência de montagem." },
    { id: "chapas", label: "Chapas e carnes", icon: "🍔", detail: "Preparação, parâmetros do material e procedimentos de chapa." },
    { id: "mcfritas", label: "McFritas", icon: "🍟", detail: "Preparação, fritura, salga e manutenção da estação." },
    { id: "fritos", label: "Produtos fritos", icon: "🍗", detail: "Frango, nuggets, tortas e rotinas de fritura." }
  ];

  const QUESTIONS = [
    {
      "id": "BK-LIN-07",
      "area": "linha",
      "prompt": "Por quanto tempo devemos lavar as mãos?",
      "options": [
        "10 segundos",
        "15 segundos",
        "20 segundos",
        "30 segundos"
      ],
      "answer": 2,
      "explanation": "O book informa 20 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 7",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-08",
      "area": "linha",
      "prompt": "Qual é o primeiro passo na lavagem das mãos?",
      "options": [
        "Aplicar o sanitizante",
        "Molhar as mãos",
        "Secar as mãos",
        "Colocar as luvas"
      ],
      "answer": 1,
      "explanation": "O primeiro passo indicado é molhar as mãos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 8",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-09",
      "area": "linha",
      "prompt": "Qual é a frequência correta para lavagem das mãos?",
      "options": [
        "A cada 30 minutos",
        "A cada 1 hora",
        "A cada 2 horas",
        "Somente ao iniciar o turno"
      ],
      "answer": 1,
      "explanation": "O book indica lavagem a cada 1 hora.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 9",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-11",
      "area": "linha",
      "prompt": "Qual opção reúne padrões de higiene citados no book?",
      "options": [
        "Cabelos presos, unhas curtas e limpas, sem esmalte ou adornos e com redinha",
        "Cabelos soltos e unhas esmaltadas",
        "Somente usar avental",
        "Usar adornos se estiverem cobertos"
      ],
      "answer": 0,
      "explanation": "O book lista cabelos presos, unhas curtas, sem esmalte e limpas, barba feita, sem adornos e com redinha.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 11",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-12",
      "area": "linha",
      "prompt": "Qual é a compressão do pão e o tempo de tostagem indicados no book?",
      "options": [
        "Compressão 3, por 18 segundos",
        "Compressão 4, por 22 segundos",
        "Compressão 5, por 30 segundos",
        "Compressão 5D, por 22 segundos"
      ],
      "answer": 1,
      "explanation": "O book informa compressão 4 e tostagem por 22 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 12",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-17",
      "area": "linha",
      "prompt": "Qual é o tempo de reação do iniciador?",
      "options": [
        "De 1 a 2 segundos",
        "De 3 a 5 segundos",
        "De 10 a 15 segundos",
        "De 20 a 25 segundos"
      ],
      "answer": 1,
      "explanation": "O book indica de 3 a 5 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 17",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-18",
      "area": "linha",
      "prompt": "Qual pessoa da linha nunca pode sair da estação?",
      "options": [
        "A pessoa da condimentação",
        "A pessoa do iniciador",
        "A pessoa responsável pelas bebidas",
        "A pessoa do apoio"
      ],
      "answer": 1,
      "explanation": "O book identifica a pessoa do iniciador.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 18",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-19",
      "area": "linha",
      "prompt": "A partir de quantos sanduíches produzidos na hora devemos abrir o lado 2?",
      "options": [
        "75 sanduíches por hora",
        "100 sanduíches por hora",
        "125 sanduíches por hora",
        "150 sanduíches por hora"
      ],
      "answer": 2,
      "explanation": "O book indica 125 sanduíches na hora.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 19",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-20",
      "area": "linha",
      "prompt": "Em qual direção devem ficar a base e a coroa dos pães na linha?",
      "options": [
        "Base para a tostadeira e coroa para a UHC",
        "Base no sentido da UHC e coroa no sentido da tostadeira",
        "Base e coroa ambas no sentido da UHC",
        "A direção não importa"
      ],
      "answer": 1,
      "explanation": "O book indica base no sentido UHC e coroa no sentido da tostadeira.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 20",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-21",
      "area": "linha",
      "prompt": "Quantos pães podemos ativar por vez na tostadeira?",
      "options": [
        "1 pão",
        "2 pães",
        "4 pães",
        "6 pães"
      ],
      "answer": 1,
      "explanation": "O book indica 2 pães.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 21",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-22",
      "area": "linha",
      "prompt": "Quantos sanduíches podemos condimentar por vez?",
      "options": [
        "1 sanduíche",
        "2 sanduíches",
        "3 sanduíches",
        "4 sanduíches"
      ],
      "answer": 1,
      "explanation": "O book indica 2 sanduíches.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 22",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-25",
      "area": "linha",
      "prompt": "Quantos panos devemos ter na linha e para quais usos?",
      "options": [
        "2: um para chapa e outro para fritadeira",
        "3: um para tostadeira, um para mesa de condimentação e um para UHC",
        "4: dois para utensílios, um para área gordurosa e um para não gordurosa",
        "1 pano para toda a estação"
      ],
      "answer": 1,
      "explanation": "O book indica três panos com as finalidades descritas na alternativa correta.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 25",
      "sourceType": "book"
    },
    {
      "id": "BK-LIN-26",
      "area": "linha",
      "prompt": "Em quantos pedaços devemos cortar a carne Crispy da Salada Mix?",
      "options": [
        "De 2 a 3 pedaços",
        "De 4 a 5 pedaços",
        "De 5 a 7 pedaços",
        "De 8 a 10 pedaços"
      ],
      "answer": 2,
      "explanation": "O book indica de 5 a 7 pedaços.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 26",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-10",
      "area": "chapas",
      "prompt": "Quais EPIs são necessários para atuar na estação de chapa, segundo o book?",
      "options": [
        "Avental e mangote",
        "Casaco e luvas térmicas",
        "Touca e óculos de proteção",
        "Somente luvas descartáveis"
      ],
      "answer": 0,
      "explanation": "O book indica avental e mangote.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 10",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-13",
      "area": "chapas",
      "prompt": "Qual temperatura das UHCs para carnes vermelhas e brancas, respectivamente?",
      "options": [
        "85°C e 79°C",
        "79°C e 85°C",
        "79°C e 80°C",
        "85°C e 85°C"
      ],
      "answer": 1,
      "explanation": "O book indica 79°C para carnes vermelhas e 85°C para carnes brancas.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 13",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-14",
      "area": "chapas",
      "prompt": "Qual é o tempo de vida das carnes vermelhas na UHC?",
      "options": [
        "5 minutos",
        "8 minutos",
        "10 minutos",
        "15 minutos"
      ],
      "answer": 2,
      "explanation": "O book indica 10 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 14",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-34",
      "area": "chapas",
      "prompt": "Quais cores de pegadores são indicadas na linha e para quais carnes?",
      "options": [
        "Vermelho para carnes vermelhas com cebola; azul para vermelhas sem cebola; verde para carnes brancas",
        "Verde para vermelhas; azul para brancas; vermelho para nuggets",
        "Preto para vermelhas; bege para brancas; azul para tortas",
        "Vermelho para todas as carnes"
      ],
      "answer": 0,
      "explanation": "O book lista vermelho para carnes vermelhas com cebola, azul para vermelhas sem cebola e verde para carnes brancas.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 34",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-35",
      "area": "chapas",
      "prompt": "Qual procedimento devemos seguir logo após ativar as carnes na chapa?",
      "options": [
        "Lavar os utensílios",
        "Sanitizar as mãos",
        "Trocar o avental",
        "Desligar a chapa"
      ],
      "answer": 1,
      "explanation": "O book indica sanitizar as mãos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 35",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-37",
      "area": "chapas",
      "prompt": "Qual é o ângulo de raspagem da chapa?",
      "options": [
        "5°",
        "10°",
        "15°",
        "30°"
      ],
      "answer": 2,
      "explanation": "O book indica 15°.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 37",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-38",
      "area": "chapas",
      "prompt": "Qual é a direção indicada para ativar, salgar e remover as carnes?",
      "options": [
        "Da esquerda para a direita, do fundo para a frente",
        "Da direita para a esquerda, da frente para o fundo",
        "Do centro para as bordas em qualquer ordem",
        "Da frente para o fundo e depois da direita para a esquerda"
      ],
      "answer": 1,
      "explanation": "O book indica da direita para a esquerda, da frente para o fundo.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 38",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-39",
      "area": "chapas",
      "prompt": "Qual é o empilhamento máximo de carnes 10:1 na gaveta?",
      "options": [
        "1 carne",
        "2 carnes",
        "3 carnes",
        "4 carnes"
      ],
      "answer": 2,
      "explanation": "O book indica no máximo 3 carnes.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 39",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-40",
      "area": "chapas",
      "prompt": "Qual é o empilhamento máximo de carnes 4:1 na gaveta?",
      "options": [
        "1 carne; não empilhar carnes 4:1",
        "2 carnes",
        "3 carnes",
        "4 carnes"
      ],
      "answer": 0,
      "explanation": "O book informa uma carne e que não podemos empilhar carnes 4:1.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 40",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-41",
      "area": "chapas",
      "prompt": "Quantas carnes 10:1 podemos ativar no máximo em cada platen?",
      "options": [
        "4 carnes",
        "6 carnes",
        "8 carnes",
        "12 carnes"
      ],
      "answer": 1,
      "explanation": "O book indica 6 carnes.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 41",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-42",
      "area": "chapas",
      "prompt": "Quantas carnes 4:1 podemos ativar no máximo em cada platen?",
      "options": [
        "2 carnes",
        "4 carnes",
        "6 carnes",
        "8 carnes"
      ],
      "answer": 1,
      "explanation": "O book indica 4 carnes.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 42",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-43",
      "area": "chapas",
      "prompt": "Quantas carnes 4:1 podemos colocar no máximo em cada gaveta?",
      "options": [
        "2 carnes",
        "4 carnes",
        "6 carnes",
        "8 carnes"
      ],
      "answer": 1,
      "explanation": "O book indica 4 carnes.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 43",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-44",
      "area": "chapas",
      "prompt": "Quantas carnes 10:1 podemos colocar no máximo em cada gaveta?",
      "options": [
        "6 carnes",
        "8 carnes",
        "10 carnes",
        "12 carnes"
      ],
      "answer": 3,
      "explanation": "O book indica 12 carnes.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 44",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-45",
      "area": "chapas",
      "prompt": "Quantas fatias de bacon podemos ativar por vez em cada platen?",
      "options": [
        "3 fatias",
        "4 fatias",
        "6 fatias",
        "8 fatias"
      ],
      "answer": 2,
      "explanation": "O book indica 6 fatias.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 45",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-46",
      "area": "chapas",
      "prompt": "Qual pegador devemos usar para ativar as carnes brancas?",
      "options": [
        "Vermelho",
        "Azul",
        "Verde",
        "Preto"
      ],
      "answer": 3,
      "explanation": "O book indica o pegador preto.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 46",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-117",
      "area": "chapas",
      "prompt": "Quantos panos devemos ter na área de chapa e para que servem?",
      "options": [
        "3: um para chapa, um para UHC e um para tostadeira",
        "4: dois para utensílios, um para área gordurosa e um para áreas não gordurosas",
        "2: um para tudo e outro reserva",
        "5: três para utensílios e dois para inox"
      ],
      "answer": 1,
      "explanation": "O book indica quatro panos: dois para utensílios, um para área gordurosa e um para áreas não gordurosas.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 117",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-118",
      "area": "chapas",
      "prompt": "Qual é o tempo de remoção das carnes?",
      "options": [
        "10 segundos",
        "15 segundos",
        "18 segundos",
        "25 segundos"
      ],
      "answer": 2,
      "explanation": "O book indica 18 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 118",
      "sourceType": "book"
    },
    {
      "id": "BK-CHA-133",
      "area": "chapas",
      "prompt": "Quais são as temperaturas dos platens superior e inferior e o tempo de aquecimento das chapas?",
      "options": [
        "Superior 218°C, inferior 177°C e aquecimento de 45 minutos",
        "Superior 177°C, inferior 218°C e aquecimento de 30 minutos",
        "Ambos 200°C e aquecimento de 15 minutos",
        "Superior 271°C, inferior 254°C e aquecimento de 60 minutos"
      ],
      "answer": 0,
      "explanation": "O book indica platen superior a 218°C, inferior a 177°C e aquecimento por 45 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 133",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-68",
      "area": "mcfritas",
      "prompt": "Qual é a temperatura do óleo para McFritas?",
      "options": [
        "150°C",
        "168°C",
        "180°C",
        "190°C"
      ],
      "answer": 1,
      "explanation": "O book indica 168°C.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 68",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-70",
      "area": "mcfritas",
      "prompt": "Qual é o tempo de fritura para McFritas?",
      "options": [
        "2 minutos e 30 segundos",
        "3 minutos e 10 segundos",
        "3 minutos e 15 segundos",
        "6 minutos"
      ],
      "answer": 1,
      "explanation": "O book indica 3 minutos e 10 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 70",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-71",
      "area": "mcfritas",
      "prompt": "Qual é o Duty para McFritas?",
      "options": [
        "15 segundos",
        "20 segundos",
        "30 segundos",
        "45 segundos"
      ],
      "answer": 2,
      "explanation": "O book indica 30 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 71",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-72",
      "area": "mcfritas",
      "prompt": "Qual é o tempo de vida das McFritas depois de prontas?",
      "options": [
        "3 minutos",
        "5 minutos",
        "7 minutos",
        "10 minutos"
      ],
      "answer": 2,
      "explanation": "O book indica 7 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 72",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-73",
      "area": "mcfritas",
      "prompt": "Quantas gramas de sal o saleiro das McFritas dispensa?",
      "options": [
        "2 gramas",
        "4 gramas",
        "6 gramas",
        "8 gramas"
      ],
      "answer": 1,
      "explanation": "O book indica 4 gramas.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 73",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-75",
      "area": "mcfritas",
      "prompt": "Quantos panos devemos manter na estação de McFritas?",
      "options": [
        "1 pano",
        "2 panos",
        "3 panos",
        "4 panos"
      ],
      "answer": 1,
      "explanation": "O book indica 2 panos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 75",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-129",
      "area": "mcfritas",
      "prompt": "A que altura devemos segurar o saleiro das McFritas?",
      "options": [
        "10 cm",
        "15 cm",
        "20 cm",
        "30 cm"
      ],
      "answer": 2,
      "explanation": "O book indica 20 cm.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 129",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-131",
      "area": "mcfritas",
      "prompt": "Quais são os pesos das McFritas P, M e G, respectivamente?",
      "options": [
        "73 g, 102 g e 146 g",
        "70 g, 100 g e 140 g",
        "75 g, 105 g e 150 g",
        "80 g, 110 g e 160 g"
      ],
      "answer": 0,
      "explanation": "O book indica 73 g, 102 g e 146 g, respectivamente.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 131",
      "sourceType": "book"
    },
    {
      "id": "BK-FRI-132",
      "area": "mcfritas",
      "prompt": "Quantas vezes devemos misturar as McFritas após salgá-las?",
      "options": [
        "Uma vez",
        "De 2 a 3 vezes",
        "De 4 a 5 vezes",
        "Não é necessário misturar"
      ],
      "answer": 1,
      "explanation": "O book indica de 2 a 3 vezes para distribuir o sal por igual.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 132",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-15",
      "area": "fritos",
      "prompt": "Qual é o tempo de vida na UHC indicado para carnes brancas?",
      "options": [
        "Crispy 60 min; Chicken 30 min; Junior e Nuggets 20 min",
        "Crispy 30 min; Chicken 60 min; Junior e Nuggets 10 min",
        "Todos os produtos 20 min",
        "Todos os produtos 60 min"
      ],
      "answer": 0,
      "explanation": "O book indica Crispy 60 minutos, Chicken 30 minutos, Junior e Nuggets 20 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 1, questão 15",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-47",
      "area": "fritos",
      "prompt": "Para que serve o pegador bege sem dentes nos produtos fritos?",
      "options": [
        "Para aplicar sal",
        "Para auxiliar a remoção das carnes dos cestos",
        "Para ativar carnes na chapa",
        "Para transportar pão"
      ],
      "answer": 1,
      "explanation": "O book indica que ele auxilia a remoção das carnes dos cestos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 47",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-48",
      "area": "fritos",
      "prompt": "Quais são as rodadas máximas para ativar carnes brancas e tortas?",
      "options": [
        "McChicken e Chicken Jr 6; Crispy 4; Nuggets 24; tortas 16",
        "McChicken e Chicken Jr 4; Crispy 6; Nuggets 16; tortas 24",
        "Todos os produtos 6 unidades",
        "McChicken 8; Crispy 8; Nuggets 12; tortas 12"
      ],
      "answer": 0,
      "explanation": "O book indica McChicken e Chicken Jr 6 carnes, Crispy 4 carnes, Nuggets 24 bolinhas e tortas 16 unidades.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 48",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-49",
      "area": "fritos",
      "prompt": "Qual é o tempo de resfriamento das tortas?",
      "options": [
        "10 minutos",
        "15 minutos",
        "20 minutos",
        "30 minutos"
      ],
      "answer": 2,
      "explanation": "O book indica 20 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 49",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-50",
      "area": "fritos",
      "prompt": "Qual é o tempo de fritura das tortas?",
      "options": [
        "3 minutos",
        "4 minutos",
        "6 minutos",
        "8 minutos"
      ],
      "answer": 2,
      "explanation": "O book indica 6 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 50",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-51",
      "area": "fritos",
      "prompt": "Qual é o tempo de vida das tortas prontas?",
      "options": [
        "30 minutos",
        "1 hora",
        "2 horas",
        "4 horas"
      ],
      "answer": 2,
      "explanation": "O book indica 2 horas.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 51",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-52",
      "area": "fritos",
      "prompt": "Quais são os dois sistemas de ativada que podemos usar nos produtos fritos?",
      "options": [
        "Manutenção e Recuperação",
        "Treinamento e Competição",
        "Rápido e Lento",
        "Contínuo e Intermitente"
      ],
      "answer": 0,
      "explanation": "O book indica Manutenção e Recuperação.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 52",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-53",
      "area": "fritos",
      "prompt": "Por quanto tempo as carnes devem escorrer sobre o óleo antes de ir para a gaveta?",
      "options": [
        "1 a 3 segundos",
        "5 a 10 segundos",
        "15 a 20 segundos",
        "30 segundos"
      ],
      "answer": 1,
      "explanation": "O book indica de 5 a 10 segundos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 53",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-67",
      "area": "fritos",
      "prompt": "Qual é a temperatura do óleo para carnes brancas e tortas?",
      "options": [
        "168°C",
        "175°C",
        "180°C",
        "190°C"
      ],
      "answer": 2,
      "explanation": "O book indica 180°C.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 67",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-69",
      "area": "fritos",
      "prompt": "Qual é o tempo de fritura indicado para carnes brancas?",
      "options": [
        "McChicken, Chicken Jr e Nuggets 3 min 15 s; Crispy e tortas 6 min",
        "Todos os produtos 3 min 10 s",
        "McChicken 6 min; tortas 3 min 15 s",
        "Todos os produtos 2 min"
      ],
      "answer": 0,
      "explanation": "O book indica 3 min e 15 s para McChicken, Chicken Jr e Nuggets; Crispy e tortas, 6 minutos.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 69",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-74",
      "area": "fritos",
      "prompt": "Quais EPIs devemos usar para operar as estações de McFritas e Produtos Fritos?",
      "options": [
        "Avental e mangote",
        "Casaco e balaclava",
        "Somente luvas",
        "Óculos e protetor auricular"
      ],
      "answer": 0,
      "explanation": "O book indica avental e mangote.",
      "source": "Book Olimpíadas de Básico — Venture, p. 2, questão 74",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-123",
      "area": "fritos",
      "prompt": "Qual é o percentual máximo de compostos polares aceitável para a gordura?",
      "options": [
        "12%",
        "18%",
        "24%",
        "30%"
      ],
      "answer": 2,
      "explanation": "O book indica 24%.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 123",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-124",
      "area": "fritos",
      "prompt": "Quais são sinais de decomposição do óleo citados no book?",
      "options": [
        "Espuma amarelada, cheiro forte e ácido, cor escura e fumaça excessiva",
        "Somente mudança de temperatura",
        "Somente bolhas pequenas",
        "Óleo claro e sem odor"
      ],
      "answer": 0,
      "explanation": "O book lista espuma amarelada, cheiro forte e ácido, cor escura e fumaça excessiva.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 124",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-125",
      "area": "fritos",
      "prompt": "Quais são os seis inimigos do óleo?",
      "options": [
        "Sal, ar, água, altas temperaturas, resíduos de carbono e detergente",
        "Sal, açúcar, gelo, ar, papel e plástico",
        "Água, gelo, farinha, sal, vapor e detergente",
        "Ar, óleo novo, sal, papel, água e açúcar"
      ],
      "answer": 0,
      "explanation": "O book lista sal, ar, água, altas temperaturas, resíduos de carbono e detergente.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 125",
      "sourceType": "book"
    },
    {
      "id": "BK-PFR-134",
      "area": "fritos",
      "prompt": "Qual é a temperatura e o tempo de congelamento dos congeladores portáteis?",
      "options": [
        "De -18 a -23°C e 45 minutos",
        "De 1 a 4°C e 30 minutos",
        "De -5 a -10°C e 60 minutos",
        "De -18 a -23°C e 15 minutos"
      ],
      "answer": 0,
      "explanation": "O book indica de -18 a -23°C e 45 minutos de congelamento.",
      "source": "Book Olimpíadas de Básico — Venture, p. 5, questão 134",
      "sourceType": "book"
    }
  ];

  const state = { area: "cozinha", mode: "study", session: null };
  const byId = function (id) { return document.getElementById(id); };
  const getUser = function () {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined" || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const getTrack = function (id) { return TRACKS.find(function (track) { return track.id === id; }) || TRACKS[0]; };
  const getArea = function (id) { return AREAS.find(function (area) { return area.id === id; }) || AREAS[0]; };
  const escapeHtml = function (value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  const questionsFor = function (areaId) {
    return QUESTIONS.filter(function (question) { return areaId === "cozinha" || question.area === areaId; });
  };
  const shuffle = function (items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i]; result[i] = result[j]; result[j] = temp;
    }
    return result;
  };
  function saveUser(sync) {
    const user = getUser();
    if (!user) return;
    user.updatedAt = Date.now();
    try {
      if (typeof STORAGE_USERS_KEY !== "undefined") localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (_) {}
    if (typeof scheduleCloudSync === "function" && typeof currentUserKey !== "undefined") scheduleCloudSync(currentUserKey, sync === true);
  }
  function getProgress(user, areaId) {
    const allstar = user && user.ventureAllStar && typeof user.ventureAllStar === "object" ? user.ventureAllStar : {};
    const progress = allstar.progress && typeof allstar.progress === "object" ? allstar.progress : {};
    return progress[areaId] && typeof progress[areaId] === "object" ? progress[areaId] : { trainingAttempts: 0, challengeAttempts: 0, bestTrainingScore: 0, bestChallengeScore: 0, lastScore: null, lastMode: "", lastAt: 0 };
  }
  function getProgressSummary() {
    const user = getUser();
    if (!user) return { trainingAttempts: 0, challengeAttempts: 0, bestTrainingScore: 0, bestChallengeScore: 0, lastScore: null };
    const current = getProgress(user, state.area);
    return current;
  }
  function render() {
    const root = byId("ventureAllStar");
    if (!root) return;
    const user = getUser();
    const saved = user && user.ventureAllStar && typeof user.ventureAllStar === "object" ? user.ventureAllStar : {};
    const selectedTrack = saved.preferredTrack || "";
    const trackList = byId("ventureAllStarTracks");
    const status = byId("ventureAllStarStatus");
    const assessment = byId("ventureAllStarAssessmentCount");
    const currentLeague = byId("ventureAllStarLeague");
    if (trackList) {
      Array.from(trackList.querySelectorAll("[data-allstar-track]")).forEach(function (button) {
        const active = button.dataset.allstarTrack === selectedTrack;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    if (status) {
      if (!user) status.textContent = "Entre na sua conta para salvar seu progresso All Star.";
      else if (selectedTrack) status.textContent = "Sua trilha de foco: " + getTrack(selectedTrack).label + ". A escolha pode ser alterada a qualquer momento.";
      else status.textContent = "Escolha sua trilha de foco e depois selecione uma estação da Cozinha.";
    }
    if (assessment) {
      const records = user && user.ventureAllStar && Array.isArray(user.ventureAllStar.history) ? user.ventureAllStar.history.length : 0;
      assessment.textContent = user ? String(records) : "—";
    }
    if (currentLeague) {
      const league = window.VentureLeagues && user ? window.VentureLeagues.getDivision(user) : null;
      currentLeague.textContent = league ? league.icon + " Liga " + league.name : "Entre na conta";
    }
    renderAreaControls();
    renderProgress();
    renderQuiz();
  }
  function renderAreaControls() {
    const areaList = byId("ventureAllStarAreas");
    if (areaList) {
      Array.from(areaList.querySelectorAll("[data-allstar-area]")).forEach(function (button) {
        const active = button.dataset.allstarArea === state.area;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    const modeList = byId("ventureAllStarModes");
    if (modeList) {
      Array.from(modeList.querySelectorAll("[data-allstar-mode]")).forEach(function (button) {
        const active = button.dataset.allstarMode === state.mode;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
  }
  function renderProgress() {
    const box = byId("ventureAllStarProgress");
    if (!box) return;
    const user = getUser();
    if (!user) {
      box.innerHTML = '<div class="vas-progress-empty">Entre na sua conta para guardar notas, tentativas e evolução entre dispositivos.</div>';
      return;
    }
    const progress = getProgressSummary();
    const best = state.mode === "challenge" ? progress.bestChallengeScore : progress.bestTrainingScore;
    const attempts = state.mode === "challenge" ? progress.challengeAttempts : progress.trainingAttempts;
    const modeLabel = state.mode === "challenge" ? "provas" : "treinos";
    box.innerHTML = '<div class="vas-progress-card"><div><span>Melhor nota em ' + modeLabel + '</span><strong>' + (best || 0) + '%</strong></div><div><span>' + (state.mode === "challenge" ? "Provas concluídas" : "Treinos concluídos") + '</span><strong>' + attempts + '</strong></div><div><span>Última nota</span><strong>' + (progress.lastScore == null ? "—" : progress.lastScore + "%") + '</strong></div></div>';
  }
  function renderQuiz() {
    const box = byId("ventureAllStarQuiz");
    if (!box) return;
    const area = getArea(state.area);
    if (!state.session) {
      const count = questionsFor(state.area).length;
      const modeLabel = state.mode === "study" ? "Treinamento guiado" : "Prova competitiva";
      const modeCopy = state.mode === "study" ? "Responda uma questão por vez. Após cada resposta, veja o gabarito, a explicação e a página de origem." : "A prova não mostra o gabarito durante as respostas. Ao finalizar, você verá a nota, as respostas corretas e as fontes.";
      const questionCount = state.mode === "challenge" ? Math.min(10, count) : count;
      box.innerHTML = '<div class="vas-quiz-intro"><div class="vas-quiz-kicker">' + escapeHtml(area.icon + " " + modeLabel) + '</div><h3>' + escapeHtml(area.label) + '</h3><p>' + escapeHtml(area.detail) + '</p><div class="vas-quiz-facts"><span><strong>' + questionCount + '</strong> questões nesta sessão</span><span><strong>0 XP</strong> concedido por esta atividade</span></div><p class="vas-quiz-copy">' + escapeHtml(modeCopy) + '</p><button class="vas-primary" type="button" data-allstar-action="start">Começar ' + (state.mode === "study" ? "treino" : "prova") + ' <span aria-hidden="true">→</span></button></div>';
      return;
    }
    const session = state.session;
    if (session.completed) {
      renderResult(box, session);
      return;
    }
    const question = session.questions[session.index];
    const selected = session.answers[session.index];
    const answered = selected !== null && selected !== undefined;
    const total = session.questions.length;
    const answeredCount = session.answers.filter(function (value) { return value !== null && value !== undefined; }).length;
    const percent = Math.round(((session.index + 1) / total) * 100);
    let optionsHtml = "";
    question.options.forEach(function (option, index) {
      const isSelected = selected === index;
      let className = "vas-answer";
      if (session.mode === "study" && answered && index === question.answer) className += " is-correct";
      else if (session.mode === "study" && answered && isSelected && index !== question.answer) className += " is-wrong";
      else if (session.mode === "challenge" && isSelected) className += " is-selected";
      optionsHtml += '<button class="' + className + '" type="button" data-allstar-answer="' + index + '"' + (session.mode === "study" && answered ? " disabled" : "") + '><span class="vas-answer-letter">' + String.fromCharCode(65 + index) + '</span><span>' + escapeHtml(option) + '</span>' + (session.mode === "study" && answered && index === question.answer ? '<span class="vas-answer-check" aria-hidden="true">✓</span>' : "") + '</button>';
    });
    let feedbackHtml = "";
    if (session.mode === "study" && answered) {
      feedbackHtml = '<div class="vas-feedback ' + (selected === question.answer ? "is-correct" : "is-wrong") + '"><strong>' + (selected === question.answer ? "Resposta correta!" : "Vamos revisar esse ponto.") + '</strong><p>' + escapeHtml(question.explanation) + '</p><small>Fonte: ' + escapeHtml(question.source) + '</small></div>';
    }
    const navBack = session.index > 0 && session.mode === "challenge" ? '<button type="button" class="vas-secondary" data-allstar-nav="prev">Anterior</button>' : "";
    let nextLabel = "";
    if (session.mode === "study") nextLabel = session.index === total - 1 ? "Concluir treino" : "Próxima questão";
    else nextLabel = session.index === total - 1 ? "Finalizar prova" : "Próxima questão";
    const canAdvance = session.mode === "study" ? answered : answered;
    const nextAction = session.index === total - 1 ? "finish" : "next";
    const challengeStatus = session.mode === "challenge" ? '<p class="vas-quiz-copy">Respostas registradas: ' + answeredCount + ' de ' + total + '. O gabarito aparece apenas ao finalizar.</p>' : "";
    const sourceLabel = session.mode === "study" ? escapeHtml(question.source) : "Fonte revelada na revisão final";
    box.innerHTML = '<div class="vas-question-card"><div class="vas-question-top"><span>' + escapeHtml(area.icon + " " + area.label) + '</span><span>Questão ' + (session.index + 1) + ' de ' + total + '</span></div><div class="vas-progress-track"><span style="width:' + percent + '%"></span></div><div class="vas-question-meta">' + sourceLabel + '</div><h3>' + escapeHtml(question.prompt) + '</h3><div class="vas-answers">' + optionsHtml + '</div>' + feedbackHtml + challengeStatus + '<div class="vas-question-nav">' + navBack + '<button type="button" class="vas-primary" data-allstar-nav="' + nextAction + '"' + (!canAdvance ? " disabled" : "") + '>' + nextLabel + ' <span aria-hidden="true">→</span></button></div></div>';
  }
  function renderResult(box, session) {
    const correct = session.answers.reduce(function (sum, value, index) { return sum + (value === session.questions[index].answer ? 1 : 0); }, 0);
    const total = session.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = session.mode === "challenge" && score >= 80;
    const heading = session.mode === "study" ? "Treino concluído" : (passed ? "Meta do simulado atingida!" : "Prova concluída");
    const copy = session.mode === "study" ? "Revise as explicações e pratique novamente para consolidar o conteúdo." : (passed ? "Você atingiu a meta sugerida de 80% neste simulado do Venture." : "Use a revisão abaixo para identificar os assuntos que precisam de mais treino.");
    let review = "";
    session.questions.forEach(function (question, index) {
      const selected = session.answers[index];
      const isCorrect = selected === question.answer;
      review += '<div class="vas-review-item ' + (isCorrect ? "is-correct" : "is-wrong") + '"><div><strong>' + (isCorrect ? "✓ " : "↺ ") + escapeHtml(question.id + " · " + question.prompt) + '</strong><p>Sua resposta: ' + escapeHtml(selected == null ? "Não respondida" : question.options[selected]) + '</p>' + (!isCorrect ? '<p>Resposta correta: ' + escapeHtml(question.options[question.answer]) + '</p>' : "") + '<small>' + escapeHtml(question.source) + '</small></div></div>';
    });
    box.innerHTML = '<div class="vas-result-card"><div class="vas-result-medal">' + (passed ? "🏆" : "⭐") + '</div><div class="vas-quiz-kicker">' + (session.mode === "study" ? "RESULTADO DO TREINO" : "RESULTADO DA PROVA") + '</div><h3>' + heading + '</h3><div class="vas-score">' + score + '<span>%</span></div><p>' + correct + ' de ' + total + ' respostas corretas. ' + escapeHtml(copy) + '</p><div class="vas-result-facts"><span><strong>' + correct + '/' + total + '</strong> acertos</span><span><strong>0 XP</strong> concedido</span><span><strong>' + (passed ? "Meta atingida" : "Revisão disponível") + '</strong> resultado Venture</span></div><div class="vas-review"><h4>Revisão das respostas</h4>' + review + '</div><div class="vas-question-nav"><button class="vas-secondary" type="button" data-allstar-action="home">Voltar às estações</button><button class="vas-primary" type="button" data-allstar-action="restart">Tentar novamente ↻</button></div><p class="vas-quiz-copy">A meta de 80% é uma regra sugerida para o simulado do Venture, não uma certificação ou resultado oficial da competição All Star.</p></div>';
  }
  function startSession() {
    const pool = questionsFor(state.area);
    if (!pool.length) return;
    const chosen = state.mode === "challenge" ? shuffle(pool).slice(0, Math.min(10, pool.length)) : pool.slice();
    state.session = { area: state.area, mode: state.mode, questions: chosen, index: 0, answers: chosen.map(function () { return null; }), completed: false, startedAt: Date.now() };
    renderQuiz();
  }
  function recordResult(session, correct, total, score) {
    const user = getUser();
    if (!user) return;
    if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
    const allstar = user.ventureAllStar;
    if (!allstar.progress || typeof allstar.progress !== "object") allstar.progress = {};
    const progress = getProgress(user, session.area);
    if (session.mode === "challenge") {
      progress.challengeAttempts = (Number(progress.challengeAttempts) || 0) + 1;
      progress.bestChallengeScore = Math.max(Number(progress.bestChallengeScore) || 0, score);
    } else {
      progress.trainingAttempts = (Number(progress.trainingAttempts) || 0) + 1;
      progress.bestTrainingScore = Math.max(Number(progress.bestTrainingScore) || 0, score);
    }
    progress.lastScore = score;
    progress.lastMode = session.mode;
    progress.lastAt = Date.now();
    allstar.progress[session.area] = progress;
    if (!Array.isArray(allstar.history)) allstar.history = [];
    allstar.history.push({ id: "allstar-" + Date.now() + "-" + Math.floor(Math.random() * 1000000), area: session.area, mode: session.mode, correct: correct, total: total, score: score, startedAt: session.startedAt, completedAt: Date.now(), xpAwarded: 0 });
    allstar.history = allstar.history.slice(-30);
    saveUser(false);
    if (window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
      window.VentureNotifications.addForUser(currentUserKey, session.mode === "challenge" ? "Prova All Star concluída" : "Treino All Star concluído", "Resultado: " + score + "% em " + getArea(session.area).label + ". Nenhum XP oficial foi alterado.", "allstar", "allstar-result:" + allstar.history[allstar.history.length - 1].id);
    }
  }
  function finishSession() {
    if (!state.session || state.session.completed) return;
    const session = state.session;
    const correct = session.answers.reduce(function (sum, value, index) { return sum + (value === session.questions[index].answer ? 1 : 0); }, 0);
    const total = session.questions.length;
    const score = Math.round((correct / total) * 100);
    session.completed = true;
    session.correct = correct;
    session.score = score;
    recordResult(session, correct, total, score);
    renderProgress();
    renderQuiz();
    render();
  }
  function selectArea(areaId) {
    if (!AREAS.some(function (area) { return area.id === areaId; })) return;
    state.area = areaId;
    state.session = null;
    const user = getUser();
    if (user) {
      if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
      user.ventureAllStar.selectedArea = areaId;
      saveUser(false);
    }
    renderAreaControls();
    renderProgress();
    renderQuiz();
  }
  function setMode(modeId) {
    if (modeId !== "study" && modeId !== "challenge") return;
    state.mode = modeId;
    state.session = null;
    renderAreaControls();
    renderProgress();
    renderQuiz();
  }
  function setTrack(trackId) {
    const user = getUser();
    if (!user) { alert("Entre na sua conta para escolher sua trilha All Star."); return; }
    const track = getTrack(trackId);
    if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
    const previous = user.ventureAllStar.preferredTrack;
    user.ventureAllStar.preferredTrack = track.id;
    user.ventureAllStar.updatedAt = Date.now();
    saveUser(false);
    if (!previous && window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
      window.VentureNotifications.addForUser(currentUserKey, "Trilha All Star escolhida", "Sua preparação começa por " + track.label + ".", "allstar", "allstar-track:" + track.id);
    }
    render();
  }
  function handleClick(event) {
    const trackButton = event.target.closest("[data-allstar-track]");
    if (trackButton) { setTrack(trackButton.dataset.allstarTrack); return; }
    const areaButton = event.target.closest("[data-allstar-area]");
    if (areaButton) { selectArea(areaButton.dataset.allstarArea); return; }
    const modeButton = event.target.closest("[data-allstar-mode]");
    if (modeButton) { setMode(modeButton.dataset.allstarMode); return; }
    const answerButton = event.target.closest("[data-allstar-answer]");
    if (answerButton) {
      if (!state.session || state.session.completed) return;
      const session = state.session;
      const index = Number(answerButton.dataset.allstarAnswer);
      if (!Number.isInteger(index) || index < 0 || index >= session.questions[session.index].options.length) return;
      if (session.mode === "study" && session.answers[session.index] !== null) return;
      session.answers[session.index] = index;
      renderQuiz();
      return;
    }
    const navButton = event.target.closest("[data-allstar-nav]");
    if (navButton) {
      if (!state.session || state.session.completed) return;
      const session = state.session;
      const action = navButton.dataset.allstarNav;
      if (action === "prev") { session.index = Math.max(0, session.index - 1); renderQuiz(); return; }
      if (action === "next") {
        if (session.answers[session.index] === null) return;
        session.index = Math.min(session.questions.length - 1, session.index + 1);
        renderQuiz();
        return;
      }
      if (action === "finish") {
        if (session.answers[session.index] === null && session.mode === "study") return;
        finishSession();
        return;
      }
    }
    const actionButton = event.target.closest("[data-allstar-action]");
    if (actionButton) {
      const action = actionButton.dataset.allstarAction;
      if (action === "start") startSession();
      else if (action === "restart") startSession();
      else if (action === "home") { state.session = null; renderQuiz(); }
    }
  }
  function init() {
    const root = byId("ventureAllStar");
    if (!root) return;
    const user = getUser();
    if (user && user.ventureAllStar && AREAS.some(function (area) { return area.id === user.ventureAllStar.selectedArea; })) state.area = user.ventureAllStar.selectedArea;
    root.addEventListener("click", handleClick);
    render();
    const oldHeader = typeof updateHeaderUI === "function" ? updateHeaderUI : null;
    if (oldHeader && !oldHeader.__ventureAllStarWrapped) {
      const wrapped = function () { const result = oldHeader.apply(this, arguments); render(); return result; };
      wrapped.__ventureAllStarWrapped = true;
      updateHeaderUI = wrapped;
    }
    const oldLeagueRender = window.refreshVentureMonthlyLeague;
    if (typeof oldLeagueRender === "function" && !oldLeagueRender.__ventureAllStarWrapped) {
      const wrapped = function () { const result = oldLeagueRender.apply(this, arguments); render(); return result; };
      wrapped.__ventureAllStarWrapped = true;
      window.refreshVentureMonthlyLeague = wrapped;
    }
  }
  window.VentureAllStar = { tracks: TRACKS, areas: AREAS, questions: QUESTIONS, render: render, setTrack: setTrack, selectArea: selectArea, setMode: setMode, startSession: startSession };
  window.setVentureAllStarTrack = setTrack;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();