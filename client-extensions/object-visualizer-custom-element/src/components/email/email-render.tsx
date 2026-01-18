import { PropsWithChildren } from 'react';

export function EmailRender({ children }: PropsWithChildren) {
    return (
        <iframe
            srcDoc={`<html><head><style>body { margin: 0; } img, table { max-width: 100%; height: auto; } .variable-highlight { background-color: rgba(88, 28, 135, 0.5); color: inherit; padding: 0.25rem; border-radius: 0.25rem; font-weight: 600; }</style></head><body>${children}<script>window.addEventListener('load', () => { const body = document.body; const scale = Math.min(1, body.clientWidth / body.scrollWidth); if (scale < 1) { body.style.transform = \`scale(\${scale})\`; body.style.transformOrigin = 'top left'; body.style.width = \`\${100 / scale}%\`; } });</script></body></html>`}
            className="prose prose-sm max-w-none"
            sandbox="allow-scripts allow-same-origin"
            style={{
                width: '100%',
                height: '600px',
                border: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.6',
            }}
            title="Email Preview"
        />
    );
}
