import { X, Download, FileText, Image as ImageIcon, Video, File, Music, Archive, Table, Presentation } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileType } from '@/types/lms';

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileType: FileType;
  fileData?: string;
  videoUrl?: string;
  title?: string;
}

export function getFileIcon(fileType: FileType) {
  const iconMap: Record<FileType, React.ElementType> = {
    pdf: FileText,
    document: FileText,
    image: ImageIcon,
    video: Video,
    spreadsheet: Table,
    presentation: Presentation,
    audio: Music,
    archive: Archive,
    other: File,
  };
  return iconMap[fileType] || File;
}

export function getFileIconColor(fileType: FileType): string {
  const colorMap: Record<FileType, string> = {
    pdf: 'text-red-500',
    document: 'text-blue-500',
    image: 'text-green-500',
    video: 'text-purple-500',
    spreadsheet: 'text-emerald-500',
    presentation: 'text-orange-500',
    audio: 'text-pink-500',
    archive: 'text-amber-500',
    other: 'text-gray-500',
  };
  return colorMap[fileType] || 'text-gray-500';
}

export function FilePreviewModal({
  open,
  onOpenChange,
  fileName,
  fileType,
  fileData,
  videoUrl,
  title,
}: FilePreviewModalProps) {
  const IconComponent = getFileIcon(fileType);

  const handleDownload = () => {
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Simulate download for files without data
      const blob = new Blob([`Conteúdo simulado de ${fileName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  };

  const renderPreview = () => {
    // Video URL (YouTube/Vimeo)
    if (videoUrl) {
      const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);
      const vimeoEmbed = getVimeoEmbedUrl(videoUrl);
      const embedUrl = youtubeEmbed || vimeoEmbed;

      if (embedUrl) {
        return (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Image preview
    if (fileType === 'image' && fileData) {
      return (
        <div className="flex items-center justify-center bg-muted rounded-lg p-4 max-h-[60vh] overflow-auto">
          <img src={fileData} alt={fileName} className="max-w-full max-h-[55vh] object-contain rounded" />
        </div>
      );
    }

    // PDF preview
    if (fileType === 'pdf' && fileData) {
      return (
        <div className="w-full h-[60vh] rounded-lg overflow-hidden">
          <iframe src={fileData} className="w-full h-full" title={fileName} />
        </div>
      );
    }

    // Video file preview
    if (fileType === 'video' && fileData) {
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <video src={fileData} controls className="w-full h-full" />
        </div>
      );
    }

    // Audio preview
    if (fileType === 'audio' && fileData) {
      return (
        <div className="flex flex-col items-center gap-4 p-8 bg-muted rounded-lg">
          <Music className="h-16 w-16 text-pink-500" />
          <audio src={fileData} controls className="w-full max-w-md" />
        </div>
      );
    }

    // No preview available
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 bg-muted rounded-lg">
        <IconComponent className={`h-20 w-20 ${getFileIconColor(fileType)}`} />
        <div className="text-center">
          <p className="font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Pré-visualização não disponível para este formato
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <IconComponent className={`h-5 w-5 ${getFileIconColor(fileType)}`} />
              {title || fileName}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {renderPreview()}
        </div>

        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleDownload} className="gradient-primary">
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
