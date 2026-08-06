import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { addProduct } from "@/atom/shoppingCart";
import { discountedPrice, formatPrice } from "@/utils/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function ProductCard({ product }) {
  const { productID, name, price, image, category, stock } = product;
  const inStock = stock > 0;
  const hasDiscount = Number(product.discount) > 0;
  const finalPrice = discountedPrice(product);

  const handleAddToCart = () => {
    addProduct({ ...product, price: finalPrice });
    toast.success("Added to cart");
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link
        to={`/product/${productID}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <Badge variant="destructive">-{product.discount}%</Badge>
          )}
          {category && (
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
              {category}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to={`/product/${productID}`}
          className="line-clamp-1 font-semibold text-foreground transition-colors hover:text-primary"
        >
          {name}
        </Link>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>
          {inStock ? (
            <span className="text-xs text-muted-foreground">{stock} in stock</span>
          ) : (
            <Badge variant="destructive">Out of stock</Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-full"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;