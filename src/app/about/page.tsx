export default function AboutPage() {
  return <InfoPage title="About TrendyCart" body="TrendyCart is a production-ready multi-vendor commerce platform for modern brands, independent sellers, and customers who expect fast discovery, secure checkout, and transparent order tracking." />;
}

function InfoPage({ title, body }: { title: string; body: string }) {
  return <div className="container max-w-3xl py-16"><h1 className="text-4xl font-black tracking-normal">{title}</h1><p className="mt-5 text-lg text-muted-foreground">{body}</p></div>;
}
