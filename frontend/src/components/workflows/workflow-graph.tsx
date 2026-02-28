'use client'

export function WorkflowGraph({ steps }: { steps: unknown[] }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-muted-foreground">
        Workflow visualization (stub - implement with recharts/d3)
      </p>
      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
        {JSON.stringify(steps, null, 2)}
      </pre>
    </div>
  )
}
