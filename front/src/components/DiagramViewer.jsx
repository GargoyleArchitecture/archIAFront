/* eslint-disable react/prop-types */
import { useMemo, useRef, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import "../styles/diagramViewer.css";

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
