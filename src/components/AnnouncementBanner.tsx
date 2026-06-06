import { useState } from 'react';
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLMS } from '@/contexts/LMSContext';
import { Button } from '@/components/ui/button';

export function AnnouncementBanner() {
  const { announcements, currentUser, getUserById, turmas } = useLMS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (!currentUser) return null;

  // Filter announcements for this student's turma or general announcements
  const relevantAnnouncements = announcements.filter(a => {
    if (dismissed.includes(a.id)) return false;
    if (!a.turmaId) return true; // General announcement
    return a.turmaId === currentUser.turmaId;
  });

  if (relevantAnnouncements.length === 0) return null;

  const currentAnnouncement = relevantAnnouncements[currentIndex];
  const author = getUserById(currentAnnouncement.authorId);
  const turma = currentAnnouncement.turmaId 
    ? turmas.find(t => t.id === currentAnnouncement.turmaId)
    : null;

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % relevantAnnouncements.length);
  };

  const goPrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? relevantAnnouncements.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{currentAnnouncement.title}</h3>
            {turma && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {turma.name}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{currentAnnouncement.content}</p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            {author?.name} • {new Date(currentAnnouncement.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {relevantAnnouncements.length > 1 && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                {currentIndex + 1}/{relevantAnnouncements.length}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setDismissed(prev => [...prev, currentAnnouncement.id]);
              if (currentIndex >= relevantAnnouncements.length - 1) {
                setCurrentIndex(0);
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}