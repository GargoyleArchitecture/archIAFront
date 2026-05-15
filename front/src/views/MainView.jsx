/**
 * MainView — Deprecado tras la Iteración 4 del refactor de routing.
 *
 * La sidebar persistente vive ahora en `components/templates/AppLayout.jsx`
 * y el contenido del chat en `components/templates/ChatHomePanel.jsx`.
 *
 * Este archivo se mantiene solo como re-export del panel de chat para
 * preservar imports externos durante la transición.
 */
export { default } from '../components/templates/ChatHomePanel'
