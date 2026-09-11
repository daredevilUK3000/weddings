import Image from "next/image";
import { Watermark } from "@/components/watermark";

// Per credibility-section-mockup.html: real, verifiable background (the
// 2013 date is confirmed via the original domain registration) — not
// invented, and deliberately scoped to wedding/ceremony credibility only.
// No MarryQ or other portfolio products belong in this section; that's a
// considered exclusion, not an oversight.
const CREDENTIALS = [
  {
    mark: "Publishing",
    body: "Founded national wedding and lifestyle magazines, with years spent covering the industry from the inside.",
  },
  {
    mark: "Authorship",
    body: "Published several wedding-planning guides, drawing on real insight from industry professionals.",
  },
  {
    mark: "Officiating",
    body: "An ordained officiant on the team, legally able to conduct marriages — lived ceremony experience, not theory.",
  },
];

// Alternating deal-in direction and staggered delay per cover, "dealt
// from a deck" — see the .credibility-book / .credibility-book-cover
// split in globals.css for why the entrance and hover transforms can't
// share an element.
const BOOKS = [
  {
    title: "Weddings, Weddings, Weddings!",
    src: "/images/books/book-weddings-weddings-weddings.jpg",
    width: 333,
    height: 420,
    href: "https://www.amazon.com/dp/B00828JN8M",
    dealX: "-70px",
    dealRot: "-22deg",
    delay: "0.44s",
  },
  {
    title: "Insider's Know-How: Planning Your Perfect Wedding",
    src: "/images/books/book-insiders-know-how.jpg",
    width: 279,
    height: 420,
    href: "https://www.amazon.com/dp/B007FZPXKA",
    dealX: "70px",
    dealRot: "22deg",
    delay: "0.49s",
  },
  {
    title: "Wedding Secrets",
    src: "/images/books/book-wedding-secrets.jpg",
    width: 325,
    height: 420,
    href: "https://www.amazon.com/dp/1477573550",
    dealX: "-70px",
    dealRot: "-22deg",
    delay: "0.54s",
  },
  {
    title: "Weddings Know-How: Planning Your Wedding",
    src: "/images/books/book-weddings-know-how.jpg",
    width: 280,
    height: 420,
    href: "https://www.amazon.com/dp/1492170569",
    dealX: "70px",
    dealRot: "22deg",
    delay: "0.59s",
  },
  {
    title: "Your Wedding Sorted!",
    src: "/images/books/book-your-wedding-sorted.jpg",
    width: 280,
    height: 420,
    href: "https://www.amazon.com/dp/1517598893",
    dealX: "-70px",
    dealRot: "-22deg",
    delay: "0.64s",
  },
];

export function CredibilitySection() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 py-[120px] text-ivory sm:px-8">
      <Watermark corner="right" size="credibility" tone="dark" />

      <div className="relative z-10 mx-auto max-w-[1000px] text-center">
        <div className="rise-in-el mb-6 flex animate-[riseIn_0.8s_ease_both] items-center justify-center gap-3">
          <span aria-hidden className="h-px w-8 bg-champagne" />
          <span className="font-serif text-base text-ivory/55 italic">Behind the ceremony</span>
        </div>

        <h2 className="rise-in-el mx-auto mb-5 max-w-[700px] animate-[riseIn_0.9s_ease_0.08s_both] font-serif text-[32px] leading-[1.16] font-medium min-[760px]:text-[46px]">
          Built by a small team with years of hands-on experience in weddings, publishing, and{" "}
          <em className="text-dusty-rose italic">ceremony</em>.
        </h2>

        <p className="rise-in-el mx-auto mb-5 max-w-[580px] animate-[riseIn_0.9s_ease_0.14s_both] text-base leading-relaxed text-ivory/62">
          WeddingsForOne is made by a team that has spent years working directly in the wedding
          industry — as publishers, authors, and an ordained officiant — not a generic product
          team guessing at what a ceremony should feel like.
        </p>

        <div className="rise-in-el mb-16 inline-flex animate-[riseIn_0.9s_ease_0.2s_both] items-center gap-2.5 font-serif text-[15px] text-champagne italic">
          <span aria-hidden className="h-1 w-1 rounded-full bg-champagne" />
          Publishing wedding guidance since 2013
          <span aria-hidden className="h-1 w-1 rounded-full bg-champagne" />
        </div>

        <div className="mb-[90px] grid grid-cols-1 gap-5 min-[760px]:grid-cols-3">
          {CREDENTIALS.map((c, i) => (
            <div
              key={c.mark}
              className="rise-in-el animate-[riseIn_0.9s_ease_both] rounded-[3px] border border-champagne/25 bg-ivory/4 px-6 py-9 transition-colors duration-250 hover:border-champagne hover:bg-ivory/7"
              style={{ animationDelay: `${0.26 + i * 0.06}s` }}
            >
              <div className="mb-2.5 font-serif text-xl text-champagne italic">{c.mark}</div>
              <p className="text-sm leading-relaxed text-ivory/75">{c.body}</p>
            </div>
          ))}
        </div>

        <div aria-hidden className="mx-auto mb-[60px] h-px w-[60px] bg-champagne/30" />

        <p className="mb-8 text-[13px] tracking-[0.3px] text-ivory/40">BOOKS FROM THE TEAM</p>
        <div
          className="mb-5 flex flex-wrap items-end justify-center gap-6"
          style={{ perspective: "1200px" }}
        >
          {BOOKS.map((book) => (
            <a
              key={book.href}
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="credibility-book inline-block"
              style={
                {
                  "--deal-x": book.dealX,
                  "--deal-rot": book.dealRot,
                  animationDelay: book.delay,
                } as React.CSSProperties
              }
            >
              <span className="credibility-book-cover block h-40 rounded-sm shadow-[0_18px_40px_rgba(0,0,0,0.45)] min-[760px]:h-[220px]">
                <Image
                  src={book.src}
                  alt={`${book.title} book cover`}
                  width={book.width}
                  height={book.height}
                  className="block h-full w-auto rounded-sm"
                />
              </span>
            </a>
          ))}
        </div>
        <p className="mb-[90px] font-serif text-[14.5px] text-ivory/40 italic">
          Five guides. One team. A decade of paying attention to what actually matters on the day.
        </p>

        <p className="mb-8 text-[13px] tracking-[0.3px] text-ivory/40">FEATURED ON</p>
        <div className="flex flex-wrap items-center justify-center gap-[30px] min-[760px]:gap-14">
          <span className="rise-in-el animate-[riseIn_0.9s_ease_0.7s_both] font-serif text-2xl tracking-[0.3px] text-ivory/45 transition-colors hover:text-champagne">
            Channel 4
          </span>
          <span className="rise-in-el animate-[riseIn_0.9s_ease_0.75s_both] font-serif text-2xl tracking-[0.3px] text-ivory/45 italic transition-colors hover:text-champagne">
            Sky TV
          </span>
          <span className="rise-in-el animate-[riseIn_0.9s_ease_0.8s_both] font-serif text-2xl tracking-[0.3px] text-ivory/45 transition-colors hover:text-champagne">
            International Radio
          </span>
        </div>
      </div>
    </section>
  );
}
