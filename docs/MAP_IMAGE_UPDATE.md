# Atualização das Imagens de Mapa

Para resolver o problema com a imagem do mapa de_mirage mostrando uma imagem placeholder com a mensagem "Carregando informações..." constante, siga estas instruções:

## Problema Identificado

1. O sistema está usando imagens SVG placeholder para os mapas
2. A mensagem "Carregando informações..." não desaparece após o carregamento da imagem
3. A imagem do mapa Mirage não é uma imagem real do mapa

## Soluções Implementadas

1. Melhorado o código para esconder a mensagem "Carregando informações..." quando uma imagem válida é carregada
2. Aprimorada a detecção de mapas para melhor associação entre nomes de mapas e arquivos de imagem
3. Adicionada validação para garantir que a imagem carregue corretamente

## Próximos Passos

Para completar a solução, substitua os arquivos SVG placeholder por imagens reais dos mapas:

1. Substitua o arquivo `public/img/maps/mirage.svg` por uma imagem real do mapa Mirage
2. Formato recomendado: PNG ou JPG com resolução 16:9 (ex: 1280x720)
3. Dimensão recomendada: pelo menos 800x450 pixels para boa qualidade

### Exemplo de Implementação

```html
<!-- Imagem atual (placeholder SVG) -->
<img src="./public/img/maps/mirage.svg" alt="Mirage">

<!-- Substituir por imagem real do mapa -->
<img src="./public/img/maps/mirage.jpg" alt="Mirage">
```

Arquivos a serem atualizados:
- `public/img/maps/mirage.svg` → `public/img/maps/mirage.jpg` ou `.png`
- `public/img/maps/dust2.svg` → `public/img/maps/dust2.jpg` ou `.png`
- `public/img/maps/inferno.svg` → `public/img/maps/inferno.jpg` ou `.png`

Após a substituição, atualize o método `getMapImagePath()` em `cs2-server-status.js` para referenciar os novos arquivos.
