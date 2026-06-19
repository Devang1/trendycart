"use client";

import { Heart, Home, LayoutDashboard, Menu, Moon, PackageSearch, Search, ShoppingCart, Sun, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

const navItems = [["Shop", "/shop"], ["Orders", "/orders"], ["Wishlist", "/wishlist"]];

export function Header() {
  const { data } = useSession();
  const { theme, setTheme } = useTheme();
  const items = useCartStore((state) => state.items);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur-xl">
      <div className="container flex min-h-14 items-center gap-2 py-2 md:gap-3">
        <Link href="/" className="flex items-center gap-3">
  <img
    src="/logo-icon.png"
    alt="TrendysCart"
    className="h-10 w-10 object-contain"
  />

  <div className="hidden sm:block">
    <h1 className="text-xl font-black text-[#1F2B46]">
      TrendysCart
    </h1>
    <p className="text-xs text-muted-foreground">
      Smart Shopping
    </p>
  </div>
</Link>
        <form action="/search" className="flex h-10 min-w-0 flex-1 items-center rounded-md border bg-background px-2 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 md:h-11 md:max-w-4xl md:border-2 md:px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input name="q" placeholder="Search products" className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none md:h-10 md:px-3 md:placeholder:text-muted-foreground" />
        </form>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" className="hidden md:inline-flex" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="Wishlist" className="hidden xl:inline-flex">
          <Link href="/wishlist"><Heart className="h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="ghost" aria-label="Cart" className="relative hidden px-3 sm:inline-flex">
          <Link href="/cart">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Cart</span>
            {items.length > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] text-accent-foreground">{items.length}</span> : null}
          </Link>
        </Button>
        <div className="hidden items-center gap-2 lg:flex">
          {data?.user ? (
            <>
              {data.user.role === "ADMIN" ? (
                <Button asChild variant="ghost" size="icon" aria-label="Admin dashboard"><Link href="/admin"><LayoutDashboard className="h-4 w-4" /></Link></Button>
              ) : null}
              {data.user.role === "SELLER" ? (
                <Button asChild variant="ghost" size="icon" aria-label="Seller dashboard"><Link href="/seller"><LayoutDashboard className="h-4 w-4" /></Link></Button>
              ) : null}
              <Button asChild variant="ghost" aria-label="Profile" className="px-3"><Link href="/profile"><User className="h-4 w-4" /> Account</Link></Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Button asChild variant="ghost" className="px-3"><Link href="/login"><User className="h-4 w-4" /> Login</Link></Button>
          )}
        </div>
        <Button variant="ghost" size="icon" aria-label="Toggle menu" className="lg:hidden" onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      <div className="container hidden border-t py-2 lg:block">
        <nav className="flex items-center gap-6 text-sm font-semibold">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-primary">
              {label}
            </Link>
          ))}
          <Link href="/compare" className="ml-auto transition hover:text-primary">Compare</Link>
        </nav>
      </div>
      {menuOpen ? (
        <div className="border-t bg-card lg:hidden">
          <div className="container grid gap-3 py-3">
            <div className="flex items-center justify-between gap-3 border-b pb-3">
              <span className="text-sm font-bold">Menu</span>
              <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="hidden h-4 w-4 dark:block" />
                Theme
              </Button>
            </div>
            <nav className="grid gap-1 text-sm font-semibold">
              {navItems.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-md px-2 py-2 hover:bg-muted" onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
            </nav>
            {data?.user ? (
              <div className="grid gap-2 border-t pt-3">
                <Link href="/profile" className="rounded-md px-2 py-2 text-sm font-semibold hover:bg-muted" onClick={() => setMenuOpen(false)}>Profile</Link>
                {data.user.role === "ADMIN" ? <Link href="/admin" className="rounded-md px-2 py-2 text-sm font-semibold hover:bg-muted" onClick={() => setMenuOpen(false)}>Admin dashboard</Link> : null}
                {data.user.role === "SELLER" ? <Link href="/seller" className="rounded-md px-2 py-2 text-sm font-semibold hover:bg-muted" onClick={() => setMenuOpen(false)}>Seller dashboard</Link> : null}
                <Button variant="outline" size="sm" onClick={() => signOut()}>Logout</Button>
              </div>
            ) : (
              <Button asChild><Link href="/login" onClick={() => setMenuOpen(false)}>Login / Register</Link></Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t bg-card/95 px-2 pb-2 pt-1 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      {[
        { label: "Home", href: "/", icon: Home },
        { label: "Shop", href: "/shop", icon: PackageSearch },
        { label: "Wishlist", href: "/wishlist", icon: Heart },
        { label: "Cart", href: "/cart", icon: ShoppingCart, count: items.length },
        { label: data?.user ? "Account" : "Login", href: data?.user ? "/profile" : "/login", icon: User }
      ].map((item) => (
        <Link key={item.href} href={item.href} className="relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-primary">
          <item.icon className="h-5 w-5" />
          <span className="max-w-full truncate">{item.label}</span>
          {item.count ? <span className="absolute right-4 top-1 rounded-full bg-accent px-1.5 text-[10px] text-accent-foreground">{item.count}</span> : null}
        </Link>
      ))}
    </nav>
    </>
  );
}
