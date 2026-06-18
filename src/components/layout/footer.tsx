import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#1F2B46] text-white">
      <div className="container px-4 py-10 md:py-12">
        
        {/* Top Section */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_2fr]">
          
          {/* Brand */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-black">TrendyCart</h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70 lg:mx-0">
              Discover fashion, electronics, beauty products, home
              essentials and more from trusted sellers across India.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-4 text-center lg:text-left">
            
            {/* Shop */}
            <div>
              <h3 className="text-sm font-semibold text-white">
                Shop
              </h3>

              <div className="mt-3 flex flex-col gap-2 text-xs text-white/70 sm:text-sm">
                <Link
                  href="/shop"
                  className="transition hover:text-white"
                >
                  Products
                </Link>

                <Link
                  href="/categories"
                  className="transition hover:text-white"
                >
                  Categories
                </Link>

                <Link
                  href="/search"
                  className="transition hover:text-white"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-white">
                Account
              </h3>

              <div className="mt-3 flex flex-col gap-2 text-xs text-white/70 sm:text-sm">
                <Link
                  href="/orders"
                  className="transition hover:text-white"
                >
                  Orders
                </Link>

                <Link
                  href="/profile"
                  className="transition hover:text-white"
                >
                  Profile
                </Link>

                <Link
                  href="/wishlist"
                  className="transition hover:text-white"
                >
                  Wishlist
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white">
                Company
              </h3>

              <div className="mt-3 flex flex-col gap-2 text-xs text-white/70 sm:text-sm">
                <Link
                  href="/about"
                  className="transition hover:text-white"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="transition hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  href="/privacy-policy"
                  className="transition hover:text-white"
                >
                  Privacy
                </Link>

                <Link
                  href="/terms-and-conditions"
                  className="transition hover:text-white"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-sm text-white/60 md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} TrendyCart. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/privacy-policy"
                className="transition hover:text-white"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms-and-conditions"
                className="transition hover:text-white"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}