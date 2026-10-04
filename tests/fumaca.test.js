const { expect } = chai;

describe('Ambiente de testes', () => {
  it('carrega Mocha e Chai', () => {
    expect(typeof describe).to.equal('function');
  });
});
