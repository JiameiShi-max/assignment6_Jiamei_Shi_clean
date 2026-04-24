import { useEffect, useRef } from "react";
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

    const fontSize = Math.min(12, width / 7, height / (lines.length * 1.6 + 1));
    if (fontSize < 6) return null;

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

// Watermark big label shown on large rectangles (like the screenshot)
function BigLabel({ node, x, y, width, height }) {
    if (width < 80 || height < 50) return null;
    let topNode = node;
    while (topNode.depth > 1) topNode = topNode.parent;
    const label = `${topNode.data.attr}: ${topNode.data.name}`;
    const fontSize = Math.min(width / label.length * 1.5, height / 3, 30);
    return (
        <text
            x={x + width / 2}
            y={y + height / 2 + fontSize / 3}
            fontSize={fontSize}
            fill="rgba(255,255,255,0.18)"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            style={{ pointerEvents: "none", userSelect: "none" }}
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
    const treemapLayout = d3
        .treemap()
        .size([innerWidth, innerHeight])
        .paddingOuter(4)
        .paddingInner(2)
        .round(true);

    // Build d3 hierarchy and apply layout
    const root = d3
        .hierarchy(tree)
        .sum(d => (d.children ? 0 : d.value))
        .sort((a, b) => b.value - a.value);

    treemapLayout(root);

    const leaves = root.leaves();

    // --- Q1.1: define color map using schemeDark2 ---
    const colorScale = d3.scaleOrdinal(d3.schemeDark2);

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
                {/* --- Q1.1: plot the rectangles --- */}
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
                            {/* Rectangle */}
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
                            {/* Watermark label */}
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
