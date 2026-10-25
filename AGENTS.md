## Agent skills

### Issue tracker

Issues live in GitHub Issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

Ao commitar trabalho de uma issue (o usuário dá o push depois):
- Conferir cada critério de aceite contra o que foi feito e testado.
- Todos atendidos: mensagem do commit leva `Closes #N`; marcar os checkboxes no corpo (`gh issue edit N --body-file`) e comentar o que foi feito (`gh issue comment N`). A issue fecha sozinha no push.
- Algum pendente: `Refs #N`, marcar só os atendidos e comentar o que falta. Nunca `Closes`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
