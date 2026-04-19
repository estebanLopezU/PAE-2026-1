import React, { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, Info, ZoomIn, ZoomOut, Maximize2, Zap } from 'lucide-react';
import { relationshipsApi } from '../services/api';

export default function RelationshipGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    relationshipsApi.getGraph()
      .then(res => {
        const data = res.data;
        // Map source/target to object references
        const nodesById = Object.fromEntries(data.nodes.map(node => [node.id, node]));
        const links = data.links.map(link => ({
          ...link,
          source: nodesById[link.source],
          target: nodesById[link.target]
        })).filter(link => link.source && link.target);

        setGraphData({ nodes: data.nodes, links });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading graph:', err);
        setLoading(false);
      });
  }, []);

  const updateHighlight = () => {
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  };

  const handleNodeHover = node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      graphData.links.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          highlightLinks.add(link);
          highlightNodes.add(link.source);
          highlightNodes.add(link.target);
        }
      });
    }
    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = link => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }
    updateHighlight();
  };

  const filteredNodes = graphData.nodes.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (n.acronym && n.acronym.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSearch = (node) => {
    setSearchTerm(node.name);
    setSelectedNode(node);
    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(3, 1000);
    handleNodeHover(node);
  };

  if (loading) return (
    <div className="h-[600px] flex items-center justify-center bg-gray-900 rounded-2xl border border-gray-700">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Iniciando Motor de Interconexión...</p>
      </div>
    </div>
  );

  return (
    <div className="relative bg-[#050a18] rounded-2xl border border-gray-700 overflow-hidden group">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10 w-72">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar entidad en la red..."
            className="w-full bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && filteredNodes.length > 0 && !selectedNode && (
            <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-20">
              {filteredNodes.slice(0, 5).map(node => (
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

      {/* Stats/Legend */}
      <div className="absolute bottom-4 left-4 z-10 p-4 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl text-xs space-y-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-bold">Estado: Red Operativa</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3B82F6]"></div>
            <span className="text-gray-300">Entidad Pública</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            <span className="text-gray-300">Flujo de Datos (Real-time)</span>
          </div>
        </div>
        <p className="text-gray-500 text-[10px]">Total Conexiones: {graphData.links.length}</p>
      </div>

      {/* Floating Info Panel */}
      {hoverNode && (
        <div className="absolute top-4 right-4 z-10 p-5 bg-blue-900/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl w-72 animate-fade-in shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em]">Conexión Activa</h4>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <p className="text-white font-extrabold text-lg leading-tight mb-3">{hoverNode.name}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-[10px] border border-blue-500/30 font-medium">
              {hoverNode.sector}
            </span>
            {hoverNode.acronym && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-[10px] border border-purple-500/30 font-medium">
                {hoverNode.acronym}
              </span>
            )}
          </div>
          <div className="pt-4 border-t border-blue-500/20">
            <p className="text-gray-400 text-[11px]">
              {highlightLinks.size > 0 
                ? `Interoperando con ${highlightLinks.size} entidades del Estado.`
                : 'Sin conexiones externas verificadas en este momento.'}
            </p>
          </div>
        </div>
      )}

      {/* The Neural Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#050a18"
        nodeRelSize={7}
        nodeColor={node => highlightNodes.has(node) ? '#60A5FA' : '#1D4ED8'}
        linkColor={link => highlightLinks.has(link) ? '#60A5FA' : 'rgba(59, 130, 246, 0.2)'}
        linkWidth={link => highlightLinks.has(link) ? 3 : 1.5}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleColor={() => '#60A5FA'}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.acronym || node.name.substring(0, 8);
          const fontSize = 14/globalScale;
          
          // Glow effect for all nodes
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = highlightNodes.has(node) ? '#FFFFFF' : '#3B82F6';
          ctx.shadowBlur = highlightNodes.has(node) ? 15 : 5;
          ctx.shadowColor = '#3B82F6';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Text labels if zoomed in
          if (globalScale > 2) {
            ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(label, node.x, node.y + 12);
          }
        }}
      />

      {/* Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={() => fgRef.current.zoom(fgRef.current.zoom() * 1.5, 400)} className="p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all"><ZoomIn className="h-5 w-5" /></button>
        <button onClick={() => fgRef.current.zoom(fgRef.current.zoom() * 0.7, 400)} className="p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all"><ZoomOut className="h-5 w-5" /></button>
        <button onClick={() => fgRef.current.zoomToFit(400)} className="p-2 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all"><Maximize2 className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
