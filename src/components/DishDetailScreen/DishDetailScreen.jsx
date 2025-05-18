import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {LeftOutlined, MinusOutlined, PlusOutlined, StarFilled} from '@ant-design/icons';
import './DishDetailScreen.css';
import axios from 'axios';
import {useNotify} from "../../contexts/NotificationContext.jsx";

const DishDetailScreen = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [dish, setDish] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const notify = useNotify();

    useEffect(() => {
        const fetchDish = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/oop/dish/${id}`);
                setDish(res.data.result);
            } catch (error) {
                console.error('Error fetching dish:', error);
            }
        };
        fetchDish();
    }, [id]);

    if (!dish) return <div>Loading...</div>;

    const handleQuantity = (type) => {
        setQuantity((prev) => (type === 'inc' ? prev + 1 : Math.max(1, prev - 1)));
    };

    const handleOrder = () => {
        const orderItem = {
            dishId: dish.id,
            quantity: quantity,
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        existingOrders.push(orderItem);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        notify.success({message: 'Đặt hàng thành công!', duration: 1});
        navigate(-1);
    };

    return (
        <div className="dish-detail-container">
            <div className="back-btn" onClick={() => navigate(-1)}>
                <LeftOutlined/>
            </div>

            <img src={dish.image || "/mon_an.svg"} alt={dish.name} className="dish-image"/>

            <div className="dish-info">
                <h2>{dish.name}</h2>
                <div className="rating-time">
                    <StarFilled style={{color: 'orange', marginRight: 4}}/>
                    {dish.popularity || 4.5} &nbsp;–&nbsp; {dish.estimatedTime || 20} mins
                </div>
                <p className="dish-description">{dish.description}</p>

                <div className="note-section">
                    <label><b>Ghi chú</b></label>
                    <textarea
                        rows={3}
                        placeholder="Ví dụ: Ít đá, không cay..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="order-footer">
                    <span className="price">{dish.price.toLocaleString('vi-VN')} VND</span>
                    <div className="quantity-control">
                        <button onClick={() => handleQuantity('dec')}><MinusOutlined/></button>
                        <span>{quantity}</span>
                        <button onClick={() => handleQuantity('inc')}><PlusOutlined/></button>
                    </div>
                    <button className="order-btn" onClick={handleOrder}>Order</button>
                </div>
            </div>
        </div>
    );
};

export default DishDetailScreen;
