import React from 'react';
import {Button, Form, Input} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import './SignupScreen.css';
import {useNotify} from "../../contexts/NotificationContext.jsx";
import {SERVER_URL} from "../../constant/Constant.jsx";
import axios from "axios";

const SignupScreen = () => {
    const navigate = useNavigate();
    const notify = useNotify();

    const onFinish = async (values) => {
        const response = await axios.post(`${SERVER_URL}/customer/register`, values);
        if (response.data.code === 200) {
            notify.success({message: response.data.message, duration: 1});
            navigate('/login');
        } else {
            notify.error({message: response.data.message, duration: 1});
        }
    };

    return (
        <div className="signup-container">
            <div className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeftOutlined style={{fontSize: '20px'}}/>
            </div>

            <Form
                name="signup"
                onFinish={onFinish}
                layout="vertical"
                className="signup-form"
            >
                <Form.Item
                    label="Tên"
                    name="username"
                    rules={[{required: true, message: 'Vui lòng nhập họ và tên!'}]}
                >
                    <Input size="large" placeholder="Họ và tên"/>
                </Form.Item>

                <Form.Item
                    label="SĐT"
                    name="phone"
                    rules={[{required: true, message: 'Vui lòng nhập số điện thoại!'}]}
                >
                    <Input size="large" placeholder="Số điện thoại"/>
                </Form.Item>

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


                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {required: true, message: 'Vui lòng nhập email!'},
                        {type: 'email', message: 'Email không hợp lệ!'}
                    ]}
                >
                    <Input size="large" placeholder="Email"/>
                </Form.Item>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{required: true, message: 'Vui lòng nhập địa chỉ!'}]}
                >
                    <Input size="large" placeholder="Địa chỉ"/>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="submit-btn"
                    >
                        Xác nhận
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SignupScreen;
