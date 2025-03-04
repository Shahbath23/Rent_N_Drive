import AuthContext from "../context/AuthContext.js";
import { useContext, useEffect, useReducer, useState } from "react";
import axios from 'axios';
import userReducer from "../reducers/userReducer.js";
import { useNavigate } from 'react-router-dom';

const initialState = {
    isLoggedIn: false,
    user: null
};

export default function AuthProvider({ children }) {
    const [userState, userDispatch] = useReducer(userReducer, initialState);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Set up axios interceptor for handling authentication headers
    useEffect(() => {
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = token;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Handle 401 responses globally
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    handleLogout();
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );
    }, [navigate]);

    const handleLogin = async (userData) => {
        try {
            userDispatch({
                type: 'LOGIN',
                payload: {
                    isLoggedIn: true,
                    user: userData
                }
            });
            // Store token from userData if it exists
            if (userData.token) {
                localStorage.setItem('token', userData.token);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        userDispatch({
            type: 'LOGOUT',
            payload: {
                isLoggedIn: false,
                user: null
            }
        });
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:3020/user/account');
                    if (response.data) {
                        handleLogin(response.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                // If there's an error, clear the token and redirect to login
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkLoginStatus();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    const contextValue = {
        userState,
        handleLogin,
        handleLogout,
        userDispatch
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}