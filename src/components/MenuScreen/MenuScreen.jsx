import React, {useCallback, useEffect, useState} from 'react';
import {Input, Rate, Spin, Tabs} from 'antd';
import {LeftOutlined, SearchOutlined} from '@ant-design/icons';
import axios from 'axios';
import './MenuScreen.css';
import {useNotify} from '../../contexts/NotificationContext';
import {debounce} from 'lodash';
import {useNavigate} from "react-router-dom";

const {TabPane} = Tabs;

const MenuScreen = () => {
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('ALL');
    const notify = useNotify();
    const navigate = useNavigate();

    const categories = [
        {label: 'Tất cả', value: 'ALL'},
        {label: 'Món chính', value: 'MON_CHINH'},
        {label: 'Tráng miệng', value: 'TRANG_MIENG'},
        {label: 'Nước uống', value: 'NUOC_UONG'}
    ];

    const fetchByCategory = async () => {
        setLoading(true);
        try {
            let res;
            if (category === 'ALL') {
                res = await axios.get('http://localhost:8080/oop/dish/filter/status?status=DANG_BAN');
            } else {
                res = await axios.get('http://localhost:8080/oop/dish/filter/type', {
                    params: {type: category, status: 'DANG_BAN'}
                });
            }
            setMenuItems(res.data.result || []);
        } catch (err) {
            notify.error({message: 'Không thể tải danh sách món ăn!', duration: 1});
        } finally {
            setLoading(false);
        }
    };

    const fetchSearch = useCallback(
        debounce(async (keyword) => {
            if (!keyword.trim()) {
                fetchByCategory();
                return;
            }

            setLoading(true);
            try {
                const res = await axios.get(
                    `http://localhost:8080/oop/dish/search?keyword=${encodeURIComponent(keyword)}`
                );
                setMenuItems(res.data.result || []);
            } catch (err) {
                notify.error({message: 'Không thể tìm kiếm món ăn!', duration: 1});
            } finally {
                setLoading(false);
            }
        }, 500),
        [category]
    );

    useEffect(() => {
        if (search.trim()) {
            fetchSearch(search);
        } else {
            fetchByCategory();
        }
    }, [category, search]);

    return (
        <div className="menu-container">
            <div className="menu-header">
                <LeftOutlined className="menu-icon" onClick={() => navigate("/")}/>
                <span>Order your favourite food!</span>
                <img src="/gio_hang.svg" className="cart-icon" alt="Giỏ hàng" onClick={() => navigate("/cart")}/>
            </div>

            <Input
                placeholder="Search"
                prefix={<SearchOutlined/>}
                allowClear
                className="search-bar"
                value={search}
                onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    if (value.trim() === '') {
                        fetchByCategory();
                    }
                }}
            />

            <Tabs activeKey={category} onChange={setCategory} className="menu-tabs">
                {categories.map((cat) => (
                    <TabPane tab={cat.label} key={cat.value}/>
                ))}
            </Tabs>

            {loading ? (
                <div className="loading"><Spin size="large"/></div>
            ) : (
                <div className="grid">
                    {menuItems.length > 0 ? (
                        menuItems.map((item) => (
                            <div key={item.id} className="card" onClick={() => navigate(`/dish/${item.id}`)}>
                                <img
                                    src={item.image || "/mon_an.svg"}
                                    alt={item.name}
                                    className="food-img"
                                    style={{width: '100%'}}
                                />
                                <div className="card-title">{item.name}</div>
                                <div className="card-sub">{item.description}</div>
                                <Rate disabled allowHalf defaultValue={item.popularity || 4}/>
                            </div>
                        ))
                    ) : (
                        <div className="empty-message">Không có món ăn nào trong danh mục này.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuScreen;
