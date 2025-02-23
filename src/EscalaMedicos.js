import { useState } from "react";
import Select from "react-select";

const unidadesLista = [
  "DJBA-AM", "TQTP-AM", "BNOC-BA", "PQSH-BA", "PRLA-BA", "ALDT-CE", "STDU-CE",
  "WSOA-CE", "ASAN-DF", "BSIA-DF", "EPIA-DF", "GAMA-DF", "GBSL-DF", "PKSB-DF",
  "TGTG-DF", "W3NT-DF", "ECOM-SP", "SERR-ES", "VLVL-ES", "VTRA-ES"
];

const horariosLista = [
  "09:00 às 15:00", "15:00 às 21:00", "14:00 às 20:00", "10:00 às 16:00",
  "13:00 às 19:00", "10:00 às 18:00", "12:00 às 18:00"
];

export default function EscalaMedicos() {
  const [medico, setMedico] = useState("");
  const [coordenacao, setCoordenacao] = useState("");
  const [tipoPreenchimento, setTipoPreenchimento] = useState("");
  const [unidades, setUnidades] = useState([]);
  const [observacoes, setObservacoes] = useState("");

  const addUnidade = () => {
    setUnidades([...unidades, { nome: "", dias: [] }]);
  };

  const removeUnidade = (index) => {
    setUnidades(unidades.filter((_, i) => i !== index));
  };

  const updateUnidade = (index, nome) => {
    const newUnidades = [...unidades];
    newUnidades[index].nome = nome;
    setUnidades(newUnidades);
  };

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
    newUnidades[uIndex].dias[dIndex][field] = value;
    setUnidades(newUnidades);
  };

  const enviarDados = async () => {
    if (!medico || !coordenacao || !tipoPreenchimento || unidades.length === 0) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    await fetch("https://seu-backend.onrender.com/api/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medico, coordenacao, tipoPreenchimento, unidades, observacoes })
    });
    alert("Dados enviados com sucesso!");
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Cadastro de Escala Médica</h1>
      <input
        type="text"
        placeholder="Nome do Médico"
        value={medico}
        onChange={(e) => setMedico(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        placeholder="Coordenação"
        value={coordenacao}
        onChange={(e) => setCoordenacao(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <Select
        options={[
          { label: "Preenchimento", value: "Preenchimento" },
          { label: "Alteração", value: "Alteração" }
        ]}
        onChange={(selected) => setTipoPreenchimento(selected.value)}
        className="w-full mb-4"
        placeholder="Selecione o tipo de preenchimento"
      />
      <button onClick={addUnidade} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        Adicionar Unidade
      </button>
      {unidades.map((unidade, uIndex) => (
        <div key={uIndex} className="mb-4 p-4 border w-full">
          <div className="flex justify-between items-center">
            <Select
              options={unidadesLista.map((u) => ({ label: u, value: u }))}
              onChange={(selected) => updateUnidade(uIndex, selected.value)}
              className="w-5/6"
              placeholder="Selecione a Unidade"
            />
            <button onClick={() => removeUnidade(uIndex)} className="ml-2 text-red-500">X</button>
          </div>
          {unidade.dias.map((dia, dIndex) => (
            <div key={dIndex} className="flex gap-2 my-2">
              <input
                type="date"
                value={dia.data}
                onChange={(e) => updateData(uIndex, dIndex, "data", e.target.value)}
                className="border p-2"
              />
              <Select
                options={horariosLista.map((h) => ({ label: h, value: h }))}
                onChange={(selected) => updateData(uIndex, dIndex, "horario", selected.value)}
                className="w-1/2"
                placeholder="Selecione o horário"
              />
              <button onClick={() => removeData(uIndex, dIndex)} className="text-red-500">X</button>
            </div>
          ))}
          <button onClick={() => addData(uIndex)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Adicionar Data
          </button>
        </div>
      ))}
      <textarea
        placeholder="Observações"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        className="border p-2 w-full mt-4"
      ></textarea>
      <button onClick={enviarDados} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
        Enviar
      </button>
    </div>
  );
}
