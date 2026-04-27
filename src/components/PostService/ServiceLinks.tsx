import { useState } from "react"
import { Label } from "../ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { platforms } from "@/lib/utils";

export interface ServiceLink {
    type: string;
    url: string;
}

interface Props {
    socialLinks?: ServiceLink[];
    onChange: (value: ServiceLink[]) => void;
}

const ServiceLinks = ({
    socialLinks = [],
    onChange
}: Props) => {
    const addLink = () => {
        console.log(socialLinks);
        onChange([...socialLinks, { type: "", url: "" }]);
    };

    const removeLink = (index: number) => {
        onChange(socialLinks.filter((_, i) => i !== index));
    }

    const updateLink = (
        index: number,
        field: "type" | "url",
        value: string
    ) => {
        const updated = [...socialLinks];
        updated[index][field] = value;
        onChange(updated);
    }

    return (
        <div className="flex flex-col gap-4">
            <Label>مواقع التواصل</Label>

            {socialLinks.map((link, index) => (
                <div
                    key={index}
                    className="grid grid-cols-12 gap-2"
                >
                    <Select
                        value={link.type}
                        onValueChange={(value) => updateLink(index, "type", value)}
                        dir="rtl"
                    >
                        <SelectTrigger className="col-span-4">
                            <SelectValue placeholder="نوع الرابط" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel className="opacity-70">موقع التواصل</SelectLabel>
                                {platforms.map((platform) => {
                                    const Icon = platform.icon;

                                    return (
                                        <SelectItem
                                            key={platform.value}
                                            value={platform.value}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon size={20} />
                                                <span>{platform.label}</span>
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Input
                        dir="ltr"
                        className="col-span-7"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink(index, "url", e.target.value)}
                    />

                    <Button
                        type="button"
                        variant="destructive"
                        className="col-span-1"
                        onClick={() => removeLink(index)}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ))}

            <Button type="button" onClick={addLink} variant="outline">
                إضافة رابط
            </Button>
        </div>
    )
}

export default ServiceLinks;