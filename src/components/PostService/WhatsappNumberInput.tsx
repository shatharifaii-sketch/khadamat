import { FaWhatsapp } from "react-icons/fa6"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

const countries = [
  { code: "970", label: "PS +970" },
  { code: "966", label: "SA +966" },
  { code: "20", label: "EG +20" },
  { code: "971", label: "AE +971" },
  { code: "963", label: "SY +963" },
  { code: "962", label: "JO +962" },
  { code: "1", label: "US +1" },
];

interface Props {
  whatsappNumber: {
    countryCode: string;
    number: string;
  };
  onChange: (event: { countryCode: string; number: string; }) => void;
}

const WhatsappNumberInput = ({
  whatsappNumber,
  onChange
}: Props) => {
  const hanldePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");

    onChange({
      ...whatsappNumber,
      number: digits
    })
  }

  const handleCountryChange = (code: string) => {
    onChange({
      ...whatsappNumber,
      countryCode: code,
    });
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="text-md">رقم الواتساب</Label>
        <p className="text-xs text-muted-foreground">
          رقم الواتساب يسهل عليك التواصل مع الزبائن!
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-[#25D366] py-2 px-4 rounded-lg">
          <FaWhatsapp className="text-white" size={30} />
        </div>

        <Select
          value={whatsappNumber.countryCode}
          onValueChange={(e) => handleCountryChange(e)}
          dir="rtl"
        >
          <SelectTrigger className="">
            <SelectValue placeholder="رقم البلد" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {countries.map((c) =>  (
                  <SelectItem
                    key={c.code} value={c.code}
                  >
                    <div className="flex items-center gap-2">
                      {c.label}
                    </div>
                  </SelectItem>
                )
            )}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="tel"
          value={whatsappNumber.number}
          onChange={(e) => hanldePhoneChange(e.target.value)}
          placeholder="599123456"
          dir="ltr"
        />
      </div>
    </div>
  )
}

export default WhatsappNumberInput