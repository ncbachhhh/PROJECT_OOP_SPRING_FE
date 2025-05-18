import React, {createContext, useEffect, useState} from 'react';

// Tạo context
export const UserContext = createContext();

// Provider
export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);

    // Lấy user từ localStorage khi app load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Hàm login: set user và lưu vào localStorage
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Hàm logout: clear user
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <UserContext.Provider value={{user, setUser: login, logout}}>
            {children}
        </UserContext.Provider>
    );
};
