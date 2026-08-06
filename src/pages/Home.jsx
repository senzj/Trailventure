import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Backpack,
  BedDouble,
  Flame,
  Headset,
  Lightbulb,
  RotateCcw,
  Search,
  ShieldCheck,
  Tent,
  Truck,
} from "lucide-react";
import heroBg from "@/assets/hiking_bg.png";
import { fetchCategories } from "@/api/categories";
import ProductGrid from "@/components/products/ProductGrid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ICONS = {
  Tents: Tent,
  Backpacks: Backpack,
  Cooking: Flame,
  Lighting: Lightbulb,
  Sleeping: BedDouble,
};

const FEATURES = [
  { Icon: Truck, title: "Free Shipping", description: "On orders over $100" },
  { Icon: RotateCcw, title: "30-Day Returns", description: "No questions asked" },
  { Icon: ShieldCheck, title: "Secure Checkout", description: "Safe and encrypted" },
  { Icon: Headset, title: "Gear Experts", description: "Real outdoors advice" },
];

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroBg}
          alt="Camping under the mountains"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="container relative py-20 md:py-32">
          <Badge className="border-white/20 bg-white/10 text-white backdrop-blur">
            New Season Arrivals
          </Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Gear Up for Your Next Adventure
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            From rugged tents to trail-ready backpacks, find everything you need to
            camp, hike, and explore with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/search">
                Shop Now <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-10 flex max-w-xl items-center gap-2 rounded-xl border border-border/60 bg-background/95 p-2 shadow-soft backdrop-blur"
          >
            <Search className="ml-2 h-5 w-5 flex-none text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tents, backpacks, gear..."
              className="border-0 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="flex-none">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find the right gear for every trip.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/search">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.name] ?? Tent;
              return (
                <Link
                  key={category.id}
                  to={`/search?category=${category.id}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-soft"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="font-semibold">{category.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Brand New */}
      <section className="bg-secondary/40 py-14">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Brand New</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fresh gear just added to the collection.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link to="/search">
                See more <ArrowRight />
              </Link>
            </Button>
          </div>
          <ProductGrid latest limit={8} />
        </div>
      </section>

      {/* Best Selling */}
      <section className="container py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">Best Sellers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The gear our customers love the most.
          </p>
        </div>
        <ProductGrid randomize limit={8} />
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/40">
        <div className="container grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;