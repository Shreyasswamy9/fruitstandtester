"use client"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader"
import MarqueeBanner from "@/components/MarqueeBanner"

interface EditorialPhoto {
  id: string
  image: string
  location: string
}

const editorialPhotos: EditorialPhoto[] = [
  { id: "1", image: "https://cdn.jsdelivr.net/gh/Shreyasswamy9/NY@main/website-real/public/images/editorial/EDITSr1-11.JPG", location: "LOWER EAST SIDE" },
  { id: "2", image: "https://cdn.jsdelivr.net/gh/Shreyasswamy9/NY@main/website-real/public/images/editorial/EDITSr1-15.JPG", location: "CHINATOWN" },
  { id: "3", image: "https://cdn.jsdelivr.net/gh/Shreyasswamy9/NY@main/website-real/public/images/editorial/EDITSr1-155.JPG", location: "LOWER EAST SIDE" },
  { id: "4", image: "https://cdn.jsdelivr.net/gh/Shreyasswamy9/NY@main/website-real/public/images/editorial/EDITSr1-21.JPG", location: "LOWER EAST SIDE" },
]

const newItems = [
  {
    id: "kiwi-rugby-jersey",
    name: "KIWI RUGBY JERSEY",
    image: "/images/products/kiwi rugby jersey/Kiwi DS 1x1.png",
    price: "$125",
    link: "/shop/kiwi-rugby-jersey",
  },
  {
    id: "liberty-zip-up",
    name: "LIBERTY ZIP-UP",
    image: "/images/products/liberty zip ups/copper/Copper DS 1x1.png",
    price: "$110",
    link: "/shop/liberty-zip-up",
  },
  {
    id: "liberty-hoodie",
    name: "LIBERTY HOODIE",
    image: "/images/products/liberty hoodies/mauve/Mauve DS 1x1.png",
    price: "$110",
    link: "/shop/liberty-hoodie",
  },
  {
    id: "jozi-rugby-jersey",
    name: "JOZI RUGBY JERSEY",
    image: "/images/products/jozi rugby jersey/Jozi DS 1x1.png",
    price: "$125",
    link: "/shop/jozi-rugby-jersey",
  },
  {
    id: "stamped-waffle-knit",
    name: "STAMPED WAFFLE KNIT",
    image: "/images/products/waffle knit/Stamped Waffle Knit Updated.png",
    price: "$65",
    link: "/shop/stamped-waffle-knit",
  },
  {
    id: "tracksuit",
    name: "RETRO TRACK SUIT",
    image: "/images/products/tracksuits/ELMHURST TARO CUSTARD/TP.png",
    price: "$165",
    link: "/shop/tracksuit",
  },
  {
    id: "gala-tee",
    name: "GALA TEE",
    image: "/images/products/gala-tshirt/broadwaynoir/GN4.png",
    price: "$40",
    link: "/shop/gala-tshirt",
  },
  {
    id: "shirt-combo",
    name: "SHIRT COMBO",
    image: "/images/products/Teebundle/Five T-Shirts.png",
    price: "$106.25",
    link: "/shop/tshirt-bundle",
  },
  {
    id: "fuji-tee",
    name: "FUJI LONG SLEEVE",
    image: "/images/products/fuji-tshirt/Arboretum/F2.png",
    price: "$80",
    link: "/shop/fuji-tshirt",
  },
]

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Carousel scroll handlers
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current || typeof window === "undefined") return

    const container = carouselRef.current
    const currentScroll = container.scrollLeft
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0
    const scrollAmount = viewportWidth

    if (!scrollAmount) return

    const newScroll =
      direction === "left"
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount

    container.scrollTo({ left: newScroll, behavior: "smooth" })
  }

  return (
    <>
      <ProductPageBrandHeader />
      <div className="w-full bg-[#fbf6f0]">
        {/* Hero Video Section - Sized to accommodate carousel */}
        <section className="relative w-full min-h-[80vh] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            poster="/images/home.jpg"
          >
            <source
              src="https://cdn.jsdelivr.net/gh/Shreyasswamy9/NY/Videos/homevideo.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" />
          {/* Marquee Banner Overlay */}
          <div className="absolute top-20 left-0 right-0 z-20 w-full">
            <MarqueeBanner
              items={[
                "☘️ ST. PATRICK'S DAY SALE",
                "50% OFF EVERYTHING GREEN",
              ]}
              backgroundColor="transparent"
              textColor="#6ee86e"
              separator="✦"
              speed={25}
            />
          </div>

          {/* Shop Now Button inside video at bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex justify-center w-full pointer-events-none">
            <a
              href="/shop"
              className="pointer-events-auto text-white underline underline-offset-4 font-black text-lg md:text-xl tracking-wide"
              style={{ fontFamily: 'Avenir Black, Avenir, Helvetica, Arial, sans-serif', letterSpacing: '0.04em' }}
            >
              Shop Now
            </a>
          </div>
        </section>

        {/* New Items Carousel */}
        <section className="w-full py-0">
          {/* Carousel Container with Arrows */}
          <div className="relative w-full flex items-stretch">
            {/* Left Arrow - Mobile Only */}
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              className="absolute left-0 top-0 bottom-14 md:hidden z-10 flex items-center justify-center text-[#181818] -translate-x-10 w-8"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {/* Main Carousel Content */}
            <div className="relative w-full">
              {/* Scrollable Carousel */}
              <div
                ref={carouselRef}
                className="new-items-carousel overflow-x-auto scrollbar-hide md:overflow-visible"
                style={{
                  scrollBehavior: "smooth",
                }}
              >
                <div className="flex border-l border-r border-t border-[#181818] md:border md:rounded-none">
                  {newItems.map((item, index) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="carousel-card flex shrink-0 flex-col items-center justify-center border-l border-[#181818] first:border-l-0 md:border-l md:first:border-l-0 bg-[#f7f2ea]"
                    >
                      <div className="relative w-full aspect-square md:aspect-auto md:h-full flex items-center justify-center bg-[#f7f2ea]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Label Bar */}
              <div className="w-full h-14 bg-[#181818] flex items-center justify-center border-l border-r border-b border-[#181818] md:border">
                <a
                  href="/shop"
                  className="text-white text-sm font-semibold tracking-widest uppercase text-center hover:text-[#ffe066] transition-colors duration-200 cursor-pointer"
                  style={{ fontFamily: 'Avenir Black, Avenir, Helvetica, Arial, sans-serif', letterSpacing: '0.15em', padding: '0.5em 1.5em', borderRadius: '0.5em' }}
                >
                  NEW ITEMS
                </a>
              </div>
            </div>

            {/* Right Arrow - Mobile Only */}
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              className="absolute right-0 top-0 bottom-14 md:hidden z-10 flex items-center justify-center text-[#181818] translate-x-10 w-8"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
        </section>

        {/* Editorial Photos Section */}
        <section className="px-0 md:px-8 py-12 md:py-20">
          <div className="mx-auto w-full max-w-[1600px]">

            <div className="grid grid-cols-1 gap-6 px-0 md:grid-cols-4 md:gap-4">
              {editorialPhotos.map((photo) => (
                <div key={photo.id} className="flex flex-col">
                  {/* Image */}
                  <div className="relative w-full h-[70vh] overflow-hidden bg-[#e8e0d5] mb-3 md:h-auto md:aspect-[4/5] md:rounded-2xl">
                    <Image
                      src={photo.image}
                      alt={photo.location}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* Location Label */}
                  <p className="px-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6f6f] md:px-0">
                    {photo.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scrollbar Hide Styles */}
        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          /* New Items Carousel */
          .new-items-carousel {
            scroll-snap-type: x mandatory;
            scroll-padding: 0;
            display: flex;
          }

          .carousel-card {
            width: calc((100vw - 54px) / 2);
            flex: 0 0 calc((100vw - 54px) / 2);
            scroll-snap-align: start;
            scroll-snap-stop: always;
            height: auto;
            min-height: auto;
          }

          @media (min-width: 768px) {
            .carousel-card {
              flex: 1 1 0%;
              scroll-snap-align: none;
              scroll-snap-stop: unset;
              min-height: 500px;
            }

            .new-items-carousel > div {
              display: flex !important;
              width: 100%;
            }

            .new-items-carousel {
              display: flex;
              scroll-snap-type: none;
              overflow: visible !important;
              width: 100%;
            }

            .carousel-card:nth-child(n+5) {
              display: none;
            }
          }

          @media (min-width: 1024px) {
            .carousel-card {
              flex: 1 1 0%;
            }

            .carousel-card:nth-child(n+5) {
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  )
}
