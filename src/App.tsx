
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PendingServiceHandler from "@/components/PostService/PendingServiceHandler";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import PostService from "./pages/PostService";
import FindService from "./pages/FindService";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Account from "./pages/Account";
import Payment from "./pages/Payment";
import Checkout from "./pages/Checkout";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
            <PendingServiceHandler />
            <div className="min-h-screen flex flex-col">
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/post-service" element={<PostService />} />
                  <Route path="/find-service" element={<FindService />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);
}

export default App;
