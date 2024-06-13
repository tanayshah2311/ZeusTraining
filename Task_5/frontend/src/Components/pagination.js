import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={`page-item ${i === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          <a href="#" className="page-link">
            {i}
          </a>
        </li>
      );
    }

    return pageNumbers;
  };

  const goToFirstSubset = () => {
    const firstPageOfSubset = Math.floor((currentPage - 1) / 5) * 5 + 1;
    onPageChange(firstPageOfSubset);
  };

  const goToLastSubset = () => {
    const lastPageOfSubset = Math.min(
      Math.floor((currentPage - 1) / 5) * 5 + 5,
      totalPages
    );
    onPageChange(lastPageOfSubset);
  };

  return (
    <nav>
      <ul className="pagination">
        <li className="page-item">
          <a href="#" className="page-link" onClick={goToFirstSubset}>
            &lt;&lt; First
          </a>
        </li>
        <li className="page-item">
          <a href="#" className="page-link" onClick={handlePrevClick}>
            Previous
          </a>
        </li>
        {renderPageNumbers()}
        <li className="page-item">
          <a href="#" className="page-link" onClick={handleNextClick}>
            Next
          </a>
        </li>
        <li className="page-item">
          <a href="#" className="page-link" onClick={goToLastSubset}>
            Last &gt;&gt;
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
