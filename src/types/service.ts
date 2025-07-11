export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience: string;
}

export interface ServiceFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  location: string;
  phone: string;
  email: string;
  experience: string;
}