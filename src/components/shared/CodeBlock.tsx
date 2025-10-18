import { Shield, AlertTriangle } from 'lucide-react';

interface CodeBlockProps {
  title: string;
  code: string;
  tone: 'safe' | 'dangerous';
  hint?: string;
}

export function CodeBlock({ title, code, tone, hint }: CodeBlockProps) {
  const isSafe = tone === 'safe';

  return (
    <div className={`glass rounded-lg overflow-hidden ${isSafe ? 'border-success/30' : 'border-destructive/30'}`}>
      <div
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
          isSafe ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
        }`}
      >
        {isSafe ? <Shield className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {title}
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-muted/30">
        <code>{code}</code>
      </pre>
      {hint && <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border/50">{hint}</div>}
    </div>
  );
}
