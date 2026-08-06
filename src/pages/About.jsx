import { Link } from "react-router-dom";
import { ArrowRight, Compass, Leaf, Mountain } from "lucide-react";
import aboutBg from "@/assets/adventureBG.png";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    Icon: Mountain,
    title: "Built for the Outdoors",
    description:
      "Every product is selected for real-world durability so it earns its place in your pack.",
  },
  {
    Icon: Leaf,
    title: "Sustainability",
    description:
      "We prioritize responsible materials and long-lasting designs that reduce waste.",
  },
  {
    Icon: Compass,
    title: "Expert Guidance",
    description:
      "Our team of outdoor enthusiasts helps you find the right gear for your next trip.",
  },
];

function About() {
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={aboutBg} alt="Adventure landscape" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="container relative py-20 text-center md:py-28">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">
            About Trailventure
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            We help adventurers head outdoors with confidence, one thoughtful piece
            of gear at a time.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Gear that gets you out there</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Trailventure started with a simple idea: outdoor gear shouldn&apos;t be
              complicated to choose. We test, review, and stock a curated range of
              tents, backpacks, cooking kit, lighting, and sleep systems so you can
              spend less time researching and more time outside.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Whether you&apos;re a weekend camper or a seasoned thru-hiker, our catalog
              brings together reliable, comfortable, and long-lasting equipment at a
              fair price.
            </p>
            <Button asChild className="mt-6">
              <Link to="/search">
                Explore the Gear <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl">
            <img src={aboutBg} alt="Outdoor camping" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">What We Stand For</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;