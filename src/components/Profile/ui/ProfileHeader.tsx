import { GeneratedAvatar } from "@/components/GeneratedAvatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface Props {
    image: string;
    name: string;
    phone: string;
    email: string;
}

const ProfileHeader = ({
    image,
    name,
    phone,
    email
}: Props) => {
    console.log(image, name, phone)
    return (
        <div>
            <div className='flex flex-col items-center justify-center w-3/4 mx-auto'>
                {image ? (
                    <Avatar>
                        <AvatarImage
                            src={image}
                        />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                        seed={name}
                        variant="initials"
                        className="size-32"
                    />
                )}
                <div className="flex flex-col items-center gap-2 mb-4">
                    <h2 className="text-3xl">{name}</h2>
                    <p className="text-muted-foreground">{phone || '--'}</p>
                    <p className="text-muted-foreground text-lg">{email}</p>
                </div>
            </div>
        </div>
    )
}

export default ProfileHeader