import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AxiosInterceptor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 403 || error.response?.status === 401) {
          console.warn("🔒 Unauthorized, redirecting to login");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  return null; // this component doesn't render anything
};

export default AxiosInterceptor;
