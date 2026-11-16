"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  RemoveFormatting,
  Sparkles,
  ExternalLink,
  Check,
} from "lucide-react";
import {
  getProductionBrandStoryTemplate,
  getProductionFaqTemplate,
  getProductionPrivacyTemplate,
  getProductionTermsTemplate,
  compileFaqHtml,
  friendlyTextToHtml,
} from "./contentStudio/contentTemplates";

export type DocTab = "story" | "faq" | "privacy" | "terms";

interface GoogleDocEditorProps {
  storeName: string;
  supportEmail: string;
  aboutHtml: string;
  faqHtml: string;
  privacyHtml: string;
  termsHtml: string;
  onChange: (updates: {
    about_html?: string;
    faq_html?: string;
    privacy_html?: string;
    terms_html?: string;
  }) => void;
}

const TAB_CONFIG: { id: DocTab; label: string; route: string }[] = [
  { id: "story", label: "Brand Story", route: "/about" },
  { id: "faq", label: "FAQ", route: "/faq" },
  { id: "privacy", label: "Privacy Policy", route: "/privacy" },
  { id: "terms", label: "Terms & Warranty", route: "/terms" },
];

export function GoogleDocEditor({
  storeName,
  supportEmail,
  aboutHtml,
  faqHtml,
  privacyHtml,
  termsHtml,
  onChange,
}: GoogleDocEditorProps) {
  const [activeTab, setActiveTab] = useState<DocTab>("story");
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  // Store documents content in state
  const [docs, setDocs] = useState<Record<DocTab, string>>({
    story: aboutHtml || friendlyTextToHtml(getProductionBrandStoryTemplate(storeName)),
    faq: faqHtml || compileFaqHtml(getProductionFaqTemplate(storeName, supportEmail)),
    privacy: privacyHtml || friendlyTextToHtml(getProductionPrivacyTemplate(storeName, supportEmail)),
    terms: termsHtml || friendlyTextToHtml(getProductionTermsTemplate(storeName, supportEmail)),
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Calculate word and character count
  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    setStats({ words, chars });
  }, []);

  // Sync editor innerHTML when active tab changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = docs[activeTab] || "";
      updateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle typing inside contentEditable canvas
  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;

    setDocs((prev) => ({ ...prev, [activeTab]: html }));
    updateStats();

    if (activeTab === "story") onChange({ about_html: html });
    else if (activeTab === "faq") onChange({ faq_html: html });
    else if (activeTab === "privacy") onChange({ privacy_html: html });
    else if (activeTab === "terms") onChange({ terms_html: html });
  };

  // Execute standard document command
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (typeof document === "undefined") return;
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  // Format block (Heading, Paragraph, Blockquote)
  const handleFormatBlock = (tag: string) => {
    if (typeof document === "undefined") return;
    if (editorRef.current) editorRef.current.focus();

    if (tag === "blockquote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    handleInput();
  };

  // Insert Hyperlink
  const handleInsertLink = () => {
    const url = prompt("Enter link destination (e.g. https://... or /shop):");
    if (url) execCmd("createLink", url);
  };

  // Flash template notice
  const notify = (msg: string) => {
    setTemplateNotice(msg);
    setTimeout(() => setTemplateNotice(null), 3500);
  };

  // Load Production Template into active tab
  const loadTemplateForActiveTab = () => {
    let templateHtml = "";
    let name = "";

    if (activeTab === "story") {
      templateHtml = friendlyTextToHtml(getProductionBrandStoryTemplate(storeName));
      name = "Brand Story";
      onChange({ about_html: templateHtml });
    } else if (activeTab === "faq") {
      templateHtml = compileFaqHtml(getProductionFaqTemplate(storeName, supportEmail));
      name = "FAQ";
      onChange({ faq_html: templateHtml });
    } else if (activeTab === "privacy") {
      templateHtml = friendlyTextToHtml(getProductionPrivacyTemplate(storeName, supportEmail));
      name = "Privacy Policy";
      onChange({ privacy_html: templateHtml });
    } else if (activeTab === "terms") {
      templateHtml = friendlyTextToHtml(getProductionTermsTemplate(storeName, supportEmail));
      name = "Terms & Warranty";
      onChange({ terms_html: templateHtml });
    }

    setDocs((prev) => ({ ...prev, [activeTab]: templateHtml }));
    if (editorRef.current) {
      editorRef.current.innerHTML = templateHtml;
      updateStats();
    }
    notify(`Standard template for ${name} loaded. Click "Save Changes" at the top to publish.`);
  };

  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  return (
    <div className="rounded-2xl border border-[#1A1C18]/10 bg-white shadow-xs overflow-hidden font-sans">
      {/* 1. Clean Document Tabs */}
      <div className="flex flex-wrap border-b border-[#1A1C18]/10 bg-[#FAF9F6]">
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "border-[#1A1C18] text-[#1A1C18] bg-white font-bold"
                  : "border-transparent text-[#77766E] hover:text-[#1A1C18] hover:bg-black/5"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-[#8A927A] font-normal">{tab.route}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Sleek Rich-Text Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-[#1A1C18]/10 text-xs">
        {/* Formatting controls */}
        <div className="flex items-center gap-1">
          <select
            onChange={(e) => handleFormatBlock(e.target.value)}
            defaultValue="p"
            className="px-2.5 py-1.5 rounded-lg border border-[#1A1C18]/15 bg-[#FDFBF7] text-xs font-medium text-[#1A1C18] focus:outline-none cursor-pointer"
          >
            <option value="p">Normal text</option>
            <option value="h2">Heading 1</option>
            <option value="h3">Heading 2</option>
            <option value="blockquote">Quote</option>
          </select>

          <div className="h-4 w-px bg-[#1A1C18]/15 mx-1" />

          <button
            type="button"
            onClick={() => execCmd("bold")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#1A1C18]/15 mx-1" />

          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Bullet list"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Numbered list"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormatBlock("blockquote")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Quote block"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertHorizontalRule")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Divider line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#1A1C18]/15 mx-1" />

          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Insert link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("removeFormat")}
            className="p-1.5 rounded-lg hover:bg-[#F4F0E8] text-[#1A1C18] transition-colors cursor-pointer"
            title="Clear formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTemplateForActiveTab}
            className="px-3 py-1.5 rounded-lg bg-[#8A927A]/15 text-[#8A927A] hover:bg-[#8A927A]/25 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Standard Template</span>
          </button>
          <a
            href={activeConfig.route}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg border border-[#1A1C18]/15 text-[#1A1C18] hover:bg-[#F4F0E8] text-xs font-medium transition-colors inline-flex items-center gap-1"
          >
            <span>Preview Live</span>
            <ExternalLink className="w-3 h-3 text-[#77766E]" />
          </a>
        </div>
      </div>

      {/* 3. Notification Flash Banner */}
      {templateNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs text-emerald-800 font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{templateNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setTemplateNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Elegant Document Canvas */}
      <div className="p-6 sm:p-10 bg-[#FAF9F5] min-h-[460px]">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-[#1A1C18]/10 shadow-sm p-8 sm:p-12 min-h-[400px] text-[#1A1C18] font-sans text-sm leading-relaxed focus:outline-none transition-shadow focus:border-[#1A1C18]/30"
          style={{
            wordBreak: "break-word",
            caretColor: "#1A1C18",
          }}
        />
      </div>

      {/* 5. Clean Footer Status Bar */}
      <div className="px-6 py-2.5 bg-white border-t border-[#1A1C18]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#77766E] font-sans gap-2">
        <div className="flex items-center gap-3">
          <span>{stats.words} words</span>
          <span>·</span>
          <span>{stats.chars} characters</span>
        </div>
        <span className="text-[11px] text-[#8A927A] flex items-center gap-1 font-medium">
          <Check className="w-3.5 h-3.5 text-[#8A927A]" />
          Staged for {activeConfig.route} · Click &quot;Save Changes&quot; above to publish
        </span>
      </div>
    </div>
  );
}
