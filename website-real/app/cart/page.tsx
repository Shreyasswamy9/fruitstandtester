"use client";

import Image from "next/image";
import Link from "next/link";
import ProductPageBrandHeader from "@/components/ProductPageBrandHeader";
import { useCart, type CartItem } from "@/components/CartContext";

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

function getItemIdentifier(item: CartItem) {
	return item.lineId ?? item.productId;
}

export default function CartPage() {
	const { items, removeFromCart, setLineQuantity } = useCart();

	const subtotal = items.reduce(
		(total, item) => total + Number(item.price || 0) * item.quantity,
		0
	);
	const shipping = subtotal >= 120 || subtotal === 0 ? 0 : 8.99;
	const estimatedTotal = subtotal + shipping;

	return (
		<main className="min-h-screen bg-[#fbf6f0] text-[#171717]">
			<ProductPageBrandHeader />

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
				<section className="flex-1 rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8">
					<div className="flex items-end justify-between gap-4 border-b border-black/10 pb-5">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-black/55">
								Shopping Cart
							</p>
							<h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-black sm:text-4xl">
								Your bag
							</h1>
						</div>
						<p className="text-sm text-black/55">
							{items.length} {items.length === 1 ? "item" : "items"}
						</p>
					</div>

					{items.length === 0 ? (
						<div className="flex min-h-80 flex-col items-center justify-center text-center">
							<p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-black/50">
								Cart Empty
							</p>
							<h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-black">
								Nothing here yet.
							</h2>
							<p className="mt-3 max-w-md text-sm leading-6 text-black/60">
								Add products from the shop to start checkout.
							</p>
							<Link
								href="/shop"
								className="mt-6 inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
							>
								Continue shopping
							</Link>
						</div>
					) : (
						<div className="mt-6 space-y-4">
							{items.map((item) => {
								const itemId = getItemIdentifier(item);
								const lineTotal = Number(item.price || 0) * item.quantity;

								return (
									<article
										key={itemId}
										className="grid gap-4 rounded-3xl border border-black/10 bg-[#fcfaf7] p-4 sm:grid-cols-[132px_1fr] sm:p-5"
									>
										<div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#f1eadf]">
											{item.image ? (
												<Image
													src={item.image}
													alt={item.name}
													fill
													sizes="(max-width: 640px) 100vw, 132px"
													className="object-cover"
												/>
											) : (
												<div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.28em] text-black/45">
													{item.name.slice(0, 2)}
												</div>
											)}
										</div>

										<div className="flex flex-col justify-between gap-4">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<h2 className="text-lg font-semibold tracking-[-0.02em] text-black">
														{item.name}
													</h2>
													<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium uppercase tracking-[0.24em] text-black/50">
														{item.size ? <span>Size {item.size}</span> : null}
														{item.color ? <span>{item.color}</span> : null}
													</div>
												</div>
												<p className="text-base font-semibold text-black">
													{currencyFormatter.format(lineTotal)}
												</p>
											</div>

											<div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-4">
												<div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1">
													<button
														type="button"
														onClick={() => setLineQuantity(itemId, item.quantity - 1)}
														className="h-9 w-9 rounded-full text-lg text-black transition hover:bg-black/5"
														aria-label={`Decrease quantity for ${item.name}`}
													>
														-
													</button>
													<span className="min-w-10 text-center text-sm font-semibold text-black">
														{item.quantity}
													</span>
													<button
														type="button"
														onClick={() => setLineQuantity(itemId, item.quantity + 1)}
														className="h-9 w-9 rounded-full text-lg text-black transition hover:bg-black/5"
														aria-label={`Increase quantity for ${item.name}`}
													>
														+
													</button>
												</div>

												<button
													type="button"
													onClick={() => removeFromCart(itemId)}
													className="text-sm font-semibold text-black/55 transition hover:text-black"
												>
													Remove
												</button>
											</div>
										</div>
									</article>
								);
							})}
						</div>
					)}
				</section>

				<aside className="w-full rounded-[28px] border border-black/10 bg-[#171717] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.12)] lg:sticky lg:top-8 lg:max-w-90 lg:self-start">
					<p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/60">
						Order Summary
					</p>
					<div className="mt-6 space-y-4">
						<div className="flex items-center justify-between text-sm text-white/70">
							<span>Subtotal</span>
							<span>{currencyFormatter.format(subtotal)}</span>
						</div>
						<div className="flex items-center justify-between text-sm text-white/70">
							<span>Shipping</span>
							<span>{shipping === 0 ? "Free" : currencyFormatter.format(shipping)}</span>
						</div>
						<div className="border-t border-white/10 pt-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-white/70">Estimated total</span>
								<span className="text-2xl font-semibold tracking-[-0.03em] text-white">
									{currencyFormatter.format(estimatedTotal)}
								</span>
							</div>
							<p className="mt-2 text-xs leading-5 text-white/50">
								Tax is calculated during checkout.
							</p>
						</div>
					</div>

					<Link
						href={items.length === 0 ? "/shop" : "/cart/checkout-redirect"}
						className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#f4eadb] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#efe0ca]"
					>
						{items.length === 0 ? "Browse products" : "Proceed to checkout"}
					</Link>

					<Link
						href="/shop"
						className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
					>
						Continue shopping
					</Link>

					<p className="mt-6 text-xs leading-5 text-white/50">
						Orders over $120 ship free. Secure payment happens on the next step.
					</p>
				</aside>
			</div>
		</main>
	);
}
