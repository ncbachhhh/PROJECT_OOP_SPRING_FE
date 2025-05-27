import React, {useEffect, useState} from 'react';
import {Button, Form, Input, Modal, Select, Table, Typography} from 'antd';
import axios from 'axios';
import "./UserList.css";
import {useNotify} from "../../contexts/NotificationContext.jsx";

const {Title} = Typography;
const {Option} = Select;

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const notify = useNotify();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/oop/staff/get/users');
            if (res.data.code === 200) {
                setUsers(res.data.result);
            } else {
                notify.error({message: 'Lỗi khi tải danh sách người dùng: ' + res.data.message, duration: 1.5});
            }
        } catch (error) {
            notify.error({message: 'Lỗi khi gọi API: ' + error.message, duration: 1.5});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (values) => {
        try {
            if (editingUser) {
                // Update user, bỏ password nếu không có
                const payload = {...values};
                if (!payload.password) delete payload.password;

                const res = await axios.post(`http://localhost:8080/oop/staff/update/${editingUser.id}`, payload);
                if (res.data.code === 200) {
                    notify.success({message: 'Cập nhật người dùng thành công!', duration: 1.5});
                } else {
                    notify.error({message: 'Cập nhật thất bại: ' + res.data.message, duration: 1.5});
                    return;
                }
            } else {
                const res = await axios.post('http://localhost:8080/oop/staff/create', values);
                if (res.data.code === 200) {
                    notify.success({message: 'Thêm người dùng thành công!', duration: 1.5});
                } else {
                    notify.error({message: 'Thêm người dùng thất bại: ' + res.data.message, duration: 1.5});
                    return;
                }
            }
            form.resetFields();
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            notify.error({message: 'Lỗi khi gửi dữ liệu: ' + error.message, duration: 1.5});
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
        form.setFieldsValue({
            username: user.username,
            role: user.role,
            address: user.address,
            phone: user.phone,
            email: user.email,
            status: user.status || 'Đang hoạt động',
        });
    };

    const columns = [
        {title: 'ID', dataIndex: 'id', key: 'id', ellipsis: true},
        {title: 'Tên người dùng', dataIndex: 'username', key: 'username'},
        {title: 'Trạng thái', dataIndex: 'status', key: 'status'},
        {title: 'Vai trò', dataIndex: 'role', key: 'role'},
        {title: 'Số điện thoại', dataIndex: 'phone', key: 'phone'},
        {title: 'Email', dataIndex: 'email', key: 'email'},
        {title: 'Địa chỉ', dataIndex: 'address', key: 'address'},
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
            ),
        },
    ];

    return (
        <div className="user-list-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Title level={3} className="user-list-title">Danh sách người dùng</Title>
                <Button
                    type="primary"
                    onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Thêm người dùng
                </Button>
            </div>

            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                bordered
                pagination={{pageSize: 10}}
            />

            <Modal
                title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item name="username" label="Tên người dùng" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                {required: true, message: 'Vui lòng nhập mật khẩu!'},
                                {
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                                    message: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt!'
                                }
                            ]}
                        >
                            <Input.Password placeholder="Mật khẩu của bạn" size="large"/>
                        </Form.Item>

                    )}

                    <Form.Item name="role" label="Vai trò" rules={[{required: true}]}>
                        <Select>
                            <Option value="MANAGER">MANAGER</Option>
                            <Option value="CHEF">CHEF</Option>
                            <Option value="CASHIER">CASHIER</Option>
                            <Option value="CUSTOMER">CUSTOMER</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{required: true, type: 'email'}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserList;
