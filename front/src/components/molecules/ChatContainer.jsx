/**
 * <ChatContainer /> — Contenedor de mensajes de chat
 *
 * Resuelve la distribución correcta de los BubbleMessage dentro de
 * un chat. El problema es que BubbleMessage usa `flex flex-col
 * items-end/start` en su wrapper: si el wrapper no es `w-full`,
 * los mensajes del usuario no se alinean al borde derecho.
 *
 * ChatContainer aplica `w-full overflow-y-auto flex flex-col gap-4`,
 * lo que hace que flexbox aplique `align-items: stretch` por defecto
 * sobre sus hijos — cada BubbleMessage hereda el ancho completo
 * del contenedor y su alineación interna (items-end / items-start)
 * funciona correctamente.
 *
 * Props:
 *   children   — ReactNode   BubbleMessage o cualquier elemento de mensaje
 *   className  — string      Clases adicionales para el wrapper
 *
 * Notas de layout:
 *   - El padre debe darle altura definida (h-full, h-screen, etc.)
 *     para que overflow-y-auto funcione correctamente
 *   - padding interno: py-4 px-4 por defecto (sobreescribible con className)
 */

import BoxAtom from '../atoms/BoxAtom'

export default function ChatContainer({ children, className = '', ...props }) {
  return (
    <BoxAtom
      display="flex"
      direction="col"
      gap="4"
      w="full"
      overflow="y-auto"
      px="4"
      py="4"
      className={['min-h-0', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </BoxAtom>
  )
}

/* ----------------------------------------------------------------
   Ejemplos de uso:

   // Chat básico en una ventana con altura fija
   // IMPORTANTE: el padre debe ser flex flex-col con altura definida
   // y ChatContainer recibe flex-1 para que overflow-y-auto funcione.
   <div className="h-[600px] flex flex-col">
     <ChatContainer className="flex-1">
       <BubbleMessage variant="user" timestamp="14:20">
         ¿Qué es DDD?
       </BubbleMessage>
       <BubbleMessage variant="ai" timestamp="14:20">
         Domain-Driven Design es una metodología...
       </BubbleMessage>
       <BubbleMessage variant="ai" isLoading />
     </ChatContainer>
     <MessageInput onSend={handleSend} />
   </div>

   // Chat que ocupa toda la pantalla (con sidebar)
   <div className="flex h-screen">
     <Sidebar items={navItems} className="w-64" />
     <div className="flex flex-col flex-1 min-h-0">
       <ChatContainer className="flex-1 min-h-0">
         {messages.map(msg => (
           <BubbleMessage
             key={msg.id}
             variant={msg.variant}
             timestamp={msg.time}
             isLoading={msg.loading}
           >
             {msg.content}
           </BubbleMessage>
         ))}
       </ChatContainer>
       <div className="p-4 border-t border-gray-200">
         <MessageInput onSend={handleSend} />
       </div>
     </div>
   </div>
---------------------------------------------------------------- */
