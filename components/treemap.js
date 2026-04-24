import * as d3 from "d3";

// --- Q1.1: <Text> component — adds attribute labels and value to each rectangle ---
function Text({ node, x, y, width, height }) {
    if (width < 20 || height < 14) return null;

    const lines = [];
    let cur = node;
    while (cur.depth > 0) {
        lines.unshift(`${cur.data.attr}: ${cur.data.name}`);
        cur = cur.parent;
    }
    lines.push(`Value: ${node.value}`);

    const fontSize = 12;

    return (
        <text
            x={x + 4}
            y={y + fontSize + 3}
            fontSize={fontSize}
            fill="white"
            fontFamily="monospace"
            style={{ pointerEvents: "none" }}
        >
            {lines.map((line, i) => (
                <tspan key={i} x={x + 4} dy={i === 0 ? 0 : fontSize * 1.4}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

// Watermark big label — shows the FIRST-level attribute (e.g. "heart_disease: 0")
function BigLabel({ node, x, y, width, height }) {
    if (width < 150 || height < 80) return null;
    // Walk to depth=1 (top level group)
    let topNode = node;
    while (topNode.depth > 1) topNode = topNode.parent;
    const label = `${topNode.data.attr}: ${topNode.data.name}`;
    const fontSize = Math.min(width / label.length * 1.4, height / 4, 32);
    return (
        <text
            x={x + width / 2}
            y={y + height / 2 + fontSize / 3}
            fontSize={fontSize}
            fill="rgba(0,0,0,0.25)"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: "none", userSelect: "none" }}
        >
            {label}
        </text>
    );
}

// Top-level internal node label strip — only drawn for depth=1 (heart_disease)
// NOT for depth=2 (gender) — matches the reference screenshot
function TopInternalLabel({ node, x, y, width }) {
    if (width < 20) return null;
    const label = `${node.data.attr}: ${node.data.name}`;
    const fontSize = 12;
    return (
        <text
            x={x + 4}
            y={y + fontSize + 3}
            fontSize={fontSize}
            fill="white"
            fontFamily="monospace"
            style={{ pointerEvents: "none" }}
        >
            {label}
        </text>
    );
}

export function TreeMap(props) {
    const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;

    // --- Q1.1: define innerWidth and innerHeight using the margin ---
    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;

    // --- Q1.1: define a treemap using d3.treemap() ---
    // paddingTop only at depth=1 (heart_disease groups) for its label strip.
    // depth=2 (gender) gets no label strip — matches reference screenshot.
    const treemapLayout = d3
        .treemap()
        .size([innerWidth, innerHeight])
        .paddingOuter(2)
        .paddingTop(d => (d.depth === 1 ? 18 : 0))
        .paddingInner(2);

    // Build d3 hierarchy — NO sort, keep original order from getTree
    const root = d3
        .hierarchy(tree)
        .sum(d => (d.children ? 0 : d.value));

    treemapLayout(root);

    const leaves = root.leaves();
    // Only top-level internal nodes (depth=1 → heart_disease groups)
    const topInternals = root.descendants().filter(d => d.depth === 1);

    // --- Q1.1: define color map using schemeDark2 ---
    const colorScale = d3.scaleOrdinal(d3.schemeDark2);

    // Color by the FIRST-level attribute (heart_disease) — matches reference screenshot
    // Green for heart_disease=0, orange for heart_disease=1
    function getColor(node) {
        let cur = node;
        while (cur.depth > 1) cur = cur.parent;
        return colorScale(cur.data.name);
    }

    return (
        <svg
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        >
            <g transform={`translate(${margin.left},${margin.top})`}>
                {/* Top-level group rectangles (heart_disease: 0 / 1) drawn first */}
                {topInternals.map((node, i) => {
                    const x = node.x0;
                    const y = node.y0;
                    const w = node.x1 - node.x0;
                    const h = node.y1 - node.y0;
                    return (
                        <g key={`top-${i}`}>
                            <rect
                                x={x}
                                y={y}
                                width={w}
                                height={h}
                                fill={getColor(node)}
                                stroke="white"
                                strokeWidth={1.5}
                            />
                            <TopInternalLabel node={node} x={x} y={y} width={w} />
                        </g>
                    );
                })}

                {/* --- Q1.1: plot the leaf rectangles --- */}
                {leaves.map((leaf, i) => {
                    const x = leaf.x0;
                    const y = leaf.y0;
                    const w = leaf.x1 - leaf.x0;
                    const h = leaf.y1 - leaf.y0;
                    const color = getColor(leaf);
                    const isSelected =
                        selectedCell &&
                        selectedCell.x0 === leaf.x0 &&
                        selectedCell.y0 === leaf.y0;

                    return (
                        <g
                            key={i}
                            onClick={() =>
                                setSelectedCell(isSelected ? null : leaf)
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <rect
                                x={x}
                                y={y}
                                width={w}
                                height={h}
                                fill={color}
                                stroke={isSelected ? "yellow" : "white"}
                                strokeWidth={isSelected ? 3 : 1.5}
                                opacity={selectedCell && !isSelected ? 0.6 : 1}
                            />
                            {/* Watermark label on large cells */}
                            <BigLabel node={leaf} x={x} y={y} width={w} height={h} />
                            {/* --- Q1.1: text with attributes and values --- */}
                            <Text node={leaf} x={x} y={y} width={w} height={h} />
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}
