import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONTACT_METHODS = [
  { Icon: Phone, title: "Phone", value: "+63 900 000 0000", hint: "Mon–Fri, 9am–5pm" },
  { Icon: Mail, title: "Email", value: "hello@trailventure.com", hint: "We reply within 24 hours" },
  { Icon: MapPin, title: "Location", value: "University Campus, Manila", hint: "By appointment only" },
];

function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent (demo)");
      event.target.reset();
    }, 700);
  };

  return (
    <div className="container py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Questions about an order, a product, or planning your trip? We&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Methods */}
        <div className="space-y-4 lg:col-span-2">
          {CONTACT_METHODS.map(({ Icon, title, value, hint }) => (
            <Card key={title}>
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{value}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{hint}</CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill in the form and we&apos;ll get back to you shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="mb-1.5 block">
                    Name
                  </Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject" className="mb-1.5 block">
                  Subject
                </Label>
                <Input id="subject" placeholder="What is this about?" required />
              </div>
              <div>
                <Label htmlFor="message" className="mb-1.5 block">
                  Message
                </Label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <Button type="submit" disabled={sending}>
                <Send /> {sending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Developer placeholder sections */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Project Team</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((member) => (
            <Card key={member}>
              <CardHeader>
                <CardTitle>Team Member {member}</CardTitle>
                <CardDescription>Role / Course</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {/* TODO: Add developer name, contact, and responsibilities. */}
                Name, university, email, and role to be filled in.
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;