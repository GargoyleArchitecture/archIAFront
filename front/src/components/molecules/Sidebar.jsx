/**
 * <Sidebar /> — Menú lateral de navegación
 *
 * Sidebar vertical con items de navegación, grupo de items inferiores
 * (configuración, perfil, etc.) y un slot de footer opcional.
 * Soporta estado colapsado (solo iconos + TooltipAtom en hover).
 *
 * Props:
 *   items       — SidebarItemDef[]  Items del nav principal
 *   bottomItems — SidebarItemDef[]  Items fijos al fondo (settings, logout…)
 *   footer      — ReactNode         Slot debajo de los bottom items (oculto si collapsed)
 *   collapsed   — bool              Muestra solo iconos (default: false)
 *   className   — string            Clases adicionales para el <aside>
 *
 * SidebarItemDef shape:
 *   { id: string, label: string, icon?: ReactNode, href?: string, isActive?: bool, onClick?: function }
 *
 * Comportamiento:
 *   - Si `href` está definido, el item se renderiza como <a>
 *   - Si no, como <button>
 *   - Item activo: fondo brand-50, borde izquierdo brand-500, texto brand-700
 *   - collapsed=true: ancho w-14, solo iconos + TooltipAtom position="right"
 */

import BoxAtom     from '../atoms/BoxAtom'
import TooltipAtom from '../atoms/TooltipAtom'

/* ================================================================
   Componente interno: item individual del sidebar
================================================================ */
function SidebarItem({ item, collapsed }) {
  const { label, icon, href, isActive, onClick } = item
  const Tag = href ? 'a' : 'button'

  /* ── Modo expandido ── */
  if (!collapsed) {
    const classes = [
      'flex items-center gap-3 w-full rounded-md px-3 py-2',
      'text-body-sm font-sans transition-colors duration-150 outline-none',
      'border-l-2',
      isActive
        ? 'bg-brand-50 text-brand-700 border-brand-500 font-semibold'
        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900 font-medium',
      'focus:shadow-focus-gray',
    ].join(' ')

    return (
      <Tag
        href={href}
        type={!href ? 'button' : undefined}
        onClick={onClick}
        className={classes}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon && (
          <span
            className={[
              'flex-shrink-0 [&_svg]:w-5 [&_svg]:h-5',
              isActive ? 'text-brand-600' : 'text-gray-400',
            ].join(' ')}
          >
            {icon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </Tag>
    )
  }

  /* ── Modo colapsado: solo icono + TooltipAtom a la derecha ── */
  const collapsedClasses = [
    'flex items-center justify-center w-10 h-10 rounded-md',
    'transition-colors duration-150 outline-none',
    'border-l-2',
    isActive
      ? 'bg-brand-50 text-brand-600 border-brand-500'
      : 'text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-700',
    'focus:shadow-focus-gray',
    '[&_svg]:w-5 [&_svg]:h-5',
  ].join(' ')

  return (
    <TooltipAtom content={label} position="right">
      <Tag
        href={href}
        type={!href ? 'button' : undefined}
        onClick={onClick}
        className={collapsedClasses}
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
      >
        {icon}
      </Tag>
    </TooltipAtom>
  )
}

/* ================================================================
   Componente principal: Sidebar
================================================================ */
export default function Sidebar({
  items       = [],
  bottomItems = [],
  footer,
  collapsed   = false,
  className   = '',
  ...props
}) {
  const classes = [
    'flex flex-col h-full bg-white border-r border-gray-200',
    'transition-all duration-200',
    collapsed ? 'w-14 overscroll-x-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={classes} {...props}>

      {/* Navegación principal — ocupa el espacio restante */}
      <nav
        className={[
          'flex-1 overflow-y-auto flex flex-col gap-1',
          collapsed ? 'p-2 items-center overflow-x-hidden' : 'p-4',
        ].join(' ')}
      >
        {items.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Items inferiores */}
      {bottomItems.length > 0 && (
        <BoxAtom
          direction="col"
          gap="1"
          className={[
            'border-t border-gray-100',
            collapsed ? 'p-2 items-center' : 'p-4',
          ].join(' ')}
        >
          {bottomItems.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={collapsed} />
          ))}
          {!collapsed && footer && (
            <BoxAtom mt="2">
              {footer}
            </BoxAtom>
          )}
        </BoxAtom>
      )}

      {/* Footer sin bottomItems (solo cuando expandido) */}
      {bottomItems.length === 0 && footer && !collapsed && (
        <BoxAtom p="4" className="border-t border-gray-100">
          {footer}
        </BoxAtom>
      )}
    </aside>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   import ChatIcon      from '@mui/icons-material/Chat'
   import FolderIcon    from '@mui/icons-material/FolderOpen'
   import HomeIcon      from '@mui/icons-material/Home'
   import SettingsIcon  from '@mui/icons-material/Settings'
   import LogoutIcon    from '@mui/icons-material/Logout'

   const [activeId,  setActiveId]  = useState('chats')
   const [collapsed, setCollapsed] = useState(false)

   <Sidebar
     collapsed={collapsed}
     items={[
       { id: 'home',     label: 'Inicio',    icon: <HomeIcon />,   href: '/',         isActive: activeId === 'home' },
       { id: 'chats',    label: 'Chats',     icon: <ChatIcon />,   href: '/chats',    isActive: activeId === 'chats' },
       { id: 'projects', label: 'Proyectos', icon: <FolderIcon />, href: '/projects', isActive: activeId === 'projects' },
     ]}
     bottomItems={[
       { id: 'settings', label: 'Configuración', icon: <SettingsIcon />, href: '/settings' },
       { id: 'logout',   label: 'Cerrar sesión',  icon: <LogoutIcon />,  onClick: handleLogout },
     ]}
     footer={
       <TextAtom variant="text-xs" className="text-gray-400 px-3">
         ArchIA v0.1
       </TextAtom>
     }
     className="w-64"
   />

   // Toggle externo de colapso
   <button onClick={() => setCollapsed(prev => !prev)}>
     {collapsed ? '→' : '←'}
   </button>
---------------------------------------------------------------- */
