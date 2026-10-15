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
        notes:
        [
            'الحد الأقصى للخدمات: 2',
            'في حال وجود خدمتين لديك بالفعل فعليك حذف احدها لتقدر على اضافة خدمة جديدة'
        ],
        freeTial: true,
        freeTrialPeriodText: 'ثلاثة أشهر مجانا',
        freeTrialPeriod: 90,
        className: 'bg-primary text-primary-foreground',
        badgeClassName: 'bg-secondary text-secondary-foreground px-4 py-1 hover:bg-secondary'
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
        notes:
        [
            'الحد الأقصى للخدمات: 10',
            'في حال وجود عشر خدمات لديك بالفعل فعليك حذف احدها لتقدر على اضافة خدمة جديدة'
        ],
        freeTial: true,
        freeTrialPeriodText: 'ثلاثة أشهر مجانا',
        freeTrialPeriod: 90,
        badgeClassName: 'bg-primary text-secondary px-4 py-1 hover:bg-primary',
        className: 'bg-secondary text-secondary-foreground'
    }
];

export const countries = [
  { code: "970", label: "PS +970" },
  { code: "972", label: "IS +972" },
  { code: "966", label: "SA +966" },
  { code: "20", label: "EG +20" },
  { code: "971", label: "AE +971" },
  { code: "963", label: "SY +963" },
  { code: "962", label: "JO +962" },
  { code: "31", label: "NL +31" },
  { code: "1", label: "US +1" },
];