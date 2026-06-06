import { ReactNode } from 'react';
import { AppSidebar, MobileHeader } from './AppSidebar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <main className="min-h-screen pt-14 md:pt-0 md:ml-64">
        {title && (
          <header className="sticky top-14 md:top-0 z-30 flex h-14 md:h-16 items-center border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-8">
            <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
          </header>
        )}
        <div className="p-4 md:p-8 animate-fade-in w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
