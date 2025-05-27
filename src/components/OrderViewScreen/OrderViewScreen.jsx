import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {UserContext} from '../../contexts/UserContext.jsx';
import {useNotify} from "../../contexts/NotificationContext.jsx";
import {useNavigate} from "react-router-dom";

const OrderScreen = () => {
    const {user} = useContext(UserContext);
    const [order, setOrder] = useState(null);
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [showPaymentMethod, setShowPaymentMethod] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT');
    const notify = useNotify();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (!user?.id) return;
                const res = await axios.get(`http://localhost:8080/oop/order/get/${user.id}`);
                if (res.data.code === 200) {
                    setOrder(res.data.result);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrder();
    }, [user]);

    const statusTextMap = {
        DA_HOAN_THANH: 'Món ăn đã hoàn thành',
        CHO_XAC_NHAN: 'Món ăn đang được chuẩn bị',
    };

    const messageMap = {
        DA_HOAN_THANH: 'Xin mời quý khách lấy món.',
        CHO_XAC_NHAN: 'Mời quý khách đợi trong ít phút',
    };

    const createInvoice = async () => {
        if (!order) {
            notify.error({message: 'Không có đơn hàng để tạo hóa đơn', duration: 3});
            return;
        }
        setLoadingInvoice(true);
        try {
            const payload = {
                method: paymentMethod,
                orderId: order.id,
                phone: user.phone || '',
            };
            const res = await axios.post('http://localhost:8080/oop/invoice/create', payload);
            if (res.data.code === 200) {
                notify.success({message: 'Hóa đơn đã được tạo thành công, vui lòng ra quầy thanh toán', duration: 3});
                setShowPaymentMethod(false);
                navigate("/");
            } else {
                notify.error({message: 'Tạo hóa đơn thất bại: ' + res.data.message, duration: 3});
            }
        } catch (error) {
            notify.error({message: 'Lỗi khi tạo hóa đơn: ' + error.message, duration: 3});
        } finally {
            setLoadingInvoice(false);
        }
    };

    if (!user) {
        return <div>Loading user info...</div>;
    }

    const handleBack = () => {
        navigate(-1); // quay lại trang trước đó
    };

    return (
        <div
            style={{
                maxWidth: 400,
                margin: '20px auto',
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#fff',
                boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            }}
        >
            <button
                onClick={handleBack}
                style={{
                    marginBottom: 16,
                    backgroundColor: '#1890ff',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                }}
            >
                ← Quay lại
            </button>
            <h2 style={{textAlign: 'center', marginBottom: 20}}>Thông tin đơn hàng</h2>
            {order ? (
                <>
                    <div style={{marginBottom: 8}}>
                        <strong>Mã đơn:</strong> {order.id}
                    </div>
                    <div style={{marginBottom: 8, fontWeight: 'bold', fontSize: 16}}>
                        {statusTextMap[order.status] || order.status}
                    </div>
                    <div style={{marginBottom: 8, color: '#666'}}>
                        {messageMap[order.status] || 'Đang xử lý'}
                    </div>
                    <div style={{marginBottom: 8}}>
                        <strong>Ngày:</strong>{' '}
                        {(new Date(order.date)).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        }) || 'Không có'}
                    </div>
                    <div style={{marginBottom: 8}}>
                        <strong>Ghi chú:</strong> {order.note || 'Không có'}
                    </div>
                    <div style={{marginBottom: 16}}>
                        <strong>Tổng tiền:</strong>{' '}
                        {order.totalPrice
                            ? order.totalPrice.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            })
                            : '0đ'}
                    </div>

                    {!showPaymentMethod && (
                        <button
                            onClick={() => setShowPaymentMethod(true)}
                            style={{
                                backgroundColor: '#1890ff',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                width: '100%',
                                fontWeight: 'bold',
                                fontSize: 16,
                            }}
                        >
                            Yêu cầu tạo hóa đơn
                        </button>
                    )}

                    {showPaymentMethod && (
                        <div style={{marginTop: 16}}>
                            <label htmlFor="payment-method" style={{fontWeight: 'bold'}}>
                                Chọn phương thức thanh toán:
                            </label>
                            <select
                                id="payment-method"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginTop: 8,
                                    borderRadius: 4,
                                    border: '1px solid #ccc',
                                    fontSize: 16,
                                }}
                            >
                                <option value="TIEN_MAT">Tiền mặt</option>
                                <option value="CHUYEN_KHOAN">Chuyển khoản</option>
                                <option value="MOMO">Momo</option>
                                <option value="ZALO_PAY">ZaloPay</option>
                            </select>

                            <button
                                onClick={createInvoice}
                                disabled={loadingInvoice}
                                style={{
                                    marginTop: 12,
                                    backgroundColor: '#52c41a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '10px 16px',
                                    borderRadius: 6,
                                    cursor: loadingInvoice ? 'not-allowed' : 'pointer',
                                    width: '100%',
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                }}
                            >
                                {loadingInvoice ? 'Đang tạo hóa đơn...' : 'Xác nhận tạo hóa đơn'}
                            </button>

                            <button
                                onClick={() => setShowPaymentMethod(false)}
                                style={{
                                    marginTop: 8,
                                    backgroundColor: '#f5222d',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    width: '100%',
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p style={{textAlign: 'center'}}>Chưa có đơn hàng</p>
            )}
        </div>
    );
};

export default OrderScreen;
