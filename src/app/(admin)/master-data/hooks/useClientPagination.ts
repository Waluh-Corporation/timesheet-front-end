import { useState, useMemo } from "react";

export function useClientPagination<T>(
  data: T[],
  filterFn: (item: T, search: string) => boolean,
  initialSortKey: keyof T,
  initialSortDir: "asc" | "desc" = "asc"
) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortKey, setSortKey] = useState<keyof T>(initialSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSortDir);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((item) => filterFn(item, search.toLowerCase()));
  }, [data, search, filterFn]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return sortedData.slice(startIndex, startIndex + limit);
  }, [sortedData, currentPage, limit]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return {
    search,
    setSearch,
    page: currentPage,
    setPage,
    limit,
    setLimit,
    sortKey,
    sortDir,
    handleSort,
    paginatedData,
    totalItems,
    totalPages,
  };
}
