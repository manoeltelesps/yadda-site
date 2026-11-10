# YADDA: o que preencher no App Store Connect

Respostas baseadas no código da `main` do CAAapp (versão 1.0, bundle `br.com.manoel.CAAapp`) e no que já está na `develop`. Conferir antes de enviar se algo mudou.

## URLs

| Campo | Valor |
|---|---|
| URL da política de privacidade | https://manoeltelesps.github.io/yadda-site/privacidade.html |
| URL de suporte | https://manoeltelesps.github.io/yadda-site/suporte.html |
| URL de marketing (opcional) | https://manoeltelesps.github.io/yadda-site/ |

## Privacidade do app (App Privacy)

- **Coleta de dados:** "Não, não coletamos dados deste app".
- Rótulo resultante na loja: **Dados não coletados**.

Por quê:
- Não há rede no app: nenhum `URLSession`, nenhum servidor, nenhuma conta.
- Não há SDK de terceiros, análise, anúncios nem rastreamento.
- O manifesto `CAAapp/CAAapp/PrivacyInfo.xcprivacy` declara `NSPrivacyTracking = false` e nenhum tipo de dado coletado.
- Para a Apple, dado que fica só no aparelho e nunca sai dele não conta como coletado. Isso inclui vocabulário, fotos dos cards, histórico de frases e preferências.
- A fala do Modo Escuta é transcrita no aparelho (`SpeechTranscriber`, com o `SFSpeechRecognizer` em modo no aparelho como reserva). As recomendações vêm do modelo de linguagem do próprio iPad (Foundation Models). Nada é gravado nem enviado.

Atenção: se um dia entrar análise de uso, crash reporting de terceiros ou sincronização na nuvem, estas respostas precisam mudar.

## Permissões declaradas (Info.plist)

| Chave | Texto atual |
|---|---|
| `NSCameraUsageDescription` | A câmera permite tirar uma foto para usar em um card ou pasta de comunicação. |
| `NSMicrophoneUsageDescription` | O microfone é necessário para captar a fala durante a escuta do ambiente, sem gravar nem salvar áudio. |
| `NSSpeechRecognitionUsageDescription` | O reconhecimento de fala é necessário para transcrever a conversa no aparelho durante a escuta, mantendo sua privacidade. |

A galeria usa o `PhotosPicker`, que não precisa de permissão.

## Conformidade de exportação (criptografia)

- `ITSAppUsesNonExemptEncryption = NO` já está no projeto.
- Resposta: o app não usa criptografia além da que o sistema já oferece. Não é preciso enviar documentação.

## Classificação etária

Responder "Nenhum" ou "Não" em todos os itens: o app não tem violência, conteúdo sexual, jogos de azar nem acesso livre à web, e não tem conteúdo gerado por usuários compartilhado com outras pessoas. Resultado esperado: **4+**.

Observação: o vocabulário é personalizável, mas fica só no aparelho de quem o criou.

## Categoria

- Principal: **Medicina** ou **Utilidades**. A decisão é do time. Medicina pode atrair mais revisão; Utilidades é mais neutra. Evitar afirmações clínicas na descrição (RN03).
- Secundária (opcional): **Educação**.

## Informações da revisão (App Review)

- Login: não é preciso, porque o app não tem conta.
- Notas para o revisor (sugestão):
  > O YADDA é um app de Comunicação Aumentativa e Alternativa. Todo o processamento acontece no aparelho, sem rede. O Modo Escuta usa o microfone e o reconhecimento de fala do iPad apenas enquanto está ativo, sem gravar áudio. As recomendações do Modo Escuta exigem um iPad compatível com Apple Intelligence; sem ele, o app mostra palavras de reserva.

## Ainda faltam (fora deste repositório)

- [ ] Screenshots de iPad (13") e de iPhone (6,9"), se o app for publicado para iPhone. Tarefa C18-111.
- [ ] Nome, subtítulo, descrição, palavras-chave e texto promocional em pt-BR. Tarefa C18-111.
- [x] Ativar o GitHub Pages deste repositório e conferir as URLs acima abrindo no navegador.
- [ ] Revisão das declarações de privacidade pelo time. Tarefa C18-97.
