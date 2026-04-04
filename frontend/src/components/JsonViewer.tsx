export default function JsonViewer({
  value,
  emptyLabel = 'Sem dados disponíveis.',
}: {
  value: unknown;
  emptyLabel?: string;
}) {
  if (value === null || value === undefined) {
    return <pre className="json-box">{emptyLabel}</pre>;
  }

  return <pre className="json-box">{JSON.stringify(value, null, 2)}</pre>;
}
