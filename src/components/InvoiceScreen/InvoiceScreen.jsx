import React, {useEffect, useState} from 'react';
import {Button, Popconfirm, Table} from 'antd';
import axios from 'axios';
import {useNotify} from "../../contexts/NotificationContext.jsx";

const InvoiceScreen = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const notify = useNotify();

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8080/oop/invoice/get/unpaid');
            if (res.data.code === 200) {
                setInvoices(res.data.result);
            } else {
                notify.error({
                    message: 'Lỗi',
                    description: 'Lấy danh sách hóa đơn thất bại: ' + res.data.message,
                    placement: 'topRight',
                    duration: 2,
                });
            }
        } catch (error) {
            notify.error({
                message: 'Lỗi',
                description: 'Lỗi khi gọi API: ' + error.message,
                placement: 'topRight',
                duration: 2,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const confirmInvoice = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/oop/invoice/complete/${id}`);
            if (res.data.code === 200) {
                notify.success({
                    message: 'Thành công',
                    description: 'Xác nhận hóa đơn thành công',
                    placement: 'topRight',
                    duration: 2,
                });
                fetchInvoices();
            } else {
                notify.error({
                    message: 'Thất bại',
                    description: 'Xác nhận thất bại: ' + res.data.message,
                    placement: 'topRight',
                    duration: 2,
                });
            }
        } catch (error) {
            notify.error({
                message: 'Lỗi',
                description: 'Lỗi khi xác nhận: ' + error.message,
                placement: 'topRight',
                duration: 2,
            });
        }
    };

    const deleteInvoice = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/oop/invoice/delete/${id}`);
            if (res.data.code === 200) {
                notify.success({
                    message: 'Thành công',
                    description: 'Xóa hóa đơn thành công',
                    placement: 'topRight',
                    duration: 2,
                });
                fetchInvoices();
            } else {
                notify.error({
                    message: 'Thất bại',
                    description: 'Xóa thất bại: ' + res.data.message,
                    placement: 'topRight',
                    duration: 2,
                });
            }
        } catch (error) {
            notify.error({
                message: 'Lỗi',
                description: 'Lỗi khi xóa: ' + error.message,
                placement: 'topRight',
                duration: 2,
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date',
            key: 'date',
            render: (text) =>
                new Date(text).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPay',
            key: 'totalPay',
            render: (value) =>
                value.toLocaleString('vi-VN', {style: 'currency', currency: 'VND'}),
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            key: 'method',
            render: (text) => {
                const map = {
                    TIEN_MAT: 'Tiền mặt',
                    CHUYEN_KHOAN: 'Chuyển khoản',
                    MOMO: 'Momo',
                    ZALO_PAY: 'ZaloPay',
                };
                return map[text] || text;
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <>
                    <Button
                        type="primary"
                        style={{marginRight: 8}}
                        onClick={() => confirmInvoice(record.id)}
                    >
                        Xác nhận
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa hóa đơn này?"
                        onConfirm={() => deleteInvoice(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div style={{padding: 24}}>
            <h2>Danh sách hóa đơn chưa thanh toán</h2>
            <Table
                columns={columns}
                dataSource={invoices}
                rowKey="id"
                loading={loading}
                pagination={{pageSize: 10}}
                bordered
            />
        </div>
    );
};

export default InvoiceScreen;
