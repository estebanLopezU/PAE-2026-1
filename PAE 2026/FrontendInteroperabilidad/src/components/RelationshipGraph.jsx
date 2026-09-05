import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, ZoomIn, ZoomOut, Maximize2, Zap, X, Network, ArrowUpRight } from 'lucide-react';
import { relationshipsApi, sectorsApi } from '../services/api';

const HUB_RADIUS = 320;
const ENTITY_RADIUS = 150;
const ROOT_COLOR = '#FBBF24';

function hexWithAlpha(hex, alpha255) {
  const h = hex.replace('#', '');
  return `#${h}${Math.round(alpha255).toString(16).padStart(2, '0')}`;
}

function getConnectedEntities(node, graphData) {
  if (!node) return [];
  const connected = new Map(); // id -> { node, linkCount }
  graphData.links.forEach(link => {
    const sId = typeof link.source === 'object' ? link.source.id : link.source;
    const tId = typeof link.target === 'object' ? link.target.id : link.target;
    const otherId = sId === node.id ? tId : tId === node.id ? sId : null;
    if (!otherId) return;
    const otherNode = graphData.nodes.find(n => n.id === otherId);
    if (!otherNode || otherNode.level !== 'entity') return;
    if (connected.has(otherId)) {
      connected.get(otherId).linkCount += 1;
    } else {
      connected.set(otherId, { node: otherNode, linkCount: 1 });
    }
  });
  return Array.from(connected.values()).sort((a, b) => b.linkCount - a.linkCount);
}

export default function RelationshipGraph() {
  const [rawData, setRawData] = useState({ nodes: [], links: [] });
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoverNode, setHoverNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const fgRef = useRef();

  useEffect(() => {
    Promise.all([
      relationshipsApi.getGraph(),
      sectorsApi.getAll(),
    ])
      .then(([relRes, secRes]) => {
        const data = relRes.data;
        const secData = secRes.data?.items || secRes.data || [];
        setRawData(data);
        setSectors(secData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading graph:', err);
        setLoading(false);
      });
  }, []);

  const { graphData, entityNodes, hubCount } = useMemo(() => {
    if (!rawData.nodes.length) {
      return { graphData: { nodes: [], links: [] }, entityNodes: [], hubCount: 0 };
    }

    // Normalize all IDs to strings
    const rawNodes = rawData.nodes.map(n => ({ ...n, id: String(n.id) }));
    const nodesById = new Map(rawNodes.map(n => [n.id, n]));

    // Group entity IDs by sector
    const entitiesBySector = {};
    rawNodes.forEach(n => {
      const sec = n.sector || 'Otros';
      if (!entitiesBySector[sec]) entitiesBySector[sec] = [];
      entitiesBySector[sec].push(n.id);
    });

    const sortedSectors = Object.keys(entitiesBySector)
      .map(name => {
        const s = sectors.find(sec => sec.name === name);
        return { name, color: s?.color || '#94A3B8', count: entitiesBySector[name].length };
      })
      .sort((a, b) => b.count - a.count);

    const rootNode = {
      id: 'root',
      name: 'Estado Colombiano',
      val: 20,
      level: 'root',
      x: 0,
      y: 0,
    };

    const hubNodes = sortedSectors.map((s, i) => {
      const angle = (i / sortedSectors.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: `hub-${s.name}`,
        name: s.name,
        sector: s.name,
        color: s.color,
        val: 10 + s.count * 0.3,
        level: 'hub',
        x: Math.cos(angle) * HUB_RADIUS,
        y: Math.sin(angle) * HUB_RADIUS,
      };
    });

    const hubBySector = new Map(hubNodes.map(h => [h.sector, h]));

    const allNodes = [rootNode, ...hubNodes];
    const positionedEntityIds = new Set();

    sortedSectors.forEach((sec) => {
      const hub = hubBySector.get(sec.name);
      const ids = entitiesBySector[sec.name];
      const count = ids.length;
      const baseAngle = Math.atan2(hub.y, hub.x);
      const spread = Math.min(Math.PI / 1.3, Math.max(Math.PI / 6, count * 0.28));

      ids.forEach((eid, j) => {
        const entity = nodesById.get(eid);
        if (!entity) return;
        const offset = count === 1 ? 0 : (j - (count - 1) / 2) * (spread / (count - 1));
        const angle = baseAngle + offset;
        entity.x = hub.x + Math.cos(angle) * ENTITY_RADIUS;
        entity.y = hub.y + Math.sin(angle) * ENTITY_RADIUS;
        entity.color = sec.color;
        entity.level = 'entity';
        entity.hubId = hub.id;
        allNodes.push(entity);
        positionedEntityIds.add(eid);
      });
    });

    // Fallback for any orphan node
    rawNodes.forEach(n => {
      if (!positionedEntityIds.has(n.id)) {
        n.x = (Math.random() - 0.5) * 300;
        n.y = (Math.random() - 0.5) * 300;
        n.color = '#94A3B8';
        n.level = 'entity';
        allNodes.push(n);
      }
    });

    // Build links
    const structuralLinks = hubNodes.map(h => ({
      source: rootNode.id,
      target: h.id,
      type: 'structural',
      value: 3,
    }));

    allNodes.forEach(n => {
      if (n.level === 'entity' && n.hubId) {
        structuralLinks.push({
          source: n.hubId,
          target: n.id,
          type: 'structural',
          value: 1,
        });
      }
    });

    const validIds = new Set(allNodes.map(n => n.id));
    const dataLinks = (rawData.links || [])
      .map(link => ({
        ...link,
        source: String(link.source),
        target: String(link.target),
        type: 'data',
        value: 1,
      }))
      .filter(link => validIds.has(link.source) && validIds.has(link.target));

    return {
      graphData: { nodes: allNodes, links: [...structuralLinks, ...dataLinks] },
      entityNodes: rawNodes,
      hubCount: hubNodes.length,
    };
  }, [rawData, sectors]);

  const connectedEntities = useMemo(() => {
    return getConnectedEntities(clickedNode, graphData);
  }, [clickedNode, graphData]);

  const applyHighlight = useCallback((node) => {
    const newHN = new Set();
    const newHL = new Set();
    if (node) {
      newHN.add(node);
      graphData.links.forEach(link => {
        const sId = typeof link.source === 'object' ? link.source.id : link.source;
        const tId = typeof link.target === 'object' ? link.target.id : link.target;
        if (sId === node.id || tId === node.id) {
          newHL.add(link);
          const sNode = graphData.nodes.find(n => n.id === sId);
          const tNode = graphData.nodes.find(n => n.id === tId);
          if (sNode) newHN.add(sNode);
          if (tNode) newHN.add(tNode);
        }
      });
      if (node.level === 'hub') {
        graphData.nodes.forEach(n => {
          if (n.hubId === node.id) newHN.add(n);
        });
      }
      if (node.level === 'root') {
        graphData.nodes.forEach(n => newHN.add(n));
        graphData.links.forEach(l => newHL.add(l));
      }
    }
    setHighlightNodes(newHN);
    setHighlightLinks(newHL);
  }, [graphData]);

  const handleNodeHover = useCallback(node => {
    setHoverNode(node || null);
    if (!clickedNode) {
      applyHighlight(node);
    }
  }, [clickedNode, applyHighlight]);

  const handleLinkHover = useCallback(link => {
    const newHN = new Set();
    const newHL = new Set();
    if (link) {
      newHL.add(link);
      const sId = typeof link.source === 'object' ? link.source.id : link.source;
      const tId = typeof link.target === 'object' ? link.target.id : link.target;
      const sNode = graphData.nodes.find(n => n.id === sId);
      const tNode = graphData.nodes.find(n => n.id === tId);
      if (sNode) newHN.add(sNode);
      if (tNode) newHN.add(tNode);
    }
    setHoverNode(null);
    if (!clickedNode) {
      setHighlightNodes(newHN);
      setHighlightLinks(newHL);
    }
  }, [clickedNode, graphData]);

  const handleNodeClick = useCallback(node => {
    if (clickedNode && clickedNode.id === node.id) {
      setClickedNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    } else {
      setClickedNode(node);
      applyHighlight(node);
    }
  }, [clickedNode, applyHighlight]);

  const clearSelection = () => {
    setClickedNode(null);
    setSelectedNode(null);
    setSearchTerm('');
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setHoverNode(null);
  };

  const filteredNodes = entityNodes.filter(n =>
    n.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.acronym?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (node) => {
    setSearchTerm(node.name);
    setSelectedNode(node);
    const targetNode = graphData.nodes.find(n => n.id === String(node.id));
    if (targetNode && fgRef.current) {
      fgRef.current.centerAt(targetNode.x, targetNode.y, 800);
      fgRef.current.zoom(2.5, 800);
    }
    handleNodeClick(targetNode);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedNode(null);
    if (!clickedNode) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      setHoverNode(null);
    }
    if (fgRef.current) {
      fgRef.current.zoomToFit(800, 40);
    }
  };

  if (loading) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-gray-900 rounded-2xl border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Iniciando Motor de Interconexión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-[#050a18] rounded-2xl border border-gray-700 overflow-hidden group h-[700px]">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 z-10 w-80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar entidad en la red..."
              className="w-full bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl py-2 pl-10 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSelectedNode(null); }}
            />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
            {searchTerm && filteredNodes.length > 0 && !selectedNode && (
              <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-20">
                {filteredNodes.slice(0, 6).map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleSearch(node)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <span className="font-bold text-blue-400">{node.acronym || ''}</span> {node.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats / Legend */}
        <div className="absolute bottom-4 left-4 z-10 p-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl text-xs space-y-3 pointer-events-none max-w-[220px]">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold">Red Neuronal Estatal</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#FBBF24]"></div>
              <span className="text-gray-300">Núcleo Central</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]"></div>
              <span className="text-gray-300">Hubs Sectoriales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-gray-300">Entidades</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full"></div>
              <span className="text-gray-300">Interconexión</span>
            </div>
          </div>
          <p className="text-gray-500 text-[10px] pt-1 border-t border-gray-700">
            {rawData.nodes.length} entidades • {rawData.links.length} conexiones • {hubCount} sectores
          </p>
        </div>

        {/* Info Panel */}
        {hoverNode && (
          <div className="absolute top-4 right-4 z-10 p-5 bg-blue-900/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl w-72 animate-fade-in shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                {hoverNode.level === 'root' ? 'Núcleo Central' : hoverNode.level === 'hub' ? 'Sector Estratégico' : 'Conexión Activa'}
              </h4>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <p className="text-white font-extrabold text-lg leading-tight mb-3">{hoverNode.name}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {hoverNode.sector && hoverNode.level !== 'hub' && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-[10px] border border-blue-500/30 font-medium">
                  {hoverNode.sector}
                </span>
              )}
              {hoverNode.acronym && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-[10px] border border-purple-500/30 font-medium">
                  {hoverNode.acronym}
                </span>
              )}
              {hoverNode.level === 'hub' && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] border border-emerald-500/30 font-medium">
                  {graphData.nodes.filter(n => n.hubId === hoverNode.id).length} entidades
                </span>
              )}
            </div>
            <div className="pt-4 border-t border-blue-500/20">
              <p className="text-gray-400 text-[11px]">
                {hoverNode.level === 'root'
                  ? `Eje central de interoperabilidad con ${hubCount} sectores estratégicos.`
                  : hoverNode.level === 'hub'
                  ? 'Coordina la interoperabilidad de su sector con el ecosistema nacional.'
                  : highlightLinks.size > 0
                  ? `Interoperando con ${highlightLinks.size} entidades del Estado.`
                  : 'Sin conexiones externas verificadas en este momento.'}
              </p>
            </div>
          </div>
        )}

        {/* Neural Graph */}
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          backgroundColor="#050a18"
          nodeRelSize={6}
          warmupTicks={0}
          cooldownTicks={0}
          enableNodeDrag={false}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          linkColor={link => {
            if (highlightLinks.size && !highlightLinks.has(link)) return 'rgba(100,116,139,0.04)';
            if (link.type === 'structural') {
              const src = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
              if (src && src.level === 'root') return 'rgba(251,191,36,0.35)';
              return 'rgba(148,163,184,0.22)';
            }
            return highlightLinks.has(link) ? '#60A5FA' : 'rgba(59,130,246,0.12)';
          }}
          linkWidth={link => {
            if (highlightLinks.has(link)) return 3;
            return link.type === 'structural' ? 1.5 : 1;
          }}
          linkDirectionalParticles={link => link.type === 'data' ? 3 : 0}
          linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 3 : 1.5}
          linkDirectionalParticleSpeed={0.008}
          linkDirectionalParticleColor={() => '#60A5FA'}
          onNodeHover={handleNodeHover}
          onLinkHover={handleLinkHover}
          onNodeClick={handleNodeClick}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const isHighlighted = highlightNodes.has(node);
            const isDimmed = highlightNodes.size && !isHighlighted;
            const isClicked = clickedNode && clickedNode.id === node.id;

            if (node.level === 'root') {
              const r = 16 / globalScale;
              // outer glow ring
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 8, 0, 2 * Math.PI);
              ctx.fillStyle = isDimmed ? hexWithAlpha(ROOT_COLOR, 15) : hexWithAlpha(ROOT_COLOR, 50);
              ctx.fill();
              // core
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = isDimmed ? hexWithAlpha(ROOT_COLOR, 80) : ROOT_COLOR;
              ctx.shadowBlur = isHighlighted ? 30 : 14;
              ctx.shadowColor = ROOT_COLOR;
              ctx.fill();
              ctx.shadowBlur = 0;
              // click ring
              if (isClicked) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r + 14, 0, 2 * Math.PI);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }
              if (globalScale > 0.5) {
                ctx.font = `bold ${13 / globalScale}px Inter, system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.35)' : '#FFF';
                ctx.fillText(node.name, node.x, node.y + r + 10);
              }
            } else if (node.level === 'hub') {
              const r = (7 + node.val * 0.35) / globalScale;
              const color = node.color || '#10B981';
              // outer ring
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 5, 0, 2 * Math.PI);
              ctx.fillStyle = isDimmed ? hexWithAlpha(color, 12) : hexWithAlpha(color, 45);
              ctx.fill();
              // core
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = isDimmed ? hexWithAlpha(color, 70) : color;
              ctx.shadowBlur = isHighlighted ? 22 : 10;
              ctx.shadowColor = color;
              ctx.fill();
              ctx.shadowBlur = 0;
              // click ring
              if (isClicked) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r + 10, 0, 2 * Math.PI);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }
              if (globalScale > 0.6) {
                ctx.font = `bold ${11 / globalScale}px Inter, system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.35)' : '#FFF';
                ctx.fillText(node.name, node.x, node.y + r + 9);
              }
            } else {
              const r = (3.5 + (node.val || 2) * 1.2) / globalScale;
              const color = node.color || '#3B82F6';
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = isDimmed ? hexWithAlpha(color, 45) : color;
              ctx.shadowBlur = isHighlighted ? 14 : 5;
              ctx.shadowColor = color;
              ctx.fill();
              ctx.shadowBlur = 0;
              // click ring
              if (isClicked) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r + 7, 0, 2 * Math.PI);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5 / globalScale;
                ctx.stroke();
              }

              if ((globalScale > 1.6 || isHighlighted) && node.acronym) {
                ctx.font = `bold ${9 / globalScale}px Inter, system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isDimmed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)';
                ctx.fillText(node.acronym, node.x, node.y + r + 5);
              }
            }
          }}
        />

        {/* Navigation Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400)} className="p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
            <ZoomIn className="h-5 w-5" />
          </button>
          <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 400)} className="p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
            <ZoomOut className="h-5 w-5" />
          </button>
          <button onClick={() => fgRef.current?.zoomToFit(400, 40)} className="p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Connected Entities Table */}
      {clickedNode && (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Network className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">
                  Conexiones de {clickedNode.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {clickedNode.level === 'entity'
                    ? `Entidad del sector ${clickedNode.sector || 'N/A'}`
                    : clickedNode.level === 'hub'
                    ? `Sector ${clickedNode.name}`
                    : 'Núcleo Central del Estado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                {connectedEntities.length} entidades conectadas
              </span>
              <button
                onClick={clearSelection}
                className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-600 transition-all"
                title="Cerrar tabla"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {connectedEntities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">#</th>
                    <th className="px-5 py-3 text-left font-semibold">Entidad</th>
                    <th className="px-5 py-3 text-left font-semibold">Sigla</th>
                    <th className="px-5 py-3 text-left font-semibold">Sector</th>
                    <th className="px-5 py-3 text-left font-semibold">Conexiones directas</th>
                    <th className="px-5 py-3 text-left font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {connectedEntities.map((item, idx) => (
                    <tr
                      key={item.node.id}
                      className="transition hover:bg-slate-700/20"
                    >
                      <td className="px-5 py-3 text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.node.color || '#3B82F6' }}
                          />
                          <span className="font-medium text-slate-100">{item.node.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {item.node.acronym || <span className="text-slate-500 italic">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                          style={{
                            backgroundColor: hexWithAlpha(item.node.color || '#3B82F6', 20),
                            borderColor: hexWithAlpha(item.node.color || '#3B82F6', 60),
                            color: item.node.color || '#60A5FA',
                          }}
                        >
                          {item.node.sector || 'Otros'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 rounded-full bg-slate-700 w-24 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-400"
                              style={{
                                width: `${Math.min(100, (item.linkCount / Math.max(...connectedEntities.map(e => e.linkCount))) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 tabular-nums">{item.linkCount}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => {
                            const target = graphData.nodes.find(n => n.id === item.node.id);
                            if (target && fgRef.current) {
                              fgRef.current.centerAt(target.x, target.y, 800);
                              fgRef.current.zoom(2.5, 800);
                              handleNodeClick(target);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          Ver en red <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <Network className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {clickedNode.level === 'entity'
                  ? 'Esta entidad no tiene conexiones de interoperabilidad directas registradas.'
                  : clickedNode.level === 'hub'
                  ? 'Este sector no tiene conexiones de datos directas en la red.'
                  : 'Selecciona una entidad o sector en la red para ver sus conexiones.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
