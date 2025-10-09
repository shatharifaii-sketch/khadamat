import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Menu, LogOut, PlusCircle, Search, Info, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useProfile } from '@/hooks/useProfile';
import LanguageSwitcher from './LanguageSwitcher';
import { Avatar, AvatarImage } from './ui/avatar';
import { GeneratedAvatar } from './GeneratedAvatar';
import { isAdmin } from '@/hooks/useAdminFunctionality';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const { profile } = useProfile();

  // Enable real-time notifications
  const { isConnected } = useRealTimeNotifications();

  const admin = isAdmin() || user?.email === 'shatharifaii@gmail.com';
  const isServiceProvider = profile?.is_service_provider || false;

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
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
    <NavLink to="/account" onClick={mobile ? () => setIsOpen(false) : undefined}>
      <div className="flex items-center gap-2">
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
        <span>حسابي</span>
      </div>
    </NavLink>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">خدمتك</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <NavLink to="/find-service">
              <div className="flex items-center gap-2">
                <Search size={16} />
                البحث عن خدمة
              </div>
            </NavLink>
            <NavLink to="/post-service">
              <div className="flex items-center gap-2">
                <PlusCircle size={16} />
                أضف خدمة
              </div>
            </NavLink>
            <NavLink to="/about">
              <div className="flex items-center gap-2">
                <Info size={16} />
                من نحن
              </div>
            </NavLink>
            {admin && (
              <NavLink to="/admin">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  لوحة الإدارة
                </div>
              </NavLink>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-4 space-x-reverse">

                <AccountButton />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      <LogOut size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تسجيل الخروج</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Link to="/auth">
                <Button>تسجيل الدخول</Button>
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
                      البحث عن خدمة
                    </div>
                  </NavLink>
                  <NavLink to="/post-service" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-2 text-lg">
                      <PlusCircle size={20} />
                      أضف خدمة
                    </div>
                  </NavLink>
                  <NavLink to="/about" onClick={() => setIsOpen(false)}>
                    <div className="flex items-center gap-2 text-lg">
                      <Info size={20} />
                      من نحن
                    </div>
                  </NavLink>
                  {admin && (
                    <NavLink to="/admin" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-2 text-lg">
                        <Shield size={20} />
                        لوحة الإدارة
                      </div>
                    </NavLink>
                  )}

                  <div className="border-t pt-4">
                    {user ? (
                      <div className="space-y-4">

                        <AccountButton mobile />
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
                          <LogOut size={20} className="ml-2" />
                          تسجيل الخروج
                        </Button>
                      </div>
                    ) : (
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">تسجيل الدخول</Button>
                      </Link>
                    )}
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
