import Link from "next/link"
import {
  ArrowUpRight,
  Grid2x2,
  Instagram,
  Mail,
  Rows3,
  Search,
  Twitter,
  Youtube,
} from "lucide-react"
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader"

const quickActions = [
  {
    title: "Where is my order?",
    description: "Track live updates on every shipment.",
    href: "/order/complete",
  },
  {
    title: "How do I start a return or exchange?",
    description: "Begin a return within 14 days of delivery.",
    href: "/return-policy",
  },
  {
    title: "What is the status of my return?",
    description: "Confirm when your item reaches our studio.",
    href: "/account",
  },
  {
    title: "What is your return policy?",
    description: "Review timelines, conditions, and processing.",
    href: "/return-policy",
  },
  {
    title: "Can I change or cancel my order?",
    description: "Adjust your order before it enters fulfillment.",
    href: "#support",
  },
  {
    title: "The  loyalty program",
    description: "Unlock tiered perks and early access drops.",
    href: "/account",
  },
]

const infoCollections = [
  {
    title: "Frequently Asked Questions",
    meta: "9 articles",
    href: "#quick-answers",
  },
  {
    title: "Account and Loyalty",
    meta: "6 articles",
    href: "/account",
  },
  {
    title: "Policies and Care",
    meta: "4 articles",
    href: "/terms-and-conditions",
  },
]

const supportChannels = [
  {
    icon: Mail,
    heading: "Email our studio",
    description: "Reach us any time and expect a response within one business day.",
    meta: "=info@ny.com",
    href: "mailto:info@ny.com",
    id: "email-support",
  },
]

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/ny" },
  { icon: Twitter, label: "Twitter", href: "https://x.com/ny" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@ny" },
]

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-[#fbf6f0] text-[#181818]">
      <ProductPageBrandHeader />

      <section className="relative isolate overflow-hidden border-b border-[#181818]/10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-r from-[#211c16] via-[#2d251c] to-[#342a1f]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-32 pt-28 text-center text-white sm:px-10">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.28em] uppercase text-white/80">
            Support Hub
          </span>
          <h1 className="text-4xl font-black uppercase tracking-[0.24em] sm:text-5xl md:text-6xl">
           How can we help?
          </h1>
          <p className="mt-6 max-w-2xl text-sm uppercase tracking-[0.16em] text-white/70">
            Navigate answers, policies, and direct support tailored to every  drop.
          </p>

          <form className="mt-10 w-full max-w-2xl">
            <div className="flex h-14 items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 text-left backdrop-blur">
              <Search className="h-5 w-5 text-white/70" aria-hidden />
              <input
                type="search"
                name="help-center-search"
                placeholder="Search orders, returns, sizing, or general help"
                className="h-full w-full bg-transparent text-sm uppercase tracking-[0.18em] text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 text-xs font-semibold tracking-[0.2em] uppercase text-white transition hover:bg-white/30"
              >
                Search
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </div>
      </section>

      <section id="quick-answers" className="relative z-10 -mt-20 px-6 pb-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-[#181818]/10 bg-white/90 p-6 shadow-[0_30px_80px_rgba(24,24,24,0.08)] backdrop-blur sm:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6f6f6f]">
                Quick answers
              </p>
              <div className="flex items-center gap-2 text-[#6f6f6f]">
                <button
                  type="button"
                  aria-label="Grid view"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#181818]/10 bg-white text-[#6f6f6f] transition hover:text-[#181818]"
                >
                  <Grid2x2 className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#181818]/10 bg-white text-[#6f6f6f] transition hover:text-[#181818]"
                >
                  <Rows3 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {quickActions.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col gap-1 rounded-2xl border border-[#181818]/10 bg-white px-5 py-4 text-left transition hover:border-[#181818]/30 hover:bg-[#f3ede5]"
                >
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#181818]">
                    {item.title}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#6f6f6f]">
                    {item.description}
                  </span>
                  <ArrowUpRight className="mt-2 h-4 w-4 text-[#181818]/60 transition group-hover:translate-x-1 group-hover:text-[#181818]" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#181818]">Get more information</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {infoCollections.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex flex-col justify-between gap-6 rounded-2xl border border-[#181818]/10 bg-white p-6 transition hover:border-[#181818]/30 hover:bg-[#f5eee4]"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f6f6f]">{item.meta}</p>
                  <h3 className="mt-5 text-lg font-semibold uppercase tracking-[0.22em] text-[#181818]">
                    {item.title}
                  </h3>
                </div>
                <ArrowUpRight className="h-5 w-5 text-[#181818]/60" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="support" className="px-6 pb-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#181818]">Get support</h2>
          <div className="mt-6 grid gap-4">
            {supportChannels.map((channel) => {
              const Icon = channel.icon
              return (
                <Link
                  key={channel.heading}
                  href={channel.href}
                  id={channel.id}
                  className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-[#181818]/10 bg-white p-6 transition hover:border-[#181818]/30 hover:bg-[#f5eee4]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181818]/10 bg-[#fbf6f0] text-[#181818]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-[13px] font-semibold uppercase tracking-[0.24em] text-[#181818]">
                        {channel.heading}
                      </h3>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#6f6f6f]">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#181818]">
                    <span>{channel.meta}</span>
                    <ArrowUpRight className="h-4 w-4 text-[#181818]/60 transition group-hover:translate-x-1 group-hover:text-[#181818]" aria-hidden />
                  </div>
                </Link>
              )
            })}
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-[#6f6f6f]">
            Studio hours: Monday to Friday · 9:30a – 6:30p EST · Expect overnight turnaround outside of launch weeks.
          </p>
        </div>
      </section>

      <footer className="border-t border-[#181818]/10 bg-white/60 px-6 py-12 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 justify-between text-[#181818] sm:flex-row sm:items-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#6f6f6f]">
            ® Customer Support · 2026
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#181818]/10 bg-white text-[#181818] transition hover:border-[#181818]/40 hover:bg-[#f3ede5]"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </Link>
              )
            })}
          </div>
        </div>
      </footer>
    </div>
  )
}
