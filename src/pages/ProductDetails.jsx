import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Minus, Package, Plus, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { fetchProduct, fetchProducts } from "@/api/products";
import ProductCard from "@/components/products/ProductCard";
import { discountedPrice, formatPrice } from "@/utils/price";
import { addProductQuantity } from "@/atom/shoppingCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    fetchProduct(id)
      .then((item) => {
        if (active) setProduct(item);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  // "Recommended for You": same-category picks first, then other gear, capped at 4.
  useEffect(() => {
    if (!product) return;
    let active = true;

    fetchProducts()
      .then((all) => {
        if (!active) return;
        const others = all.filter((p) => p.productID !== product.productID);
        const sameCategory = others.filter((p) => p.categoryId === product.categoryId);
        const rest = others.filter((p) => p.categoryId !== product.categoryId);
        const picks = [...sameCategory, ...rest]
          .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
          .slice(0, 4);
        setRecommended(picks);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [product]);

  if (notFound) {
    return (
      <div className="container flex flex-col items-center gap-3 py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-sm text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or was removed.
        </p>
        <Button asChild>
          <Link to="/search">Back to shop</Link>
        </Button>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="container grid gap-8 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-12 w-64" />
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const hasDiscount = Number(product.discount) > 0;
  const finalPrice = discountedPrice(product);

  const handleAddToCart = () => {
    addProductQuantity({ ...product, price: finalPrice }, quantity);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    addProductQuantity({ ...product, price: finalPrice }, quantity);
    navigate("/checkout");
  };

  return (
    <div className="container py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/search" className="hover:text-primary">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/search?category=${product.categoryId}`}
              className="hover:text-primary"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="truncate font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <Badge className="w-fit">{product.category}</Badge>
          <h1 className="mt-3 text-3xl font-bold leading-tight">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold text-primary">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="destructive">-{product.discount}% off</Badge>
              </>
            )}
            {inStock ? (
              <Badge variant="success">In stock ({product.stock})</Badge>
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description || "No description provided for this product."}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              Quantity
            </span>
            <div className="inline-flex items-center rounded-xl border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="flex h-10 w-10 items-center justify-center hover:text-primary disabled:opacity-50"
                disabled={!inStock}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((prev) => Math.min(product.stock, prev + 1))
                }
                className="flex h-10 w-10 items-center justify-center hover:text-primary disabled:opacity-50"
                disabled={!inStock || quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={handleAddToCart} disabled={!inStock}>
              <ShoppingCart /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={!inStock}>
              <Zap /> Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommended.map((item) => (
              <ProductCard key={item.productID} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetails;