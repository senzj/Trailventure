import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import { CreditCard, ShoppingCart } from "lucide-react";
import { clearCart, shoppingCartAtom } from "@/atom/shoppingCart";
import { createOrder } from "@/api/orders";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const PAYMENT_METHODS = ["Credit Card", "GCash", "Cash on Delivery"];

function CheckOut() {
  const navigate = useNavigate();
  const [shoppingCart] = useAtom(shoppingCartAtom);
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [processing, setProcessing] = useState(false);

  const subtotal = shoppingCart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handlePay = async (event) => {
    event.preventDefault();
    if (!customerName.trim() || !email.trim()) {
      toast.error("Please provide your name and email");
      return;
    }

    setProcessing(true);
    try {
      await createOrder({
        customerName,
        email,
        paymentMethod,
        items: shoppingCart.map((item) => ({
          productID: item.productID,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        total,
      });
      clearCart();
      toast.success("Order placed successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  if (shoppingCart.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-3 py-24 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add some gear before heading to checkout.
        </p>
        <Button asChild>
          <Link to="/search">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handlePay} className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Order summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {shoppingCart.map((item) => (
                  <li key={item.productID} className="flex items-center gap-4">
                    <Link
                      to={`/product/${item.productID}`}
                      className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-muted"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <p className="line-clamp-1 font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {item.quantity} &times; ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator className="my-5" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="co-name" className="mb-1.5 block">
                    Full Name
                  </Label>
                  <Input
                    id="co-name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="co-email" className="mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Payment Method</Label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="h-4 w-4 accent-primary"
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </div>

              {paymentMethod === "Credit Card" && (
                <>
                  <div>
                    <Label htmlFor="name" className="mb-1.5 block">
                      Name on Card
                    </Label>
                    <Input id="name" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="mb-1.5 block">
                      Card Number
                    </Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry" className="mb-1.5 block">
                        Expiry Date
                      </Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="mb-1.5 block">
                        CVV
                      </Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod !== "Credit Card" && (
                <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
                  {paymentMethod} details will be confirmed at delivery.
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={processing}>
                {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default CheckOut;