import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { OnlineFriends } from "./OnlineFriends";

interface MainLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function MainLayout({
  children,
  showRightSidebar = true,
}: MainLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <Header />
        
        <div className="flex flex-1">
          {/* Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>

          {/* Right sidebar (optional) */}
          {showRightSidebar && (
            <aside className="hidden w-80 border-l p-4 lg:block">
              <OnlineFriends />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}