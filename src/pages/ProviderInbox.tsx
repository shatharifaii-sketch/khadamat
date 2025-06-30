
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, User, Loader2, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useProviderConversations } from '@/hooks/useProviderConversations';
import { useAuth } from '@/contexts/AuthContext';
import ChatDialog from '@/components/Chat/ChatDialog';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const ProviderInbox = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { user, loading } = useAuth();
  const { data: conversations = [], isLoading } = useProviderConversations();

  if (loading) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <User size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h2>
                <p className="text-muted-foreground text-large mb-6">
                  يجب تسجيل الدخول لعرض رسائل عملائك
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg">تسجيل الدخول</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg">العودة للرئيسية</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleOpenChat = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowChat(true);
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  // Helper function to safely get client name
  const getClientName = (conversation: typeof conversations[0]) => {
    return conversation.profiles?.full_name || 'عميل';
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/account">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للحساب
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              رسائل العملاء
            </h1>
            <p className="text-muted-foreground">
              جميع الاستفسارات والرسائل من العملاء المهتمين بخدماتك
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <MessageCircle size={64} className="mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold mb-2">لا توجد رسائل</h2>
                <p className="text-muted-foreground mb-6">
                  لم يتواصل معك أي عميل بعد. تأكد من نشر خدماتك لتتلقى استفسارات!
                </p>
              </div>
              <Link to="/post-service">
                <Button>أضف خدمة جديدة</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenChat(conversation.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-right">
                      <CardTitle className="text-lg mb-2">
                        استفسار حول: {conversation.services?.title || 'خدمة محذوفة'}
                      </CardTitle>
                      <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground mb-2">
                        <span>من: {getClientName(conversation)}</span>
                        <User size={14} />
                      </div>
                      <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                        <Clock size={14} />
                      </div>
                    </div>
                    <Badge 
                      variant={conversation.status === 'active' ? 'default' : 'secondary'}
                      className="mr-4"
                    >
                      {conversation.status === 'active' ? 'نشطة' : 'مؤرشفة'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedConv && (
        <ChatDialog
          open={showChat}
          onOpenChange={setShowChat}
          conversationId={selectedConversation}
          serviceName={selectedConv.services?.title || 'خدمة محذوفة'}
          providerName={getClientName(selectedConv)}
        />
      )}
    </div>
  );
};

export default ProviderInbox;
