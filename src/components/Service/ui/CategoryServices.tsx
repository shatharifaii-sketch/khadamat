import { useCategoryServices } from '@/hooks/useServices'
import React from 'react'
import ServiceCard from './ServiceCard';

interface Props {
    category: string,
    serviceId: string
}

const CategoryServices = ({ category, serviceId }: Props) => {
    const data = useCategoryServices(category, serviceId);

    console.log(data);
    return (
        <div className='space-y-4'>
            <h1 className='text-lg font-bold'>خدمات من نفس القسم</h1>
            {data.length > 0 ? (
                <ul className='h-fit flex gap-5 overflow-auto py-8 px-5'>
                {data?.map((service) => (
                    <li key={service.id}>
                        <ServiceCard service={service} />
                    </li>
                ))}
            </ul>
            ) : (
                <p className='text-muted-foreground'>لا يوجد خدمات اخرى في هذا القسم</p>
            )}
        </div>
    )
}

export default CategoryServices