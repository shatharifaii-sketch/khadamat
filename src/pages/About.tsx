
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart, Shield, Award, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useHomeStats } from '@/hooks/useHomeStats';

const About = () => {
  const { data: homeStats, isLoading, error } = useHomeStats();

  const features = [
    {
      icon: Shield,
      title: 'أمان وثقة',
      description: 'نضمن لك تجربة آمنة مع التحقق من هوية جميع مقدمي الخدمات'
    },
    {
      icon: Users,
      title: 'شبكة واسعة',
      description: 'آلاف مقدمي الخدمات المحترفين في جميع أنحاء فلسطين'
    },
    {
      icon: Award,
      title: 'جودة عالية',
      description: 'نظام تقييم وتعليقات يضمن جودة الخدمات المقدمة'
    },
    {
      icon: CheckCircle,
      title: 'سهولة الاستخدام',
      description: 'واجهة بسيطة وسهلة للعثور على الخدمة المناسبة بسرعة'
    }
  ];

  // Create dynamic stats based on real data
  const getDynamicStats = () => {
    if (isLoading) {
      return [
        { number: '...', label: 'مقدم خدمة' },
        { number: '...', label: 'خدمة متاحة' },
        { number: '...', label: 'فئة خدمة' },
      ];
    }

    const serviceProvidersCount = homeStats?.serviceProvidersCount || 0;
    const publishedServicesCount = homeStats?.publishedServicesCount || 0;
    const categoriesCount = homeStats?.categoriesWithServices?.length || 0;

    // Show encouraging message for new platform
    const isNewPlatform = serviceProvidersCount < 10 && publishedServicesCount < 20;

    return [
      { 
        number: serviceProvidersCount === 0 ? 'قريباً' : `${serviceProvidersCount}+`, 
        label: 'مقدم خدمة' 
      },
      { 
        number: publishedServicesCount === 0 ? 'قريباً' : `${publishedServicesCount}+`, 
        label: 'خدمة متاحة' 
      },
      { 
        number: categoriesCount === 0 ? 'قريباً' : `${categoriesCount}+`, 
        label: 'فئة خدمة' 
      },
    ];
  };

  const stats = getDynamicStats();
  const isNewPlatform = !isLoading && (homeStats?.serviceProvidersCount || 0) < 10 && (homeStats?.publishedServicesCount || 0) < 20;

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            من نحن
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            منصة فلسطينية رائدة تهدف إلى ربط مقدمي الخدمات المحترفين مع الأشخاص الباحثين عن الخدمات
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="text-primary" size={32} />
                رسالتنا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl-large text-muted-foreground">
                نسعى لتسهيل الوصول إلى الخدمات المهنية عالية الجودة في فلسطين، وتوفير فرص عمل للمهنيين المحليين من خلال منصة آمنة وموثوقة.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="text-primary" size={32} />
                رؤيتنا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl-large text-muted-foreground">
                أن نكون المنصة الأولى والأكثر ثقة في فلسطين لربط الخدمات المهنية، ودعم الاقتصاد المحلي من خلال تمكين المواهب الفلسطينية.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-card py-16 px-8 rounded-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isNewPlatform ? 'منصة جديدة في نمو مستمر' : 'أرقامنا تتحدث'}
          </h2>
          
          {isNewPlatform && (
            <p className="text-center text-muted-foreground mb-8 text-large">
              انضم إلينا في بداية رحلتنا وكن جزءاً من مجتمع الخدمات المهنية الفلسطيني
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-large text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            لماذا نحن مختلفون؟
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-large text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">قصتنا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl-large text-muted-foreground">
              بدأت فكرة "خدمتك" من الحاجة الماسة لوجود منصة تربط بين المواهب الفلسطينية والأشخاص الباحثين عن خدمات مهنية موثوقة. لاحظنا أن العديد من المهنيين المهرة يواجهون صعوبة في الوصول إلى العملاء، بينما يجد الناس صعوبة في العثور على مقدمي خدمات موثوقين.
            </p>
            <p className="text-xl-large text-muted-foreground">
              من هنا ولدت فكرة إنشاء منصة إلكترونية تجمع بين الطرفين، تتميز بسهولة الاستخدام والأمان والجودة. نحن نؤمن بأن التكنولوجيا يمكن أن تكون جسراً يربط بين الحاجات والحلول، وأن المواهب الفلسطينية تستحق منصة تليق بها.
            </p>
            <p className="text-xl-large text-muted-foreground">
              {isNewPlatform 
                ? 'نحن في بداية رحلتنا ونتطلع لخدمة مجتمعنا ودعم المهنيين الفلسطينيين في تحقيق دخل مستدام من خلال مهاراتهم وخبراتهم.'
                : 'اليوم، نحن فخورون بخدمة آلاف المستخدمين ودعم مئات المهنيين في تحقيق دخل مستدام من خلال مهاراتهم وخبراتهم.'
              }
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">قيمنا</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">الثقة</h3>
              <p className="text-large text-muted-foreground">
                نبني الثقة من خلال الشفافية والجودة في جميع خدماتنا
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">الابتكار</h3>
              <p className="text-large text-muted-foreground">
                نسعى دائماً لتطوير حلول مبتكرة تخدم مجتمعنا
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">التميز</h3>
              <p className="text-large text-muted-foreground">
                نلتزم بتقديم أعلى مستويات الجودة والخدمة
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
