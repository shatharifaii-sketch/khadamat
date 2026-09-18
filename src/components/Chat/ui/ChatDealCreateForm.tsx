import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useChatDeals } from "@/hooks/useChatDeals";
import { createDealSchema, CreateDealSchemaType } from "@/types/deal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const ChatDealCreateForm = () => {
  const { t } = useTranslation("chat");
  const lang = localStorage.getItem("language") || "en";

  const { user } = useAuth();
  const {
    id: conversationId,
    client_id,
    service_id,
    provider_id,
  } = useParams();

  const { createDeal, isCreatingDealError, isCreatingDeal } = useChatDeals({
    conversationId,
  });

  const createdBy =
    user?.id == client_id
      ? "client"
      : user?.id == provider_id
        ? "provider"
        : "unspecified";

  const form = useForm<CreateDealSchemaType>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      provider_id: provider_id,
      client_id: client_id,
      conversation_id: conversationId,
      service_id: service_id ?? null,
      price: 0,
      created_by: createdBy,
    },
  });

  function onSubmit(values: CreateDealSchemaType) {
    console.log(values);
  }
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

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button className="flex-1 w-full" type="submit">
          {t("create_deal_form.submit_button")}
        </Button>
      </form>
    </>
  );
};

export default ChatDealCreateForm;
