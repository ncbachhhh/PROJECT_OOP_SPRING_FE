import React from 'react';
import {Layout} from 'antd';
import {Outlet} from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar.jsx';
import AdminHeader from "../AdminHeader/AdminHeader.jsx";

const {Sider, Content, Header} = Layout;

const AdminLayout = () => {
    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider width={240} style={{background: '#fff'}}>
                <AdminSidebar/>
            </Sider>

            <Layout>
                <Header style={{
                    background: '#fff',
                    padding: 0,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <AdminHeader/>
                </Header>

                <Content style={{padding: 24, background: '#f0f2f5'}}>
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
