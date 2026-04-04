import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getAutomation, getAutomationRuns, runAutomation } from '../api/automations';
import { retryRun } from '../api/runs';
import type { Automation, PaginatedResponse, Run } from '../types';
import PageIntro from '../components/PageIntro';
import JsonViewer from '../components/JsonViewer';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { getErrorMessage } from '../lib/errors';

const emptyRuns: PaginatedResponse<Run> = {
  current_page: 1,
  data: [],
  last_page: 1,
  per_page: 10,
  total: 0,
};

function badgeClass(status: Run['status'] | Automation['status']) {
  if (status === 'success' || status === 'active') return 'badge success';
  if (status === 'failed' || status === 'paused') return 'badge error';
  if (status === 'queued') return 'badge warning';
  if (status === 'running') return 'badge info pulse';
  return 'badge';
}

export default function AutomationDetailsPage() {
  const { id } = useParams();
  const automationId = Number(id);

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [runsResponse, setRunsResponse] = useState<PaginatedResponse<Run>>(emptyRuns);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const loadAutomation = useCallback(
    async (showLoader = true) => {
      if (!automationId || Number.isNaN(automationId)) return;

      try {
        if (showLoader) setLoading(true);

        const [automationResponse, runs] = await Promise.all([
          getAutomation(automationId),
          getAutomationRuns(automationId, {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            page,
            per_page: 8,
          }),
        ]);

        setAutomation(automationResponse.data);
        setRunsResponse(runs);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [automationId, page, statusFilter]
  );

  useEffect(() => {
    loadAutomation();
  }, [loadAutomation]);

  useEffect(() => {
    if (!automationId || Number.isNaN(automationId)) return;

    const interval = setInterval(() => {
      loadAutomation(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [automationId, loadAutomation]);

  async function handleRunNow() {
    if (!automationId || Number.isNaN(automationId)) return;

    setRunning(true);
    try {
      await runAutomation(automationId);
      toast.success('Execução criada com sucesso.');
      await loadAutomation(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRunning(false);
    }
  }

  async function handleRetry(runId: number) {
    setRetryingId(runId);
    try {
      await retryRun(runId);
      toast.success('Execução reenfileirada com sucesso.');
      await loadAutomation(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRetryingId(null);
    }
  }

  if (!automation && loading) {
    return (
      <section>
        <PageIntro
          title="Detalhes da automação"
          subtitle="Carregando dados da automação..."
        />
      </section>
    );
  }

  if (!automation) {
    return (
      <section>
        <EmptyState
          title="Automação não encontrada"
          description="Verifique se ela ainda existe ou se você possui permissão de acesso."
        />
      </section>
    );
  }

  const successCount = runsResponse.data.filter((run) => run.status === 'success').length;
  const failedCount = runsResponse.data.filter((run) => run.status === 'failed').length;

  return (
    <section>
      <PageIntro
        title={automation.name}
        subtitle="Detalhamento operacional, configuração JSON e histórico de execuções."
        action={
          <div className="actions-row">
            <Link className="btn btn-secondary btn-sm icon-inline" to="/automations">
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </Link>

            <button
              className="btn btn-sm icon-inline"
              type="button"
              onClick={handleRunNow}
              disabled={running}
            >
              <Play size={16} />
              <span>{running ? 'Executando...' : 'Rodar agora'}</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-3">
        <div className="card stat-card">
          <p className="muted">Projeto</p>
          <h3>{automation.project?.name ?? 'Sem projeto'}</h3>
          <span className="badge">{automation.trigger_type}</span>
        </div>

        <div className="card stat-card">
          <p className="muted">Status</p>
          <h3>
            <span className={badgeClass(automation.status)}>{automation.status}</span>
          </h3>
          <span className="muted">{runsResponse.total} execuções registradas</span>
        </div>

        <div className="card stat-card">
          <p className="muted">Última página analisada</p>
          <h3>{runsResponse.data.length}</h3>
          <span className="muted">
            {successCount} sucesso • {failedCount} falha
          </span>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="panel-title">
            <h3>Configuração JSON</h3>
            <span className="badge">Payload</span>
          </div>
          <JsonViewer value={automation.config} />
        </div>

        <div className="card">
          <div className="panel-title">
            <h3>Resumo da automação</h3>
            <span className="badge">Overview</span>
          </div>

          <div className="drawer-stack">
            <div className="drawer-block">
              <span className="muted">Criada em</span>
              <strong>{new Date(automation.created_at).toLocaleString('pt-BR')}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Atualizada em</span>
              <strong>{new Date(automation.updated_at).toLocaleString('pt-BR')}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Projeto vinculado</span>
              <strong>{automation.project?.name ?? 'Sem projeto'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="panel-title panel-title-wrap">
          <div>
            <h3>Histórico de execuções</h3>
            <p className="muted compact">Filtre e reprocese execuções diretamente daqui.</p>
          </div>

          <select
            className="toolbar-select details-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todos os status</option>
            <option value="queued">queued</option>
            <option value="running">running</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
          </select>
        </div>

        {runsResponse.data.length === 0 ? (
          <EmptyState
            title="Nenhuma execução encontrada"
            description="Dispare uma nova execução ou ajuste o filtro para visualizar o histórico."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Mensagem</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Criado em</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {runsResponse.data.map((run) => (
                    <tr key={run.id}>
                      <td>#{run.id}</td>
                      <td>
                        <span className={badgeClass(run.status)}>{run.status}</span>
                      </td>
                      <td>{run.message || 'Sem mensagem'}</td>
                      <td>
                        {run.started_at ? new Date(run.started_at).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td>
                        {run.finished_at ? new Date(run.finished_at).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td>{new Date(run.created_at).toLocaleString('pt-BR')}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm icon-inline"
                          type="button"
                          disabled={retryingId === run.id}
                          onClick={() => handleRetry(run.id)}
                        >
                          <RotateCcw size={15} />
                          <span>{retryingId === run.id ? 'Reprocessando...' : 'Retry'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={runsResponse.current_page}
              lastPage={runsResponse.last_page}
              total={runsResponse.total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}