/**
 * projectService.js — Capa de red: proyectos y contexto de proyecto
 *
 * Todos los endpoints requieren autenticación. El token se lee
 * directamente de localStorage para mantener el patrón del resto
 * del proyecto (sin pasar el token como argumento).
 */

import { API_BASE as BASE, apiRequest as request } from './http'

/* ================================================================
   PROYECTOS — CRUD
================================================================ */

/**
 * GET /projects?page=&limit=
 * @returns {Promise<{ data: object[], meta: object }>}
 */
export async function listProjects({ page = 1, limit = 100 } = {}) {
  return request(`${BASE}/projects?page=${page}&limit=${limit}`)
}

/**
 * POST /projects
 * @param {{ name: string, description?: string }} params
 * @returns {Promise<object>} Proyecto creado
 */
export async function createProject({ name, description }) {
  return request(`${BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

/**
 * PATCH /projects/:id
 * @param {string} id
 * @param {{ name?: string, description?: string }} params
 * @returns {Promise<object>}
 */
export async function updateProject(id, { name, description }) {
  return request(`${BASE}/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description }),
  })
}

/**
 * DELETE /projects/:id
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteProject(id) {
  return request(`${BASE}/projects/${id}`, { method: 'DELETE' })
}

/* ================================================================
   CONTEXTO DE PROYECTO
================================================================ */

/**
 * GET /projects/:projectId/context
 * @param {string} projectId
 * @returns {Promise<{ techStack: string[], businessRules: string }>}
 */
export async function getProjectContext(projectId) {
  return request(`${BASE}/projects/${projectId}/context`)
}

/**
 * PUT /projects/:projectId/context  (crea o actualiza completo)
 * @param {string} projectId
 * @param {{ techStack?: string[], businessRules?: string }} params
 * @returns {Promise<object>}
 */
export async function upsertProjectContext(projectId, { techStack, businessRules }) {
  return request(`${BASE}/projects/${projectId}/context`, {
    method: 'PUT',
    body: JSON.stringify({ techStack, businessRules }),
  })
}
