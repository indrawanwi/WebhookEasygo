"use client";

import { useState } from "react";
import { Check, Copy, ChevronRight, ChevronDown, Code2, FileJson } from "lucide-react";
import { clsx } from "clsx";

interface JsonViewerProps {
  data: any;
  initialExpandedDepth?: number;
}

export function JsonViewer({ data, initialExpandedDepth = 3 }: JsonViewerProps) {
  const [activeTab, setActiveTab] = useState<"parsed" | "raw">("parsed");
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 border border-[var(--border-color)] text-xs font-medium">
          <button
            onClick={() => setActiveTab("parsed")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
              activeTab === "parsed"
                ? "bg-[var(--card-bg)] text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Interactive JSON</span>
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
              activeTab === "raw"
                ? "bg-[var(--card-bg)] text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw Text</span>
          </button>
        </div>

        <button
          onClick={() => handleCopy(jsonString)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Content panel */}
      <div className="p-4 overflow-x-auto max-h-[600px] font-mono text-xs leading-relaxed bg-zinc-950 text-zinc-100 dark:bg-[#0c0c0e]">
        {activeTab === "parsed" ? (
          <JsonNode value={data} name={null} depth={0} initialExpandedDepth={initialExpandedDepth} />
        ) : (
          <pre className="text-zinc-300 whitespace-pre-wrap font-mono">{jsonString}</pre>
        )}
      </div>
    </div>
  );
}

interface JsonNodeProps {
  value: any;
  name?: string | null;
  depth: number;
  initialExpandedDepth: number;
}

function JsonNode({ value, name, depth, initialExpandedDepth }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(depth < initialExpandedDepth);
  const [copiedValue, setCopiedValue] = useState(false);

  const copyVal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(str);
    setCopiedValue(true);
    setTimeout(() => setCopiedValue(false), 1500);
  };

  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isCollapsible = isObject || isArray;

  const keyLabel = name !== null && name !== undefined ? (
    <span className="text-sky-400 hover:underline cursor-pointer" title="Key">
      &quot;{name}&quot;:{" "}
    </span>
  ) : null;

  if (value === null || value === undefined) {
    return (
      <div className="flex items-center gap-1 group py-0.5" style={{ paddingLeft: `${depth * 16}px` }}>
        {keyLabel}
        <span className="text-amber-500/90 italic font-semibold">null</span>
        <button
          onClick={copyVal}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 rounded text-zinc-500 hover:text-zinc-300"
          title="Copy value"
        >
          {copiedValue ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  if (!isCollapsible) {
    let valueElement;
    if (typeof value === "string") {
      valueElement = <span className="text-emerald-300">&quot;{value}&quot;</span>;
    } else if (typeof value === "number") {
      valueElement = <span className="text-purple-300 font-semibold">{value}</span>;
    } else if (typeof value === "boolean") {
      valueElement = <span className="text-rose-400 font-semibold">{String(value)}</span>;
    } else {
      valueElement = <span className="text-zinc-300">{String(value)}</span>;
    }

    return (
      <div className="flex items-center gap-1 group py-0.5 hover:bg-white/5 rounded px-1 -ml-1 transition-colors" style={{ paddingLeft: `${depth * 16}px` }}>
        {keyLabel}
        {valueElement}
        <button
          onClick={copyVal}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-opacity"
          title="Copy value"
        >
          {copiedValue ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  const entries = isArray ? value : Object.entries(value);
  const count = entries.length;
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div className="py-0.5">
      <div
        className="flex items-center gap-1 cursor-pointer select-none hover:bg-white/5 rounded px-1 -ml-1 py-0.5 transition-colors group"
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-zinc-500">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>
        {keyLabel}
        <span className="text-zinc-400 font-bold">{openBracket}</span>
        {!expanded && (
          <span className="text-zinc-500 text-[11px] px-1 bg-zinc-800/60 rounded">
            {count} {isArray ? "items" : "keys"}
          </span>
        )}
        {!expanded && <span className="text-zinc-400 font-bold">{closeBracket}</span>}
        <button
          onClick={copyVal}
          className="opacity-0 group-hover:opacity-100 ml-2 p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-opacity"
          title="Copy object JSON"
        >
          {copiedValue ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div>
          {isArray
            ? value.map((item: any, idx: number) => (
                <JsonNode
                  key={idx}
                  value={item}
                  name={String(idx)}
                  depth={depth + 1}
                  initialExpandedDepth={initialExpandedDepth}
                />
              ))
            : Object.entries(value).map(([k, v]) => (
                <JsonNode
                  key={k}
                  value={v}
                  name={k}
                  depth={depth + 1}
                  initialExpandedDepth={initialExpandedDepth}
                />
              ))}
          <div style={{ paddingLeft: `${depth * 16 + 14}px` }} className="text-zinc-400 font-bold py-0.5">
            {closeBracket}
          </div>
        </div>
      )}
    </div>
  );
}
