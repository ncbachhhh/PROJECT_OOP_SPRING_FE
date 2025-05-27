import React, {useContext, useEffect, useState} from 'react';
import {Button, Form, Input, InputNumber, Modal, Select, Table} from 'antd';
import axios from 'axios';
import {useNotify} from '../../contexts/NotificationContext.jsx';
import {UserContext} from '../../contexts/UserContext.jsx';
import './DishScreen.css';

const {Option} = Select;

const DishScreen = () => {
    const [dishes, setDishes] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [selectedDish, setSelectedDish] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [availableModalVisible, setAvailableModalVisible] = useState(false);
    const [availableDishes, setAvailableDishes] = useState([]);
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const notify = useNotify();
    const {user} = useContext(UserContext); // Lấy userId

    const fetchDishes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/oop/dish/all');
            if (res.data.code === 200) {
                setDishes(res.data.result);
            } else {
                notify.error({message: 'Lỗi tải danh sách món ăn: ' + res.data.message});
            }
        } catch (error) {
            notify.error({message: 'Lỗi tải danh sách món ăn'});
        }
    };

    const fetchRecipes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/oop/recipe/get/all');
            if (res.data.code === 200) {
                setRecipes(res.data.result);
            } else {
                notify.error({message: 'Lỗi tải danh sách công thức: ' + res.data.message});
            }
        } catch (error) {
            notify.error({message: 'Lỗi tải danh sách công thức'});
        }
    };

    // Hàm mới: gọi api lấy danh sách món có thể chế biến
    const fetchAvailableDishes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/oop/dish/available-dishes');
            if (res.data.code === 200) {
                setAvailableDishes(res.data.result);
                setAvailableModalVisible(true);
            } else {
                notify.error({message: 'Lỗi tải danh sách món có thể chế biến: ' + res.data.message});
            }
        } catch (error) {
            notify.error({message: 'Lỗi tải danh sách món có thể chế biến'});
        }
    };

    useEffect(() => {
        fetchDishes();
    }, []);

    const openEditModal = (dish) => {
        setSelectedDish(dish);
        form.setFieldsValue({
            name: dish.name,
            description: dish.description,
            price: dish.price,
            status: dish.status,
            type: dish.type,
            popularity: dish.popularity,
            estimatedTime: dish.estimatedTime,
        });
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setSelectedDish(null);
        setEditModalVisible(false);
        form.resetFields();
    };

    const onFinishEdit = async (values) => {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                price: values.price,
                status: values.status,
                type: values.type,
                popularity: values.popularity,
                estimatedTime: values.estimatedTime,
            };

            const res = await axios.post(`http://localhost:8080/oop/dish/update/${selectedDish.id}`, payload);
            if (res.data.code === 200) {
                notify.success({message: 'Cập nhật món ăn thành công'});
                fetchDishes();
                closeEditModal();
            } else {
                notify.error({message: res.data.message || 'Cập nhật thất bại'});
            }
        } catch (error) {
            notify.error({message: 'Lỗi khi cập nhật món ăn: ' + error.message});
        }
    };

    const openAddModal = () => {
        fetchRecipes();
        addForm.resetFields();
        setAddModalVisible(true);
    };

    const closeAddModal = () => {
        setAddModalVisible(false);
        addForm.resetFields();
    };

    const onFinishAdd = async (values) => {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                price: values.price,
                status: values.status,
                type: values.type,
                popularity: values.popularity,
                estimatedTime: values.estimatedTime,
                recipeId: values.recipeId,
                userId: user.id,
            };

            const res = await axios.post('http://localhost:8080/oop/dish/create', payload);
            if (res.data.code === 200) {
                notify.success({message: 'Thêm món ăn thành công'});
                fetchDishes();
                closeAddModal();
            } else {
                notify.error({message: res.data.message || 'Thêm thất bại'});
            }
        } catch (error) {
            notify.error({message: 'Lỗi khi thêm món ăn: ' + error.message});
        }
    };

    // Cột bảng hiển thị trong modal món ăn có thể chế biến
    const availableDishesColumns = [
        {
            title: 'Tên món ăn',
            dataIndex: 'dishName',
            key: 'dishName',
        },
        {
            title: 'Số lượng có thể chế biến',
            dataIndex: 'maxServings',
            key: 'maxServings',
        },
    ];

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <h2>Danh sách món ăn</h2>
                <div>
                    <Button type="primary" style={{marginRight: 12}} onClick={openAddModal}>Thêm món ăn mới</Button>
                    <Button onClick={fetchAvailableDishes}>Món ăn có thể chế biến</Button>
                </div>
            </div>

            <div className="dish-container">
                {dishes.map((dish) => (
                    <div key={dish.id} className="dish-card" onClick={() => openEditModal(dish)}>
                        <img className="dish-image-dishscreen" src="/mon_an.svg" alt={dish.name}/>
                        <div className="dish-info">
                            <h4 className="dish-name">{dish.name}</h4>
                            <p className="dish-desc">{dish.description}</p>
                            <p>Giá: {dish.price?.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'})}</p>
                            <p>Trạng thái: {dish.status}</p>
                            <p>Loại: {dish.type}</p>
                            <p>Thời gian: {dish.estimatedTime}</p>
                            <p>Độ phổ biến: {dish.popularity}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal sửa */}
            <Modal
                visible={editModalVisible}
                title={`Sửa món ăn: ${selectedDish?.name || ''}`}
                okText="Lưu"
                cancelText="Hủy"
                onCancel={closeEditModal}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinishEdit}>
                    <Form.Item name="name" label="Tên món ăn"
                               rules={[{required: true, message: 'Vui lòng nhập tên món ăn'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả"
                               rules={[{required: true, message: 'Vui lòng nhập mô tả'}]}>
                        <Input.TextArea rows={3}/>
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{required: true, message: 'Vui lòng nhập giá'}]}>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{required: true}]}>
                        <Select>
                            <Option value="DANG_BAN">Đang bán</Option>
                            <Option value="NGUNG_BAN">Ngưng bán</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="type" label="Loại món" rules={[{required: true}]}>
                        <Select>
                            <Option value="MON_CHINH">Món chính</Option>
                            <Option value="TRANG_MIENG">Tráng miệng</Option>
                            <Option value="NUOC_UONG">Nước uống</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="estimatedTime" label="Thời gian ước tính" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="popularity"
                        label="Độ phổ biến"
                        rules={[{required: true, type: 'number', min: 0, max: 5}]}
                    >
                        <InputNumber min={0} max={5}/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal thêm mới */}
            <Modal
                visible={addModalVisible}
                title="Thêm món ăn mới"
                okText="Thêm"
                cancelText="Hủy"
                onCancel={closeAddModal}
                onOk={() => addForm.submit()}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={onFinishAdd}>
                    <Form.Item name="name" label="Tên món ăn"
                               rules={[{required: true, message: 'Vui lòng nhập tên món ăn'}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả"
                               rules={[{required: true, message: 'Vui lòng nhập mô tả'}]}>
                        <Input.TextArea rows={3}/>
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{required: true, message: 'Vui lòng nhập giá'}]}>
                        <InputNumber
                            style={{width: '100%'}}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{required: true}]}>
                        <Select>
                            <Option value="DANG_BAN">Đang bán</Option>
                            <Option value="NGUNG_BAN">Ngưng bán</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="type" label="Loại món" rules={[{required: true}]}>
                        <Select>
                            <Option value="MON_CHINH">Món chính</Option>
                            <Option value="TRANG_MIENG">Tráng miệng</Option>
                            <Option value="NUOC_UONG">Nước uống</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="estimatedTime" label="Thời gian ước tính" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="popularity"
                        label="Độ phổ biến"
                        rules={[{required: true, type: 'number', min: 0, max: 5}]}
                    >
                        <InputNumber min={0} max={5}/>
                    </Form.Item>

                    {/* Chọn recipeId */}
                    <Form.Item
                        name="recipeId"
                        label="Chọn công thức"
                        rules={[{required: true, message: 'Vui lòng chọn công thức'}]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn công thức"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            loading={recipes.length === 0}
                        >
                            {recipes.map((recipe) => (
                                <Option key={recipe.id} value={recipe.id}>
                                    {recipe.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal món ăn có thể chế biến */}
            <Modal
                title="Món ăn có thể chế biến"
                visible={availableModalVisible}
                onCancel={() => setAvailableModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setAvailableModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={600}
                destroyOnClose
            >
                <Table
                    columns={[
                        {
                            title: 'Tên món ăn',
                            dataIndex: 'dishName',
                            key: 'dishName',
                        },
                        {
                            title: 'Số lượng có thể chế biến',
                            dataIndex: 'maxServings',
                            key: 'maxServings',
                        },
                    ]}
                    dataSource={availableDishes}
                    rowKey="dishId"
                    pagination={false}
                    size="small"
                />
            </Modal>
        </>
    );
};

export default DishScreen;
