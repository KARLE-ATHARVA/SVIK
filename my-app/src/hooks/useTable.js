import { useState, useMemo } from "react";

export default function useTable(data, entriesPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = String(a[sortConfig.key] ?? "");
      const bVal = String(b[sortConfig.key] ?? "");

      return sortConfig.direction === "ascending"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return sorted;
  }, [data, sortConfig]);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = sortedData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedData.length / entriesPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  return {
    currentItems,
    currentPage,
    setCurrentPage,
    totalPages,
    sortConfig,
    handleSort,
    totalCount: sortedData.length,
  };
}