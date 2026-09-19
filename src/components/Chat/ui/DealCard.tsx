import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
}

const DealCard = ({ deal, deleteDeal, isDeletingDealSuccess }: Props) => {
  const { t } = useTranslation("chat");
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<boolean>(false);

  const offerer =
    user?.id == deal.created_by
      ? user?.id == deal.client_id
        ? deal.client.full_name
        : deal.provider.full_name
      : user?.id == deal.client_id
        ? deal.provider.full_name
        : deal.client.full_name;

  const acceptFilled =
    user?.id == deal.client_id ? deal.client_accepted : deal.provider_accepted;

  const rejectFilled =
    user?.id == deal.client_id ? deal.client_rejected : deal.client_rejected;

  const handleDelete = () => {
    deleteDeal(deal.id);
  };

  useEffect(() => {
    if (isDeletingDealSuccess) {
      setDeleting(false);
    }
  }, [isDeletingDealSuccess, setDeleting])

  return (
    <Card className="min-h-40 flex flex-col justify-between">
      <CardHeader className="px-4 pt-3 flex flex-row justify-between items-start">
        <div>
          <CardTitle>
            <span>
              {deal.price} <span className="text-sm">{deal.currency}</span>
            </span>
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
              <Button variant="destructive" disabled={user?.id == deal.client_id} onClick={handleDelete} className="flex-1">
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
            acceptFilled ? "border border-primary" : "",
          )}
        >
          <ThumbsUp
            className={cn("text-primary", acceptFilled ? "fill-primary" : "")}
          />
        </Button>

        <Button
          variant="secondary"
          className={cn(
            "rounded-sm",
            rejectFilled ? "border border-destructive" : "",
          )}
        >
          <ThumbsDown
            className={cn(
              "text-destructive",
              rejectFilled ? "fill-destructive" : "",
            )}
          />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DealCard;
