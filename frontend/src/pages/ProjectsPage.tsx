import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from '../api/projects';
import type { Project } from '../types';
import Modal from '../components/Modal';
import SkeletonCard from '../components/SkeletonCard';
import PageIntro from '../components/PageIntro';
import Drawer from '../components/Drawer';
import { getErrorMessage } from '../lib/errors';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    description: '',
    is_active: true,
  });

  async function loadProjects() {
    setLoading(true);
    try {
      const response = await getProjects();
      setProjects(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        (project.description || '').toLowerCase().includes(term)
    );
  }, [projects, search]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createProject({
        name: createForm.name,
        description: createForm.description,
        is_active: true,
      });

      toast.success('Projeto criado com sucesso.');
      setCreateForm({ name: '', description: '' });
      setCreateOpen(false);
      await loadProjects();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOpenDrawer(projectId: number) {
    try {
      const response = await getProject(projectId);
      setSelectedProject(response.data);
      setDrawerOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleOpenEdit(projectId: number, e: React.MouseEvent) {
    e.stopPropagation();

    try {
      const response = await getProject(projectId);
      const project = response.data;

      setEditForm({
        id: project.id,
        name: project.name,
        description: project.description || '',
        is_active: project.is_active,
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
      await updateProject(editForm.id, {
        name: editForm.name,
        description: editForm.description,
        is_active: editForm.is_active,
      });

      toast.success('Projeto atualizado com sucesso.');
      setEditOpen(false);
      await loadProjects();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(projectId: number, e: React.MouseEvent) {
    e.stopPropagation();

    const confirmed = window.confirm('Deseja excluir este projeto?');
    if (!confirmed) return;

    try {
      await deleteProject(projectId);
      toast.success('Projeto removido com sucesso.');
      await loadProjects();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <section>
      <PageIntro
        title="Projetos"
        subtitle="Gerencie, edite e exclua seus projetos aqui!"
        action={
          <button className="btn btn-sm icon-inline" onClick={() => setCreateOpen(true)} type="button">
            <Plus size={16} />
            <span>Novo projeto</span>
          </button>
        }
      />

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            className="toolbar-input"
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Modal open={createOpen} title="Criar novo projeto" onClose={() => setCreateOpen(false)}>
        <form className="form-grid" onSubmit={handleCreate}>
          <input
            className="input"
            placeholder="Nome do projeto"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <input
            className="input"
            placeholder="Descrição"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="actions-row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar projeto'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setCreateOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Editar projeto" onClose={() => setEditOpen(false)}>
        <form className="form-grid" onSubmit={handleEdit}>
          <input
            className="input"
            placeholder="Nome do projeto"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <input
            className="input"
            placeholder="Descrição"
            value={editForm.description}
            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <select
            className="input"
            value={editForm.is_active ? 'true' : 'false'}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, is_active: e.target.value === 'true' }))
            }
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>

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
        title={selectedProject?.name || 'Detalhes do projeto'}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedProject ? (
          <div className="drawer-stack">
            <div className="drawer-block">
              <span className="muted">ID</span>
              <strong>#{selectedProject.id}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Descrição</span>
              <strong>{selectedProject.description || 'Sem descrição'}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Status</span>
              <strong>{selectedProject.is_active ? 'Ativo' : 'Inativo'}</strong>
            </div>

            <div className="drawer-block">
              <span className="muted">Criado em</span>
              <strong>{new Date(selectedProject.created_at).toLocaleString('pt-BR')}</strong>
            </div>
          </div>
        ) : null}
      </Drawer>

      <div className="grid">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
          : filteredProjects.map((project) => (
              <div
                className="card list-card clickable-card"
                key={project.id}
                onClick={() => handleOpenDrawer(project.id)}
              >
                <div className="panel-title">
                  <h3>{project.name}</h3>
                  <span className={project.is_active ? 'badge success' : 'badge'}>Ativo</span>
                </div>

                <p className="muted">{project.description || 'Sem descrição'}</p>

                <div className="list-meta">
                  <span className="meta-chip">ID #{project.id}</span>
                  <span className="meta-chip">Projeto operacional</span>
                  <span className="meta-chip">Owner atual</span>
                </div>

                <div className="actions-row">
                  <button
                    className="btn btn-secondary btn-sm icon-inline"
                    type="button"
                    onClick={(e) => handleOpenEdit(project.id, e)}
                  >
                    <Pencil size={15} />
                    <span>Editar</span>
                  </button>

                  <button
                    className="btn btn-danger btn-sm icon-inline"
                    type="button"
                    onClick={(e) => handleDelete(project.id, e)}
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