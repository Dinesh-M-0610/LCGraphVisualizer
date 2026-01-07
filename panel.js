const inputArea = document.getElementById('input');
const errorDiv = document.getElementById('error-message');
const modeRadios = document.getElementsByName('mode');
const highlightRadios = document.getElementsByName('highlight');
const darkModeToggle = document.getElementById('dark-mode');
const btnReset = document.getElementById('btn-reset');
const btnFit = document.getElementById('btn-fit');

let currentMode = 'directed';
let currentHighlight = 'none';
let isNodeSelected = false;

const cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
        { selector: 'node', style: {
            'background-color': '#007aff', 'label': 'data(fullLabel)', 'text-valign': 'center',
            'text-halign': 'center', 'color': '#fff', 'font-size': '9px', 'width': 40, 'height': 40,
            'text-wrap': 'wrap', 'text-max-width': '35px'
        }},
        { selector: 'edge', style: { 
            'width': 2, 'line-color': '#888', 'curve-style': 'bezier', 'target-arrow-color': '#888'
        }},
        { selector: 'edge[mode="directed"]', style: { 'target-arrow-shape': 'triangle' }},
        { selector: '.dimmed', style: { 'opacity': 0.15 }},
        { selector: '.emphasized', style: { 
            'background-color': '#ff9500', 'line-color': '#ff9500', 'target-arrow-color': '#ff9500', 
            'opacity': 1
        }}
    ]
});

/**
 * Robust Parser Logic
 * Handles Python dicts, unquoted keys, and weighted tuples
 */
const GraphParser = {
    parse(input) {
        let sanitized = input.trim();
        sanitized = sanitized.replace(/'/g, '"');
        sanitized = sanitized.replace(/([{,]\s*)([0-9]+)(\s*:)/g, '$1"$2"$3');
        sanitized = sanitized.replace(/\(/g, '[').replace(/\)/g, ']');

        const rawData = JSON.parse(sanitized);
        const canonical = { nodes: new Set(), edges: [] };

        for (let [source, targets] of Object.entries(rawData)) {
            const from = String(source);
            canonical.nodes.add(from);
            if (!Array.isArray(targets)) continue;

            targets.forEach(entry => {
                let to, weight = 1.0;
                if (Array.isArray(entry)) {
                    to = String(entry[0]);
                    weight = parseFloat(entry[1]);
                } else {
                    to = String(entry);
                }
                canonical.nodes.add(to);
                canonical.edges.push({ from, to, weight });
            });
        }
        return canonical;
    }
};

function updateStyles() {
    const isDark = darkModeToggle.checked;
    document.body.classList.toggle('dark', isDark);
    cy.style().selector('edge').style({ 
        'line-color': isDark ? '#666' : '#888', 
        'target-arrow-color': isDark ? '#666' : '#888' 
    }).update();
}

function updateGraph() {
    try {
        const canonical = GraphParser.parse(inputArea.value);
        const seenEdges = new Set();
        const edges = [];

        canonical.edges.forEach(e => {
            if (currentMode === 'undirected') {
                const key = [e.from, e.to].sort().join('-');
                if (!seenEdges.has(key)) {
                    edges.push({ data: { id: `e-${key}`, source: e.from, target: e.to, mode: 'undirected' } });
                    seenEdges.add(key);
                }
            } else {
                edges.push({ data: { id: `e-${e.from}-${e.to}`, source: e.from, target: e.to, mode: 'directed' } });
            }
        });

        const nodesMap = new Map();
        canonical.nodes.forEach(id => nodesMap.set(id, { in: 0, out: 0, total: 0 }));
        edges.forEach(e => {
            if (currentMode === 'undirected') {
                nodesMap.get(e.data.source).total++;
                nodesMap.get(e.data.target).total++;
            } else {
                nodesMap.get(e.data.source).out++;
                nodesMap.get(e.data.target).in++;
            }
        });

        const nodeElements = Array.from(nodesMap.entries()).map(([id, deg]) => ({
            data: { id, inDeg: deg.in, outDeg: deg.out, 
                    fullLabel: (currentMode === 'directed') ? `${id}\nI:${deg.in} O:${deg.out}` : `${id}\nD:${deg.total}` }
        }));

        cy.elements().remove();
        cy.add([...nodeElements, ...edges]);
        resetInteraction();
        cy.layout({ name: 'cose', animate: false, padding: 35 }).run();
        errorDiv.textContent = "";
    } catch (e) { errorDiv.textContent = "Parser Error: Ensure valid dictionary format."; }
}

function applyFilters() {
    cy.batch(() => {
        cy.elements().removeClass('dimmed emphasized');
        if (currentHighlight !== 'none') {
            cy.elements().addClass('dimmed');
            if (currentHighlight === 'in') cy.nodes().filter(n => n.data('inDeg') > 0).addClass('emphasized');
            else cy.nodes().filter(n => n.data('outDeg') > 0).addClass('emphasized');
        }
    });
}

function resetInteraction() { isNodeSelected = false; applyFilters(); }

cy.on('tap', 'node', function(evt){
    isNodeSelected = true;
    const node = evt.target;
    cy.batch(() => {
        cy.elements().removeClass('dimmed emphasized');
        cy.elements().addClass('dimmed');
        node.addClass('emphasized');
        if (currentMode === 'directed') node.outgoers().addClass('emphasized');
        else node.neighborhood().addClass('emphasized');
    });
});

cy.on('mouseover', 'edge', function(evt){
    if (isNodeSelected) return;
    const edge = evt.target;
    cy.batch(() => {
        cy.elements().addClass('dimmed');
        edge.addClass('emphasized');
        edge.source().addClass('emphasized');
        edge.target().addClass('emphasized');
    });
});

cy.on('mouseout', 'edge', function(evt){
    if (!isNodeSelected) applyFilters();
});

cy.on('tap', evt => { if(evt.target === cy) resetInteraction(); });

inputArea.addEventListener('input', updateGraph);
darkModeToggle.addEventListener('change', updateStyles);
modeRadios.forEach(r => r.addEventListener('change', e => { currentMode = e.target.value; updateGraph(); }));
highlightRadios.forEach(r => r.addEventListener('change', e => { currentHighlight = e.target.value; applyFilters(); }));
btnReset.addEventListener('click', () => cy.layout({ name: 'cose', animate: false, padding: 35 }).run());
btnFit.addEventListener('click', () => cy.fit(null, 35));

updateGraph();