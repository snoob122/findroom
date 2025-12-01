import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'admin';
  avatar?: string;
  preferences?: {
    language: string;
    theme: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'tenant' | 'landlord';
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Đã đăng xuất');
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Đăng nhập thành công!');
    } catch (error: any) {
      // Ensure error message is always a string
      let message = 'Đăng nhập thất bại';
      if (error.response?.data?.error) {
        message = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : String(error.response.data.error);
      } else if (error.message) {
        message = typeof error.message === 'string' ? error.message : String(error.message);
      }
      toast.error(message);
      // Throw a new error with string message instead of the original error object
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post('/api/auth/register', data);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      toast.success('Đăng ký thành công!');
    } catch (error: any) {
      // Ensure error message is always a string
      let message = 'Đăng ký thất bại';
      if (error.response?.data?.error) {
        message = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : String(error.response.data.error);
      } else if (error.message) {
        message = typeof error.message === 'string' ? error.message : String(error.message);
      }
      toast.error(message);
      // Throw a new error with string message instead of the original error object
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};








