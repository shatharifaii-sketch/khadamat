import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ChatDeal } from "@/hooks/useChatDeals";
import { cn } from "@/lib/utils";
import { Dot, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  deal: ChatDeal;

  deleteDeal: (dealId: string) => void;
  isDeletingDealSuccess: boolean;

  acceptDeal: ({
    dealId,
    role,
    isAccepted,
  }: {
    dealId: string;
    role: string;
    isAccepted: boolean;
  }) => void;
  isAcceptingDeal: boolean;
  isAcceptingDealSuccess: boolean;

  rejectDeal: ({
    dealId,
    role,
    isRejected,
  }: {
    dealId: string;
    role: string;
    isRejected: boolean;
  }) => void;
  isRejectingDeal: boolean;
  isRejectingDealSuccess: boolean;
}

const DealCard = ({
  deal,

  deleteDeal,
  isDeletingDealSuccess,

  acceptDeal,
  isAcceptingDeal,
  isAcceptingDealSuccess,

  rejectDeal,
  isRejectingDeal,
  isRejectingDealSuccess,
}: Props) => {
  const { t } = useTranslation("chat");
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<boolean>(false);

  const userRole =
    user?.id == deal.client_id
      ? "client"
      : user?.id == deal.provider_id
        ? "provider"
        : "";

  const offerer =
    user?.id == deal.created_by
      ? userRole == "client"
        ? deal.client.full_name
        : deal.provider.full_name
      : userRole == "client"
        ? deal.provider.full_name
        : deal.client.full_name;

  const userAccepted =
    userRole == "client" ? deal.client_accepted : deal.provider_accepted;

  const userRejected =
    userRole == "client" ? deal.client_rejected : deal.provider_rejected;

  const handleDelete = () => {
    deleteDeal(deal.id);
  };

  const handleAccept = () => {
    if (userAccepted) return;
    acceptDeal({
      dealId: deal.id,
      role: userRole,
      isAccepted: userAccepted,
    });
  };

  const handleReject = () => {
    if (userRejected) return;
    rejectDeal({
      dealId: deal.id,
      role: userRole,
      isRejected: userRejected,
    });
  };

  useEffect(() => {
    if (isDeletingDealSuccess) {
      setDeleting(false);
    }
  }, [isDeletingDealSuccess, setDeleting]);

  return (
    <Card className="min-h-40 flex flex-col justify-between">
      <CardHeader className="px-4 pt-3 flex flex-row justify-between items-start">
        <div className="w-full">
          <CardTitle className="flex justify-between items-center">
            <span>
              {deal.price} <span className="text-sm">{deal.currency}</span>
            </span>

            {userRole == "client" && deal.provider_rejected && (
              <Badge variant="destructive">{t("deals.deal.rejected")}</Badge>
            )}
            {userRole == "client" && deal.provider_accepted && (
              <Badge variant="default">{t("deals.deal.accepted")}</Badge>
            )}

            {userRole == "provider" && deal.client_accepted && (
              <Badge variant="default">{t("deals.deal.accepted")}</Badge>
            )}
            {userRole == "provider" && deal.client_rejected && (
              <Badge variant="destructive">{t("deals.deal.rejected")}</Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground pl-1">{offerer}</p>

          {deal.service && (
            <p className="text-xs flex items-center">
              {deal.service.title}
              <Dot />
              {deal.service.is_online
                ? t("deals.deal.online")
                : deal.service.location}
              <Dot />
              {deal.service.price_range}
            </p>
          )}
        </div>

        <AlertDialog open={deleting} onOpenChange={setDeleting}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-fit p-1 h-fit">
              <X />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("deals.deal.delete.title")}
              </AlertDialogTitle>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2">
              <Button
                variant="destructive"
                disabled={user?.id == deal.client_id}
                onClick={handleDelete}
                className="flex-1"
              >
                {t("deals.deal.delete.delete")}
              </Button>
              <Button variant="outline" onClick={() => setDeleting(false)}>
                {t("deals.deal.delete.cancel")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardFooter className="px-4 pb-4 grid grid-cols-2 gap-1">
        <Button
          variant="secondary"
          className={cn(
            "rounded-sm",
            userAccepted ? "border border-primary" : "",
          )}
          onClick={handleAccept}
          disabled={isAcceptingDeal}
        >
          <ThumbsUp
            className={cn("text-primary", userAccepted ? "fill-primary" : "")}
          />
        </Button>

        <Button
          variant="secondary"
          className={cn(
            "rounded-sm",
            userRejected ? "border border-destructive" : "",
          )}
          onClick={handleReject}
          disabled={isRejectingDeal}
        >
          <ThumbsDown
            className={cn(
              "text-destructive",
              userRejected ? "fill-destructive" : "",
            )}
          />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DealCard;
