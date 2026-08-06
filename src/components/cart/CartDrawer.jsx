import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  addQuantity,
  removeProduct,
  shoppingCartAtom,
  subtractQuantity,
} from "@/atom/shoppingCart";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

function CartDrawer() {
  const [shoppingCart] = useAtom(shoppingCartAtom);
  const subtotal = shoppingCart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <SheetContent className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader className="border-b px-5 py-4">
        <SheetTitle>Shopping Cart ({shoppingCart.length})</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {shoppingCart.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">Your cart is empty</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/search">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {shoppingCart.map((item) => (
              <li key={item.productID} className="flex gap-3">
                <Link
                  to={`/product/${item.productID}`}
                  className="h-20 w-20 flex-none overflow-hidden rounded-xl bg-muted"
                >
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link
                    to={`/product/${item.productID}`}
                    className="line-clamp-1 text-sm font-semibold hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <span className="text-sm font-bold text-primary">
                    ${Number(item.price).toFixed(2)}
                  </span>

                  <div className="mt-auto flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => subtractQuantity(item.productID)}
                        className="flex h-8 w-8 items-center justify-center hover:text-primary"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => addQuantity(item.productID)}
                        className="flex h-8 w-8 items-center justify-center hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeProduct(item.productID)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {shoppingCart.length > 0 && (
        <>
          <Separator />
          <SheetFooter className="gap-3 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <Button asChild className="w-full">
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
          </SheetFooter>
        </>
      )}
    </SheetContent>
  );
}

export default CartDrawer;