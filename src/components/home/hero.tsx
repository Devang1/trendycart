"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgePercent, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/bg1.png",
    eyebrow: "Fresh offers live",
    title: "Smart deals for fashion, tech and home",
    body: "Fresh drops, seller picks, and limited-time value bundles curated for everyday shopping."
  },
  {
    image: "/bg2.png",
    eyebrow: "Weekend edit",
    title: "Upgrade your cart with sharper picks",
    body: "Browse fast-moving essentials, new arrivals, and offers from verified TrendyCart sellers."
  },
  {
    image: "/bg3.png",
    eyebrow: "Daily value picks",
    title: "Find more reasons to shop today",
    body: "Simple discovery, secure checkout, and order updates from placement to delivery."
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      <Link href="/shop" className="group relative block min-h-[400px] overflow-hidden border-y bg-secondary shadow-sm sm:min-h-[470px] lg:min-h-[540px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.image}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <Image src={slide.image} alt="TrendyCart sale banner" fill priority className="object-cover object-center sm:object-cover" sizes="100vw" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/88 via-secondary/72 to-secondary/92 sm:bg-gradient-to-r sm:from-secondary/96 sm:via-secondary/78 sm:to-secondary/18" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-secondary/95 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[400px] w-full max-w-7xl flex-col justify-end px-4 pb-7 pt-16 text-secondary-foreground sm:min-h-[470px] sm:justify-center sm:px-6 sm:py-8 lg:min-h-[540px] lg:px-8">
          <div className="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-md border border-white/15 bg-black/20 px-2 py-1 text-[10px] font-bold backdrop-blur-md sm:mb-4 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
            <BadgePercent className="h-3.5 w-3.5 text-accent sm:h-4 sm:w-4" />
            {slide.eyebrow}
          </div>
          <h1 className="max-w-[18rem] text-2xl font-black leading-[1.15] tracking-normal sm:max-w-3xl sm:text-5xl sm:leading-tight lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-2 max-w-[19rem] text-[11px] leading-[1.55] text-white/80 sm:mt-4 sm:max-w-2xl sm:text-base sm:leading-7 lg:text-lg">
            {slide.body}
          </p>
          <div className="mt-6 hidden flex-wrap gap-2 text-sm font-bold text-white/88 sm:flex">
            <span className="rounded-md bg-white/12 px-2.5 py-1 backdrop-blur sm:px-3 sm:py-1.5">Top sellers</span>
            <span className="rounded-md bg-white/12 px-2.5 py-1 backdrop-blur sm:px-3 sm:py-1.5">Easy checkout</span>
            <span className="rounded-md bg-white/12 px-3 py-1.5 backdrop-blur">Daily value picks</span>
          </div>
          <span className="mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-3 py-2 text-[11px] font-black text-secondary shadow-lg transition group-hover:-translate-y-0.5 group-hover:shadow-xl sm:mt-7 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm">
            Shop offers <ArrowRight className="h-4 w-4" />
          </span>

          <div className="mt-4 grid max-w-md grid-cols-3 gap-1.5 sm:mt-8 sm:max-w-2xl sm:gap-2">
            <div className="flex min-h-14 items-center gap-2 border border-white/20 bg-black/20 p-2 shadow-lg backdrop-blur-md sm:block sm:p-3 md:rounded-lg">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground sm:h-auto sm:w-auto sm:bg-transparent sm:text-accent">
                <Truck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-black leading-tight sm:mt-2 sm:text-sm">Fast</span>
                <span className="block truncate text-[8px] leading-tight text-white/65 sm:text-xs">Quick dispatch</span>
              </span>
            </div>
            <div className="flex min-h-14 items-center gap-2 border border-white/20 bg-black/20 p-2 shadow-lg backdrop-blur-md sm:block sm:p-3 md:rounded-lg">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground sm:h-auto sm:w-auto sm:bg-transparent sm:text-primary">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-black leading-tight sm:mt-2 sm:text-sm">Secure</span>
                <span className="block truncate text-[8px] leading-tight text-white/65 sm:text-xs">Safe payment</span>
              </span>
            </div>
            <div className="flex min-h-14 items-center gap-2 border border-white/20 bg-black/20 p-2 shadow-lg backdrop-blur-md sm:block sm:p-3 md:rounded-lg">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-500 text-white sm:h-auto sm:w-auto sm:bg-transparent sm:text-accent">
                <BadgePercent className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-black leading-tight sm:mt-2 sm:text-sm">Offers</span>
                <span className="block truncate text-[8px] leading-tight text-white/65 sm:text-xs">Fresh daily</span>
              </span>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-10 flex gap-1.5 sm:bottom-5 sm:right-6 sm:top-auto lg:right-8">
          {slides.map((item, index) => (
            <span key={item.image} className={`h-1.5 rounded-full transition-all ${index === current ? "w-8 bg-white" : "w-2 bg-white/45"}`} />
          ))}
        </div>
      </Link>
    </section>
  );
}
