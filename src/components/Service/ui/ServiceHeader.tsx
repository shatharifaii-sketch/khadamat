import { categories } from '@/components/FindService/ServiceCategories';
import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

  const categoryLabel = categories.find(cat => cat.value === category)?.label || category;

  return (
    <div className='flex items-center md:justify-between flex-col-reverse md:flex-row'>
      <div>
        <NavLink
          to={`/profile/${publisherId}`}
          className='flex items-center justify-end gap-2 hover:text-primary transition-colors'>
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
          <h2>{publisherName}</h2>
        </NavLink>
      </div>
      <div className=''>
        <div className='flex justify-start gap-2'>
          <Badge variant="secondary" className="text-sm font-medium">
            {categoryLabel}
          </Badge>
          <h1 className='md:text-4xl text-wrap text-2xl'>{title}</h1>
        </div>
        <p className='text-end text-muted-foreground text-sm mt-3'>{updatedAt.split('T')[0]}</p>
      </div>
    </div>
  )
}

export default ServiceHeader