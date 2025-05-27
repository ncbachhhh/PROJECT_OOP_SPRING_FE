import React, {useContext, useEffect, useState} from 'react';
import {Button, Form, Input, InputNumber, Modal, Select, Space} from 'antd';
import axios from 'axios';
import {useNotify} from '../../contexts/NotificationContext.jsx';
import './RecipeScreen.css';
import {UserContext} from "../../contexts/UserContext.jsx";

const {Option} = Select;

const RecipeScreen = () => {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [addForm] = Form.useForm();
    const notify = useNotify();
    const [ingredientsOptions, setIngredientsOptions] = useState([]);
    const {user} = useContext(UserContext);

    // Lấy công thức
    const fetchRecipes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/oop/recipe/get/all');
            if (res.data.code === 200) {
                setRecipes(res.data.result);
            } else {
                notify.error({message: 'Lỗi tải công thức: ' + res.data.message});
            }
        } catch (error) {
            notify.error({message: 'Lỗi tải công thức'});
        }
    };

    // Lấy danh sách nguyên liệu dropdown
    const fetchIngredients = async () => {
        try {
            const res = await axios.get('http://localhost:8080/oop/ingredient/get/ingredients');
            if (res.data.code === 200) {
                setIngredientsOptions(res.data.result);
            }
        } catch {
            notify.error({message: 'Lỗi tải danh sách nguyên liệu'});
        }
    };

    useEffect(() => {
        fetchRecipes();
        fetchIngredients();
    }, []);

    // Mở modal sửa, set dữ liệu form
    const openEditModal = (recipe) => {
        setSelectedRecipe(recipe);
        form.setFieldsValue({
            name: recipe.name,
            description: recipe.description,
            ingredients: recipe.ingredients?.map(i => ({
                id: i.ingredientId,
                quantity: i.quantity,
            })) || [],
        });
        setEditModalVisible(true);
    };

    // Đóng modal sửa
    const closeEditModal = () => {
        setSelectedRecipe(null);
        setEditModalVisible(false);
        form.resetFields();
    };

    // Xử lý submit sửa
    const onFinishEdit = async (values) => {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                ingredients: values.ingredients.map(i => ({
                    id: i.id,
                    quantity: i.quantity,
                })),
            };

            const res = await axios.post(
                `http://localhost:8080/oop/recipe/update/${selectedRecipe.id}`,
                payload
            );

            if (res.data.code === 200) {
                notify.success({message: 'Cập nhật công thức thành công'});
                fetchRecipes();
                closeEditModal();
            } else {
                notify.error({message: res.data.message || 'Cập nhật thất bại'});
            }
        } catch {
            notify.error({message: 'Lỗi khi cập nhật công thức'});
        }
    };

    // Mở modal thêm mới
    const openAddModal = () => {
        addForm.resetFields();
        setAddModalVisible(true);
    };

    // Đóng modal thêm mới
    const closeAddModal = () => {
        setAddModalVisible(false);
        addForm.resetFields();
    };

    // Xử lý submit thêm mới
    const onFinishAdd = async (values) => {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                userId: user.id,  // thêm userId vào payload
                ingredients: values.ingredients.map(i => ({
                    id: i.id,
                    quantity: i.quantity,
                })),
            };

            const res = await axios.post(
                `http://localhost:8080/oop/recipe/create`,
                payload
            );

            if (res.data.code === 200) {
                notify.success({message: 'Thêm công thức thành công'});
                fetchRecipes();
                closeAddModal();
            } else {
                notify.error({message: res.data.message || 'Thêm thất bại'});
            }
        } catch {
            notify.error({message: 'Lỗi khi thêm công thức'});
        }
    };

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <h2>Công thức món ăn</h2>
                <Button type="primary" onClick={openAddModal}>Thêm công thức mới</Button>
            </div>

            <div className="recipe-container" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20}}>
                {recipes.map(recipe => (
                    <div
                        key={recipe.id}
                        className="recipe-card"
                        style={{cursor: 'pointer', border: '1px solid #ccc', borderRadius: 8, padding: 12}}
                        onClick={() => openEditModal(recipe)}
                    >
                        <img src={"/mon_an.svg"} alt={recipe.name}
                             style={{width: '120px', borderRadius: 8}}/>
                        <div style={{marginTop: 10}}>
                            <h4>{recipe.name}</h4>
                            <p style={{color: '#666'}}>{recipe.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal sửa */}
            <Modal
                visible={editModalVisible}
                title={`Sửa công thức: ${selectedRecipe?.name || ''}`}
                okText="Lưu"
                cancelText="Hủy"
                onCancel={closeEditModal}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onFinishEdit} initialValues={{ingredients: []}}>
                    <Form.Item
                        label="Tên công thức"
                        name="name"
                        rules={[{required: true, message: 'Vui lòng nhập tên công thức'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{required: true, message: 'Vui lòng nhập mô tả'}]}
                    >
                        <Input.TextArea rows={3}/>
                    </Form.Item>

                    <Form.List name="ingredients">
                        {(fields, {add, remove}) => (
                            <>
                                {fields.map(({key, name, ...restField}) => (
                                    <Space key={key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            rules={[{required: true, message: 'Chọn nguyên liệu'}]}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Chọn nguyên liệu"
                                                style={{width: 200}}
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().includes(input.toLowerCase())
                                                }
                                                loading={ingredientsOptions.length === 0}
                                            >
                                                {ingredientsOptions.map(ing => (
                                                    <Option key={ing.id} value={ing.id}>
                                                        {ing.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'quantity']}
                                            rules={[{required: true, message: 'Nhập số lượng'}]}
                                        >
                                            <InputNumber min={0.01} step={0.01} placeholder="Số lượng"/>
                                        </Form.Item>

                                        <Button type="link" danger onClick={() => remove(name)}>
                                            Xóa
                                        </Button>
                                    </Space>
                                ))}

                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        Thêm nguyên liệu
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            {/* Modal thêm mới */}
            <Modal
                visible={addModalVisible}
                title="Thêm công thức mới"
                okText="Thêm"
                cancelText="Hủy"
                onCancel={closeAddModal}
                onOk={() => addForm.submit()}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={onFinishAdd} initialValues={{ingredients: []}}>
                    <Form.Item
                        label="Tên công thức"
                        name="name"
                        rules={[{required: true, message: 'Vui lòng nhập tên công thức'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{required: true, message: 'Vui lòng nhập mô tả'}]}
                    >
                        <Input.TextArea rows={3}/>
                    </Form.Item>

                    <Form.List name="ingredients">
                        {(fields, {add, remove}) => (
                            <>
                                {fields.map(({key, name, ...restField}) => (
                                    <Space key={key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            rules={[{required: true, message: 'Chọn nguyên liệu'}]}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Chọn nguyên liệu"
                                                style={{width: 200}}
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().includes(input.toLowerCase())
                                                }
                                                loading={ingredientsOptions.length === 0}
                                            >
                                                {ingredientsOptions.map(ing => (
                                                    <Option key={ing.id} value={ing.id}>
                                                        {ing.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'quantity']}
                                            rules={[{required: true, message: 'Nhập số lượng'}]}
                                        >
                                            <InputNumber min={0.01} step={0.01} placeholder="Số lượng"/>
                                        </Form.Item>

                                        <Button type="link" danger onClick={() => remove(name)}>
                                            Xóa
                                        </Button>
                                    </Space>
                                ))}

                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        Thêm nguyên liệu
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </>
    );
};

export default RecipeScreen;
