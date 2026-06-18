import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-4xl font-black tracking-normal">Contact</h1>
      <form className="mt-8 grid gap-4 rounded-lg border bg-card p-5">
        <Input placeholder="Name" />
        <Input placeholder="Email" type="email" />
        <textarea className="min-h-32 rounded-md border bg-background p-3 text-sm" placeholder="How can we help?" />
        <Button>Send message</Button>
      </form>
    </div>
  );
}
