/**
 * USACE Vocabulary Explorer
 * Interactive visualization of USACE ontologies and vocabularies
 */

class VocabExplorer {
  constructor() {
    this.graph = null;
    this.searchIndex = null;
    this.domains = null;
    this.cy = null;
    this.selectedNode = null;
    this.visibleNodes = new Set();
    this.theme = 'firefly';
    this.currentView = 'domain'; // 'domain' or 'combined'

    // Color palette for micro-theories in combined view
    this.microTheoryColors = {
      'dams': { bg: '#ef4444', border: '#dc2626' },
      'dod-real-property': { bg: '#f97316', border: '#ea580c' },
      'engineering-and-design': { bg: '#f59e0b', border: '#d97706' },
      'facilities-maintenance': { bg: '#84cc16', border: '#65a30d' },
      'hydrographic-survey': { bg: '#22c55e', border: '#16a34a' },
      'installation-resilience': { bg: '#14b8a6', border: '#0d9488' },
      'levees': { bg: '#06b6d4', border: '#0891b2' },
      'navigation': { bg: '#3b82f6', border: '#2563eb' },
      'operation-and-maintenance': { bg: '#6366f1', border: '#4f46e5' },
      'project-delivery': { bg: '#8b5cf6', border: '#7c3aed' },
      'recreation': { bg: '#a855f7', border: '#9333ea' },
      'spatial-foundation': { bg: '#d946ef', border: '#c026d3' },
      'studies': { bg: '#ec4899', border: '#db2777' },
      'water-control': { bg: '#f43f5e', border: '#e11d48' }
    };

    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.initCytoscape();
      this.bindEvents();
      this.applyTheme();
      this.updateStats();
      this.populateDomainFilter();
      this.hideLoading();
    } catch (error) {
      console.error('Failed to initialize:', error);
      this.showError('Failed to load vocabulary data. Please ensure the data files exist.');
    }
  }

  async loadData() {
    const [graphRes, searchRes, domainsRes] = await Promise.all([
      fetch('data/graph.json'),
      fetch('data/search-index.json'),
      fetch('data/domains.json')
    ]);

    if (!graphRes.ok || !searchRes.ok || !domainsRes.ok) {
      throw new Error('Failed to load data files');
    }

    const minGraph = await graphRes.json();
    const minSearch = await searchRes.json();
    this.domains = await domainsRes.json();

    // Expand minified graph keys
    // n=nodes, e=edges, a=adjacency
    // Node: i=id, l=label, d=definition, a=altLabels, s=source, o=scopeNote, x=example, t=type, m=domain
    // Edge: s=source, g=target, t=type
    // Adjacency: n=node, t=type
    this.graph = {
      nodes: minGraph.n.map(n => ({
        id: n.i,
        label: n.l,
        definition: n.d || '',
        altLabels: n.a || [],
        source: n.s || '',
        scopeNote: n.o || '',
        example: n.x || '',
        type: n.t,
        domain: n.m
      })),
      edges: minGraph.e.map(e => ({
        source: e.s,
        target: e.g,
        type: e.t
      })),
      adjacency: Object.fromEntries(
        Object.entries(minGraph.a).map(([key, value]) => [
          key,
          value.map(item => ({ node: item.n, type: item.t }))
        ])
      )
    };

    // Expand minified search index keys
    // i=id, l=label, a=altLabels, d=definition, m=domain
    this.searchIndex = minSearch.map(s => ({
      id: s.i,
      label: s.l,
      altLabels: s.a || [],
      definition: s.d || '',
      domain: s.m
    }));

    // Create node lookup map
    this.nodeMap = new Map();
    this.graph.nodes.forEach(node => {
      this.nodeMap.set(node.id, node);
    });
  }

  initCytoscape() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      style: this.theme === 'firefly' ? this.getFireflyStyles() : this.getLightStyles(),
      layout: { name: 'preset' },
      minZoom: 0.05,
      maxZoom: 8,
      wheelSensitivity: 0.3
    });

    // Show labels when zoomed in on combined view
    this.cy.on('zoom', () => {
      if (this.currentView === 'combined') {
        const zoom = this.cy.zoom();
        // Show labels when zoomed in past 2x
        const showLabels = zoom > 2;
        this.cy.nodes('[bgColor]').style('text-opacity', showLabels ? 1 : 0);
      }
    });

    // Node click handler
    this.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      this.selectNode(node.id());
    });

    // Background click handler
    this.cy.on('tap', (evt) => {
      if (evt.target === this.cy) {
        this.clearSelection();
      }
    });

    // Hover tooltip
    this.cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const data = this.nodeMap.get(node.id());
      if (data) {
        this.showTooltip(evt.renderedPosition, data.label, data.definition);
      }
    });

    this.cy.on('mouseout', 'node', () => {
      this.hideTooltip();
    });
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearBtn.style.display = query ? 'flex' : 'none';
      this.search(query);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      this.clearSearch();
    });

    // Domain filter
    document.getElementById('domain-select').addEventListener('change', (e) => {
      this.filterByDomain(e.target.value);
    });

    // Graph controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      this.cy.zoom(this.cy.zoom() * 1.3);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      this.cy.zoom(this.cy.zoom() / 1.3);
    });

    document.getElementById('btn-fit').addEventListener('click', () => {
      this.cy.fit(null, 50);
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      this.resetGraph();
    });

    document.getElementById('btn-expand').addEventListener('click', () => {
      if (this.selectedNode) {
        this.expandNode(this.selectedNode);
      }
    });

    document.getElementById('btn-layout').addEventListener('click', () => {
      this.runLayout();
    });

    // Detail panel actions
    document.getElementById('btn-focus').addEventListener('click', () => {
      if (this.selectedNode) {
        this.focusOnNode(this.selectedNode);
      }
    });

    document.getElementById('btn-explore').addEventListener('click', () => {
      if (this.selectedNode) {
        this.expandNode(this.selectedNode);
      }
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'firefly' : 'light';
    this.applyTheme();
  }

  applyTheme() {
    // Update body data attribute
    document.documentElement.setAttribute('data-theme', this.theme === 'firefly' ? 'firefly' : '');

    // Update toggle button
    const iconLight = document.getElementById('icon-light');
    const iconDark = document.getElementById('icon-dark');
    const label = document.querySelector('.theme-label');

    if (this.theme === 'firefly') {
      iconLight.style.display = 'none';
      iconDark.style.display = 'block';
      label.textContent = 'Light Mode';
    } else {
      iconLight.style.display = 'block';
      iconDark.style.display = 'none';
      label.textContent = 'Firefly Mode';
    }

    // Update Cytoscape styles if initialized
    if (this.cy) {
      this.cy.style(this.theme === 'firefly' ? this.getFireflyStyles() : this.getLightStyles());
    }
  }

  getLightStyles() {
    return [
      // Node styles - light fills with colored borders for professional appearance
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#eff6ff',
          'color': '#1e40af',
          'font-size': '10px',
          'font-weight': '500',
          'text-wrap': 'wrap',
          'text-max-width': '80px',
          'width': 'label',
          'height': 'label',
          'padding': '6px',
          'shape': 'round-rectangle',
          'border-width': 2,
          'border-color': '#3b82f6'
        }
      },
      {
        selector: 'node[type="class"]',
        style: { 'background-color': '#f5f3ff', 'border-color': '#8b5cf6', 'color': '#6d28d9' }
      },
      {
        selector: 'node[type="property"]',
        style: { 'background-color': '#fdf2f8', 'border-color': '#ec4899', 'color': '#be185d', 'shape': 'diamond' }
      },
      {
        selector: 'node:selected',
        style: { 'background-color': '#fef3c7', 'border-color': '#f59e0b', 'color': '#92400e', 'border-width': 3 }
      },
      {
        selector: 'node.highlighted',
        style: { 'background-color': '#d1fae5', 'border-color': '#10b981', 'color': '#065f46', 'border-width': 3 }
      },
      {
        selector: 'node.faded',
        style: { 'opacity': 0.3 }
      },
      // Domain-colored nodes (combined view) - small dots, labels show on zoom
      {
        selector: 'node[bgColor]',
        style: {
          'background-color': 'data(bgColor)',
          'border-color': 'data(borderColor)',
          'width': 5,
          'height': 5,
          'label': 'data(label)',
          'font-size': '8px',
          'text-opacity': 0, // Hidden by default, shown on zoom via event
          'shape': 'ellipse',
          'min-zoomed-font-size': 10 // Only show labels when zoomed in enough
        }
      },
      // Edge styles
      {
        selector: 'edge',
        style: {
          'width': 1.5,
          'line-color': '#94a3b8',
          'target-arrow-color': '#94a3b8',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'arrow-scale': 0.7
        }
      },
      {
        selector: 'edge[type="broader"], edge[type="narrower"]',
        style: { 'line-color': '#3b82f6', 'target-arrow-color': '#3b82f6' }
      },
      {
        selector: 'edge[type="related"]',
        style: { 'line-color': '#10b981', 'target-arrow-color': '#10b981', 'line-style': 'dashed' }
      },
      {
        selector: 'edge[type="subClassOf"], edge[type="superClassOf"]',
        style: { 'line-color': '#8b5cf6', 'target-arrow-color': '#8b5cf6' }
      },
      {
        selector: 'edge[type="exactMatch"], edge[type="closeMatch"], edge[type="equivalentClass"]',
        style: { 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b', 'line-style': 'dotted' }
      },
      {
        selector: 'edge.faded',
        style: { 'opacity': 0.15 }
      },
      {
        selector: 'edge.highlighted',
        style: {
          'line-color': '#f59e0b',
          'target-arrow-color': '#f59e0b',
          'width': 2.5,
          'opacity': 1,
          'z-index': 999
        }
      }
    ];
  }

  getFireflyStyles() {
    return [
      // Node styles - glowing firefly effect
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#1e3a5f',
          'background-opacity': 0.9,
          'color': '#e2e8f0',
          'font-size': '10px',
          'font-weight': '500',
          'text-wrap': 'wrap',
          'text-max-width': '80px',
          'width': 'label',
          'height': 'label',
          'padding': '6px',
          'shape': 'round-rectangle',
          'border-width': 1,
          'border-color': '#60a5fa',
          'border-opacity': 0.8,
          'text-outline-color': '#0f172a',
          'text-outline-width': 1,
          'overlay-opacity': 0
        }
      },
      {
        selector: 'node[type="class"]',
        style: {
          'background-color': '#2e1065',
          'border-color': '#a78bfa'
        }
      },
      {
        selector: 'node[type="property"]',
        style: {
          'background-color': '#500724',
          'border-color': '#f472b6',
          'shape': 'diamond'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'background-color': '#422006',
          'border-color': '#fbbf24',
          'border-width': 2
        }
      },
      {
        selector: 'node.highlighted',
        style: {
          'background-color': '#052e16',
          'border-color': '#34d399',
          'border-width': 2
        }
      },
      {
        selector: 'node.faded',
        style: { 'opacity': 0.2 }
      },
      // Domain-colored nodes (combined view) - glowing dots, labels on zoom
      {
        selector: 'node[bgColor]',
        style: {
          'background-color': 'data(bgColor)',
          'border-color': 'data(borderColor)',
          'background-opacity': 0.95,
          'width': 4,
          'height': 4,
          'label': 'data(label)',
          'font-size': '7px',
          'text-opacity': 0, // Hidden by default, shown on zoom via event
          'shape': 'ellipse',
          'min-zoomed-font-size': 10
        }
      },
      // Edge styles - glowing lines
      {
        selector: 'edge',
        style: {
          'width': 1,
          'line-color': '#475569',
          'target-arrow-color': '#475569',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'arrow-scale': 0.6,
          'opacity': 0.7
        }
      },
      {
        selector: 'edge[type="broader"], edge[type="narrower"]',
        style: {
          'line-color': '#60a5fa',
          'target-arrow-color': '#60a5fa',
          'width': 2,
          'opacity': 0.9
        }
      },
      {
        selector: 'edge[type="related"]',
        style: {
          'line-color': '#34d399',
          'target-arrow-color': '#34d399',
          'line-style': 'dashed',
          'width': 2,
          'opacity': 0.9
        }
      },
      {
        selector: 'edge[type="subClassOf"], edge[type="superClassOf"]',
        style: {
          'line-color': '#a78bfa',
          'target-arrow-color': '#a78bfa',
          'width': 2,
          'opacity': 0.9
        }
      },
      {
        selector: 'edge[type="exactMatch"], edge[type="closeMatch"], edge[type="equivalentClass"]',
        style: {
          'line-color': '#fbbf24',
          'target-arrow-color': '#fbbf24',
          'line-style': 'dotted',
          'width': 2,
          'opacity': 0.9
        }
      },
      {
        selector: 'edge.faded',
        style: { 'opacity': 0.1 }
      },
      {
        selector: 'edge.highlighted',
        style: {
          'line-color': '#fbbf24',
          'target-arrow-color': '#fbbf24',
          'width': 3,
          'opacity': 1,
          'z-index': 999
        }
      }
    ];
  }

  search(query) {
    const resultsContainer = document.getElementById('search-results');

    if (!query || query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = this.searchIndex.filter(item => {
      // Search only the primary label
      return item.label.includes(lowerQuery);
    }).slice(0, 20);

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No matching terms found</div>';
      return;
    }

    resultsContainer.innerHTML = results.map(item => {
      const node = this.nodeMap.get(item.id);
      const highlightedLabel = this.highlightMatch(node.label, query);
      const shortDef = node.definition ? node.definition.substring(0, 100) + '...' : '';

      return `
        <div class="search-result-item" data-id="${item.id}">
          <div class="search-result-label">${highlightedLabel}</div>
          <div class="search-result-domain">${node.domain}</div>
          ${shortDef ? `<div class="search-result-definition">${shortDef}</div>` : ''}
        </div>
      `;
    }).join('');

    // Bind click handlers
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const node = this.nodeMap.get(id);

        if (node && node.domain) {
          // Set the domain dropdown to match the node's domain
          const domainSelect = document.getElementById('domain-select');
          domainSelect.value = node.domain;

          // Load the domain's graph
          this.filterByDomain(node.domain);

          // Wait for layout animation to complete (500ms), then select and center on the node
          setTimeout(() => {
            this.selectNode(id);
            this.showNodeInGraph(id);
          }, 600);
        } else {
          this.selectNode(id);
          this.showNodeInGraph(id);
        }
      });
    });
  }

  highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  clearSearch() {
    document.getElementById('search-results').innerHTML = '';
  }

  selectNode(nodeId) {
    this.selectedNode = nodeId;
    const nodeData = this.nodeMap.get(nodeId);

    if (!nodeData) return;

    // Update detail panel
    this.showDetailPanel(nodeData);

    // Highlight in graph if visible
    const cyNode = this.cy.getElementById(nodeId);
    if (cyNode.length > 0) {
      // Clear previous selection highlights
      this.cy.nodes().removeClass('selected');
      this.cy.edges().removeClass('highlighted');

      // Select the node
      cyNode.select();

      // Highlight connected edges
      const connectedEdges = cyNode.connectedEdges();
      connectedEdges.addClass('highlighted');
    }
  }

  showDetailPanel(node) {
    const placeholder = document.querySelector('.detail-placeholder');
    const content = document.querySelector('.detail-content');

    placeholder.style.display = 'none';
    content.style.display = 'block';

    // Update type badge - show both term type and file type (vocabulary/ontology)
    const typeEl = document.getElementById('detail-type');
    const termType = node.type || node.instanceType || 'unknown';
    const fileType = node.domain ? node.domain.split(' - ').pop() : '';
    const fileTypeIcon = {
      'vocabulary': '📖',
      'ontology': '🔗',
      'workflow': '⚙️',
      'spatial': '🗺️',
      'instances': '📍',
      'shapes': '✅'
    }[fileType] || '';
    typeEl.textContent = `${fileTypeIcon} ${termType}`;
    typeEl.className = `detail-type ${termType} ${fileType}`;

    // Update basic info
    document.getElementById('detail-label').textContent = node.label;
    document.getElementById('detail-uri').textContent = node.id;

    document.getElementById('detail-definition').textContent = node.definition || 'No definition available.';

    // Update optional sections
    this.updateOptionalSection('section-source', 'detail-source', node.source);
    this.updateOptionalSection('section-scope', 'detail-scope', node.scopeNote);
    this.updateOptionalSection('section-example', 'detail-example', node.example);

    // Alt labels
    const altSection = document.getElementById('section-altlabels');
    const altContainer = document.getElementById('detail-altlabels');
    if (node.altLabels && node.altLabels.length > 0) {
      altSection.style.display = 'block';
      altContainer.innerHTML = node.altLabels.map(l => `<span class="tag">${l}</span>`).join('');
    } else {
      altSection.style.display = 'none';
    }

    // Relations
    this.updateRelations(node.id);
  }

  updateOptionalSection(sectionId, contentId, value) {
    const section = document.getElementById(sectionId);
    const content = document.getElementById(contentId);

    if (value) {
      // Use flex for source-callout, block for others
      section.style.display = sectionId === 'section-source' ? 'flex' : 'block';
      content.textContent = value;
    } else {
      section.style.display = 'none';
    }
  }

  updateRelations(nodeId) {
    const container = document.getElementById('detail-relations');

    const adjacency = this.graph.adjacency[nodeId] || [];

    if (adjacency.length === 0) {
      container.innerHTML = '<div class="no-relations">No related terms found.</div>';
      return;
    }

    // Group by relationship type
    const groups = {};
    const typeLabels = {
      broader: 'Broader Terms',
      narrower: 'Narrower Terms',
      related: 'Related Terms',
      subClassOf: 'Subclass Of',
      superClassOf: 'Superclass Of',
      exactMatch: 'Exact Match',
      closeMatch: 'Close Match',
      equivalentClass: 'Equivalent Class',
      domain: 'Domain Of',
      range: 'Range Of',
      hasDomainProperty: 'Properties (Domain)',
      hasRangeProperty: 'Properties (Range)'
    };

    const groupClasses = {
      broader: 'broader',
      narrower: 'narrower',
      related: 'related',
      subClassOf: 'subclass',
      superClassOf: 'subclass',
      exactMatch: 'match',
      closeMatch: 'match',
      equivalentClass: 'match'
    };

    adjacency.forEach(rel => {
      const type = rel.type;
      if (!groups[type]) groups[type] = [];
      const targetNode = this.nodeMap.get(rel.node);
      if (targetNode) {
        groups[type].push(targetNode);
      }
    });

    let html = '';
    Object.entries(groups).forEach(([type, nodes]) => {
      const label = typeLabels[type] || type;
      const groupClass = groupClasses[type] || '';

      html += `
        <div class="relation-group ${groupClass}">
          <div class="relation-group-label">${label} (${nodes.length})</div>
          ${nodes.slice(0, 10).map(n => `
            <div class="relation-item" data-id="${n.id}">
              <span class="relation-item-label">${n.label}</span>
            </div>
          `).join('')}
          ${nodes.length > 10 ? `<div class="relation-item" style="font-style: italic; color: #64748b;">+${nodes.length - 10} more...</div>` : ''}
        </div>
      `;
    });

    container.innerHTML = html;

    // Bind click handlers
    container.querySelectorAll('.relation-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.selectNode(id);
        this.showNodeInGraph(id);
      });
    });
  }

  showNodeInGraph(nodeId) {
    // Check if node already exists in graph
    let cyNode = this.cy.getElementById(nodeId);

    if (cyNode.length === 0) {
      // Add the node to graph
      this.addNodeToGraph(nodeId);
      cyNode = this.cy.getElementById(nodeId);
    }

    // Center on node
    if (cyNode.length > 0) {
      this.cy.animate({
        center: { eles: cyNode },
        zoom: 1.5
      }, { duration: 300 });

      this.cy.nodes().removeClass('selected');
      cyNode.select();
    }
  }

  addNodeToGraph(nodeId) {
    const nodeData = this.nodeMap.get(nodeId);
    if (!nodeData) return;

    // Add the node
    this.cy.add({
      group: 'nodes',
      data: {
        id: nodeId,
        label: nodeData.label,
        type: nodeData.type
      },
      position: {
        x: this.cy.width() / 2 + (Math.random() - 0.5) * 200,
        y: this.cy.height() / 2 + (Math.random() - 0.5) * 200
      }
    });

    this.visibleNodes.add(nodeId);

    // Add edges to existing nodes
    const adjacency = this.graph.adjacency[nodeId] || [];
    adjacency.forEach(rel => {
      if (this.visibleNodes.has(rel.node)) {
        // Check if edge already exists
        const edgeId = `${nodeId}-${rel.node}-${rel.type}`;
        if (this.cy.getElementById(edgeId).length === 0) {
          this.cy.add({
            group: 'edges',
            data: {
              id: edgeId,
              source: nodeId,
              target: rel.node,
              type: rel.type
            }
          });
        }
      }
    });
  }

  expandNode(nodeId) {
    const adjacency = this.graph.adjacency[nodeId] || [];

    // Add all connected nodes
    adjacency.forEach(rel => {
      if (!this.visibleNodes.has(rel.node)) {
        this.addNodeToGraph(rel.node);
      }
    });

    // Add edges between the node and new nodes
    adjacency.forEach(rel => {
      const edgeId = `${nodeId}-${rel.node}-${rel.type}`;
      const reverseEdgeId = `${rel.node}-${nodeId}-${rel.type}`;

      if (this.cy.getElementById(edgeId).length === 0 &&
          this.cy.getElementById(reverseEdgeId).length === 0) {
        this.cy.add({
          group: 'edges',
          data: {
            id: edgeId,
            source: nodeId,
            target: rel.node,
            type: rel.type
          }
        });
      }
    });

    // Run layout
    this.runLayout();
  }

  focusOnNode(nodeId) {
    const cyNode = this.cy.getElementById(nodeId);
    if (cyNode.length > 0) {
      // Highlight connected nodes and edges
      const neighborhood = cyNode.neighborhood().add(cyNode);

      this.cy.elements().addClass('faded');
      neighborhood.removeClass('faded');

      this.cy.animate({
        fit: { eles: neighborhood, padding: 50 }
      }, { duration: 300 });
    }
  }

  runLayout() {
    const layout = this.cy.layout({
      name: 'fcose',
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 50,
      nodeDimensionsIncludeLabels: true,
      uniformNodeDimensions: false,
      packComponents: true,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      tilingPaddingVertical: 10,
      tilingPaddingHorizontal: 10,
      gravityRangeCompound: 1.5,
      gravityCompound: 1.0,
      gravityRange: 3.8,
      initialEnergyOnIncremental: 0.5
    });

    layout.run();
  }

  runCombinedLayout() {
    // Optimized layout for the massive combined view - spread out for visibility
    const layout = this.cy.layout({
      name: 'fcose',
      animate: false, // Skip animation for performance
      fit: true,
      padding: 50,
      nodeDimensionsIncludeLabels: false, // Faster without label calculations
      uniformNodeDimensions: true,
      packComponents: true,
      nodeRepulsion: 12000, // Higher repulsion = more spread out
      idealEdgeLength: 100, // Longer edges = more space between nodes
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.1, // Lower gravity = less compact clustering
      numIter: 1500, // Fewer iterations for speed
      tile: true,
      tilingPaddingVertical: 30,
      tilingPaddingHorizontal: 30,
      gravityRangeCompound: 1.5,
      gravityCompound: 1.0,
      gravityRange: 3.8,
      quality: 'default',
      randomize: true,
      sampleSize: 25, // Sampling for speed
      nodeSeparation: 50 // More separation between nodes
    });

    layout.run();
  }

  resetGraph() {
    this.cy.elements().remove();
    this.visibleNodes.clear();
    this.clearSelection();
    this.cy.elements().removeClass('faded');
    this.hideDomainLegend();
  }

  clearSelection() {
    this.selectedNode = null;
    this.cy.nodes().unselect();
    this.cy.edges().removeClass('highlighted');
    this.cy.elements().removeClass('faded');

    const placeholder = document.querySelector('.detail-placeholder');
    const content = document.querySelector('.detail-content');
    placeholder.style.display = 'flex';
    content.style.display = 'none';
  }

  filterByDomain(domain) {
    // Reset graph
    this.resetGraph();

    if (!domain) {
      this.hideCurrentViewLabel();
      document.getElementById('welcome-message').style.display = 'block';
      return;
    }

    // Hide welcome message when a domain is selected
    this.hideWelcome();

    // Handle combined view (disabled)
    if (domain === '__all__') {
      return;
    }

    this.currentView = 'domain';

    // Parse the domain to show a nice label
    // Format is "theme - type" (e.g., "dam safety - ontology")
    const dashIndex = domain.lastIndexOf(' - ');
    if (dashIndex > 0) {
      const themeName = domain.substring(0, dashIndex).trim();
      const fileType = domain.substring(dashIndex + 3).trim();
      const formattedTheme = this.formatMicroTheoryName(themeName);
      const typeIcon = this.getTypeIcon(fileType);
      const typeName = fileType.charAt(0).toUpperCase() + fileType.slice(1);
      this.showCurrentViewLabel(`${typeIcon} ${formattedTheme} — ${typeName}`);
    } else {
      this.showCurrentViewLabel(domain);
    }

    // Find nodes in this domain
    const domainNodes = this.graph.nodes.filter(n => n.domain === domain);

    // Add first 100 nodes (increased from 50 for better coverage)
    const nodesToAdd = domainNodes.slice(0, 100);
    nodesToAdd.forEach(node => {
      this.addNodeToGraph(node.id);
    });

    // After adding domain nodes, also add directly connected nodes from other domains
    // This ensures we show meaningful relationships even when they cross domains
    this.addConnectedNodes();

    // After adding all nodes, add all edges between visible nodes
    // This ensures we capture relationships in both directions
    this.addEdgesBetweenVisibleNodes();

    // Run layout
    if (nodesToAdd.length > 0) {
      this.runLayout();
    }
  }

  loadCombinedView() {
    // Group nodes by micro-theory - only ontologies (02-*) and spatial (05-*)
    const nodesByTheory = {};

    this.graph.nodes.forEach(node => {
      // Filter to only include ontologies and spatial ontologies
      const domain = node.domain || '';
      const filename = domain.split('\\').pop().toLowerCase();

      // Include: 02-* (ontologies), 05-* (spatial)
      const isOntology = filename.startsWith('02') || filename.startsWith('05');

      // Exclude: vocabularies (01-*), workflows (04-*), task files, process files
      const isExcluded = filename.startsWith('01') ||
                         filename.startsWith('04') ||
                         filename.startsWith('03') ||
                         filename.startsWith('06') ||
                         filename.includes('vocabulary') ||
                         filename.includes('vocab') ||
                         filename.includes('workflow') ||
                         filename.includes('process') ||
                         filename.includes('task');

      if (isOntology && !isExcluded) {
        const theory = this.getMicroTheory(node.domain);
        if (!nodesByTheory[theory]) {
          nodesByTheory[theory] = [];
        }
        nodesByTheory[theory].push(node);
      }
    });

    // Load filtered nodes for ontologies + spatial view
    const nodesToAdd = [];

    Object.entries(nodesByTheory).forEach(([theory, nodes]) => {
      nodesToAdd.push(...nodes);
    });

    console.log(`Loading ${nodesToAdd.length} nodes for combined view...`);

    // Add nodes to graph with domain coloring
    nodesToAdd.forEach(node => {
      this.addNodeToGraphWithColor(node.id);
    });

    // Add edges between visible nodes
    this.addEdgesBetweenVisibleNodes();

    // Make edges visible for the dense view
    this.cy.edges().style({
      'width': 1.0,
      'opacity': 0.7,
      'arrow-scale': 0.5
    });

    // Run layout optimized for large graphs
    if (nodesToAdd.length > 0) {
      this.runCombinedLayout();
    }

    // Show legend
    this.showDomainLegend(Object.keys(nodesByTheory));
  }

  getMicroTheory(domain) {
    if (!domain) return 'unknown';
    const parts = domain.split('\\');
    return parts[0].toLowerCase().replace(/\s+/g, '-');
  }

  getTheoryColor(theory) {
    // Normalize theory name
    const normalized = theory.toLowerCase().replace(/\s+/g, '-');
    return this.microTheoryColors[normalized] || { bg: '#64748b', border: '#475569' };
  }

  addNodeToGraphWithColor(nodeId) {
    const nodeData = this.nodeMap.get(nodeId);
    if (!nodeData) return;

    const theory = this.getMicroTheory(nodeData.domain);
    const colors = this.getTheoryColor(theory);

    // Add the node with domain color
    this.cy.add({
      group: 'nodes',
      data: {
        id: nodeId,
        label: nodeData.label,
        type: nodeData.type,
        theory: theory,
        bgColor: colors.bg,
        borderColor: colors.border
      },
      position: {
        x: this.cy.width() / 2 + (Math.random() - 0.5) * 400,
        y: this.cy.height() / 2 + (Math.random() - 0.5) * 400
      }
    });

    this.visibleNodes.add(nodeId);
  }

  showDomainLegend(theories) {
    // Remove existing legend
    const existing = document.getElementById('domain-legend');
    if (existing) existing.remove();

    // Create legend
    const legend = document.createElement('div');
    legend.id = 'domain-legend';
    legend.className = 'domain-legend';

    const title = document.createElement('div');
    title.className = 'legend-title';
    title.textContent = 'Micro-Theories';
    legend.appendChild(title);

    // Sort theories alphabetically
    theories.sort().forEach(theory => {
      const colors = this.getTheoryColor(theory);
      const item = document.createElement('div');
      item.className = 'legend-item';

      const swatch = document.createElement('span');
      swatch.className = 'legend-swatch';
      swatch.style.backgroundColor = colors.bg;
      swatch.style.borderColor = colors.border;

      const label = document.createElement('span');
      label.className = 'legend-label';
      label.textContent = this.formatMicroTheoryName(theory);

      item.appendChild(swatch);
      item.appendChild(label);
      legend.appendChild(item);
    });

    // Add to graph container
    document.getElementById('cy').appendChild(legend);
  }

  hideDomainLegend() {
    const legend = document.getElementById('domain-legend');
    if (legend) legend.remove();
  }

  showCurrentViewLabel(label) {
    const panel = document.getElementById('current-view-panel');
    const labelEl = document.getElementById('current-view-label');
    panel.style.display = 'block';
    labelEl.textContent = label;
  }

  hideCurrentViewLabel() {
    const panel = document.getElementById('current-view-panel');
    panel.style.display = 'none';
  }

  addConnectedNodes() {
    // Collect nodes that are directly connected to visible nodes
    const connectedNodeIds = new Set();

    this.visibleNodes.forEach(nodeId => {
      const adjacency = this.graph.adjacency[nodeId] || [];
      adjacency.forEach(rel => {
        // Only add if the connected node exists in our data
        if (this.nodeMap.has(rel.node) && !this.visibleNodes.has(rel.node)) {
          connectedNodeIds.add(rel.node);
        }
      });
    });

    // Add connected nodes (limit to prevent graph explosion)
    let added = 0;
    const maxConnected = 50;
    connectedNodeIds.forEach(nodeId => {
      if (added < maxConnected) {
        this.addNodeToGraph(nodeId);
        added++;
      }
    });
  }

  addEdgesBetweenVisibleNodes() {
    // Iterate through all visible nodes and add edges between them
    this.visibleNodes.forEach(nodeId => {
      const adjacency = this.graph.adjacency[nodeId] || [];
      adjacency.forEach(rel => {
        if (this.visibleNodes.has(rel.node)) {
          const edgeId = `${nodeId}-${rel.node}-${rel.type}`;
          const reverseEdgeId = `${rel.node}-${nodeId}-${rel.type}`;

          // Only add if neither direction exists
          if (this.cy.getElementById(edgeId).length === 0 &&
              this.cy.getElementById(reverseEdgeId).length === 0) {
            this.cy.add({
              group: 'edges',
              data: {
                id: edgeId,
                source: nodeId,
                target: rel.node,
                type: rel.type
              }
            });
          }
        }
      });
    });
  }

  showTooltip(position, label, definition) {
    const tooltip = document.getElementById('graph-tooltip');
    const shortDef = definition ? definition.substring(0, 150) + (definition.length > 150 ? '...' : '') : '';

    tooltip.innerHTML = `<strong>${label}</strong>${shortDef ? '<br>' + shortDef : ''}`;
    tooltip.style.left = `${position.x + 15}px`;
    tooltip.style.top = `${position.y + 15}px`;
    tooltip.classList.add('visible');
  }

  hideTooltip() {
    const tooltip = document.getElementById('graph-tooltip');
    tooltip.classList.remove('visible');
  }

  updateStats() {
    document.getElementById('stat-terms').textContent = this.graph.nodes.length.toLocaleString();
    document.getElementById('stat-relations').textContent = this.graph.edges.length.toLocaleString();
    document.getElementById('stat-domains').textContent = Object.keys(this.domains).length;
  }

  populateDomainFilter() {
    const select = document.getElementById('domain-select');

    // Group domains by theme (micro-theory)
    // New format: "theme - type" (e.g., "civil works authorization - vocabulary")
    const themes = {};

    Object.entries(this.domains).forEach(([domain, count]) => {
      // Parse the new domain format: "theme - type"
      const dashIndex = domain.lastIndexOf(' - ');
      let themeName, fileType;

      if (dashIndex > 0) {
        themeName = domain.substring(0, dashIndex).trim();
        fileType = domain.substring(dashIndex + 3).trim();
      } else {
        // Fallback for old format
        themeName = domain;
        fileType = 'other';
      }

      if (!themes[themeName]) {
        themes[themeName] = {
          total: 0,
          items: []
        };
      }

      themes[themeName].total += count;
      themes[themeName].items.push({
        domain: domain,
        type: fileType,
        count: count
      });
    });

    // Sort themes alphabetically
    const sortedThemes = Object.entries(themes)
      .sort((a, b) => a[0].localeCompare(b[0]));

    // Create optgroups for each theme
    sortedThemes.forEach(([themeName, data]) => {
      const optgroup = document.createElement('optgroup');
      const formattedName = this.formatMicroTheoryName(themeName);
      optgroup.label = `${formattedName} (${data.total} terms)`;

      // Sort items within each theme by type order: vocabulary, ontology, workflow, spatial, instances, shapes, other
      const typeOrder = ['vocabulary', 'ontology', 'workflow', 'spatial', 'instances', 'shapes', 'other'];
      data.items.sort((a, b) => {
        const aOrder = typeOrder.indexOf(a.type) >= 0 ? typeOrder.indexOf(a.type) : 99;
        const bOrder = typeOrder.indexOf(b.type) >= 0 ? typeOrder.indexOf(b.type) : 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.type.localeCompare(b.type);
      });

      data.items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.domain;
        const typeIcon = this.getTypeIcon(item.type);
        // Capitalize the type name
        const typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        option.textContent = `${typeIcon} ${typeName} (${item.count})`;
        optgroup.appendChild(option);
      });

      select.appendChild(optgroup);
    });
  }

  formatMicroTheoryName(name) {
    // Convert folder names to title case and handle special cases
    const specialCases = {
      'civil works authorization': 'Civil Works Authorization',
      'crosswalks': 'Crosswalks',
      'dams': 'Dams',
      'dod real property': 'DoD Real Property',
      'engineering and design': 'Engineering & Design',
      'facilities maintenance': 'Facilities Maintenance',
      'hydrographic survey': 'Hydrographic Survey',
      'installation resilience': 'Installation Resilience',
      'levees': 'Levees',
      'navigation': 'Navigation',
      'operation and maintenance': 'Operation & Maintenance',
      'organization': 'Organization',
      'project delivery': 'Project Delivery',
      'recreation': 'Recreation',
      'spatial foundation': 'Spatial Foundation',
      'studies': 'Studies',
      'water control': 'Water Control'
    };

    const lowerName = name.toLowerCase();
    if (specialCases[lowerName]) {
      return specialCases[lowerName];
    }

    // Default: title case
    return name.split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getTypeIcon(type) {
    const icons = {
      'vocabulary': '📖',
      'ontology': '🔗',
      'workflow': '⚙️',
      'spatial': '🗺️',
      'instances': '📍',
      'shapes': '✓',
      'other': '📄'
    };
    return icons[type] || '📄';
  }

  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('welcome-message').style.display = 'block';
  }

  hideWelcome() {
    document.getElementById('welcome-message').style.display = 'none';
  }

  showError(message) {
    const loading = document.getElementById('loading');
    loading.innerHTML = `
      <div style="color: #dc2626;">
        <p style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Error</p>
        <p>${message}</p>
        <p style="margin-top: 16px; font-size: 12px;">Run <code>node build-graph.js</code> to generate the data files.</p>
      </div>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new VocabExplorer();
});
