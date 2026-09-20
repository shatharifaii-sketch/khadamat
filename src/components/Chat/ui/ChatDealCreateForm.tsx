import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useChatDeals } from "@/hooks/useChatDeals";
import {
  createDealSchema,
  CreateDealSchemaType,
  currencyOpt,
} from "@/types/deal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

interface Props {
  onSuccess: () => void;
}

const ChatDealCreateForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation("chat");
  const lang = localStorage.getItem("language") || "en"; 

  const { user } = useAuth();
  const {
    id: conversationId,
    client_id,
    service_id,
    provider_id,
  } = useParams();

  const {
    createDeal,
    isCreatingDealError,
    isCreatingDeal,
    isCreatingDealSuccess,
  } = useChatDeals({
    conversationId,
  });

  const userId = user?.id;
  
  const role = userId == client_id ? "client" : "provider"

  const form = useForm<CreateDealSchemaType>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      provider_id: provider_id,
      client_id: client_id,
      conversation_id: conversationId,
      service_id: service_id ?? null,
      price: 0,
      currency: "ILS",
    },
  });

  function onSubmit(values: CreateDealSchemaType) {
    createDeal({
      values,
      role
    });
  }

  useEffect(() => {
    if (isCreatingDealSuccess) {
      onSuccess();
    }
  }, [isCreatingDealSuccess, onSuccess]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("create_deal_form.title")}</DialogTitle>
        <DialogDescription>
          {t("create_deal_form.description")}
        </DialogDescription>
      </DialogHeader>

      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("FORM VALIDATION ERRORS:", errors);
        })}
        className="flex flex-col gap-3"
      >
        <div className="flex gap-2 items-end">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-1/2">
                <FieldLabel htmlFor={field.name}>
                  {t("create_deal_form.deal_price")}
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="currency"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-1/4">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ILS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="opacity-70">
                        {t("create_deal_form.select_label")}
                      </SelectLabel>

                      {currencyOpt.map((c, index) => (
                        <SelectItem key={index} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Button
          className="flex-1 w-full"
          type="submit"
          disabled={isCreatingDeal}
        >
          {t("create_deal_form.submit_button")}
        </Button>
        {isCreatingDealError && (
          <p className="text-destructive text-sm opacity-70 text-start px-1">
            {t("create_deal_form.submit_error")}
          </p>
        )}
      </form>
    </>
  );
};

export default ChatDealCreateForm;
