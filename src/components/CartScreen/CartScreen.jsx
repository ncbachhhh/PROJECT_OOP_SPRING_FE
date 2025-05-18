import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {CloseOutlined, LeftOutlined, MinusOutlined, PlusOutlined,} from '@ant-design/icons';
import './CartScreen.css';
import axios from 'axios';
import {useNotify} from "../../contexts/NotificationContext.jsx";

const CartScreen = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [note, setNote] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const notify = useNotify();

    useEffect(() => {
        const loadCart = async () => {
            const stored = JSON.parse(localStorage.getItem('orders')) || [];
            const dishes = [];

            for (const item of stored) {
                try {
                    const res = await axios.get(`http://localhost:8080/oop/dish/${item.dishId}`);
                    dishes.push({...res.data.result, quantity: item.quantity});
                } catch (err) {
                    console.error('Không lấy được món:', err);
                }
            }

            setCart(dishes);
        };

        loadCart();
    }, []);

    const handleChangeQuantity = (id, type) => {
        const updated = cart.map(item => {
            if (item.id === id) {
                const newQty = type === 'inc' ? item.quantity + 1 : Math.max(0, item.quantity - 1);
                return {...item, quantity: newQty};
            }
            return item;
        });

        setCart(updated);
        updateLocalStorage(updated);
    };

    const handleRemove = (id) => {
        const updated = cart.filter(item => item.id !== id);
        setCart(updated);
        updateLocalStorage(updated);
    };

    const updateLocalStorage = (newCart) => {
        const mapped = newCart
            .filter(item => item.quantity > 0)
            .map(item => ({
                dishId: item.id,
                quantity: item.quantity,
            }));

        localStorage.setItem('orders', JSON.stringify(mapped));
    };

    const handleShowNote = () => {
        const validItems = cart.filter(item => item.quantity > 0);
        if (validItems.length === 0) {
            notify.error({message: "Không có món hợp lệ để đặt hàng.", duration: 1});
            return;
        }
        setShowNoteModal(true);
    };

    const handleSubmitOrder = async () => {
        const orderItems = cart
            .filter(item => item.quantity > 0)
            .map(item => ({
                dishId: item.id,
                quantity: item.quantity,
            }));

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) {
            notify.error({message: "Vui lòng đăng nhập để đặt hàng.", duration: 1});
            return;
        }

        try {
            const res = await axios.post('http://localhost:8080/oop/order/create', {
                note,
                userId,
                dishes: orderItems,
            });
            console.log(res.data);

            if (res.data.code === 200) {
                setShowNoteModal(false);
                setShowSuccessModal(true);
                localStorage.removeItem('orders');
                setCart([]);
                setNote('');

                // Chuyển trang sau 2s
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate('/');
                }, 2000);

            } else {
                notify.error({message: res.data.message, duration: 1});
            }
        } catch (err) {
            console.error(err);
            notify.error({message: "Lỗi khi đặt hàng", duration: 1});
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-container">
            <div className="cart-header">
                <LeftOutlined onClick={() => navigate(-1)}/>
                <CloseOutlined
                    style={{color: 'red', fontSize: '20px', float: 'right', cursor: 'pointer'}}
                    onClick={() => setShowConfirmModal(true)}
                />
            </div>

            {cart.filter(item => item.quantity > 0).length === 0 ? (
                <div className="empty-cart">
                    <p>Không có món ăn trong giỏ hàng</p>
                    <button className="menu-btn" onClick={() => navigate('/menu')}>
                        MENU
                    </button>
                </div>
            ) : (
                <>
                    {cart.filter(item => item.quantity > 0).map((item) => (
                        <div key={item.id} className="cart-card">
                            <img src={item.image || '/mon_an.svg'} alt={item.name} className="cart-img"/>
                            <div className="cart-info">
                                <div className="cart-name">
                                    <b>{item.quantity}x</b>&nbsp; {item.name}
                                </div>
                                <div className="cart-price">{item.price.toLocaleString('vi-VN')} VND</div>
                                <div className="cart-qty">
                                    <button onClick={() => handleChangeQuantity(item.id, 'dec')}>
                                        <MinusOutlined/>
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleChangeQuantity(item.id, 'inc')}>
                                        <PlusOutlined/>
                                    </button>
                                </div>
                            </div>
                            <CloseOutlined onClick={() => handleRemove(item.id)} className="cart-remove"/>
                        </div>
                    ))}
                </>
            )}

            <div className="cart-footer">
                <div className="cart-total">
                    <span>Tổng đơn: </span>
                    <span style={{color: '#ff9800', fontWeight: 'bold'}}>{total.toLocaleString('vi-VN')} VND</span>
                </div>
                <button className="confirm-btn" onClick={handleShowNote}>Xác nhận</button>
            </div>

            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <p className="modal-text">Bạn có muốn xoá<br/>tất cả sản phẩm<br/>trong giỏ hàng không?</p>
                        <div className="modal-actions">
                            <button
                                className="btn-orange"
                                onClick={() => {
                                    localStorage.removeItem('orders');
                                    setCart([]);
                                    setShowConfirmModal(false);
                                }}
                            >
                                Xác nhận
                            </button>
                            <button className="btn-gray" onClick={() => setShowConfirmModal(false)}>
                                Huỷ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNoteModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <p className="modal-text">Ghi chú đơn hàng</p>
                        <textarea
                            className="modal-note-input"
                            rows="4"
                            placeholder="Ví dụ: Mang lên tầng 2, gọi trước khi giao..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="btn-orange" onClick={handleSubmitOrder}>
                                Xác nhận
                            </button>
                            <button className="btn-gray" onClick={() => setShowNoteModal(false)}>
                                Huỷ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: '#f7941d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            color: 'white',
                            margin: '0 auto 12px'
                        }}>
                            ✓
                        </div>
                        <p className="modal-text" style={{marginBottom: 12}}>
                            Bạn đã gọi món<br/>thành công
                        </p>
                        <button className="btn-orange" onClick={() => navigate('/')}>
                            Theo dõi đơn
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CartScreen;
