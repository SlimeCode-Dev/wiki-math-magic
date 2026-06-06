import { useState } from 'react';
import { FileText, Video, ExternalLink, Download, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLMS } from '@/contexts/LMSContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FilePreviewModal, getFileIcon, getFileIconColor } from '@/components/FilePreviewModal';
import { Material, getFileTypeFromName } from '@/types/lms';

export default function AlunoMateriais() {
  const { currentUser, getMaterialsByTurma, getTurmaById } = useLMS();
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  if (!currentUser || !currentUser.turmaId) return null;

  const turma = getTurmaById(currentUser.turmaId);
  const materials = getMaterialsByTurma(currentUser.turmaId);

  const pdfMaterials = materials.filter(m => m.type === 'pdf' || m.type === 'file');
  const videoMaterials = materials.filter(m => m.type === 'video');

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const handleDownload = (material: Material) => {
    if (material.fileData) {
      const link = document.createElement('a');
      link.href = material.fileData;
      link.download = material.fileName || material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const blob = new Blob([`Conteúdo simulado de ${material.fileName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName || material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <MainLayout title="Materiais da Turma">
      <div className="space-y-6">
        {turma && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm text-muted-foreground">
              Materiais disponíveis para <span className="font-medium text-foreground">{turma.name}</span>
            </p>
          </div>
        )}

        <Tabs defaultValue="pdfs" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="pdfs" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Materiais ({pdfMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex-1">
              <Video className="mr-2 h-4 w-4" />
              Vídeos ({videoMaterials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdfs" className="mt-6">
            {pdfMaterials.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pdfMaterials.map((material) => {
                  const fileType = material.fileType || getFileTypeFromName(material.fileName || '');
                  const FileIcon = getFileIcon(fileType);
                  
                  return (
                    <div
                      key={material.id}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-elevated"
                    >
                      <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-muted`}>
                        <FileIcon className={`h-6 w-6 sm:h-7 sm:w-7 ${getFileIconColor(fileType)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{material.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{material.fileName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(material.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewMaterial(material)}
                          className="h-9 w-9 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(material)}
                          className="h-9 w-9 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum material disponível</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aguarde o professor adicionar materiais.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {videoMaterials.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videoMaterials.map((video) => {
                  const thumbnail = video.videoUrl ? getYouTubeThumbnail(video.videoUrl) : null;
                  
                  return (
                    <a
                      key={video.id}
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-elevated"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:scale-110">
                            <ExternalLink className="h-6 w-6" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Postado em {new Date(video.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border">
                <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum vídeo disponível</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aguarde o professor adicionar vídeo-aulas.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <FilePreviewModal
          open={!!previewMaterial}
          onOpenChange={(open) => !open && setPreviewMaterial(null)}
          fileName={previewMaterial.fileName || previewMaterial.title}
          fileType={previewMaterial.fileType || getFileTypeFromName(previewMaterial.fileName || '')}
          fileData={previewMaterial.fileData}
          videoUrl={previewMaterial.videoUrl}
          title={previewMaterial.title}
        />
      )}
    </MainLayout>
  );
}
