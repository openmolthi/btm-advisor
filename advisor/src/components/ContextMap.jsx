import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Move, Camera } from 'lucide-react';
import { t } from '../lib/i18n';

const ContextMap = ({ industries, processes, values, capabilities, adoptionRelated, selectedLanguage }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };
  
  const onMouseDown = (e) => { 
    setIsDragging(true); 
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }; 
  };
  
  const onMouseMove = (e) => { 
    if (isDragging) { 
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); 
    } 
  };
  
  const onMouseUp = () => setIsDragging(false);

  const handleDownloadPng = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) { 
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"'); 
    }
    
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const bound = svgElement.getBoundingClientRect();
      canvas.width = bound.width * 2; 
      canvas.height = bound.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2); 
      ctx.drawImage(img, 0, 0, bound.width, bound.height);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a'); 
      downloadLink.href = pngUrl; 
      downloadLink.download = 'context-map.png'; 
      document.body.appendChild(downloadLink); 
      downloadLink.click(); 
      document.body.removeChild(downloadLink); 
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Check if there are any inputs selected
  const hasInputs = industries.length > 0 || processes.length > 0 || values.length > 0;

  if (!hasInputs) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
        <div className="text-center text-slate-400 max-w-md">
          <div className="text-6xl mb-4 opacity-20">🗺️</div>
          <p className="text-lg font-bold text-slate-500 mb-2">{t(selectedLanguage, "noContextSelected")}</p>
          <p className="text-sm font-medium">
            {t(selectedLanguage, "selectContextPrompt")}
          </p>
        </div>
      </div>
    );
  }

  const nodes = []; 
  const links = [];
  const colX = { ind: 50, proc: 280, val: 510, sol: 740, cap: 970 };
  let idCounter = 0;
  const createNode = (label, col, type) => ({ id: idCounter++, label, x: colX[col], type });

  const indNodes = industries.map(i => createNode(i, 'ind', 'industry'));
  const procNodes = processes.map(p => createNode(p, 'proc', 'process'));
  const valNodes = values.map(v => createNode(v, 'val', 'value'));
  
  const capNodes = capabilities.map(c => createNode(c, 'cap', 'capability'));

  // Determine which parent solutions are "active"
  const isSignavioActive = adoptionRelated?.signavio || capabilities.some(c => 
    c.includes('Signavio') || c.includes('Process') || c.includes('Journey')
  );
  const isLeanIXActive = adoptionRelated?.leanix || capabilities.some(c => 
    c.includes('LeanIX') || c.includes('Portfolio') || c.includes('Risk')
  );
  const isWalkMeActive = adoptionRelated?.walkme || capabilities.some(c => 
    c.includes('WalkMe') || c.includes('Adoption') || c.includes('Workflow')
  );
  
  const solNodes = [];
  if (isSignavioActive || (!isLeanIXActive && !isWalkMeActive && capabilities.length === 0)) 
    solNodes.push(createNode("SAP Signavio", 'sol', 'solution'));
  if (isLeanIXActive || (!isSignavioActive && !isWalkMeActive && capabilities.length === 0)) 
    solNodes.push(createNode("SAP LeanIX", 'sol', 'solution'));
  if (isWalkMeActive || (!isSignavioActive && !isLeanIXActive && capabilities.length === 0)) 
    solNodes.push(createNode("WalkMe", 'sol', 'solution'));
  
  nodes.push(...indNodes, ...procNodes, ...valNodes, ...solNodes, ...capNodes);
  
  // Linking
  indNodes.forEach(i => procNodes.forEach(p => links.push({ source: i, target: p })));
  procNodes.forEach(p => valNodes.forEach(v => links.push({ source: p, target: v })));
  valNodes.forEach(v => solNodes.forEach(s => links.push({ source: v, target: s })));
  
  // Link Solutions to Capabilities
  capNodes.forEach(c => {
    let parents = [];
    if (c.label.includes("Signavio") || c.label.includes("Process") || c.label.includes("Journey")) 
      parents.push("SAP Signavio");
    if (c.label.includes("LeanIX") || c.label.includes("Portfolio") || c.label.includes("Risk")) 
      parents.push("SAP LeanIX");
    if (c.label.includes("WalkMe") || c.label.includes("Adoption") || c.label.includes("Workflow")) 
      parents.push("WalkMe");
    
    parents.forEach(parentName => {
      const parentNode = solNodes.find(s => s.label === parentName);
      if (parentNode) {
        links.push({ source: parentNode, target: c });
      }
    });
  });

  const calculateY = (nodeList) => {
    const gap = 60;
    const totalHeight = (nodeList.length - 1) * gap;
    const offset = Math.max(0, (600 - totalHeight) / 2);
    nodeList.forEach((n, i) => { n.y = offset + (i * gap) + 50; });
  };
  
  calculateY(indNodes); 
  calculateY(procNodes); 
  calculateY(valNodes); 
  calculateY(solNodes); 
  calculateY(capNodes);
  
  const drawCurve = (x1, y1, x2, y2) => {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };
  
  const getColor = (type) => {
    switch(type) {
      case 'industry': return '#7e22ce'; 
      case 'process': return '#2563eb'; 
      case 'value': return '#16a34a'; 
      case 'solution': return '#475569'; 
      case 'capability': return '#ea580c';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="w-full h-full overflow-hidden relative bg-slate-50 rounded-lg">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white p-1 rounded-lg shadow-md border border-slate-200">
        <button 
          onClick={handleZoomIn} 
          className="p-2 hover:bg-slate-100 rounded text-slate-600" 
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="p-2 hover:bg-slate-100 rounded text-slate-600" 
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleReset} 
          className="p-2 hover:bg-slate-100 rounded text-slate-600" 
          title="Reset View"
        >
          <Move size={18} />
        </button>
        <div className="border-t border-slate-200 my-1"></div>
        <button 
          onClick={handleDownloadPng} 
          className="p-2 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600" 
          title="Download as PNG"
        >
          <Camera size={18} />
        </button>
      </div>
      
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        onMouseDown={onMouseDown} 
        onMouseMove={onMouseMove} 
        onMouseUp={onMouseUp} 
        onMouseLeave={onMouseUp}
      >
        <svg 
          ref={svgRef} 
          viewBox={`0 0 1200 600`} 
          preserveAspectRatio="xMidYMid meet" 
          className="w-full h-full" 
          style={{ fontFamily: 'sans-serif' }}
        >
          <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
            {links.map((link, i) => (
              <path 
                key={i} 
                d={drawCurve(link.source.x + 160, link.source.y + 15, link.target.x, link.target.y + 15)} 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="1.5" 
              />
            ))}
            {nodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <rect 
                  width="160" 
                  height="30" 
                  rx="6" 
                  fill="white" 
                  stroke={getColor(node.type)} 
                  strokeWidth="2" 
                />
                <text 
                  x="80" 
                  y="19" 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight="bold" 
                  fill="#1e293b" 
                  className="pointer-events-none select-none"
                >
                  {node.label.length > 24 ? node.label.substring(0, 22) + '..' : node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ContextMap;
