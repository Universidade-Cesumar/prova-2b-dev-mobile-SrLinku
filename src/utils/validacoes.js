// Regras de negócio para retirada de materiais (função pura, sem efeitos colaterais)

/**
 * Verifica se uma retirada de estoque é permitida.
 * @param {number} estoqueAtual - quantidade disponível no momento
 * @param {number} quantidadeRetirada - quantidade que será retirada
 * @returns {boolean} true se a retirada for válida, false caso contrário
 */
function validarRetirada(estoqueAtual, quantidadeRetirada) {
  // Bloqueia estoque negativo ou retirada inválida (zero ou negativa)
  if (estoqueAtual < 0 || quantidadeRetirada <= 0) {
    return false;
  }

  // Permite retirada apenas se não ultrapassar o estoque disponível
  return quantidadeRetirada <= estoqueAtual;
}

module.exports = {
  validarRetirada,
};
