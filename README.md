# Governança de Serviços — conceito de oferta

Protótipo de site para a oferta de **Governança de Serviços** (SIAM, gestão de fornecedores, SLA/XLA, escritório de governança e inteligência de serviços), com identidade visual inspirada no site da NTT DATA Brasil.

> Protótipo conceitual para apresentação interna. Não é um site oficial. Indicadores, cenários e painéis são ilustrativos.

## O que tem no site
- Hero animado (rede de fornecedores sendo orquestrada) com texto rotativo
- Demonstração interativa do "efeito melancia" (SLA × experiência do usuário)
- Seis ofertas com modal de detalhes
- Modelo SIAM em três camadas, interativo
- Jornada de entrega com linha de progresso no scroll
- Diagnóstico de maturidade (8 perguntas, nota, radar e recomendações)
- Simulador de valor com sliders
- Painel executivo de governança com dados simulados ao vivo
- Carrossel de cenários, insights, FAQ e formulário de contato (sem envio de dados)

## Rodar localmente
Abra `index.html` no navegador, ou:

```bash
python3 -m http.server 8000
```

Site 100% estático (HTML, CSS e JavaScript puro), publicado via GitHub Pages.
