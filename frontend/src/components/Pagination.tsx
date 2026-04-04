export default function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, index) => index + 1).slice(
    Math.max(currentPage - 3, 0),
    Math.max(currentPage - 3, 0) + 5
  );

  return (
    <div className="pagination-wrap">
      <div className="pagination-meta muted">Total: {total} registros</div>

      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={page === currentPage ? 'page-pill active' : 'page-pill'}
            type="button"
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="btn btn-secondary btn-sm"
          type="button"
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
