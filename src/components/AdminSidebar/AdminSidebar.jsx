import React, {useContext} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import './AdminSidebar.css';
import {RightOutlined} from '@ant-design/icons';
import {useNotify} from "../../contexts/NotificationContext.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";

const menuItems = [
    {key: 'orders', label: 'Nhận đơn gọi món'},
    {key: 'invoices', label: 'Quản lý hoá đơn'},
    {key: 'ingredients', label: 'Quản lý nguyên liệu'},
    {key: 'warehouse', label: 'Quản lý kho'},
    {key: 'recipes', label: 'Quản lý công thức'},
    {key: 'dishes', label: 'Quản lý món ăn'},
    {key: 'users', label: 'Quản lý người dùng'},
];

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentKey = location.pathname.split('/')[2];
    const {user} = useContext(UserContext);
    const notify = useNotify();

    return (
        <div className="admin-sidebar">
            <div className="admin-logo">
                <img src="/LogoAdmin.svg" alt="Admin Logo"/>
            </div>

            <div className="menu-list">
                {menuItems.map((item) => (
                    <div
                        key={item.key}
                        className={`menu-item ${item.key === currentKey ? 'active' : ''}`}
                        onClick={() => {
                            if (!user) {
                                notify.error({message: "Vui lòng đăng nhập để truy cập trang này", duration: 1.5});
                                navigate('/admin');
                            } else if (user && user.role === "CUSTOMER") {
                                notify.error({message: "Bạn không có quyền truy cập vào trang", duration: 1.5});
                                navigate('/');
                            } else {
                                navigate(`/admin/${item.key}`)
                            }
                        }}
                    >
                        <span>{item.label}</span>
                        <RightOutlined/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSidebar;
