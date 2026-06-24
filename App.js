import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { validarRetirada } from './src/utils/validacoes';

export default function App() {
  // Estados do formulário de cadastro
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tipo, setTipo] = useState('');
  const [validade, setValidade] = useState('');

  // Lista de materiais carregada da MockAPI
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quantidades digitadas nos inputs de retirada, indexadas pelo id do material
  const [retiradas, setRetiradas] = useState({});

  // Termo digitado no campo de busca
  const [busca, setBusca] = useState('');

  // Atualiza o valor de retirada de um material específico sem afetar os demais
  function atualizarRetirada(id, valor) {
    setRetiradas((prev) => ({
      ...prev,
      [id]: valor,
    }));
  }

  // Busca todos os materiais e sincroniza a interface com a API
  async function carregarMateriais() {
    setLoading(true);

    try {
      const response = await fetch('http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais');

      if (!response.ok) {
        throw new Error(`Erro ao carregar materiais: ${response.status}`);
      }

      const data = await response.json();
      setMateriais(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro na requisição GET de materiais:', error);
      Alert.alert(
        'Falha na conexão',
        'Não foi possível carregar os materiais. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  // Registra a baixa de estoque: valida, atualiza na API e recarrega a lista
  async function baixarMaterial(material, quantidadeRetirada) {
    const retiradaValida = validarRetirada(
      material.quantidade,
      Number(quantidadeRetirada)
    );

    // Cancela a operação se a retirada for inválida (evita estoque negativo)
    if (!retiradaValida) {
      return;
    }

    const qtdRetirada = Number(quantidadeRetirada);
    const novaQuantidade = material.quantidade - qtdRetirada;

    try {
      const response = await fetch(
        `http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais/${material.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: material.nome,
            quantidade: novaQuantidade,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao atualizar material: ${response.status}`);
      }

      // Limpa o input de retirada do item e sincroniza a lista com a API
      setRetiradas((prev) => ({
        ...prev,
        [material.id]: '',
      }));
      await carregarMateriais();
    } catch (error) {
      console.error('Erro na requisição PUT de materiais:', error);
    }
  }

  // Remove um material da API e atualiza a lista exibida
  async function excluirMaterial(material) {    try {
      const response = await fetch(
        `http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais/${material.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao excluir material: ${response.status}`);
      }

      await carregarMateriais();
    } catch (error) {
      console.error('Erro na requisição DELETE de materiais:', error);
    }
  }

  // Envia novo material para a API e recarrega o inventário
  async function cadastrarMaterial() {
    if (!nome.trim() || !quantidade.trim()) {
      return;
    }

    try {
      const response = await fetch('http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          quantidade: Number(quantidade),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao cadastrar material: ${response.status}`);
      }

      setNome('');
      setQuantidade('');
      await carregarMateriais();
    } catch (error) {
      console.error('Erro na requisição POST de materiais:', error);
      Alert.alert(
        'Falha na conexão',
        'Não foi possível cadastrar o material. Verifique sua conexão com a internet e tente novamente.'
      );
    }
  }

  // Carrega os materiais assim que o app é aberto
  useEffect(() => {
    carregarMateriais();
  }, []);

  const materiaisFiltrados = materiais.filter((material) =>
    (material.nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>        <Text style={styles.headerTitle}>Controle de Estoque</Text>
        <Text style={styles.headerSubtitle}>
          Consulte e cadastre materiais do almoxarifado de enfermagem.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formFields}>
          <TextInput
            style={styles.input}
            testID="input-nome"
            placeholder="Nome do material"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            style={styles.input}
            testID="input-quantidade"
            placeholder="Quantidade"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />
        </View>

        <TouchableOpacity style={styles.button} testID="btn-cadastrar" onPress={cadastrarMaterial}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      )}

      <TextInput
        style={styles.input}
        testID="input-busca"
        placeholder="Buscar material"
        placeholderTextColor="#999"
        value={busca}
        onChangeText={setBusca}
      />

      <Text style={styles.totalItens} testID="total-itens">
        Total de itens: {materiaisFiltrados.length}
      </Text>

      <FlatList
        testID="lista-materials"
        data={materiaisFiltrados}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={obterEstiloCardPorQuantidade(item.quantidade)}
            accessibilityLabel={isEstoqueCritico(item.quantidade) ? 'estoque-critico' : undefined}
          >
            <Text style={styles.itemNome}>{item.nome}</Text>
            <Text style={obterEstiloQuantidadePorQuantidade(item.quantidade)}>
              Quantidade: {item.quantidade}
            </Text>
            <Text style={styles.itemDetail}>Tipo: {item.tipo || 'Não informado'}</Text>
            <Text style={styles.itemDetail}>Validade: {item.validade || 'Não informado'}</Text>

            {/* Ações por item: retirada de estoque e exclusão */}
            <View style={styles.cardActions}>
              <TextInput
                style={styles.inputRetirada}
                testID="input-retirada"
                placeholder="Qtd. retirada"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={retiradas[item.id] || ''}
                onChangeText={(valor) => atualizarRetirada(item.id, valor)}
              />

              <TouchableOpacity
                style={styles.buttonBaixar}
                testID="btn-baixar"
                onPress={() => baixarMaterial(item, retiradas[item.id] || '')}
              >
                <Ionicons name="arrow-down-circle-outline" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonExcluir}
                testID="btn-excluir"
                onPress={() => excluirMaterial(item)}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  formFields: {
    gap: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginVertical: 16,
  },
  totalItens: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardEstoqueNormal: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  cardEstoqueBaixo: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffc107',
  },
  cardEstoqueCritico: {
    backgroundColor: '#fde8e8',
    borderColor: '#e53935',
    borderWidth: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#c62828',
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  itemQuantidadeNormal: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  itemQuantidadeBaixo: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 22,
    fontWeight: '600',
  },
  itemQuantidadeCritico: {
    fontSize: 15,
    color: '#b71c1c',
    lineHeight: 22,
    fontWeight: 'bold',
    backgroundColor: '#ffcdd2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
    overflow: 'hidden',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputRetirada: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  buttonBaixar: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonExcluir: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Verifica se o material está com estoque crítico (menos de 10 unidades)
function isEstoqueCritico(quantidade) {
  return Number(quantidade) < 10;
}

// Retorna o estilo do card conforme a quantidade disponível
function obterEstiloCardPorQuantidade(quantidade) {
  if (isEstoqueCritico(quantidade)) {
    return [styles.card, styles.cardEstoqueCritico];
  }

  return [styles.card, styles.cardEstoqueNormal];
}

// Retorna o estilo do texto de quantidade conforme o estoque
function obterEstiloQuantidadePorQuantidade(quantidade) {
  if (isEstoqueCritico(quantidade)) {
    return styles.itemQuantidadeCritico;
  }

  return styles.itemQuantidadeNormal;
}