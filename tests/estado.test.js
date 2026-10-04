import {
  normalizarTexto, filtrar, validarId, formatarFaixaPreco, formatarData,
  lerEstadoDaUrl, montarBusca, descreverResultado, descreverVazio, periodoDoDia,
} from '../js/estado.js';

const { expect } = chai;

const eixos = [
  { id: 'sono', nome: 'Sono' },
  { id: 'saude', nome: 'Saúde' },
  { id: 'casa', nome: 'Casa' },
];
const itens = [
  { id: 'lampadas-circadianas', titulo: 'Kit de lâmpadas circadianas', categoria: 'sono', resumo: 'Luz quente à noite.' },
  { id: 'monitor-pressao-braco', titulo: 'Monitor de pressão de braço', categoria: 'saude', resumo: 'Histórico para o médico.' },
  { id: 'robo-aspirador-lidar', titulo: 'Robô aspirador com LiDAR e mop', categoria: 'casa', resumo: 'Chão limpo sem esforço.' },
];

describe('T-01 normalizarTexto', () => {
  it('remove acentos, baixa a caixa e apara espaços', () => {
    expect(normalizarTexto('  Saúde  E   Ação ')).to.equal('saude e acao');
  });
  it('trata null/undefined como texto vazio', () => {
    expect(normalizarTexto(undefined)).to.equal('');
    expect(normalizarTexto(null)).to.equal('');
  });
});

describe('T-02 filtrar', () => {
  it('termo vazio ou só espaços retorna todos, na ordem original', () => {
    expect(filtrar(itens, eixos, { texto: '   ' }).map((i) => i.id))
      .to.deep.equal(itens.map((i) => i.id));
  });
  it('busca no título sem diferenciar acento e maiúscula', () => {
    expect(filtrar(itens, eixos, { texto: 'LAMPADAS' }).map((i) => i.id)).to.deep.equal(['lampadas-circadianas']);
  });
  it('busca no resumo', () => {
    expect(filtrar(itens, eixos, { texto: 'medico' }).map((i) => i.id)).to.deep.equal(['monitor-pressao-braco']);
  });
  it('busca pelo nome do eixo', () => {
    expect(filtrar(itens, eixos, { texto: 'saude' }).map((i) => i.id)).to.deep.equal(['monitor-pressao-braco']);
  });
  it('várias palavras: todas precisam aparecer', () => {
    expect(filtrar(itens, eixos, { texto: 'robo mop' })).to.have.length(1);
    expect(filtrar(itens, eixos, { texto: 'robo noite' })).to.have.length(0);
  });
  it('filtra por eixo e combina com texto', () => {
    expect(filtrar(itens, eixos, { eixo: 'casa' }).map((i) => i.id)).to.deep.equal(['robo-aspirador-lidar']);
    expect(filtrar(itens, eixos, { eixo: 'casa', texto: 'luz' })).to.have.length(0);
  });
  it('eixo inexistente não retorna nada', () => {
    expect(filtrar(itens, eixos, { eixo: 'xyz' })).to.have.length(0);
  });
});

describe('T-03 validarId', () => {
  it('aceita id existente no formato certo', () => {
    expect(validarId('robo-aspirador-lidar', itens)).to.equal(true);
  });
  it('recusa formato inválido, inexistente e não-texto', () => {
    expect(validarId('../itens', itens)).to.equal(false);
    expect(validarId('Robo', itens)).to.equal(false);
    expect(validarId('nao-existe', itens)).to.equal(false);
    expect(validarId(null, itens)).to.equal(false);
  });
});

describe('T-06 formatação', () => {
  it('faixa de preço vira símbolo + texto acessível', () => {
    expect(formatarFaixaPreco(1)).to.deep.equal({ simbolo: '$', texto: 'Faixa de preço: baixa' });
    expect(formatarFaixaPreco(2)).to.deep.equal({ simbolo: '$$', texto: 'Faixa de preço: média' });
    expect(formatarFaixaPreco(3)).to.deep.equal({ simbolo: '$$$', texto: 'Faixa de preço: alta' });
  });
  it('faixa inválida retorna null', () => {
    expect(formatarFaixaPreco(0)).to.equal(null);
    expect(formatarFaixaPreco('2')).to.equal(null);
  });
  it('data ISO vira DD/MM/AAAA sem efeito de fuso horário', () => {
    expect(formatarData('2026-10-04')).to.equal('04/10/2026');
  });
  it('descreve resultado e vazio', () => {
    expect(descreverResultado(1)).to.equal('1 produto');
    expect(descreverResultado(3, { eixoNome: 'Sono', texto: ' luz ' })).to.equal('3 produtos em Sono para “luz”');
    expect(descreverVazio({ texto: 'xyz', eixoNome: 'Cozinha' }))
      .to.equal('Nenhum produto encontrado em Cozinha para “xyz”.');
    expect(descreverVazio({})).to.equal('Nenhum produto encontrado.');
  });
  it('período do dia pela hora local', () => {
    expect(periodoDoDia(6)).to.equal('manha');
    expect(periodoDoDia(12)).to.equal('dia');
    expect(periodoDoDia(18)).to.equal('tarde');
    expect(periodoDoDia(23)).to.equal('noite');
    expect(periodoDoDia(2)).to.equal('noite');
  });
});

describe('T-07 URL', () => {
  it('lê q, eixo válido e produto', () => {
    expect(lerEstadoDaUrl('?q=luz&eixo=sono', '#produto-lampadas-circadianas', eixos))
      .to.deep.equal({ texto: 'luz', eixo: 'sono', produto: 'lampadas-circadianas' });
  });
  it('ignora eixo inválido e hash que não é de produto', () => {
    expect(lerEstadoDaUrl('?eixo=hack', '#catalogo', eixos))
      .to.deep.equal({ texto: '', eixo: '', produto: null });
  });
  it('hash malformado não lança exceção', () => {
    expect(() => lerEstadoDaUrl('', '#produto-%E0%A4%A', eixos)).not.to.throw();
    expect(lerEstadoDaUrl('', '#produto-%E0%A4%A', eixos).produto).to.equal('%E0%A4%A');
  });
  it('monta a busca preservando outros parâmetros e removendo vazios', () => {
    expect(montarBusca('?simular=lento', { texto: 'robô & mop', eixo: 'casa' }))
      .to.equal('?simular=lento&q=rob%C3%B4+%26+mop&eixo=casa');
    expect(montarBusca('?q=velho&eixo=sono', { texto: '  ', eixo: '' })).to.equal('');
  });
});
