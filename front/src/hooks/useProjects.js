/**
 * useProjects.js — Estado y operaciones de proyectos
 *
 * Encapsula toda la lógica de estado relacionada con los proyectos
 * del usuario: listado, creación, eliminación y edición del contexto.
 * Las vistas solo consumen este hook — nunca llaman a projectService directamente.
 */

import { useState, useCallback } from 'react'
import * as projectService from '../services/projectService'

/**
 * @returns {{
 *   projects: object[],
 *   isLoading: boolean,
 *   error: string|null,
 *   load: () => Promise<void>,
 *   create: (params: { name: string, description?: string }) => Promise<object>,
 *   remove: (id: string) => Promise<void>,
 *   getContext: (projectId: string) => Promise<object>,
 *   saveContext: (projectId: string, ctx: { techStack: string[], businessRules: string }) => Promise<void>,
 * }}
 */
export function useProjects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await projectService.listProjects()
      // El endpoint paginado devuelve { data: [], meta: {} } o directamente []
      const list = Array.isArray(result) ? result : (result?.data ?? [])
      setProjects(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async ({ name, description }) => {
    const newProject = await projectService.createProject({ name, description })
    setProjects((prev) => [...prev, newProject])
    return newProject
  }, [])

  const remove = useCallback(async (id) => {
    await projectService.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const getContext = useCallback(async (projectId) => {
    return projectService.getProjectContext(projectId)
  }, [])

  const saveContext = useCallback(async (projectId, { techStack, businessRules }) => {
    await projectService.upsertProjectContext(projectId, { techStack, businessRules })
  }, [])

  return { projects, isLoading, error, load, create, remove, getContext, saveContext }
}
