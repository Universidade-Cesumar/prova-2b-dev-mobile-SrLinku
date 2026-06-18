function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (estoqueAtual < 0 || quantidadeRetirada < 0) {
    return false;
  }

  return quantidadeRetirada <= estoqueAtual;
}

module.exports = {
  validarRetirada,
};
