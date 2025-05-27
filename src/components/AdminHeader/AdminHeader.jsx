import React, {useContext, useState} from 'react';
import {Button, Form, Input, Modal, Typography} from 'antd';
import axios from 'axios';
import {UserContext} from "../../contexts/UserContext.jsx";
import {useNotify} from "../../contexts/NotificationContext.jsx";

const {Text} = Typography;

const Header = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showLoginModal = () => setIsModalVisible(true);
    const handleCancel = () => setIsModalVisible(false);

    const {user, setUser, logout} = useContext(UserContext);
    const notify = useNotify();

    const onFinish = async (values) => {
        try {
            const res = await axios.post('http://localhost:8080/oop/staff/login', {
                phone: values.phone,
                password: values.password,
            });

            if (res.data.code === 200) {
                localStorage.setItem('user', JSON.stringify(res.data.result));
                setUser(res.data.result);
                notify.success({message: 'Đăng nhập thành công', duration: 1});
                setIsModalVisible(false);
            } else {
                notify.error({message: res.data.message || 'Đăng nhập thất bại', duration: 1});
            }
        } catch (error) {
            notify.error({message: 'Lỗi hệ thống', duration: 1});
        }
    };

    const handleLogout = () => {
        logout();
        notify.info({message: 'Đã đăng xuất', duration: 1});
    };

    return (
        <>
            <div style={{
                padding: 10,
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12
            }}>
                {!user ? (
                    <Button type="primary" onClick={showLoginModal}>
                        Đăng nhập
                    </Button>
                ) : (
                    <>
                        <Text strong>{user.username}</Text>
                        <Text type="secondary" italic>({user.role})</Text>
                        <Button type="default" onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </>
                )}
            </div>

            <Modal title="Đăng nhập" visible={isModalVisible} onCancel={handleCancel} footer={null}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{required: true, message: 'Vui lòng nhập số điện thoại'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{required: true, message: 'Vui lòng nhập mật khẩu'}]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Header;
