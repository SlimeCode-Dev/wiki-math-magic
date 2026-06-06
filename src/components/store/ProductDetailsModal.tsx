import { X, ShoppingCart, MessageCircle, Check, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Product, formatPrice, PLACEHOLDER_IMAGE } from "@/contexts/StoreContext";

export default function ProductDetailsModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      setSize(product.sizes?.[0] ?? null);
      setColor(product.colors?.[0]?.name ?? null);
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [product]);

  if (!product) return null;

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const selection = [
    size ? `Tamanho: ${size}` : null,
    color ? `Cor: ${color}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const whatsappHref =
    product.whatsappLink ||
    `https://wa.me/5571981971680?text=${encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name} (${formatPrice(
        product.price
      )})${selection ? ` — ${selection}` : ""}`
    )}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="slime-card relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#3ddc84]/40 bg-black/70 text-white/80 transition-colors hover:text-[#3ddc84]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#1a1a1a] md:rounded-l-3xl">
            {discount > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-[#ff5722] px-3 py-1 text-xs font-bold text-white shadow-[0_0_18px_rgba(255,87,34,0.5)]">
                -{discount}%
              </span>
            )}
            <img
              src={product.image || PLACEHOLDER_IMAGE}
              alt={product.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col p-6 md:py-8 md:pr-8">
            <span className="mb-3 inline-flex w-fit rounded-full border border-[#3ddc84]/40 px-3 py-1 text-[11px] font-semibold slime-neon">
              {product.category}
            </span>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              {product.name}
            </h2>

            <div className="mt-3 flex items-end gap-3">
              <p className="text-3xl font-extrabold slime-neon">
                {formatPrice(product.price)}
              </p>
              {product.oldPrice && product.oldPrice > product.price && (
                <p className="mb-1 text-base text-white/40 line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
            </div>

            {typeof product.stock === "number" && (
              <p
                className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
                  product.stock > 0 ? "slime-neon" : "text-red-400"
                }`}
              >
                <Package className="h-4 w-4" />
                {product.stock > 0
                  ? `${product.stock} em estoque`
                  : "Esgotado"}
              </p>
            )}

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {product.description}
            </p>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-1.5 text-xs text-white/80"
                  >
                    <Check className="h-3.5 w-3.5 flex-shrink-0 slime-neon" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold text-white/60">
                  Tamanho
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[44px] rounded-lg border px-3 py-2 text-sm font-bold transition-all ${
                        size === s
                          ? "border-[#3ddc84] bg-[#3ddc84] text-black shadow-[0_0_14px_rgba(61,220,132,0.4)]"
                          : "border-white/20 text-white/70 hover:border-[#3ddc84] hover:text-[#3ddc84]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold text-white/60">
                  Cor: <span className="text-white/80">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      title={c.name}
                      aria-label={c.name}
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-all ${
                        color === c.name
                          ? "border-[#3ddc84] shadow-[0_0_14px_rgba(61,220,132,0.5)]"
                          : "border-white/20 hover:border-white/50"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {color === c.name && (
                        <Check
                          className="h-4 w-4"
                          style={{
                            color:
                              c.hex.toLowerCase() === "#f5f5f5" ||
                              c.hex.toLowerCase() === "#39ff14"
                                ? "#0a0a0a"
                                : "#39ff14",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase area */}
            <div className="mt-7 space-y-3">
              <a
                href={product.shopeeLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5722] px-6 py-3.5 font-bold text-white transition-all hover:shadow-[0_0_22px_rgba(255,87,34,0.5)]"
              >
                <ShoppingCart className="h-5 w-5" /> Comprar Online (Shopee)
              </a>
              <p className="text-xs text-white/40">
                Para sua segurança, ao clicar acima você será redirecionado para
                a nossa loja oficial na plataforma Shopee para finalizar o
                pagamento e envio.
              </p>

              <div className="flex items-center gap-3 py-2">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-semibold text-white/50">OU</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-black transition-all hover:shadow-[0_0_22px_rgba(37,211,102,0.5)]"
              >
                <MessageCircle className="h-5 w-5" /> Comprar e Retirar (WhatsApp)
              </a>
              <p className="text-xs text-white/40">
                Fale com nossa equipe para negociar e retirar o produto
                presencialmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
