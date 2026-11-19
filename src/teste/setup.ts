import '@testing-library/jest-dom/vitest';

// O jsdom diz que o navegador fala ingles; os testes de componente conferem os
// textos em portugues, o idioma padrao. Um teste que queira outro idioma escolhe.
try {
  localStorage.setItem('render-lab:idioma', 'pt-BR');
} catch {
  // ambiente sem storage: idiomaAtivo() cai no navegador e depois no padrao
}
