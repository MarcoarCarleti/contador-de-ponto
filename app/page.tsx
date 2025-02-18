// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { addDays, format } from "date-fns";

interface Ponto {
  id: number;
  data: string;
  entrada: string;
  saida: string;
}

export default function Home() {
  const [data, setData] = useState("");
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [valorHora, setValorHora] = useState("45"); // valor hora default
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [totalPago, setTotalPago] = useState("");

  // Carregar do localStorage ao montar
  useEffect(() => {
    const storagePontos = localStorage.getItem("pontos");
    const storageValor = localStorage.getItem("valorHora");
    const storageTotalPago = localStorage.getItem("totalPago");

    if (storagePontos) {
      setPontos(JSON.parse(storagePontos));
    }

    if (storageValor) {
      setValorHora(storageValor);
    }

    if (storageTotalPago) {
      setTotalPago(storageTotalPago);
    }
  }, []);

  // Salvar no localStorage sempre que "pontos" mudar
  useEffect(() => {
    localStorage.setItem("pontos", JSON.stringify(pontos));
  }, [pontos]);

  // Salvar no localStorage sempre que valorHora mudar
  useEffect(() => {
    localStorage.setItem("valorHora", valorHora);
  }, [valorHora]);

  useEffect(() => {
    localStorage.setItem("totalPago", totalPago);
  }, [totalPago]);

  // Função para adicionar um novo ponto
  function handleAddPonto() {
    if (!data || !entrada || !saida) return;
    const novoPonto: Ponto = {
      id: Date.now(),
      data,
      entrada,
      saida,
    };
    setPontos([...pontos, novoPonto]);
    // Limpar campos
    setEntrada("");
    setSaida("");
  }

  // Converter HH:MM em decimal (por ex, 2h30 -> 2.5)
  function timeToDecimal(time: string) {
    const [h, m] = time.split(":");
    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    return hours + minutes / 60;
  }

  // Calcular total de horas
  const totalHoras = pontos.reduce((acc, ponto) => {
    const horaEntrada = timeToDecimal(ponto.entrada);
    const horaSaida = timeToDecimal(ponto.saida);
    const duracao = horaSaida - horaEntrada;
    return acc + (duracao > 0 ? duracao : 0);
  }, 0);

  const valorTotal = totalHoras * parseFloat(valorHora);
  const totalPagoNumber = parseFloat(totalPago || "0") || 0;

  const valorAReceber = valorTotal - totalPagoNumber;

  // Excluir um ponto
  function handleDeletePonto(id: number) {
    setPontos(pontos.filter((p) => p.id !== id));
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Controle de Horas</h1>

      {/* Formulário */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white max-w-md">
        <div className="flex flex-col mb-2">
          <label htmlFor="data" className="font-semibold mb-1">
            Data
          </label>
          <input
            type="date"
            id="data"
            className="border px-2 py-1 rounded"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <div className="flex flex-col mb-2">
          <label htmlFor="entrada" className="font-semibold mb-1">
            Entrada
          </label>
          <input
            type="time"
            id="entrada"
            className="border px-2 py-1 rounded"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
          />
        </div>

        <div className="flex flex-col mb-4">
          <label htmlFor="saida" className="font-semibold mb-1">
            Saída
          </label>
          <input
            type="time"
            id="saida"
            className="border px-2 py-1 rounded"
            value={saida}
            onChange={(e) => setSaida(e.target.value)}
          />
        </div>

        <button
          onClick={handleAddPonto}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Adicionar Ponto
        </button>
      </div>

      {/* Lista de Pontos */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Meus Pontos</h2>
        <div className="space-y-2">
          {pontos
            .slice()
            .sort(
              (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
            )
            .map((ponto) => (
              <div
                key={ponto.id}
                className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    {format(addDays(new Date(ponto.data), 1), "dd/MM/yyyy")}
                  </p>
                  <p className="text-sm">
                    Entrada: {ponto.entrada} - Saída: {ponto.saida}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePonto(ponto.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Valor da Hora & Total Pago */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white max-w-md space-y-4">
        <div>
          <label htmlFor="valorHora" className="block font-semibold mb-1">
            Valor da Hora (R$)
          </label>
          <input
            type="number"
            id="valorHora"
            className="border px-2 py-1 rounded w-full"
            step="0.01"
            value={valorHora}
            onChange={(e) => setValorHora(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="totalPago" className="block font-semibold mb-1">
            Total Pago (R$)
          </label>
          <input
            type="number"
            id="totalPago"
            className="border px-2 py-1 rounded w-full"
            step="0.01"
            value={totalPago}
            onChange={(e) => setTotalPago(e.target.value)}
          />
        </div>
      </div>

      {/* Resultado Final */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white max-w-md">
        <p className="mb-2">
          <span className="font-semibold">Total de Horas:</span>{" "}
          {totalHoras.toFixed(2)}h
        </p>
        <p className="mb-2">
          <span className="font-semibold">Valor Total (R$):</span>{" "}
          {valorTotal.toFixed(2)}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Total Pago (R$):</span>{" "}
          {totalPago || "0"}
        </p>
        <hr className="my-2" />
        <p className="text-lg font-semibold">
          A Receber: R$ {valorAReceber.toFixed(2)}
        </p>
      </div>
    </main>
  );
}
