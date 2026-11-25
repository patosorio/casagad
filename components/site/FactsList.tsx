export function FactsList({
  rows,
}: {
  rows: readonly { label: string; value?: string }[];
}) {
  return (
    <ul className="m-0 list-none p-0">
      {rows.map((row) => (
        <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-linea py-3">
          <span className="text-pietra">{row.label}</span>
          {row.value ? <span>{row.value}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export function GlanceList({ items }: { items: readonly string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((item) => (
        <li key={item} className="border border-linea bg-bianco px-3 py-2 text-[15px]">
          {item}
        </li>
      ))}
    </ul>
  );
}
