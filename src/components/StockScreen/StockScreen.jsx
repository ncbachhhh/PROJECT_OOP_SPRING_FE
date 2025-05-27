import React, {useEffect, useState} from "react";
import {Button, DatePicker, Form, InputNumber, Modal, notification, Select, Table,} from "antd";
import axios from "axios";
import moment from "moment";

const {Option} = Select;

const StockScreen = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Modal sửa
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editIngredient, setEditIngredient] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm] = Form.useForm();

    // Modal thêm mới (tồn kho)
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addForm] = Form.useForm();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id;

    const fetchIngredientsWithStock = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                "http://localhost:8080/oop/ingredient/get/ingredients"
            );
            if (res.data.code !== 200) {
                notification.error({message: "Lỗi tải danh sách nguyên liệu"});
                setLoading(false);
                return;
            }
            const ingredients = res.data.result;

            const ingredientsWithStock = await Promise.all(
                ingredients.map(async (item) => {
                    try {
                        const stockRes = await axios.get(
                            `http://localhost:8080/oop/inventory-item/remaining-quantity/${item.id}`
                        );
                        if (stockRes.data.code === 200) {
                            return {
                                ...item,
                                remainingQuantity: stockRes.data.result ?? 0,
                            };
                        }
                        return {...item, remainingQuantity: 0};
                    } catch {
                        return {...item, remainingQuantity: 0};
                    }
                })
            );

            setIngredients(ingredientsWithStock);
        } catch (error) {
            notification.error({message: "Lỗi kết nối server"});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredientsWithStock();
    }, []);

    // Mở modal sửa + set form
    const handleEdit = (record) => {
        setEditIngredient(record);
        editForm.setFieldsValue({
            quantity: record.remainingQuantity || 0,
            expirationDate: record.expirationDate ? moment(record.expirationDate) : null,
        });
        setEditModalVisible(true);
    };

    // Submit modal sửa
    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            const inventoryItemId = editIngredient.inventoryItemId || editIngredient.id;
            const payload = {
                quantity: values.quantity,
                expirationDate: values.expirationDate
                    ? values.expirationDate.format("YYYY-MM-DD")
                    : null,
            };

            const res = await axios.post(
                `http://localhost:8080/oop/inventory-item/update/${inventoryItemId}`,
                payload
            );
            if (res.data.code === 200) {
                notification.success({message: "Cập nhật tồn kho thành công"});
                setEditModalVisible(false);
                fetchIngredientsWithStock();
            } else {
                notification.error({message: res.data.message || "Cập nhật thất bại"});
            }
        } catch {
            notification.error({message: "Lỗi khi cập nhật tồn kho"});
        } finally {
            setEditLoading(false);
        }
    };

    // Xóa nguyên liệu
    const handleDelete = (record) => {
        Modal.confirm({
            title: "Xác nhận",
            content: `Bạn có chắc muốn xóa nguyên liệu "${record.name}" không?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                setDeletingId(record.id);
                try {
                    await axios.delete(
                        `http://localhost:8080/oop/ingredient/delete/${record.id}`
                    );
                    notification.success({message: "Xóa nguyên liệu thành công"});
                    fetchIngredientsWithStock();
                } catch {
                    notification.error({message: "Xóa nguyên liệu thất bại"});
                } finally {
                    setDeletingId(null);
                }
            },
        });
    };

    // Mở modal thêm mới tồn kho
    const openAddModal = () => {
        addForm.resetFields();
        setAddModalVisible(true);
    };

    // Submit modal thêm tồn kho
    const handleAddSubmit = async (values) => {
        if (!userId) {
            notification.error({
                message: "Không tìm thấy người dùng, vui lòng đăng nhập lại",
            });
            return;
        }
        setAddLoading(true);
        try {
            const payload = {
                ingredientId: values.ingredientId,
                quantity: values.quantity,
                expirationDate: values.expirationDate
                    ? values.expirationDate.format("YYYY-MM-DD")
                    : null,
                userId,
            };

            const res = await axios.post(
                "http://localhost:8080/oop/inventory-item/create",
                payload
            );

            if (res.data.code === 200) {
                notification.success({message: "Thêm tồn kho thành công"});
                setAddModalVisible(false);
                fetchIngredientsWithStock();
            } else {
                notification.error({message: res.data.message || "Thêm thất bại"});
            }
        } catch {
            notification.error({message: "Lỗi khi thêm tồn kho"});
        } finally {
            setAddLoading(false);
        }
    };

    const columns = [
        {title: "ID", dataIndex: "id", key: "id", width: 300, ellipsis: true},
        {title: "Tên nguyên liệu", dataIndex: "name", key: "name", width: 250},
        {
            title: "Tồn dư",
            dataIndex: "remainingQuantity",
            key: "remainingQuantity",
            width: 150,
            render: (qty) => qty ?? 0,
        },
        {
            title: "Sửa",
            key: "edit",
            width: 80,
            render: (_, record) => (
                <Button type="link" onClick={() => handleEdit(record)}>
                    Sửa
                </Button>
            ),
        },
        {
            title: "Xóa",
            key: "delete",
            width: 80,
            render: (_, record) => (
                <Button
                    type="link"
                    danger
                    loading={deletingId === record.id}
                    onClick={() => handleDelete(record)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <div style={{padding: 24, background: "#fff", minHeight: 360}}>
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <h2 style={{margin: 0}}>Tồn dư nguyên liệu</h2>
                <Button type="primary" onClick={openAddModal}>
                    Thêm tồn kho
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={ingredients}
                loading={loading}
                rowKey="id"
                pagination={{pageSize: 10}}
                scroll={{x: 900}}
            />

            {/* Modal sửa */}
            <Modal
                visible={editModalVisible}
                title={`Chỉnh tồn kho: ${editIngredient?.name || ""}`}
                okText="Lưu"
                cancelText="Hủy"
                onCancel={() => setEditModalVisible(false)}
                onOk={() => editForm.submit()}
                confirmLoading={editLoading}
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
                    <Form.Item
                        label="Số lượng tồn kho"
                        name="quantity"
                        rules={[{required: true, message: "Vui lòng nhập số lượng tồn kho"}]}
                    >
                        <InputNumber min={0} style={{width: "100%"}}/>
                    </Form.Item>

                    <Form.Item label="Ngày hết hạn" name="expirationDate">
                        <DatePicker style={{width: "100%"}}/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal thêm mới */}
            <Modal
                visible={addModalVisible}
                title="Thêm tồn kho mới"
                okText="Thêm"
                cancelText="Hủy"
                onCancel={() => setAddModalVisible(false)}
                onOk={() => addForm.submit()}
                confirmLoading={addLoading}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
                    <Form.Item
                        label="Nguyên liệu"
                        name="ingredientId"
                        rules={[{required: true, message: "Vui lòng chọn nguyên liệu"}]}
                    >
                        <Select placeholder="Chọn nguyên liệu">
                            {ingredients.map((item) => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số lượng tồn kho"
                        name="quantity"
                        rules={[{required: true, message: "Vui lòng nhập số lượng tồn kho"}]}
                    >
                        <InputNumber min={0} style={{width: "100%"}}/>
                    </Form.Item>

                    <Form.Item label="Ngày hết hạn" name="expirationDate">
                        <DatePicker style={{width: "100%"}}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StockScreen;
