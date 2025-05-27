import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import './OrderReceiveScreen.css';

const OrderReceiveScreen = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:8080/oop/order/status/CHO_XAC_NHAN');
                if (res.data.code === 200) {
                    setOrders(res.data.result || []);
                }
            } catch (err) {
                console.error('❌ Lỗi khi tải danh sách đơn hàng:', err);
            }
        };

        fetchOrders();
    }, []);

    const handleOrderClick = (order) => {
        navigate(`/admin/orders/${order.id}`, {state: {order}});
    };

    return (
        <div className="order-grid">
            {orders.length === 0 ? (
                <div className="empty-order">
                    <p>Hiện tại không có đơn hàng chờ xác nhận.</p>
                </div>
            ) : (
                orders.map((order) => (
                    <div
                        className="order-card"
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                        style={{cursor: 'pointer'}}
                    >
                        <p><b>Mã hoá đơn:</b> {order.code || order.id}</p>
                        <p><b>Ngày
                            đặt:</b> {new Date(order.date).toLocaleTimeString('vi-VN')} {new Date(order.date).toLocaleDateString('vi-VN')}
                        </p>
                        <p><b>Thành tiền:</b> {order.totalPrice?.toLocaleString('vi-VN')} VND</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderReceiveScreen;
