import { useMemo } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";

import ModeSwitcher from "./molecules/ModeSwitcher";
import TooltipAtom from "./atoms/TooltipAtom";
import { isMacPlatform } from "../hooks/useKeyboardShortcuts";

import "../styles/header.css";

/** Header global único.
 *  Notifica al chat con un CustomEvent para abrir/cerrar el drawer.
 *  F6-T2 + F6-T5: incluye el ModeSwitcher y un indicador discreto con la
 *  lista de atajos de teclado documentados en el tooltip.
 */
export default function Header() {
  const toggleDrawer = () => {
    window.dispatchEvent(new CustomEvent("arquia-toggle-drawer"));
  };

  // F6-T5: tooltip que enuncia los atajos disponibles. La detección de
  // plataforma (Cmd vs Ctrl) coincide con la del hook useKeyboardShortcuts.
  const shortcutsHint = useMemo(() => {
    const mod = isMacPlatform() ? "Cmd" : "Ctrl";
    return `Atajos: ${mod}+M cambiar modo · ${mod}+K enfocar input · ${mod}+/ paleta`;
  }, []);

  return (
    <AppBar
      position="static"
      sx={{
        background: "#111",
        boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton edge="start" aria-label="menu" onClick={toggleDrawer} sx={{ color: "#fff" }}>
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
            ArquIA
          </Typography>
          <Typography variant="h6" sx={{ color: "#d3d3d3", fontWeight: 500 }}>
            Chat
          </Typography>
        </Box>

        {/* F6-T2 + F6-T5 — ModeSwitcher e indicador de atajos en el lado derecho */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <ModeSwitcher />

          <TooltipAtom content={shortcutsHint} position="bottom">
            <button
              type="button"
              aria-label="Ver atajos de teclado"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <KeyboardOutlinedIcon style={{ fontSize: 18 }} />
            </button>
          </TooltipAtom>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
