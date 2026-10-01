import { Conversation } from "@/hooks/useConversations";
import { useServiceImages } from "@/hooks/useServices";
import React, { Suspense, useEffect, useState } from "react";
import ServiceImages from "../Service/ui/ServiceImages";
import ChatServiceData from "./ui/ChatServiceData";
import ChatDeals from "./ui/ChatDeals";
import ErrorBoundary from "../ErrorBoundary";
import ChatDealsLoader from "./ui/ChatDealsLoader";
import { CloudAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatServiceProps {
  id: string;
  title: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  service?: ChatServiceProps;
  conversationId: string;
  children: React.ReactNode;
  setAttachment: React.Dispatch<React.SetStateAction<string | null>>;
}

// TODO: Create a drawer for deals on mobile!!!!!!

const ChatLayout = ({
  service,
  conversationId,
  children,
  setAttachment,
}: Props) => {
  const [images, setImages] = useState([]);
  const serviceImages = useServiceImages(service?.id);

  useEffect(() => {
    if (serviceImages) {
      setImages(serviceImages);
    }
  }, [serviceImages]);

  return (
    <div className="grid grid-cols-1 gap-5 mx-auto">
      <div className="flex gap-5 justify-center items-center lg:items-start flex-col lg:flex-row">
        {service && (
          <div className="w-full min-w-[200px]">
            <ChatServiceData
              service={service}
              images={images}
              setAttachment={setAttachment}
            />
          </div>
        )}
        <div className="md:min-w-[500px] lg:min-w-[800px] w-full">
          {children}
        </div>
      </div>

      <Suspense fallback={<ChatDealsLoader />}>
        <ErrorBoundary
          fallback={
            <div className="text-center">
              <CloudAlert />
            </div>
          }
        >
          <ChatDeals conversationId={conversationId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default ChatLayout;
