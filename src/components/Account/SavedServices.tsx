import { useProfile } from '@/hooks/useProfile';
import React from 'react'
import SavedServiceComponent from './SavedServiceComponent';

interface Props {
    userId: string;
}

const SavedServices = ({
    userId
}: Props) => {
    const {
        savedServices,
        removeSavedService
    } = useProfile();

  return (
    <div className='bg-muted p-3 rounded-lg grid grid-cols-1 md:grid-cols-2'>
        {
            savedServices && savedServices.length > 0 ? 
            savedServices.map((ss) => (
                <SavedServiceComponent 
                    key={ss.id} 
                    service={ss.service}
                    remSavedService={removeSavedService}
                />
            ))
            : (
                <div></div>
            )
        }
    </div>
  )
}

export default SavedServices