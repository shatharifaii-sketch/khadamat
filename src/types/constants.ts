export const subscriptions = [
    {
        id: 1,
        price: {
            monthly: {
                title: 'monthly',
                price: 10
            },
            yearly: {
                title: 'yearly',
                price: 100
            }
        },
        subscriptionTier: 1,
        allowedServices: 2,
        title: 'Individual/شخصي',
        description: 'يمكنك نشر خدمتين',
        notes:
        {
            1: 'الحد الأقصى للخدمات في الشهر: 2',
            2: 'في حال وجود خدمتين لديك بالفعل فعليك حذف احدها لتقدر على اضافة خدمة جديدة',
            3: 'الاشتراك يتجدد تلقائيا في حال عدم الالغاء',
            4: 'سيتم اعلامك من خلال البريد الالكتروني والمنصة للتاكد من الدفع الشهري'
        },
        freeTial: true,
        freeTrialPeriodText: '3 months',
        freeTrialPeriod: 90,
        className: 'bg-primary text-primary-foreground'
    },
    {
        id: 2,
        price: {
            monthly: {
                title: 'monthly',
                price: 20
            },
            yearly: {
                title: 'yearly',
                price: 200
            }
        },
        subscriptionTier: 2,
        allowedServices: 10,
        title: 'Business/شركة',
        description: ' يمكنك نشر عشر خدمات',
        notes:
        {
            1: 'الحد الأقصى للخدمات في الشهر: 10',
            2: 'في حال وجود عشر خدمات لديك بالفعل فعليك حذف احدها لتقدر على اضافة خدمة جديدة',
            3: 'الاشتراك يتجدد تلقائيا في حال عدم الالغاء',
            4: 'سيتم اعلامك من خلال البريد الالكتروني والمنصة للتاكد من الدفع الشهري'
        },
        freeTial: true,
        freeTrialPeriodText: '3 months',
        freeTrialPeriod: 90
    }
]