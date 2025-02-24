import { useState } from "react";
import Select from "react-select";
import { format, isValid } from "date-fns";

const unidadesLista = [
  "DJBA-AM", "TQTP-AM", "BNOC-BA", "PQSH-BA", "PRLA-BA", "ALDT-CE", "STDU-CE",
  "WSOA-CE", "ASAN-DF", "BSIA-DF", "EPIA-DF", "GAMA-DF", "GBSL-DF", "PKSB-DF",
  "TGTG-DF", "W3NT-DF", "ECOM-SP", "SERR-ES", "VLVL-ES", "VTRA-ES"
];

const horariosLista = [
  "09:00 às 15:00", "15:00 às 21:00", "14:00 às 20:00", "10:00 às 16:00",
  "13:00 às 19:00", "10:00 às 18:00", "12:00 às 18:00"
];

const tipoSolicitacaoOptions = [
  { label: "Cancelamento", value: "Cancelamento" },
  { label: "Alteração", value: "Alteração" },
  { label: "Disponibilidade", value: "Disponibilidade" },
  { label: "Justificativa", value: "Justificativa" }
];

export default function EscalaMedicos() {
  const [medico, setMedico] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [coordenacao, setCoordenacao] = useState("");
  const [tipoSolicitacao, setTipoSolicitacao] = useState("");
  const [unidades, setUnidades] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Funções auxiliares
  const getDataMinima = () => format(new Date(), "yyyy-MM-dd");
  
  const validarCNPJ = (cnpj) => /^\d{14}$/.test(cnpj.replace(/[^\d]/g, ''));

  // Manipulação de unidades
  const addUnidade = () => setUnidades([...unidades, { nome: "", dias: [] }]);
  
  const removeUnidade = (index) => 
    setUnidades(unidades.filter((_, i) => i !== index));

  const updateUnidade = (index, nome) => {
    const newUnidades = [...unidades];
    newUnidades[index].nome = nome;
    setUnidades(newUnidades);
  };

  // Manipulação de datas/horários
  const addData = (uIndex) => {
    const newUnidades = [...unidades];
    newUnidades[uIndex].dias.push({ data: "", horario: "" });
    setUnidades(newUnidades);
  };

  const removeData = (uIndex, dIndex) => {
    const newUnidades = [...unidades];
    newUnidades[uIndex].dias.splice(dIndex, 1);
    setUnidades(newUnidades);
  };

  const updateData = (uIndex, dIndex, field, value) => {
    const newUnidades = [...unidades];
    
    if (field === "data") {
      const dataSelecionada = new Date(value);
      if (!isValid(dataSelecionada) || dataSelecionada < new Date()) {
        alert("Selecione uma data futura!");
        return;
      }
    }
    
    newUnidades[uIndex].dias[dIndex][field] = value;
    setUnidades(newUnidades);
  };

  // Validação e envio
  const validarFormulario = () => {
    const camposObrigatorios = !!medico && !!cnpj && !!coordenacao && !!tipoSolicitacao;
    const cnpjValido = validarCNPJ(cnpj);
    const unidadesValidas = unidades.every(u => 
      u.nome && u.dias.length > 0 && u.dias.every(d => d.data && d.horario)
    );

    if (!camposObrigatorios) alert("Preencha todos os campos obrigatórios!");
    else if (!cnpjValido) alert("CNPJ inválido! Use 14 dígitos numéricos");
    else if (!unidadesValidas) alert("Verifique as unidades e datas/horários!");

    return camposObrigatorios && cnpjValido && unidadesValidas;
  };

  const enviarDados = async () => {
    if (!validarFormulario()) return;

    setEnviando(true);
    
    try {
      const response = await fetch("/api/salvarNoSnowflake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medico,
          cnpj: cnpj.replace(/\D/g, ''),
          coordenacao,
          tipoSolicitacao,
          unidades: unidades.map(u => ({
            ...u,
            dias: u.dias.map(d => ({ 
              ...d, 
              data: format(new Date(d.data), "dd/MM/yyyy") 
            }))
          })),
          observacoes
        })
      });

      if (response.ok) {
        alert("Dados salvos com sucesso!");
        // Resetar formulário
        setMedico("");
        setCnpj("");
        setCoordenacao("");
        setTipoSolicitacao("");
        setUnidades([]);
        setObservacoes("");
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      alert(`Erro: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Controle de Escala Médica</h1>

      <div className="w-full space-y-4 bg-white p-6 rounded-lg shadow-md">
        {/* Seção de Dados Cadastrais */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome do Médico *"
            value={medico}
            onChange={(e) => setMedico(e.target.value)}
            className="input-campo"
          />

          <input
            type="text"
            placeholder="CNPJ *"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className="input-campo"
            inputMode="numeric"
            maxLength={14}
          />

          <input
            type="text"
            placeholder="Coordenação *"
            value={coordenacao}
            onChange={(e) => setCoordenacao(e.target.value)}
            className="input-campo"
          />

          <Select
            options={tipoSolicitacaoOptions}
            onChange={(selected) => setTipoSolicitacao(selected.value)}
            placeholder="Tipo de Solicitação *"
            className="select-campo"
            noOptionsMessage={() => "Nenhuma opção disponível"}
          />
        </div>

        {/* Seção de Unidades */}
        <div className="space-y-4 mt-6">
          {unidades.map((unidade, uIndex) => (
            <div key={uIndex} className="border rounded-md p-4 bg-gray-50">
              <div className="flex gap-2 mb-3">
                <Select
                  options={unidadesLista.map(u => ({ label: u, value: u }))}
                  onChange={(selected) => updateUnidade(uIndex, selected.value)}
                  placeholder="Selecione a Unidade *"
                  className="flex-1"
                />
                <button
                  onClick={() => removeUnidade(uIndex)}
                  className="btn-remover"
                >
                  Remover
                </button>
              </div>

              <div className="space-y-2">
                {unidade.dias.map((dia, dIndex) => (
                  <div key={dIndex} className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={dia.data}
                      min={getDataMinima()}
                      onChange={(e) => updateData(uIndex, dIndex, "data", e.target.value)}
                      className="input-data"
                    />
                    <Select
                      options={horariosLista.map(h => ({ label: h, value: h }))}
                      onChange={(selected) => updateData(uIndex, dIndex, "horario", selected.value)}
                      placeholder="Horário *"
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeData(uIndex, dIndex)}
                      className="btn-remover-pequeno"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addData(uIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Adicionar Data/Horário
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addUnidade}
            className="btn-adicionar"
          >
            + Adicionar Nova Unidade
          </button>
        </div>

        {/* Observações */}
        <textarea
          placeholder="Observações Adicionais"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="mt-4 p-2 w-full border rounded-md h-24 focus:ring-2 focus:ring-blue-300"
        />

        {/* Botão de Envio */}
        <button
          onClick={enviarDados}
          disabled={enviando}
          className={`mt-6 w-full py-2 rounded-md font-medium transition-colors ${
            enviando 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {enviando ? 'Salvando...' : 'Salvar Escala'}
        </button>
      </div>
    </div>
  );
}

// Estilos CSS (se estiver usando CSS-in-JS)
const styles = {
  inputCampo: "w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300",
  selectCampo: {
    control: (base) => ({
      ...base,
      minHeight: '42px',
      borderColor: '#e5e7eb',
      '&:hover': { borderColor: '#93c5fd' }
    })
  },
  btnAdicionar: "w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
  btnRemover: "px-3 py-1 text-red-600 hover:text-red-800 bg-red-100 rounded-md",
  btnRemoverPequeno: "px-2 text-red-500 hover:text-red-700",
  inputData: "p-2 border rounded-md flex-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
};
