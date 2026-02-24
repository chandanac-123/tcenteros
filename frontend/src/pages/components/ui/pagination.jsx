import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import left_arrow from "@assets/navigate-icons/pagination-left.svg"
import right_arrow from "@assets/navigate-icons/pagination-right.svg"

import { cn } from "@pages/lib/utils"
import { buttonVariants } from "@pages/components/ui/button";

const Pagination = ({
  className,
  ...props
}) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props} />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props} />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      'min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md border transition-colors duration-150',
      isActive
        ? 'bg-secondary text-white border-secondary font-semibold shadow'
        : 'bg-white text-secondary ',
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 border cursor-pointer border-secondary text-secondary flex text-center items-center justify-center w-auto px-4", className)}
    {...props}>
    <img src={left_arrow} className="h-4 w-4 text-secondary" />
    <span className="">Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 border cursor-pointer border-secondary text-secondary flex items-center justify-center w-auto px-4", className)}
    {...props}>
    <span className="mr-1">Next</span>
    <img src={right_arrow} className="h-4 w-4 text-secondary" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}>
    <MoreHorizontal className="h-4 w-4 text-secondary" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
