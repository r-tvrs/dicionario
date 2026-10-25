# Dicionário

Seu dicionário minimalista de português. Um web app leve, sem build e sem dependências, que busca definições direto no [Wikcionário](https://pt.wiktionary.org).

## Funcionalidades

- **Busca de verbetes**: definições organizadas por classe gramatical, lidas da seção em português do Wikcionário.
- **Sugestões enquanto digita** e **"Você quis dizer:"** quando a palavra não é encontrada.
- **Palavra do dia** na tela de início (a mesma palavra o dia todo, no fuso local).
- **Histórico** das buscas, salvo no próprio navegador (`localStorage`), com opção de limpar.
- **Instalável** como app (PWA) no celular, com ícone e tela cheia.

## Como rodar

Não precisa instalar nada. Como o app usa módulos ES, sirva a pasta por HTTP:

```sh
npx serve .
# ou
python3 -m http.server
```

Depois abra o endereço mostrado (ex.: `http://localhost:8000`).

## Testes

Requer Node.js 18+ (usa o test runner nativo):

```sh
npm test
```

## Estrutura

| Arquivo | O que faz |
|---|---|
| `index.html`, `style.css` | Interface |
| `app.js` | Telas, busca e chamadas à API do Wikcionário |
| `verbete.js` | Lê o wikitext e extrai as definições em português |
| `sugestoes.js` | Autocompletar e sugestões |
| `historico.js` | Histórico de buscas |
| `palavra-do-dia.js` | Palavra do dia |
| `test/` | Testes (`node --test`) e fixtures |

## Créditos

Definições do [Wikcionário](https://pt.wiktionary.org), disponíveis sob a licença [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
