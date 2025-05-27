import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import './OrderDetailScreen.css';
import {useNotify} from "../../contexts/NotificationContext.jsx";

const OrderDetailScreen = () => {
    const {orderId} = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const notify = useNotify();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/oop/order/get-by-id/${orderId}`);
                if (res.data.code === 200) {
                    setOrder(res.data.result);
                } else {
                    console.error('Lỗi:', res.data.message);
                }
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleCompleteOrder = async () => {
        if (!order) return;
        setUpdating(true);
        try {
            const res = await axios.post(`http://localhost:8080/oop/order/update-status/${order.id}`, {
                status: "DA_HOAN_THANH",
            });
            if (res.data.code === 200) {
                notify.success({
                    message: 'Thành công',
                    description: 'Đã cập nhật trạng thái đơn hàng thành "Đã hoàn thành"',
                    duration: 2,
                });
                setOrder(prev => ({...prev, status: "DA_HOAN_THANH"}));
            } else {
                notify.error({
                    message: 'Thất bại',
                    description: res.data.message || 'Cập nhật trạng thái thất bại',
                    duration: 2,
                });
            }
        } catch (error) {
            notify.error({
                message: 'Lỗi',
                description: 'Lỗi khi cập nhật trạng thái đơn hàng',
                duration: 2,
            });
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (!order) return (
        <div>
            <p>Không tìm thấy đơn hàng.</p>
            <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>
    );

    return (
        <div className="order-detail-container">
            <h2>Chi tiết đơn hàng</h2>

            <div className="order-info">
                <p><b>Mã đơn:</b> {order.id}</p>
                <p><b>Trạng thái:</b> {order.status}</p>
                <p><b>Ngày đặt:</b> {new Date(order.date).toLocaleString('vi-VN')}</p>
                <p className="order-note"><b>Ghi chú:</b> {order.note || 'Không có'}</p>
                <p><b>Tổng tiền:</b> {order.totalPrice.toLocaleString('vi-VN')} VND</p>
            </div>

            <h3>Danh sách món</h3>
            <ul className="dishes-list">
                {order.dishes.map(({dishName, quantity}, index) => (
                    <li key={index}>
                        <span>{dishName}</span>
                        <span>Số lượng: {quantity}</span>
                    </li>
                ))}
            </ul>

            <button
                className="back-button-order-detail"
                onClick={() => navigate(-1)}
                style={{marginRight: 12}}
            >
                Quay lại
            </button>

            <button
                onClick={handleCompleteOrder}
                disabled={updating || order.status === "DA_HOAN_THANH"}
                style={{
                    backgroundColor: order.status === "DA_HOAN_THANH" ? '#ccc' : '#1890ff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: order.status === "DA_HOAN_THANH" ? 'not-allowed' : 'pointer',
                }}
            >
                {updating ? 'Đang cập nhật...' : 'Xác nhận hoàn thành đơn'}
            </button>
        </div>
    );
};

export default OrderDetailScreen;
