import React, {useContext} from 'react';
import {Button, Form, Input, Typography} from 'antd';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import './LoginScreen.css';
import axios from "axios";
import {SERVER_URL} from "../../constant/Constant.jsx";
import {UserContext} from "../../contexts/UserContext.jsx";
import {useNotify} from "../../contexts/NotificationContext.jsx";

const {Text} = Typography;
const LoginScreen = () => {
    const {setUser} = useContext(UserContext);
    const notify = useNotify();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const response = await axios.post(`${SERVER_URL}/customer/login`, values);
        if (response.data.code === 200) {
            setUser(response.data.result);
            notify.success({message: response.data.message, duration: 1});
            navigate('/');
        } else {
            notify.error({message: response.data.message, duration: 1});
        }
    };

    return (
        <div className="login-container">
            <div className="back-button" onClick={() => navigate(-1)}>
                <ArrowLeftOutlined style={{fontSize: '20px'}}/>
            </div>

            <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
                className="login-form"
            >
                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{required: true, message: 'Vui lòng nhập số điện thoại!'}]}

                >
                    <Input placeholder="Số điện thoại *" size="large"/>
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{required: true, message: 'Vui lòng nhập mật khẩu!'}]}

                >
                    <Input.Password placeholder="Mật khẩu của bạn" size="large"/>
                </Form.Item>

                <div className="link-right" onClick={() => navigate("/signup")}>
                    <Text strong type="secondary" style={{cursor: 'pointer'}}>
                        Chưa có tài khoản?
                    </Text>
                </div>

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

export default LoginScreen;
