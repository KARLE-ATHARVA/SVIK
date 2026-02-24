export default function DataTable({
  columns,
  data,
  sortConfig,
  onSort,
  renderRow
}) {
  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
      <thead className="bg-green-100 dark:bg-green-900/30">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-3 font-semibold text-left cursor-pointer"
              onClick={() => col.sortable && onSort(col.key)}
            >
              {col.label}
              {sortConfig.key === col.key &&
                (sortConfig.direction === "ascending" ? " ↑" : " ↓")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(renderRow)}
      </tbody>
    </table>
  );
}