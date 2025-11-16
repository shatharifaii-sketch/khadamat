import React from 'react'
import { DrawerDescription, DrawerHeader, DrawerTitle } from '../ui/drawer'

const PaymentModal = () => {
  return (
    <>
        <DrawerHeader className='flex items-center justify-between'>
            <DrawerTitle className='text-2xl text-start'>
              إدفع مقابل نشر الخدمة
            </DrawerTitle>
          </DrawerHeader>
          <DrawerDescription className='flex flex-col gap-4 px-5 overflow-y-auto'>
            <div>
              <p>لقد وصلت للحد الاقصى من الخدمات المسموحة في إشتراكك, يمكنك الآن الدفع مقابل نشر خدمة اضافية</p>
            </div>
            <div>
                PAY FOR EXTRA SERVICE
            </div>
          </DrawerDescription>
    </>
  )
}

export default PaymentModal