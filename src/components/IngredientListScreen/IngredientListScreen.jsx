import React, {useEffect, useState} from 'react';
import {Button, Form, Input, InputNumber, Modal, Select, Table} from 'antd';
import axios from 'axios';
import {useNotify} from "../../contexts/NotificationContext.jsx";

const {Option} = Select;
const {confirm} = Modal;

const IngredientListScreen = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Modal edit
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editIngredient, setEditIngredient] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [form] = Form.useForm();
    const notify = useNotify();

    // Modal add
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addForm] = Form.useForm();

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/oop/ingredient/get/ingredients');
            if (res.data.code === 200) {
                setIngredients(res.data.result);
            } else {
                notify.error({message: 'Lỗi tải danh sách nguyên liệu'});
            }
        } catch (error) {
            notify.error({message: 'Lỗi kết nối server'});
        } finally {
            setLoading(false);
        }
    };

    // Khi editIngredient thay đổi, update form fields
    useEffect(() => {
        if (editIngredient) {
            form.setFieldsValue({
                name: editIngredient.name,
                unitWeight: editIngredient.unitWeight,
                type: editIngredient.type,
                minimumAmount: editIngredient.minimumAmount,
            });
        }
    }, [editIngredient, form]);

    const handleEdit = (record) => {
        setEditIngredient(record);
        setEditModalVisible(true);
    };

    const handleDelete = (record) => {
        confirm({
            title: 'Xác nhận',
            content: `Bạn có chắc muốn xóa nguyên liệu "${record.name}" không?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                setDeletingId(record.id);
                try {
                    await axios.delete(`http://localhost:8080/oop/ingredient/delete/${record.id}`);
                    notify.success({message: 'Xóa nguyên liệu thành công'});
                    await fetchIngredients();
                } catch (error) {
                    notify.error({message: 'Xóa nguyên liệu thất bại'});
                } finally {
                    setDeletingId(null);
                }
            },
        });
    };

    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            const res = await axios.put(`http://localhost:8080/oop/ingredient/update/${editIngredient.id}`, values);
            if (res.data.code === 200) {
                notify.success({message: 'Cập nhật nguyên liệu thành công'});
                setEditModalVisible(false);
                fetchIngredients();
            } else {
                notify.error({message: res.data.message || 'Cập nhật thất bại'});
            }
        } catch (error) {
            notify.error({message: 'Lỗi khi cập nhật nguyên liệu'});
        } finally {
            setEditLoading(false);
        }
    };

    const handleAddSubmit = async (values) => {
        setAddLoading(true);
        try {
            const res = await axios.post('http://localhost:8080/oop/ingredient/create', values);
            if (res.data.code === 200) {
                notify.success({message: 'Thêm nguyên liệu thành công'});
                setAddModalVisible(false);
                addForm.resetFields();
                fetchIngredients();
            } else {
                notify.error({message: res.data.message || 'Thêm thất bại'});
            }
        } catch (error) {
            notify.error({message: 'Lỗi khi thêm nguyên liệu'});
        } finally {
            setAddLoading(false);
        }
    };

    const columns = [
        {title: 'ID', dataIndex: 'id', key: 'id', width: 250, ellipsis: true},
        {title: 'Tên', dataIndex: 'name', key: 'name', width: 180},
        {title: 'Loại', dataIndex: 'type', key: 'type', width: 120},
        {title: 'Đơn vị cân', dataIndex: 'unitWeight', key: 'unitWeight', width: 120},
        {
            title: 'Sửa',
            key: 'edit',
            width: 80,
            render: (_, record) => (
                <Button type="link" onClick={() => handleEdit(record)}>
                    Sửa
                </Button>
            ),
        },
        {
            title: 'Xóa',
            key: 'delete',
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
        <div style={{padding: 24, background: '#fff', minHeight: 360}}>
            <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
                <h2 style={{margin: 0}}>Danh sách nguyên liệu</h2>
                <Button type="primary" onClick={() => setAddModalVisible(true)}>
                    Thêm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={ingredients}
                rowKey="id"
                loading={loading}
                pagination={{pageSize: 10}}
                scroll={{x: 900}}
            />

            {/* Modal sửa */}
            <Modal
                visible={editModalVisible}
                title={`Sửa nguyên liệu: ${editIngredient?.name || ''}`}
                okText="Lưu"
                cancelText="Hủy"
                onCancel={() => setEditModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={editLoading}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
                    <Form.Item
                        label="Tên"
                        name="name"
                        rules={[{required: true, message: 'Vui lòng nhập tên nguyên liệu'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Đơn vị cân"
                        name="unitWeight"
                        rules={[{required: true, message: 'Vui lòng nhập đơn vị cân'}]}
                    >
                        <InputNumber min={0.01} style={{width: '100%'}}/>
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="type"
                        rules={[{required: true, message: 'Vui lòng chọn loại'}]}
                    >
                        <Select placeholder="Chọn loại">
                            <Option value="Hải_Sản">Hải Sản</Option>
                            <Option value="Rau_Củ">Rau Củ</Option>
                            <Option value="Trái_Cây">Trái Cây</Option>
                            <Option value="Thịt">Thịt</Option>
                            <Option value="Gia_Vị">Gia Vị</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số lượng tối thiểu"
                        name="minimumAmount"
                        rules={[{required: true, message: 'Vui lòng nhập số lượng tối thiểu'}]}
                    >
                        <InputNumber min={0.01} style={{width: '100%'}}/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal thêm mới */}
            <Modal
                visible={addModalVisible}
                title="Thêm mới nguyên liệu"
                okText="Thêm"
                cancelText="Hủy"
                onCancel={() => setAddModalVisible(false)}
                onOk={() => addForm.submit()}
                confirmLoading={addLoading}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
                    <Form.Item
                        label="Tên"
                        name="name"
                        rules={[{required: true, message: 'Vui lòng nhập tên nguyên liệu'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Đơn vị cân"
                        name="unitWeight"
                        rules={[{required: true, message: 'Vui lòng nhập đơn vị cân'}]}
                    >
                        <InputNumber min={0.01} style={{width: '100%'}}/>
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="type"
                        rules={[{required: true, message: 'Vui lòng chọn loại'}]}
                    >
                        <Select placeholder="Chọn loại">
                            <Option value="Hải_Sản">Hải Sản</Option>
                            <Option value="Rau_Củ">Rau Củ</Option>
                            <Option value="Trái_Cây">Trái Cây</Option>
                            <Option value="Thịt">Thịt</Option>
                            <Option value="Gia_Vị">Gia Vị</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số lượng tối thiểu"
                        name="minimumAmount"
                        rules={[{required: true, message: 'Vui lòng nhập số lượng tối thiểu'}]}
                    >
                        <InputNumber min={0.01} style={{width: '100%'}}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default IngredientListScreen;
