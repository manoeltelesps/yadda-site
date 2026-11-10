# yadda-site

Site público do YADDA, publicado pelo GitHub Pages:

- Início: https://manoeltelesps.github.io/yadda-site/
- Política de privacidade: https://manoeltelesps.github.io/yadda-site/privacidade.html
- Suporte: https://manoeltelesps.github.io/yadda-site/suporte.html

O código do app fica em outro repositório, privado. Este repositório tem só o site, em HTML e CSS puros, sem build.

O guia do que preencher no App Store Connect está em [APP_STORE.md](APP_STORE.md).

Para mudar a política de privacidade, edite `privacidade.html` e atualize a data de vigência no topo da página.

As animações usam a biblioteca [Motion](https://motion.dev) 14.6.0 (licença MIT, em `js/motion-LICENSE.md`). O arquivo fica no próprio site, sem CDN, para nenhum visitante ser enviado a servidores de terceiros.

A página inicial mostra um iPad 3D feito com [three.js](https://threejs.org) 0.186.1 (licença MIT, em `js/three-LICENSE.txt`). O código fica em `src/ipad3d.js`, e o arquivo publicado `js/ipad3d.js` é gerado com:

```
npm i three@0.186.1 esbuild@0.28.2
npx esbuild src/ipad3d.js --bundle --minify --format=esm --target=es2020 --legal-comments=eof --outfile=js/ipad3d.js
```

O modelo `img/ipad.glb` é uma versão reduzida de [Apple iPad Pro](https://sketchfab.com/3d-models/apple-ipad-pro-e5ffb3c80b2d4d6690249f8ee2bdafbe), de DatSketch, sob licença [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/): sem o Apple Pencil e sem o papel de parede da tela. A licença não permite uso comercial; se o YADDA passar a ser pago, é preciso trocar o modelo.

A rolagem suave usa o [Lenis](https://lenis.darkroom.engineering) 1.3.27 (licença MIT, em `js/lenis-LICENSE.txt`). Ele só age com mouse e trackpad e fica desligado para quem pede menos movimento no sistema.
