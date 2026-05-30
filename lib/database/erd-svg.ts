import {
  diagramSize,
  schemaEdges,
  schemaNodes,
  type SchemaNode,
} from "./erd-schema";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getNode(nodeId: string) {
  const node = schemaNodes.find((entry) => entry.id === nodeId);

  if (!node) {
    throw new Error(`Missing ERD node: ${nodeId}`);
  }

  return node;
}

function lineHeightForNode(node: SchemaNode) {
  return node.kind === "enum" ? 22 : 18;
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
      continue;
    }

    if (`${currentLine} ${word}`.length <= maxChars) {
      currentLine = `${currentLine} ${word}`;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

function renderNode(node: SchemaNode) {
  const headerHeight = 66;
  const footerHeight = node.kind === "enum" ? 28 : 24;
  const lineHeight = lineHeightForNode(node);
  const bodyPadding = 18;
  const bodyWidth = node.width - bodyPadding * 2;
  const maxChars = Math.max(24, Math.floor(bodyWidth / 7.2));

  const fieldLines =
    node.kind === "enum"
      ? (node.values ?? [])
      : (node.fields?.map((field) => `${field.name}: ${field.type}`) ?? []);

  const fieldCount = fieldLines.reduce(
    (count, line) => count + wrapText(line, maxChars).length,
    0,
  );

  const neededHeight =
    headerHeight + bodyPadding * 2 + fieldCount * lineHeight + footerHeight;
  const nodeHeight = Math.max(node.height, neededHeight);

  const lines: string[] = [];
  for (const line of fieldLines) {
    lines.push(...wrapText(line, maxChars));
  }

  const bodyStart = headerHeight + 8;

  return `
    <g transform="translate(${node.x}, ${node.y})">
      <rect x="0" y="0" width="${node.width}" height="${nodeHeight}" rx="24" fill="#fff9f3" stroke="${node.accent}" stroke-width="2.2" />
      <rect x="0" y="0" width="${node.width}" height="${headerHeight}" rx="24" fill="${node.accent}" opacity="0.12" />
      <rect x="0" y="0" width="${node.width}" height="${headerHeight}" rx="24" fill="none" stroke="${node.accent}" stroke-width="0.5" />
      <text x="18" y="26" font-family="Manrope, Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="0.18em" fill="${node.accent}" text-transform="uppercase">${escapeXml(node.section)}</text>
      <text x="18" y="52" font-family="EB Garamond, Georgia, serif" font-size="28" font-weight="700" fill="#2c1d18">${escapeXml(node.label)}</text>
      ${node.mapName ? `<text x="18" y="72" font-family="Manrope, Arial, sans-serif" font-size="11" fill="#7a675d">@@map(&quot;${escapeXml(node.mapName)}&quot;)</text>` : ""}
      ${lines
        .map((line, index) => {
          const y = bodyStart + index * lineHeight;
          return `<text x="18" y="${y + 18}" font-family="Manrope, Arial, sans-serif" font-size="12" fill="#43352d">${escapeXml(line)}</text>`;
        })
        .join("\n")}
      <line x1="0" y1="${nodeHeight - 22}" x2="${node.width}" y2="${nodeHeight - 22}" stroke="${node.accent}" stroke-width="1" opacity="0.18" />
      <text x="18" y="${nodeHeight - 8}" font-family="Manrope, Arial, sans-serif" font-size="10" fill="#8c7b71">${escapeXml(node.kind === "enum" ? "Enum" : "Model")}</text>
    </g>
  `;
}

function edgePath(source: SchemaNode, target: SchemaNode) {
  const sourceX = source.x + source.width;
  const sourceY = source.y + source.height / 2;
  const targetX = target.x;
  const targetY = target.y + target.height / 2;

  const distance = Math.max(120, Math.abs(targetX - sourceX) * 0.45);
  const controlSource = sourceX + distance;
  const controlTarget = targetX - distance;

  return `M ${sourceX} ${sourceY} C ${controlSource} ${sourceY}, ${controlTarget} ${targetY}, ${targetX} ${targetY}`;
}

export function renderErdSvg() {
  const width = diagramSize.width;
  const height = diagramSize.height;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fdf7f1" />
          <stop offset="55%" stop-color="#faf0e6" />
          <stop offset="100%" stop-color="#f6efe6" />
        </linearGradient>
        <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M 0 0 L 12 6 L 0 12 z" fill="#8c3c3c" />
        </marker>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <circle cx="220" cy="160" r="160" fill="#c2652a" opacity="0.06" />
      <circle cx="1840" cy="360" r="210" fill="#2457d6" opacity="0.05" />
      <circle cx="1640" cy="1320" r="220" fill="#0b7a75" opacity="0.05" />
      <text x="60" y="54" font-family="EB Garamond, Georgia, serif" font-size="42" font-weight="700" fill="#2c1d18">${escapeXml("Smart Job Matching ERD")}</text>
      <text x="60" y="84" font-family="Manrope, Arial, sans-serif" font-size="16" fill="#6c5a50">${escapeXml("Prisma schema entities, relationships, and enums for onboarding, jobs, and matching.")}</text>

      ${schemaEdges
        .map((edge) => {
          const source = getNode(edge.source);
          const target = getNode(edge.target);
          const path = edgePath(source, target);
          const labelX = (source.x + source.width + target.x) / 2;
          const labelY =
            (source.y + source.height / 2 + target.y + target.height / 2) / 2;
          return `
            <g>
              <path d="${path}" fill="none" stroke="${edge.dashed ? "#8c3c3c" : "#c2652a"}" stroke-width="2" stroke-dasharray="${edge.dashed ? "7 6" : "0"}" opacity="0.72" marker-end="url(#arrow)" />
              <rect x="${labelX - 40}" y="${labelY - 11}" width="80" height="22" rx="11" fill="#fffaf4" stroke="${edge.dashed ? "#8c3c3c" : "#c2652a"}" stroke-width="1" opacity="0.95" />
              <text x="${labelX}" y="${labelY + 4}" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="11" font-weight="700" fill="#5b4439">${escapeXml(edge.label)}</text>
            </g>
          `;
        })
        .join("\n")}

      ${schemaNodes.map(renderNode).join("\n")}

      <g transform="translate(1480, 40)">
        <rect x="0" y="0" width="520" height="150" rx="24" fill="#fffaf4" stroke="#d8d0c8" stroke-width="1.5" />
        <text x="20" y="32" font-family="Manrope, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="0.2em" fill="#c2652a">LEGEND</text>
        <text x="20" y="58" font-family="Manrope, Arial, sans-serif" font-size="14" fill="#4f4037">Solid edges = foreign keys and model relations</text>
        <text x="20" y="82" font-family="Manrope, Arial, sans-serif" font-size="14" fill="#4f4037">Dashed edges = enum references and status controls</text>
        <text x="20" y="106" font-family="Manrope, Arial, sans-serif" font-size="14" fill="#4f4037">Warm cards show each table, field, and Prisma mapping</text>
        <text x="20" y="130" font-family="Manrope, Arial, sans-serif" font-size="14" fill="#4f4037">Diagram exported from the same shared schema metadata</text>
      </g>
    </svg>
  `;
}
