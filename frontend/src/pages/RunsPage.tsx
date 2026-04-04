import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRuns, retryRun } from '../api/runs';
import type { Run } from '../types';
import PageIntro from '../components/PageIntro';
import StatusFilter from '../components/StatusFilter';
import { getErrorMessage } from '../lib/errors';

function badgeClass(status: Run['status']) {
  if (status === 'success') return 'badge success';
  if (status === 'failed') return 'badge error';
  if (status === 'queued') return 'badge warning';
  if (status === 'running') return 'badge info pulse';
  return 'badge';
}

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [retryingRunId, setRetryingRunId] = useState<number | null>(null);

  const fetchRuns = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await getRuns({
        q: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        per_page: 50,
      });

      setRuns(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRuns(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchRuns]);

  const filteredRuns = useMemo(() => {
    const term = search.toLowerCase();

    return runs.filter((run) => {
      const matchesText =
        String(run.id).includes(term) ||
        String(run.automation_id).includes(term) ||
        run.status.toLowerCase().includes(term) ||
        (run.message || '').toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [runs, search, statusFilter]);

  async function handleRetry(runId: number) {
    try {
      setRetryingRunId(runId);
      await retryRun(runId);
      toast.success('Reprocessamento enfileirado com sucesso.');
      await fetchRuns(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRetryingRunId(null);
    }
  }

  return (
    <section>
      <PageIntro
        title="Execuções"
        subtitle="Histórico operacional com atualização automática."
      />

      <div className="toolbar toolbar-grid">
        <div className="search-box">
          <Search size={16} />
          <input
            className="toolbar-input"
            placeholder="Buscar execução..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={['all', 'queued', 'running', 'success', 'failed']}
        />
      </div>

      <div className="card">
        <div className="panel-title">
          <h3>Timeline de execuções</h3>
          <span className="badge info">Auto refresh 3s</span>
        </div>

        {loading ? (
          <div className="table-loading">Carregando execuções...</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Automação</th>
                  <th>Status</th>
                  <th>Mensagem</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.id}>
                    <td>#{run.id}</td>
                    <td>
                      <div className="table-stack">
                        <strong>{run.automation?.name || `#${run.automation_id}`}</strong>
                        <span className="muted small">
                          Projeto {run.automation?.project?.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={badgeClass(run.status)}>{run.status}</span>
                    </td>
                    <td>{run.message || 'Sem mensagem'}</td>
                    <td>{run.started_at ? new Date(run.started_at).toLocaleString('pt-BR') : '—'}</td>
                    <td>{run.finished_at ? new Date(run.finished_at).toLocaleString('pt-BR') : '—'}</td>
                    <td>{new Date(run.created_at).toLocaleString('pt-BR')}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm icon-inline"
                        type="button"
                        onClick={() => handleRetry(run.id)}
                        disabled={retryingRunId === run.id}
                      >
                        <RotateCcw size={14} />
                        <span>{retryingRunId === run.id ? 'Reprocessando...' : 'Retry'}</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRuns.length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-empty">
                      Nenhuma execução encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}