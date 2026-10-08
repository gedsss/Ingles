# Nathiely Quest

Quiz gamificado de inglês para iniciantes, feito com React e Vite.
São 8 fases com 10 perguntas cada: vidas, estrelas, XP, níveis, combos, cronômetro, conquistas e pronúncia em áudio.

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (inclui o npm)

## Como rodar

```bash
# 1. Instalar as dependências (só na primeira vez)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```

Depois abra **<http://localhost:5173>** no navegador.

## Scripts

| Comando           | O que faz                                                                    |
| ----------------- | ---------------------------------------------------------------------------- |
| `npm install`     | Instala as dependências do projeto.                                          |
| `npm run dev`     | Inicia o servidor de desenvolvimento com recarregamento automático.          |
| `npm run build`   | Gera a versão de produção, otimizada, na pasta `dist/`.                      |
| `npm run preview` | Serve localmente a versão gerada pelo `build` para testar antes de publicar. |

Para publicar o jogo, rode `npm run build` e envie o conteúdo da pasta `dist/` para qualquer hospedagem de sites estáticos (Netlify, Vercel, GitHub Pages etc.).

## Como jogar

- Comece pela **Fase 1** no mapa. Cada fase completada desbloqueia a próxima.
- Cada fase tem **10 perguntas**, **3 vidas** e **20 segundos** por pergunta.
- Ao perder as 3 vidas, a fase termina e você pode tentar de novo.
- **Estrelas:** nenhum erro vale 3 estrelas, 1 erro vale 2 e 2 erros valem 1.
- **XP:** 10 por acerto, mais bônus de combo (acertos seguidos), de velocidade (resposta em menos de 5 s) e de estrelas no fim da fase. A cada 100 XP você sobe de nível.
- O botão **Ouvir** e o ícone de áudio na explicação falam a pronúncia em inglês.
- Atalhos de teclado: **1 a 4** escolhem a alternativa e **Enter** continua.
- O progresso fica salvo no navegador (localStorage). Use **Reiniciar progresso**, no fim do mapa, para começar do zero.

### Fases

1. Saudações (Greetings)
2. Números (Numbers)
3. Cores (Colors)
4. Animais (Animals)
5. Comida (Food)
6. Família (Family)
7. Verbo To Be
8. Dias e Meses (Days & Months)

## Estrutura do projeto

```text
├── index.html              # Página base
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx            # Ponto de entrada do React
    ├── App.jsx             # Telas, progresso, conquistas, modais e avisos
    ├── styles.css          # Visual e animações
    ├── data/
    │   └── phases.js       # Todas as fases e perguntas
    ├── lib/
    │   ├── game.js         # Regras: tempo, vidas, XP, conquistas
    │   ├── sound.js        # Efeitos sonoros (Web Audio)
    │   ├── speech.js       # Pronúncia em inglês (voz do navegador)
    │   └── storage.js      # Salvamento do progresso
    └── components/
        ├── MapScreen.jsx   # Mapa de fases
        ├── Quiz.jsx        # Tela de perguntas
        ├── Result.jsx      # Tela de resultado
        ├── Modal.jsx       # Janela de diálogo
        ├── Confetti.jsx    # Animação de confete
        ├── Stars.jsx       # Estrelas da fase
        └── Icon.jsx        # Ícones SVG
```

## Adicionando perguntas ou fases

Edite `src/data/phases.js`. Cada pergunta segue este formato:

```js
{
  q: 'Complete: "Gabriel ___ tall."',        // enunciado
  options: ['is', 'am', 'are', 'be'],        // a PRIMEIRA é a correta
  say: 'Gabriel is tall.',                   // texto falado no botão de áudio
  tip: 'Gabriel = he (ele), que usa "is".',  // explicação exibida após responder
  l: 1,                                      // opcional: mostra "Ouvir" na pergunta
  swatch: '#ef4444',                         // opcional: mostra uma cor no cartão
}
```

As alternativas são embaralhadas durante o jogo, então a resposta certa não fica sempre na mesma posição.

Para criar uma fase nova, adicione um objeto ao array `PHASES` com `id`, `icon` (um nome de ícone de `src/components/Icon.jsx`), `title`, `subtitle`, `color` e a lista `questions`.
