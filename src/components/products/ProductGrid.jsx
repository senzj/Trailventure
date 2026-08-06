import useProduct from "@/hooks/useProduct";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

function ProductGrid({ products, latest = false, randomize = false, limit = 8, loading = false }) {
  const fetched = useProduct(randomize, latest);
  const list = (products ?? fetched.products).slice(0, limit);
  const isLoading = loading || (!products && fetched.loading);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
          <Skeleton key={index} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    );
  }

  if (list.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {list.map((product) => (
        <ProductCard key={product.productID} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;