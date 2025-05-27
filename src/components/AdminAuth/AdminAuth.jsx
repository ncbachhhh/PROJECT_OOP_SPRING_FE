import React from 'react';
import {Navigate} from "react-router-dom";

const AdminAuth = ({children}) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return <Navigate to="/admin" replace/>;
    }

    return children;
};

export default AdminAuth;