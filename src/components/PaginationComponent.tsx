import { PAGE_SIZE } from "@/hooks/useAdminFunctionality";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface Props {
  cursor: number;
  page: number;
  setCursorHistory: React.Dispatch<React.SetStateAction<number[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  hasNextPage: boolean;
  count: number;
  cursorHistory: number[];
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const items: (number | "...")[] = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  items.push(1);

  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);

  if (start > 2) {
    items.push("...");
  }

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (end < totalPages - 1) {
    items.push("...");
  }

  items.push(totalPages);

  return items;
}

const PaginationComponent = ({
  cursor,
  page,
  setCursorHistory,
  setPage,
  hasNextPage,
  count,
  cursorHistory,
}: Props) => {
  const handleNextPage = () => {
    if (cursor == null) return;

    setCursorHistory((prev) => [...prev, cursor]);

    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (page === 1) return;

    setPage((prev) => prev - 1);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const pages = getPaginationItems(page, totalPages);

  console.log("PaginationComponent: ", { cursor, page, hasNextPage, count });
  return (
    <Pagination dir="ltr" className="flex justify-center mt-6 bg-transparent">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePreviousPage();
            }}
          />
        </PaginationItem>
        {pages.map((item, index) =>
          item === "..." ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={page === item}
                href="#"
                aria-disabled={item > cursorHistory.length}
                className={
                  item > cursorHistory.length
                    ? "pointer-events-none opacity-50"
                    : ""
                }
                onClick={(e) => {
                  e.preventDefault();

                  if (item <= cursorHistory.length) {
                    setPage(item);
                  }
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNextPage();
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationComponent;
