import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';

export default function App() {
  // --- Estados da Aplicação (Os alunos implementarão aqui) ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tipo, setTipo] = useState('');
  const [validade, setValidade] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Funções de Requisição e Efeitos (Os alunos implementarão aqui) ---
  async function carregarMateriais() {
    setLoading(true);

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
    }
  }

  useEffect(() => {
    carregarMateriais();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Breve descrição do projeto inserida abaixo */}
      <Text style={styles.description}>
        Este template servirá para desenvolver o projeto responsável por modernizar o controle de insumos médicos do almoxarifado. 
        Através desta interface conectada à API, é possível realizar o inventário em tempo real, cadastrar novos materiais e registrar baixas de estoque de forma ágil e segura.
      </Text>

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
        testID="lista-materiais"
        data={materiais}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <Text style={styles.itemQuantidade}>Quantidade: {item.quantidade}</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10, // Reduzido ligeiramente para aproximar o texto explicativo
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20, // Dá um espaçamento confortável entre as linhas do parágrafo
    marginBottom: 24,
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
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  itemQuantidade: {
    fontSize: 14,
    color: '#666',
  },
});