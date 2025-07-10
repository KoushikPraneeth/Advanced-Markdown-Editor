import React, { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import MarkdownIt from 'markdown-it';
import { debounce } from 'lodash';
import { 
  Save, 
  Download, 
  FileText, 
  Moon, 
  Sun, 
  Copy,
  ExternalLink,
  Github,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Edit,
  Table,
  Clock,
  Zap,
  BookOpen,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useGist } from '@/hooks/useGist';
import { useSettings } from '@/hooks/useSettings';
import { useAutoSave } from '@/hooks/useAutoSave';
import { GistLoader } from '@/components/GistLoader';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { StatusBar } from '@/components/StatusBar';
import { TableHelper } from '@/components/TableHelper';
import { exportToHtml, exportToPdf, downloadAsFile } from '@/utils/exportUtils';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const MarkdownEditor = () => {
  const [markdownText, setMarkdownText] = useState(`# ✨ Advanced Markdown Editor

The ultimate writing experience for developers, writers, and content creators.

## 🚀 Core Features

- **Live Preview**: Real-time markdown rendering with zero latency
- **GitHub Integration**: Seamless gist saving and sharing
- **Smart Export**: Professional HTML and PDF generation
- **Visual Diagrams**: Mermaid diagram support with live rendering
- **Intelligent Auto-save**: Never lose your work again
- **Professional Syntax**: Advanced code highlighting across 20+ languages
- **Analytics Dashboard**: Word count, reading time, and writing insights

## 📊 Mermaid Diagram Example

\`\`\`mermaid
flowchart TD
    A[💡 Idea] --> B{📝 Writing}
    B -->|Draft| C[✍️ Edit]
    B -->|Final| D[🚀 Publish]
    C --> B
    D --> E[🎉 Success]
\`\`\`

## 💻 Enhanced Code Blocks

\`\`\`typescript
interface WritingStats {
  wordCount: number;
  readingTime: string;
  lastSaved: Date;
}

const calculateProgress = (stats: WritingStats): number => {
  return Math.min((stats.wordCount / 1000) * 100, 100);
}
\`\`\`

### 📋 Smart Lists

- ✅ Real-time collaboration ready
- ⚡ Lightning-fast performance
- 🎨 Beautiful, customizable themes
  - Dark mode optimized
  - Light mode perfected
  - High contrast support

### 📊 Professional Tables

| Feature | Status | Performance |
|---------|--------|-------------|
| Editor Speed | ⚡ Instant | 99.9%       |
| Export Quality | 🏆 Premium | 100%        |
| Reliability | 🛡️ Rock Solid | 99.99%      |

---

**Ready to create something amazing?** Start writing and watch your ideas come to life! 🌟
`);
  
  const [htmlPreview, setHtmlPreview] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { settings, updateSettings, toggleTheme, toggleAutoSave } = useSettings();
  const { loading: gistLoading, currentGist, saveToGist, updateGist } = useGist();
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Enhanced markdown rendering with Mermaid support
  const renderMarkdownWithMermaid = useCallback((text: string) => {
    let html = md.render(text);
    
    // Replace mermaid code blocks with rendered diagrams
    html = html.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (match, mermaidCode) => {
        const id = Math.random().toString(36).substr(2, 9);
        const decodedCode = mermaidCode
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');
        
        return `<div class="mermaid-container" data-mermaid-id="${id}" data-mermaid-content="${encodeURIComponent(decodedCode)}"></div>`;
      }
    );
    
    return html;
  }, []);

  // Debounced preview update
  const debouncedUpdatePreview = useCallback(
    debounce((text: string) => {
      const html = renderMarkdownWithMermaid(text);
      setHtmlPreview(html);
    }, 200),
    [renderMarkdownWithMermaid]
  );

  useEffect(() => {
    debouncedUpdatePreview(markdownText);
  }, [markdownText, debouncedUpdatePreview]);

  // Auto-save functionality
  const handleAutoSave = useCallback((content: string) => {
    localStorage.setItem('advanced-markdown-draft', content);
    setLastSaved(new Date());
    console.log('Auto-saved draft at', new Date().toLocaleTimeString());
  }, []);

  useAutoSave({
    content: markdownText,
    enabled: settings.autoSaveEnabled,
    onSave: handleAutoSave,
    delay: 2000,
  });

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('advanced-markdown-draft');
    if (draft && draft !== markdownText) {
      setMarkdownText(draft);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const handleSaveToGist = async () => {
    if (currentGist) {
      await updateGist(currentGist.id, markdownText);
    } else {
      await saveToGist(markdownText);
    }
  };

  const handleExportHtml = async () => {
    try {
      await exportToHtml(htmlPreview, 'Nexus Export');
      toast({
        title: "✨ HTML Ready!",
        description: "Complete HTML document copied to clipboard with professional styling.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not copy HTML to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadMarkdown = () => {
    downloadAsFile(markdownText, 'document.md', 'text/markdown');
    toast({
      title: "📄 Downloaded!",
      description: "Your markdown file is ready.",
    });
  };

  const handleExportPdf = async () => {
    if (previewRef.current) {
      try {
        await exportToPdf(previewRef.current);
        toast({
          title: "📑 PDF Generation Started",
          description: "Your professionally formatted PDF will download shortly.",
        });
      } catch (error) {
        toast({
          title: "Export Failed",
          description: "Could not export to PDF. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleContentLoad = useCallback((content: string) => {
    setMarkdownText(content);
  }, []);

  const handleInsertTable = useCallback((tableMarkdown: string) => {
    const editor = editorRef.current?.view;
    if (editor) {
      const { from, to } = editor.state.selection.main;
      editor.dispatch({
        changes: { from, to, insert: `\n\n${tableMarkdown}\n\n` }
      });
    }
  }, []);

  const togglePreviewMode = () => {
    const modes: Array<typeof settings.previewMode> = ['side', 'preview-only', 'editor-only'];
    const currentIndex = modes.indexOf(settings.previewMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateSettings({ previewMode: nextMode });
  };

  const getPreviewModeIcon = () => {
    switch (settings.previewMode) {
      case 'editor-only': return <EyeOff className="h-4 w-4" />;
      case 'preview-only': return <Eye className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const isDarkMode = settings.theme === 'dark';

  // Render Mermaid diagrams in preview
  useEffect(() => {
    const mermaidContainers = document.querySelectorAll('.mermaid-container');
    mermaidContainers.forEach((container) => {
      const id = container.getAttribute('data-mermaid-id');
      const content = decodeURIComponent(container.getAttribute('data-mermaid-content') || '');
      
      if (id && content) {
        const mermaidDiv = document.createElement('div');
        container.appendChild(mermaidDiv);
        
        import('mermaid').then((mermaid) => {
          mermaid.default.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
          });
          
          mermaid.default.render(`mermaid-${id}`, content)
            .then(({ svg }) => {
              mermaidDiv.innerHTML = svg;
            })
            .catch((error) => {
              console.error('Mermaid rendering error:', error);
              mermaidDiv.innerHTML = `<pre class="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border">${error.message}</pre>`;
            });
        });
      }
    });
  }, [htmlPreview, isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <GistLoader onContentLoad={handleContentLoad} />
      
      {/* Enhanced Header with Gradient */}
      <header className={`border-b backdrop-blur-sm ${isDarkMode ? 'border-gray-700 bg-gray-800/95' : 'border-gray-200 bg-white/95'} px-6 py-4 sticky top-0 z-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} shadow-lg`}>
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Advanced Markdown Editor
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  A feature-rich markdown editor for developers.
                </p>
              </div>
            </div>
            
            {currentGist && (
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                <Github className="h-3 w-3" />
                <span>Gist: {currentGist.id.substring(0, 8)}...</span>
              </div>
            )}
            
            {settings.autoSaveEnabled && lastSaved && (
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                <Zap className="h-3 w-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <TableHelper onInsertTable={handleInsertTable} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoSave}
              className={`h-9 transition-all duration-200 ${settings.autoSaveEnabled ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'hover:bg-gray-100'}`}
              title={`Auto-save: ${settings.autoSaveEnabled ? 'ON' : 'OFF'}`}
            >
              <Save className="h-4 w-4 mr-1" />
              Auto
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={togglePreviewMode}
              className="h-9 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle view mode"
            >
              {getPreviewModeIcon()}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="h-9 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
            
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveToGist}
              disabled={gistLoading}
              className="h-9"
            >
              {gistLoading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Github className="h-4 w-4 mr-1" />
              )}
              {currentGist ? 'Update' : 'Save'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMarkdown}
              className="h-9 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              MD
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHtml}
              className="h-9 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 transition-colors"
            >
              <Copy className="h-4 w-4 mr-1" />
              HTML
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              className="h-9 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            
            {currentGist && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentGist.html_url, '_blank')}
                className="h-9 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Enhanced Editor Layout */}
      <div className="flex flex-col h-[calc(100vh-88px)]">
        <div className="flex flex-1 relative">
          {/* Editor Pane */}
          {settings.previewMode !== 'preview-only' && (
            <div className={`${settings.previewMode === 'side' ? 'flex-1 border-r border-gray-200 dark:border-gray-700' : 'w-full'} relative`}>
              <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <CodeMirror
                  ref={editorRef}
                  value={markdownText}
                  height="100%"
                  theme={isDarkMode ? oneDark : undefined}
                  extensions={[
                    markdown({ base: markdownLanguage, codeLanguages: languages }),
                  ]}
                  onChange={(value) => setMarkdownText(value)}
                  className="h-full"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    highlightActiveLine: true,
                    highlightSelectionMatches: false,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: false,
                  }}
                />
              </div>
            </div>
          )}

          {/* Enhanced Preview Pane */}
          {settings.previewMode !== 'editor-only' && (
            <div className={`${settings.previewMode === 'side' ? 'flex-1' : 'w-full'} relative`}>
              <div ref={previewRef} className={`h-full overflow-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="p-8 max-w-4xl mx-auto">
                  <div 
                    className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''} prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700`}
                    dangerouslySetInnerHTML={{ __html: htmlPreview }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Status Bar */}
        <StatusBar content={markdownText} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default MarkdownEditor;