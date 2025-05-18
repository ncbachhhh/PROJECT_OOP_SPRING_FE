import './App.css'
import {Route, Routes} from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen.jsx";
import LoginScreen from "./components/LoginScreen/LoginScreen.jsx";
import SignupScreen from "./components/SignupScreen/SignupScreen.jsx";
import MenuScreen from "./components/MenuScreen/MenuScreen.jsx";
import DishDetailScreen from "./components/DishDetailScreen/DishDetailScreen.jsx";
import CartScreen from "./components/CartScreen/CartScreen.jsx";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<WelcomeScreen/>}/>
                <Route path="/login" element={<LoginScreen/>}/>
                <Route path="/signup" element={<SignupScreen/>}/>
                <Route path="/menu" element={<MenuScreen/>}/>
                <Route path="/dish/:id" element={<DishDetailScreen/>}/>
                <Route path="/cart" element={<CartScreen/>}/>
            </Routes>
        </>
    )
}

export default App
