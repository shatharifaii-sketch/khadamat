import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"
import { Link } from "react-router-dom"

const PaymentFailed = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 arabic">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <img src="/application_logo_cut.png" className='h-12' alt="cut logo" />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              حدث خطأ في عملية الدفع
            </CardTitle>
            <CardDescription>
              لم نتمكن من إكمال عملية الدفع, الرجاء إعادة المحاولة
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to={'/'} className="flex-1">
              العودة الى الصفحة الرئيسية
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default PaymentFailed