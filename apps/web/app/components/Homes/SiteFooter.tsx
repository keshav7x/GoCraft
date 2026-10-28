
import { BrandMark } from "./BrandMark";

const FOOTER_GROUPS = [
  {
    label: "Product",
    links: [
      { label: "Challenge preview", href: "#preview" },
      { label: "Learning path", href: "#learn" },
      { label: "Progression", href: "#progress" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Friends", href: "#friends" },
      { label: "Marketplace", href: "#store" },
      { label: "Back to top", href: "#top" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-slate-200 bg-white text-slate-600"
    >
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-14 sm:px-8 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <a
              href="#top"
              aria-label="GoCraft home"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950"
            >
              <BrandMark className="h-8 w-8" />
              <span>GoCraft</span>
            </a>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Practical coding challenges for developers who learn by building.
            </p>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-8"
          >
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <h2 className="text-sm font-semibold text-slate-950">
                  {group.label}
                </h2>

                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 transition-colors hover:text-slate-950"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:mt-14 sm:flex-row sm:items-start sm:justify-between">
          <span className="shrink-0 text-xs text-slate-500">
            © {new Date().getFullYear()} GoCraft
          </span>

          <p className="max-w-2xl text-xs leading-5 text-slate-400 sm:text-right">
            GoCraft coins are a virtual, in-platform currency with no cash
            value. They cannot be withdrawn or exchanged for money. Social,
            progression, and marketplace previews on this page are illustrative.
          </p>
        </div>
      </div>
    </footer>
  );
}
