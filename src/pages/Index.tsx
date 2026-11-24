import { useAuth } from "@/contexts/AuthContext";
import AuthHome from "./home/AuthHome";
import Home from "./home/Home";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Home />
  }

  return <AuthHome />;
};

export default Index;
