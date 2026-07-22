import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";

interface Props {
  cursor: number;
  page: number;
  setCursorHistory: React.Dispatch<React.SetStateAction<number[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationComponent = ({
  cursor,
  page,
  setCursorHistory,
  setPage
}: Props) => {
  const handleNextPage = () => {
    if (!cursor) return;

    setCursorHistory(prev => [
      ...prev,
      cursor
    ]);

    setPage(prev => prev + 1);
  }

  const handlePreviousPage = () => {
    if (page === 1) return;

    setPage(prev => prev - 1);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => {
            e.preventDefault();
            handlePreviousPage();
          }} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>
            {page}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" onClick={
            (e) => {
              e.preventDefault();
              handleNextPage();
            }
          } />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
