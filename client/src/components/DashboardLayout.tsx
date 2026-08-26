import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/useMobile";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { startGoogleLogin, startFacebookLogin } from "@/const";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { FacebookLoginButton } from "./FacebookLoginButton";
import { Button } from "./ui/button";
import {
  BarChart3,
  BriefcaseBusiness,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mountain,
  PanelLeft,
  Settings2,
  ArrowUpRight,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "ภาพรวม", path: "/admin" },
  { icon: Inbox, label: "Lead จากเว็บไซต์", path: "/admin?tab=leads" },
  { icon: BriefcaseBusiness, label: "โปรเจกต์", path: "/admin?tab=projects" },
  {
    icon: LayoutDashboard,
    label: "จัดการคอนเทนต์",
    path: "/admin?tab=content",
  },
  { icon: BarChart3, label: "สถิติการใช้งาน", path: "/admin/analytics" },
  { icon: Settings2, label: "ตั้งค่าสิทธิ์ Admin", path: "/admin/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { loading, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item =>
    location.startsWith(item.path.split("?")[0])
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="admin-auth-gate">
        <div className="admin-auth-orbit admin-auth-orbit-one" />
        <div className="admin-auth-orbit admin-auth-orbit-two" />
        <div className="admin-auth-card">
          <div className="admin-auth-kicker"><Mountain size={14} /> MHS DEV / PRIVATE WORKSPACE</div>
          <div className="admin-auth-mark"><Mountain size={22} /></div>
          <span className="admin-auth-code">ACCESS CHECK / 01</span>
          <h1>เข้าสู่ระบบเพื่อ<br /><em>ทำงานต่อ</em></h1>
          <p>พื้นที่หลังบ้านสำหรับจัดการ Lead, โปรเจกต์, คอนเทนต์ และระบบงานของสามหมอกโค้ดดิ้ง</p>
          <div className="admin-auth-actions">
            <Button onClick={() => startGoogleLogin()} size="lg" className="w-full h-11 shadow-sm hover:shadow-md transition-all cursor-pointer font-medium">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4]">G</span>
              Continue with Google
            </Button>
            <FacebookLoginButton onClick={() => startFacebookLogin()} label="Continue with Facebook" />
          </div>
          <div className="admin-auth-footer">
            <button onClick={() => setLocation("/")}>กลับหน้าเว็บหลัก</button>
            <span>•</span>
            <button onClick={() => { window.location.href = "/tool/"; }}>เปิด Tool</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="admin-brand-mark"><Mountain size={16} /></span>
                  <div className="min-w-0">
                    <span className="font-semibold tracking-tight truncate block">MHS DEV</span>
                    <small className="admin-brand-subtitle">BACK OFFICE</small>
                  </div>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        <div className="admin-contextbar">
          <div className="admin-contextbar-label"><span className="admin-contextbar-dot" /> <span>PRIVATE WORKSPACE</span><b>/</b><span>MHS DEV BACK OFFICE</span></div>
          <div className="admin-contextbar-links">
            <button onClick={() => setLocation("/")}>Public site <ArrowUpRight size={13} /></button>
            <button onClick={() => { window.location.href = "/tool/"; }}>Tools <ArrowUpRight size={13} /></button>
          </div>
        </div>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
