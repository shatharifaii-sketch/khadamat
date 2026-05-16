import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Menu, LogOut, PlusCircle, Search, Info, Shield, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useProfile } from '@/hooks/useProfile';
import LanguageSwitcher from './LanguageSwitcher';
import { Avatar, AvatarImage } from './ui/avatar';
import { GeneratedAvatar } from './GeneratedAvatar';
import { useIsAdmin } from '@/hooks/useAdminFunctionality';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation("navbar");
  const lang = localStorage.getItem("language") || "en";
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { unreadCount } = useChat();

  const { profile } = useProfile();

  // Enable real-time notifications
  const { isConnected } = useRealTimeNotifications();

  const admin = useIsAdmin();
  const isServiceProvider = profile?.is_service_provider || false;

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut().then(() => navigate('/', { replace: true }));
    setIsOpen(false);
  };

  const NavLink = ({ to, children, className = "", onClick }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary ${isActive(to) ? 'text-primary' : 'text-muted-foreground'
        } ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );


  const AccountButton = ({ mobile = false }: { mobile?: boolean }) => (
    <NavLink to="/account" onClick={mobile ? () => setIsOpen(false) : undefined} className='flex items-center gap-4 justify-start'>
      <div className="flex items-center gap-2" dir={lang === "ar" ? "rtl" : "ltr"}>
        {
          profile?.profile_image_url ? (
            <Avatar className='size-7'>
              <AvatarImage
                src={profile?.profile_image_url}
              />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={profile?.full_name}
              variant="initials"
              className="size-7"
            />
          )
        }
        <span>{t("account")}</span>
      </div>
    </NavLink>
  );

  const ConvosButton = ({ mobile = false }: { mobile?: boolean }) => (
    <NavLink to="/convos" onClick={mobile ? () => setIsOpen(false) : undefined} className={cn('flex items-center gap-4 justify-start', { 'text-primary': location.pathname === '/convos' || location.pathname.startsWith('/chat') })}>
      <div className="flex items-center gap-2 relative">
        <MessageCircle size={20} />
        {unreadCount > 0 && (
          <p className="absolute -top-2 -right-2 text-muted bg-red-500 rounded-full text-xs flex items-center justify-center size-5">{unreadCount}</p>
        )}
        {mobile && <span>{t("conversations")}</span>}
      </div>
    </NavLink>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/application_logo_cut.png" className='h-8' alt="cut logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5" dir={lang === "ar" ? "rtl" : "ltr"}>
            <NavLink to="/find-service">
              <div className="flex items-center gap-2">
                <Search size={16} />
                {t("find_service")}
              </div>
            </NavLink>
            <NavLink to="/post-service">
              <div className="flex items-center gap-2">
                <PlusCircle size={16} />
                {t("add_service")}
              </div>
            </NavLink>
            <NavLink to="/about">
              <div className="flex items-center gap-2">
                <Info size={16} />
                {t("about")}
              </div>
            </NavLink>
            {admin && (
              <NavLink to="/admin">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  {t("admin_panel")}
                </div>
              </NavLink>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <AccountButton />
                <ConvosButton />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("logout")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Link to="/auth">
                <Button>{t("login")}</Button>
              </Link>
            )}

            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLink to="/find-service" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-2 text-lg">
                      <Search size={20} />
                      {t("find_service")}
                    </div>
                  </NavLink>
                  <NavLink to="/post-service" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-2 text-lg">
                      <PlusCircle size={20} />
                      {t("add_service")}
                    </div>
                  </NavLink>
                  <NavLink to="/about" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-2 text-lg">
                      <Info size={20} />
                      {t("about")}
                    </div>
                  </NavLink>
                  {admin && (
                    <NavLink to="/admin" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-2 text-lg">
                        <Shield size={20} />
                        {t("admin_panel")}
                      </div>
                    </NavLink>
                  )}

                  <div className="border-t pt-4 flex flex-col gap-4 items-start">
                    {user ? (
                      <div className="space-y-4">

                        <AccountButton mobile />
                        <ConvosButton mobile />
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
                          <LogOut size={20} className="ml-2" />
                          {t("logout")}
                        </Button>
                      </div>
                    ) : (
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">{t("login")}</Button>
                      </Link>
                    )}
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
