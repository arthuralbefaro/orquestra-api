import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { getDashboardMetrics } from '../api/dashboard';
import StatCard from '../components/StatCard';
import MiniMetric from '../components/MiniMetric';
import PageIntro from '../components/PageIntro';
import EmptyState from '../components/EmptyState';
import type { DashboardMetrics, Run, TopAutomationMetric } from '../types';

const initialMetrics: DashboardMetrics = {
  totals: { projects: 0, automations: 0, runs: 0 },
  run_stats: {
    queued: 0,
    running: 0,
    success: 0,
    failed: 0,
    success_rate: 0,
    failure_rate: 0,
  },
  top_automations: [],
  latest_runs: [],
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const response = await getDashboardMetrics();
        if (!ignore) setMetrics(response.data);
      } catch {
        // noop
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadStats();

    return () => {
      ignore = true;
    };
  }, []);

  const chartData = useMemo(
    () => [
      { name: 'Projetos', total: metrics.totals.projects },
      { name: 'Automações', total: metrics.totals.automations },
      { name: 'Execuções', total: metrics.totals.runs },
    ],
    [metrics]
  );

  return (
    <section>
      <PageIntro
        title="Dashboard"
        subtitle="Visão estratégica com observabilidade, taxas operacionais e últimas execuções."
      />

      <div className="grid grid-3">
        <StatCard title="Projetos" value={metrics.totals.projects} subtitle="Estruturas cadastradas" />
        <StatCard title="Automações" value={metrics.totals.automations} subtitle="Fluxos disponíveis" />
        <StatCard title="Execuções" value={metrics.totals.runs} subtitle="Histórico operacional" />
      </div>

      <div className="metrics-row">
        <MiniMetric label="Na fila" value={metrics.run_stats.queued} />
        <MiniMetric label="Executando" value={metrics.run_stats.running} />
        <MiniMetric label="Sucesso" value={`${metrics.run_stats.success_rate}%`} tone="success" />
        <MiniMetric label="Falha" value={`${metrics.run_stats.failure_rate}%`} tone="danger" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="panel-title">
            <h3>Performance geral</h3>
            <span className="badge warning">Analytics</span>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#b8b8b8" />
                <YAxis stroke="#b8b8b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111111',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    color: '#f5f5f5',
                  }}
                />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#c1121f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="panel-title">
            <h3>Resumo executivo</h3>
            <span className="badge success">V8</span>
          </div>

          <p className="muted">
            Nessa versão, o Orquestra possui centro de execução, ranking de automações, taxas de sucesso e leitura operacional mais madura!
          </p>

          <div className="metrics-row" style={{ marginTop: 18 }}>
            <MiniMetric label="Execuções com sucesso" value={metrics.run_stats.success} tone="success" />
            <MiniMetric label="Execuções falhas" value={metrics.run_stats.failed} tone="danger" />
            <MiniMetric label="Stack" value="Laravel + React + PostgreSQL" />
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="panel-title">
            <h3>Top automações</h3>
            <span className="badge">Ranking</span>
          </div>

          {metrics.top_automations.length === 0 ? (
            <EmptyState
              title={loading ? 'Carregando ranking...' : 'Nenhuma automação encontrada'}
              description="Crie automações e execute fluxos para alimentar este ranking."
            />
          ) : (
            <div className="stack-list">
              {metrics.top_automations.map((automation: TopAutomationMetric) => (
                <div key={automation.id} className="stack-row">
                  <div>
                    <strong>{automation.name}</strong>
                    <p className="muted compact">
                      {automation.project?.name ?? 'Sem projeto'} • {automation.trigger_type}
                    </p>
                  </div>
                  <span className="badge">{automation.runs_count ?? 0} runs</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="panel-title">
            <h3>Últimas execuções</h3>
            <span className="badge">Tempo real</span>
          </div>

          {metrics.latest_runs.length === 0 ? (
            <EmptyState
              title={loading ? 'Carregando execuções...' : 'Ainda não existem execuções'}
              description="As execuções mais recentes aparecerão aqui."
            />
          ) : (
            <div className="stack-list">
              {metrics.latest_runs.map((run: Run) => (
                <div key={run.id} className="stack-row">
                  <div>
                    <strong>#{run.id} • {run.automation?.name ?? `Automação #${run.automation_id}`}</strong>
                    <p className="muted compact">{run.message || 'Sem mensagem'}</p>
                  </div>
                  <span
                    className={`badge ${
                      run.status === 'success'
                        ? 'success'
                        : run.status === 'failed'
                        ? 'error'
                        : run.status === 'queued'
                        ? 'warning'
                        : run.status === 'running'
                        ? 'info'
                        : ''
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}