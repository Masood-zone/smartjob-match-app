"use client";

import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { SiteFooter } from "@/components/sections/home/site-footer";
import { SiteHeader } from "@/components/sections/home/site-header";
import { ErdDownloadCenter } from "@/components/sections/resources/erd-download-center";
import {
  diagramSubtitle,
  diagramTitle,
  schemaEdges,
  schemaNodes,
  type SchemaNode,
} from "@/lib/database/erd-schema";

function getNodeStyle(node: SchemaNode) {
  return {
    borderColor: node.accent,
    boxShadow: "0 18px 48px rgba(58, 48, 42, 0.08)",
  };
}

function ModelNode({ data }: { data: SchemaNode }) {
  return (
    <div
      className="h-full w-full overflow-hidden rounded-[1.4rem] border bg-[#fffaf4]"
      style={getNodeStyle(data)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3! w-3! border-2! border-white! bg-primary!"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-3! w-3! border-2! border-white! bg-primary!"
      />
      <div
        className="border-b px-4 py-3"
        style={{ backgroundColor: `${data.accent}14` }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ color: data.accent }}
        >
          {data.section}
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h3 className="text-2xl font-bold tracking-tight text-on-surface">
            {data.label}
          </h3>
          {data.mapName ? (
            <span className="rounded-full border border-outline-variant/50 bg-surface px-2 py-1 text-[10px] text-on-surface-variant">
              {`@@map("${data.mapName}")`}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-1 px-4 py-4 text-[12px] leading-5 text-on-surface-variant">
        {data.fields?.map((field) => (
          <div
            key={field.name}
            className="flex gap-2 rounded-lg px-2 py-1 hover:bg-surface-container-low/70"
          >
            <span className="min-w-28 font-semibold text-on-surface">
              {field.name}
            </span>
            <span className="flex-1 wrap-break-word">{field.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnumNode({ data }: { data: SchemaNode }) {
  return (
    <div
      className="h-full w-full overflow-hidden rounded-[1.4rem] border bg-[#f9fffd]"
      style={getNodeStyle(data)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="h-3! w-3! border-2! border-white! bg-primary!"
      />
      <div
        className="border-b px-4 py-3"
        style={{ backgroundColor: `${data.accent}14` }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ color: data.accent }}
        >
          Enum
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-on-surface">
          {data.label}
        </h3>
      </div>

      <div className="space-y-2 px-4 py-4">
        {data.values?.map((value) => (
          <div
            key={value}
            className="rounded-xl border border-outline-variant/50 bg-surface px-3 py-2 text-sm font-semibold text-on-surface-variant"
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  modelNode: ModelNode,
  enumNode: EnumNode,
};

const initialNodes: Node<SchemaNode>[] = schemaNodes.map((node) => ({
  id: node.id,
  type: node.kind === "enum" ? "enumNode" : "modelNode",
  position: { x: node.x, y: node.y },
  data: node,
  style: {
    width: node.width,
    height: node.height,
  },
  draggable: true,
  selectable: true,
}));

const initialEdges: Edge[] = schemaEdges.map((edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  label: edge.label,
  labelStyle: {
    fontSize: 11,
    fontWeight: 700,
    fill: "#5b4439",
  },
  style: {
    stroke: edge.dashed ? "#8c3c3c" : "#c2652a",
    strokeWidth: 2,
    strokeDasharray: edge.dashed ? "7 6" : undefined,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: edge.dashed ? "#8c3c3c" : "#c2652a",
  },
  animated: false,
}));

function ErdCanvas() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{
        padding: 0.04,
        minZoom: 0.72,
        maxZoom: 1.5,
        includeHiddenNodes: false,
      }}
      minZoom={0.18}
      maxZoom={1.5}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
      zoomOnScroll
      zoomOnPinch
      className="h-full w-full"
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #fffaf4 0%, #f7efe4 100%)",
      }}
    >
      <MiniMap
        zoomable
        pannable
        nodeStrokeColor={() => "#c2652a"}
        nodeColor={() => "#faf0e6"}
      />
      <Controls />
      <Background gap={28} size={1} color="#d8d0c8" />
    </ReactFlow>
  );
}

export function ErdDigramPage() {
  return (
    <main className="flex-1 bg-[#faf5ee]">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 py-16 lg:py-20">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-8 h-72 w-72 rounded-full bg-tertiary/10 blur-3xl" />

        <div className="relative mx-auto max-w-460">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">
              Database architecture
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] tracking-tight text-on-surface sm:text-6xl lg:text-7xl">
              {diagramTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
              {diagramSubtitle}
            </p>
          </div>

          <div className="mt-10 space-y-8">
            <div className="rounded-[2rem] border border-outline-variant/40 bg-surface p-4 shadow-sm lg:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-low px-4 py-3">
                <div className="flex items-center gap-3 text-primary">
                  <MaterialSymbol icon="schema" className="text-[22px]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em]">
                      Interactive flow
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      Drag nodes, pan the canvas, and zoom into each table.
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-outline-variant/40 bg-surface px-3 py-2 text-xs font-semibold text-on-surface-variant">
                  {schemaNodes.length} Tables • {schemaEdges.length} relations
                </span>
              </div>

              <div
                style={{ width: "100%", height: 600 }}
                className="min-h-220 max-w-460 w-full overflow-hidden rounded-[1.8rem] border border-outline-variant/40 bg-[#fffdf9] lg:min-h-220"
              >
                <ReactFlowProvider>
                  <ErdCanvas />
                </ReactFlowProvider>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[2rem] border border-outline-variant/40 bg-surface p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-tertiary">
                  What is included
                </p>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-on-surface-variant">
                  <p>
                    The diagram includes every Prisma model in the schema, from
                    authentication tables to onboarding and hiring records.
                  </p>
                  <p>
                    Enum tables are shown separately so supervisors can read
                    role, status, and qualification constraints at a glance.
                  </p>
                  <p>
                    Relationship labels match the foreign key fields in{" "}
                    <span className="font-semibold text-on-surface">
                      schema.prisma
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ErdDownloadCenter />

                <div className="rounded-[2rem] border border-outline-variant/40 bg-surface p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                    Quick reference
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
                    <p>
                      Use the PNG for presentations or embedding in reports.
                    </p>
                    <p>Use the PDF for printing or supervisor review.</p>
                    <p>
                      Use the DOCX when you need an editable handoff document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
