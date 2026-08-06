import { AlertCircle, Loader2, SearchX } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * Reusable conditional-display widget for async sections.
 * Renders a loading spinner, an error (with retry), or an empty state;
 * otherwise renders `children`.
 */
function ConditionalState({
  loading = false,
  error = null,
  empty = false,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Try adjusting your filters or check back later.",
  emptyAction = null,
  onRetry = null,
  className,
  children,
}) {
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-16 text-center",
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-16 text-center",
          className,
        )}
      >
        <AlertCircle className="h-10 w-10 text-destructive/70" />
        <p className="font-medium">{error.message || "Something went wrong"}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 py-16 text-center",
          className,
        )}
      >
        <SearchX className="h-10 w-10 text-muted-foreground/50" />
        <div>
          <p className="font-semibold">{emptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
        {emptyAction}
      </div>
    );
  }

  return children;
}

export default ConditionalState;