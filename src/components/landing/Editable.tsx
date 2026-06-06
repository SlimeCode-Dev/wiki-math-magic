import { useRef, useState, ReactNode } from "react";
import { Pencil, Play, ImagePlus, X, Video } from "lucide-react";
import { getYoutubeId } from "@/contexts/SiteContentContext";

/* ---------- Editable text ---------- */
export function EditableText({
  value,
  onChange,
  canEdit,
  as = "span",
  className,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  canEdit: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  multiline?: boolean;
}) {
  const Tag = as as keyof JSX.IntrinsicElements;
  const handleEdit = () => {
    const next = window.prompt(
      multiline ? "Editar texto:" : "Editar:",
      value
    );
    if (next !== null && next.trim() !== "") onChange(next);
  };

  if (!canEdit) return <Tag className={className}>{value}</Tag>;

  return (
    <span className="group/edit relative inline-flex items-start gap-1">
      <Tag className={className}>{value}</Tag>
      <button
        type="button"
        onClick={handleEdit}
        aria-label="Editar texto"
        className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-[#39ff14]/50 bg-black/70 text-[#39ff14] opacity-70 transition-opacity hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

/* ---------- Editable image ---------- */
export function EditableImage({
  src,
  alt,
  onChange,
  canEdit,
  className,
  children,
}: {
  src: string;
  alt: string;
  onChange: (dataUrl: string) => void;
  canEdit: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      window.alert("A imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      {children ?? (
        <img src={src} alt={alt} loading="lazy" className={className} />
      )}
      {canEdit && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-[#39ff14]/60 bg-black/80 px-3 py-1.5 text-xs font-semibold text-[#39ff14] hover:bg-black"
          >
            <ImagePlus className="h-3.5 w-3.5" /> Trocar imagem
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Editable video (YouTube) ---------- */
export function EditableVideo({
  url,
  onChange,
  canEdit,
  className,
}: {
  url: string;
  onChange: (v: string) => void;
  canEdit: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const id = getYoutubeId(url);
  const thumb = id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : undefined;

  const handleEdit = () => {
    const next = window.prompt("Cole o link do vídeo do YouTube:", url);
    if (next !== null && next.trim() !== "") {
      if (!getYoutubeId(next)) {
        window.alert("Link do YouTube inválido.");
        return;
      }
      onChange(next.trim());
      setPlaying(false);
    }
  };

  return (
    <div className={className}>
      <div className="absolute -inset-4 rounded-3xl bg-[#39ff14]/10 blur-2xl" />
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-[#39ff14]/40 bg-black">
        {playing && id ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title="Vídeo de apresentação Slime Code"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => id && setPlaying(true)}
            className="group relative block h-full w-full"
            aria-label="Reproduzir vídeo"
          >
            {thumb ? (
              <img
                src={thumb}
                alt="Apresentação do curso Slime Code"
                className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/40">
                <Video className="h-12 w-12" />
              </div>
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-[#39ff14] text-black shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-transform group-hover:scale-110">
                <Play className="h-9 w-9 translate-x-0.5 fill-black" />
              </span>
            </span>
          </button>
        )}
      </div>

      {playing && (
        <button
          type="button"
          onClick={() => setPlaying(false)}
          className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg border border-white/30 bg-black/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
        >
          <X className="h-3.5 w-3.5" /> Fechar
        </button>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={handleEdit}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-[#39ff14]/60 bg-black/80 px-3 py-1.5 text-xs font-semibold text-[#39ff14] hover:bg-black"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar vídeo
        </button>
      )}
    </div>
  );
}
