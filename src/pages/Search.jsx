import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { fetchProducts } from "@/api/products";
import { fetchCategories } from "@/api/categories";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConditionalState from "@/components/ui/ConditionalState";
import { cn } from "@/lib/utils";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const [input, setInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProducts({ q: query, category })
      .then((list) => active && setProducts(list))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [query, category]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (input.trim()) next.set("q", input.trim());
      else next.delete("q");
      return next;
    });
  };

  const handleCategory = (id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set("category", String(id));
      else next.delete("category");
      return next;
    });
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="mt-1 text-muted-foreground">
          {loading
            ? "Searching..."
            : `${products.length} product${products.length === 1 ? "" : "s"} found`}
        </p>
      </div>

      {/* Search + filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSubmit} className="flex max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <button
            type="button"
            onClick={() => handleCategory("")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCategory(item.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === String(item.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <ConditionalState
        loading={loading}
        empty={!loading && products.length === 0}
        emptyTitle="No products found"
        emptyDescription="Try a different search term or clear the category filter."
        emptyAction={
          <Button
            variant="outline"
            onClick={() => {
              setInput("");
              setSearchParams({});
            }}
          >
            Clear filters
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.productID} product={product} />
          ))}
        </div>
      </ConditionalState>
    </div>
  );
}

export default SearchPage;