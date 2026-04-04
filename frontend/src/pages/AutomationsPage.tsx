import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Play, Pencil, Trash2 } from 'lucide-react';
import {
  createAutomation,
  deleteAutomation,
  getAutomation,
  getAutomations,
  runAutomation,
  updateAutomation,
} from '../api/automations';
import { getProjects } from '../api/projects';
import type { Automation, Project } from '../types';
import Modal from '../components/Modal';
import SkeletonCard from '../components/SkeletonCard';
import PageIntro from '../components/PageIntro';
import Drawer from '../components/Drawer';
import StatusFilter from '../components/StatusFilter';
import { getErrorMessage } from '../lib/errors';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    project_id: '',
    name: '',
    trigger_type: 'manual' as 'webhook' | 'schedule' | 'manual',
    status: 'active' as 'draft' | 'active' | 'paused',
    config: '{\n  "source": "csv"\n}',
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    project_id: '',
    name: '',
    trigger_type: 'manual' as 'webhook' | 'schedule' | 'manual',
    status: 'active' as 'draft' | 'active' | 'paused',
    config: '{\n  "source": "csv"\n}',
  });

  async function loadData() {
    setLoading(true);
    try {
      const [automationsResponse, projectsResponse] = await Promise.all([
        getAutomations(),
        getProjects(),
      ]);

      setAutomations(automationsResponse.data);
      setProjects(projectsResponse.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAutomations = useMemo(() => {
    const term = search.toLowerCase();

    return automations.filter((automation) => {
      const matchesText =
        automation.name.toLowerCase().includes(term) ||
        automation.trigger_type.toLowerCase().includes(term) ||
        automation.status.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [automations, search, statusFilter]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createAutomation({
        project_id: Number(createForm.project_id),
        name: createForm.name,
        trigger_type: createForm.trigger_type,
        status: createForm.status,
        config: JSON.parse(createForm.config),
      });

      toast.success('Automação criada com sucesso.');
      setCreateForm({
        project_id: '',
        name: '',
        trigger_type: 'manual',
        status: 'active',
        config: '{\n  "source": "csv"\n}',
      });
      setCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOpenEdit(id: number, e: React.MouseEvent) {
    e.stopPropagation();

    try {
      const response = await getAutomation(id);
      const automation = response.data;

      setEditForm({
        id: automation.id,
        project_id: String(automation.project_id),
        name: automation.name,
        trigger_type: automation.trigger_type,
        status: automation.status,
        config: JSON.stringify(automation.config, null, 2),
      });

      setEditOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateAutomation(editForm.id, {
        project_id: Number(editForm.project_id),
        name: editForm.name,
        trigger_type: editForm.trigger_type,
        status: editForm.status,
        config: JSON.parse(editForm.config),
      });

      toast.success('Automação atualizada com sucesso.');
      setEditOpen(false);
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRun(id: number, e?: React.MouseEvent) {
    e?.stopPropagation();

    try {
      setRunningId(id);
      await runAutomation(id);
      toast.success('Execução enfileirada com sucesso.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRunningId(null);
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();

    const confirmed = window.confirm('Deseja excluir esta automação?');
    if (!confirmed) return;

    try {
      await deleteAutomation(id);
      toast.success('Automação removida com sucesso.');
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleOpenDrawer(id: number) {
    try {
      const response = await getAutomation(id);
      setSelectedAutomation(response.data);
      setDrawerOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section>
      <PageIntro
        title="Automações"
        subtitle="Aqui estão seus fluxos operacionais."
        action={
          <button className="btn btn-sm icon-inline" onClick={() => setCreateOpen(true)} type="button">
            <Plus size={16} />
            <span>Nova automação</span>
          </button>
        }
      />

      <div className="toolbar toolbar-grid">
        <div className="search-box">
          <Search size={16} />
          <input
            className="toolbar-input"
            placeholder="Buscar automação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={['all', 'draft', 'active', 'paused']}
        />
      </div>

      <Modal open={createOpen} title="Criar nova automação" onClose={() => setCreateOpen(false)}>
        <form className="form-grid" onSubmit={handleCreate}>
          <select
            className="input"
            value={createForm.project_id}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, project_id: e.target.value }))}
          >
            <option value="">Selecione o projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Nome da automação"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <select
            className="input"
            value={createForm.trigger_type}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                trigger_type: e.target.value as 'webhook' | 'schedule' | 'manual',
              }))
            }
          >
            <option value="manual">Manual</option>
            <option value="webhook">Webhook</option>
            <option value="schedule">Agendada</option>
          </select>

          <select
            className="input"
            value={createForm.status}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                status: e.target.value as 'draft' | 'active' | 'paused',
              }))
            }
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>

          <textarea
            className="input"
            value={createForm.config}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, config: e.target.value }))}
            rows={6}
          />

          <div className="actions-row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar automação'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setCreateOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Editar automação" onClose={() => setEditOpen(false)}>
        <form className="form-grid" onSubmit={handleEdit}>
          <select
            className="input"
            value={editForm.project_id}
            onChange={(e) => setEditForm((prev) => ({ ...prev, project_id: e.target.value }))}
          >
            <option value="">Selecione o projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Nome da automação"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <select
            className="input"
            value={editForm.trigger_type}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                trigger_type: e.target.value as 'webhook' | 'schedule' | 'manual',
              }))
            }
          >
            <option value="manual">Manual</option>
            <option value="webhook">Webhook</option>
            <option value="schedule">Agendada</option>
          </select>

          <select
            className="input"
            value={editForm.status}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                status: e.target.value as 'draft' | 'active' | 'paused',
              }))
            }
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>

          <textarea
            className="input"
            value={editForm.config}
            onChange={(e) => setEditForm((prev) => ({ ...prev, config: e.target.value }))}
            rows={6}
          />

          <div className="actions-row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setEditOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Drawer
        open={drawerOpen}
        title={selectedAutomation?.name || 'Detalhes da automação'}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedAutomation ? (
          <div className="drawer-stack">
            <div className="drawer-block">
              <span className="muted">ID</span>
              <strong>#{selectedAutomation.id}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Projeto</span>
              <strong>#{selectedAutomation.project_id}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Trigger</span>
              <strong>{selectedAutomation.trigger_type}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Status</span>
              <strong>{selectedAutomation.status}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Configuração</span>
              <pre className="json-box">
                {JSON.stringify(selectedAutomation.config, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </Drawer>

      <div className="grid">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
          : filteredAutomations.map((automation) => (
              <div
                className="card list-card clickable-card"
                key={automation.id}
                onClick={() => handleOpenDrawer(automation.id)}
              >
                <div className="panel-title">
                  <h3>{automation.name}</h3>
                  <span className="badge success">{automation.status}</span>
                </div>

                <p className="muted">Trigger: {automation.trigger_type}</p>

                <div className="list-meta">
                  <span className="meta-chip">ID #{automation.id}</span>
                  <span className="meta-chip">Projeto #{automation.project_id}</span>
                  <span className="meta-chip">Modo {automation.trigger_type}</span>
                </div>

                <div className="actions-row">
                  <button
                    className="btn btn-sm icon-inline"
                    onClick={(e) => handleRun(automation.id, e)}
                    disabled={runningId === automation.id}
                  >
                    <Play size={15} />
                    <span>{runningId === automation.id ? 'Executando...' : 'Rodar agora'}</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm icon-inline"
                    type="button"
                    onClick={(e) => handleOpenEdit(automation.id, e)}
                  >
                    <Pencil size={15} />
                    <span>Editar</span>
                  </button>

                  <button
                    className="btn btn-danger btn-sm icon-inline"
                    type="button"
                    onClick={(e) => handleDelete(automation.id, e)}
                  >
                    <Trash2 size={15} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}