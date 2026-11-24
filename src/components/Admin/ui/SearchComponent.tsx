import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
    page: "users" | "services" | "pending-services" | "coupons";
    search: string;
    setSearch: Dispatch<SetStateAction<string>>
}

const SearchComponent = ({ page, search, setSearch }: Props) => {
    const lang = localStorage.getItem("language") || "en"

  return (
    <div>
        <Input 
            type="text"
            id="search"
            name="search"
            placeholder={lang === "en" ? "Search" : "بحث"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
    </div>
  )
}

export default SearchComponent