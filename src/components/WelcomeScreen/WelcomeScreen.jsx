import React, {useContext} from 'react';
import './WelcomeScreen.css';
import {useNavigate} from 'react-router-dom';
import {UserContext} from '../../contexts/UserContext.jsx';

function WelcomeScreen() {
    const navigate = useNavigate();
    const {user, logout} = useContext(UserContext);

    const firstName = user?.username?.trim().split(" ").pop();

    return (
        <div className="welcome-container">
            {user && (
                <div className="logout-button" onClick={() => {
                    logout();
                    navigate('/');
                }}>
                    Đăng xuất
                </div>
            )}

            <img className="welcome-image" src="/logo.svg" alt="logo"/>

            <div className="welcome-des">
                <h2>Kính chào quý khách <span>{firstName}</span></h2>
                <p>Chúng tôi sẽ có trả đồ cho bạn tại bàn</p>
            </div>

            {
                !user
                    ?
                    <div className="welcome-point" onClick={() => navigate('/login')}>
                        <img src="/Tichdiem.svg" alt="Tích điểm"/>
                        <p>Đăng nhập để tích điểm</p>
                    </div> :
                    <>
                        <div className="welcome-point" onClick={() => navigate('/')}>
                            <p>Bạn có {user.point} điểm</p>
                            <img src="/ngoisao.svg" alt="Tích điểm"/>
                        </div>
                        <div className="welcome-point" onClick={() => navigate('/')}>
                            <p>Theo dõi món ăn</p>
                            <img src="/orderview.svg" alt="Tích điểm"/>
                        </div>
                    </>
            }

            <div className="welcome-menu" onClick={() => navigate('/menu')}>
                <div className="welcome-menu-title">
                    <p>Xem MENU</p>
                    <span><i className="fa-solid fa-chevron-right"></i></span>
                </div>
                <img src="/serve.svg" alt="Serve"/>
            </div>
        </div>
    );
}

export default WelcomeScreen;
