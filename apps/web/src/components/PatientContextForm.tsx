import { useState, useCallback } from 'react';
import type { PatientContext } from '@prumo/postural-core';

interface PatientContextFormProps {
  onSubmit: (context: PatientContext) => void;
  isLoading: boolean;
}

export function PatientContextForm({ onSubmit, isLoading }: PatientContextFormProps) {
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [mainComplaint, setMainComplaint] = useState('');
  const [relevantHistory, setRelevantHistory] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const context: PatientContext = {};
      if (age) context.age = Number(age);
      if (sex) context.sex = sex as PatientContext['sex'];
      if (mainComplaint.trim()) context.mainComplaint = mainComplaint.trim();
      if (relevantHistory.trim()) context.relevantHistory = relevantHistory.trim();
      onSubmit(context);
    },
    [age, sex, mainComplaint, relevantHistory, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-700 mb-3">Contexto do Paciente (opcional)</h3>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Idade</label>
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              placeholder="—"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Sexo</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="other">Outro</option>
              <option value="undisclosed">Não informar</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Queixa principal</label>
          <textarea
            value={mainComplaint}
            onChange={(e) => setMainComplaint(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm resize-none"
            placeholder="Ex: dor cervical há 3 meses..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Histórico relevante</label>
          <textarea
            value={relevantHistory}
            onChange={(e) => setRelevantHistory(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm resize-none"
            placeholder="Ex: trabalha 8h em escritório..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Gerando relatório...
          </>
        ) : (
          'Gerar relatório IA'
        )}
      </button>
    </form>
  );
}
