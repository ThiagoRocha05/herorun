# Corrida dos Heróis

Jogo de tabuleiro digital para 2 a 4 jogadores, com tabuleiro de 60, 80 ou 100 casas, 8 heróis originais com superpoder, 27 mini-games escolares, 5 vilões, 3 mundos (Espaço, Cidade neon e Floresta mágica), tutorial, pódio e música. Roda direto no navegador, no tablet, celular ou computador. Sem instalação e sem custo.

Jogar: https://thiagorocha05.github.io/herorun/

## Como jogar

Role o dado e chegue primeiro ao castelo. Cada herói tem um superpoder que carrega a cada jogada e pode ser usado 2 vezes por corrida. Casas especiais: desafio, vilão, caixa surpresa, roleta, duelo, energia, turbo e portal.

## Código

O jogo inteiro está em `index.html`, e funciona sem internet depois da primeira visita (service worker e ícone de tela inicial). Os fontes ficam em `src/` (CSS, HTML, JS dos heróis e tabuleiro, lógica e mini-games). Para remontar, rode `python3 src/assemble.py` e ele regrava `index.html`.

Todos os personagens são originais.

## Testes

Rodam sozinhos a cada push (`.github/workflows/teste.yml`). Para rodar na sua máquina, na pasta do projeto:

- `node tests/conteudo.js`: confere os dados dos mini-games (rimas que não se cruzam, letra que falta sem alternativa que forme outra palavra, opostos, sílabas, corpo, filhotes).
- `node tests/pwa.js`: confere manifesto, ícones e arquivos do modo offline.
- `node tests/regras.js`: regras do jogo e vazamentos (vitória por duelo, duração dos escudos, gelo, música, mini-game abandonado). Usa o gancho `?teste` da URL, que só existe para os testes.
- `node tests/minigames.js`: um jogador-robô resolve os 27 mini-games certo e errado, nos 2 níveis.
- `node tests/partidas.js`: partidas completas de robôs e de pessoas.

Os três últimos precisam de `npm i playwright` e `npx playwright install chromium`.
