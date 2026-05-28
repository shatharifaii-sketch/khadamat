import { categories } from '@/components/FindService/ServiceCategories';
import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

interface Props {
  publisherId: string;
  title: string;
  category: string;
  publisherName?: string;
  publisherImage?: string;
  updatedAt: string;
}

const ServiceHeader = ({
  title,
  category,
  publisherName,
  publisherImage,
  updatedAt,
  publisherId
}: Props) => {
  const { user } = useAuth();
  const { t } = useTranslation("services");

  const categoryLabel = categories.find(cat => cat.value === category)?.label || category;

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-3'>
        <h1 className='md:text-4xl text-wrap text-2xl'>{title}</h1>
        <div className='flex items-center justify-between'>
          <Badge variant="secondary" className="text-sm font-medium text-center px-3 py-1 w-fit">
            {t(categoryLabel)}
          </Badge>
          <p className='text-start md:text-end text-muted-foreground text-sm px-2'>{updatedAt.split('T')[0]}</p>
        </div>
      </div>
      <NavLink
        to={user?.id === publisherId ? '/account' : `/profile/${publisherId}`}
        className='flex items-center justify-start gap-2 hover:text-primary transition-colors w-fit'>
        {publisherImage ? (
          <Avatar className='size-7'>
            <AvatarImage
              src={publisherImage}
            />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={publisherName}
            variant="initials"
            className="size-7"
          />
        )}
        <h2 className='text-sm md:text-lg font-semibold'>{publisherName}</h2>
      </NavLink>
    </div>
  )
}

export default ServiceHeader