import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
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

  // Atualiza o valor de retirada de um material específico sem afetar os demais
  function atualizarRetirada(id, valor) {
    setRetiradas((prev) => ({
      ...prev,
      [id]: valor,
    }));
  }

  // Busca todos os materiais e sincroniza a interface com a API
  async function carregarMateriais() {    setLoading(true);

    try {
      const response = await fetch('http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais');

      if (!response.ok) {
        throw new Error(`Erro ao carregar materiais: ${response.status}`);
      }

      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      console.error('Erro na requisição GET de materiais:', error);
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
  async function cadastrarMaterial() {    if (!nome.trim() || !quantidade.trim()) {
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
    }
  }

  // Carrega os materiais assim que o app é aberto
  useEffect(() => {
    carregarMateriais();
  }, []);

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

      <FlatList
        testID="lista-materials"
        data={materiais}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <Text style={styles.itemDetail}>Quantidade: {item.quantidade}</Text>
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
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