
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
  id: string;
}

export const MermaidRenderer = ({ chart, id }: MermaidRendererProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      });

      mermaid.render(`mermaid-${id}`, chart)
        .then(({ svg }) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = svg;
          }
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (elementRef.current) {
            elementRef.current.innerHTML = `<pre class="text-red-500 text-sm p-2 bg-red-50 rounded border">${error.message}</pre>`;
          }
        });
    }
  }, [chart, id]);

  return <div ref={elementRef} className="mermaid-diagram my-4" />;
};
