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
    <footer id="footer" className="border-t border-line bg-canvas text-ink-2">
      <div className="mx-auto max-w-7xl px-6 pb-6 pt-14 sm:px-8 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr]">
          <div className="max-w-sm">
            <a
              href="#top"
              aria-label="GoCraft home"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink"
            >
              <BrandMark className="h-8 w-8" />
              <span>GoCraft</span>
            </a>

            <p className="mt-4 max-w-xs text-sm leading-6 text-ink-3">
              Practical coding challenges for developers who learn by
              building.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-8"
          >
            {FOOTER_GROUPS.map((group) => (
              <div key={group.label}>
                <h2 className="text-sm font-semibold text-ink">{group.label}</h2>

                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="cursor-pointer text-sm text-ink-3 transition-colors duration-150 ease-smooth hover:text-ink"
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

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:mt-14 sm:flex-row sm:items-start sm:justify-between">
          <span className="shrink-0 text-xs text-ink-3">
            © {new Date().getFullYear()} GoCraft
          </span>

          <p className="max-w-2xl text-xs leading-5 text-ink-4 sm:text-right">
            GoCraft coins are a virtual, in-platform currency with no cash
            value. They cannot be withdrawn or exchanged for money. Social,
            progression, and marketplace previews on this page are
            illustrative.
          </p>
        </div>
      </div>
    </footer>
  );
}
