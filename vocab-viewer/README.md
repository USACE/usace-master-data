A static web application for exploring and visualizing the U.S. Army Corps of Engineers ontologies and vocabularies.

## Features

- **Search**: Find terms by label, definition, or alternative names
- **Definitions**: View complete definitions with regulatory sources and scope notes
- **Related Terms**: Browse semantically connected terms (broader, narrower, related)
- **Graph Visualization**: Interactive network graph showing term relationships
- **Domain Filtering**: Filter by knowledge domain (Levees, Navigation, Project Delivery, etc.)


## Usage Guide

### Searching
1. Type in the search box (minimum 2 characters)
2. Results show matching terms with domain and definition preview
3. Click a result to view full details

### Viewing Details
The right panel shows:
- **Type**: Concept, Class, or Property
- **Definition**: Full definition text
- **Source**: Regulatory authority citation (e.g., EC 1165-2-218)
- **Scope Note**: Implementation details
- **Alternative Labels**: Other names for the term
- **Related Terms**: Grouped by relationship type

### Graph Visualization
- **Click a term**: Select and view details
- **Domain filter**: Load terms from a specific domain
- **Explore button**: Expand to show connected terms
- **Focus button**: Highlight direct connections
- **Layout button**: Re-arrange graph for clarity

### Graph Controls
- **+/-**: Zoom in/out
- **Fit**: Fit graph to screen
- **Reset**: Clear the graph

## Architecture

```
vocab-viewer/
├── vocab.html          # Main application
├── styles.css          # Styling
├── app.js              # Application logic
├── data/
│   ├── graph.json      # Knowledge graph
│   ├── search-index.json
│   └── domains.json
└── README.md
```

## Technology Stack

- **Cytoscape.js**: Graph visualization library
- **fcose Layout**: Force-directed layout algorithm
- **Vanilla JavaScript**: No framework dependencies
- **CSS Grid/Flexbox**: Responsive layout

## Statistics

After building from the current repository:
- **Terms**: ~5,958 concepts, classes, and properties
- **Relationships**: ~8,241 semantic connections
- **Domains**: 45 knowledge domains
- **Sources**: 110 TTL files

## Relationship Types

| Type | Description | Color |
|------|-------------|-------|
| Broader/Narrower | SKOS hierarchy | Blue |
| Related | SKOS association | Green |
| SubClass | OWL class hierarchy | Purple |
| ExactMatch/CloseMatch | Alignment | Orange |

## Browser Support

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Part of the USACE Ontology project.
