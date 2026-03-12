/* eslint-disable react/prop-types */
import { useMemo, useRef, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CodeIcon from "@mui/icons-material/Code";
import EditIcon from "@mui/icons-material/Edit";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import "../styles/diagramViewer.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

/**
 * Renders an SVG diagram from a base64-encoded string.
 *
 * Props:
 *  - diagram: { ok: boolean, format: string, svg_b64: string }
 */
const DiagramViewer = ({ diagram }) => {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  // Decode the base64 SVG once
  const svgContent = useMemo(() => {
    if (!diagram?.ok || !diagram?.svg_b64) return null;
    try {
      return atob(diagram.svg_b64);
    } catch (err) {
      console.warn("Failed to decode base64 SVG:", err);
      return null;
    }
  }, [diagram]);

  if (!diagram?.ok || !svgContent) {
    return (
      <Box className="diagram-container diagram-empty">
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
          No diagram was generated.
        </Typography>
      </Box>
    );
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = () => {
    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `diagram-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download SVG:", err);
    }
  };

  const handleDownloadDot = () => {
    try {
      const dotCode = diagram?.dot;
      if (!dotCode) {
        console.warn("No DOT source available for this diagram.");
        return;
      }
      const blob = new Blob([dotCode], { type: "text/vnd.graphviz;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `diagram-${Date.now()}.dot`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download DOT:", err);
    }
  };

  const handleDownloadDrawio = async () => {
    try {
      const sid = diagram?.session_id;
      const detail = diagram?.detail_level || "detailed";
      if (sid) {
        // Preferred: fetch native .drawio from backend with Graphviz-computed layout
        const resp = await fetch(
          `${API}/diagram/export?session_id=${encodeURIComponent(sid)}&format=drawio&detail_level=${detail}`
        );
        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `diagram-${Date.now()}.drawio`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
        console.warn("Backend .drawio export failed, falling back to DOT");
      }
      // Fallback: download DOT source
      handleDownloadDot();
    } catch (err) {
      console.error("Failed to download .drawio:", err);
      handleDownloadDot();
    }
  };

  return (
    <Box className="diagram-container">
      {/* Toolbar */}
      <Box className="diagram-toolbar">
        <Tooltip title="Zoom in">
          <IconButton size="small" onClick={handleZoomIn} sx={{ color: "rgba(255,255,255,0.8)" }}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom out">
          <IconButton size="small" onClick={handleZoomOut} sx={{ color: "rgba(255,255,255,0.8)" }}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset zoom">
          <IconButton size="small" onClick={handleResetZoom} sx={{ color: "rgba(255,255,255,0.8)" }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", mx: 0.5 }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="Download SVG">
          <IconButton size="small" onClick={handleDownload} sx={{ color: "rgba(255,255,255,0.8)" }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit in draw.io (download .drawio)">
          <IconButton size="small" onClick={handleDownloadDrawio} sx={{ color: "#4ade80" }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {diagram?.dot && (
          <Tooltip title="Download DOT source">
            <IconButton size="small" onClick={handleDownloadDot} sx={{ color: "rgba(255,255,255,0.8)" }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* SVG render area */}
      <Box
        ref={containerRef}
        className="diagram-scroll-area"
      >
        <Box
          className="diagram-svg-wrapper"
          sx={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </Box>
    </Box>
  );
};

export default DiagramViewer;
