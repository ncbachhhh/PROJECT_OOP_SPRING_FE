import './App.css'
import {Route, Routes} from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen.jsx";
import LoginScreen from "./components/LoginScreen/LoginScreen.jsx";
import SignupScreen from "./components/SignupScreen/SignupScreen.jsx";
import MenuScreen from "./components/MenuScreen/MenuScreen.jsx";
import DishDetailScreen from "./components/DishDetailScreen/DishDetailScreen.jsx";
import CartScreen from "./components/CartScreen/CartScreen.jsx";
import AdminLayout from "./components/AdminLayout/AdminLayout.jsx";
import OrderReceiveScreen from "./components/OrderReceiveScreen/OrderReceiveScreen.jsx";
import OrderDetailScreen from "./components/OrderDetailScreen/OrderDetailScreen.jsx";
import IngredientListScreen from "./components/IngredientListScreen/IngredientListScreen.jsx";
import StockScreen from "./components/StockScreen/StockScreen.jsx";
import RecipeScreen from "./components/RecipeScreen/RecipeScreen.jsx";
import UserList from "./components/UserList/UserList.jsx";
import DishScreen from "./components/DishScreen/DishScreen.jsx";
import OrderScreen from "./components/OrderViewScreen/OrderViewScreen.jsx";
import InvoiceScreen from "./components/InvoiceScreen/InvoiceScreen.jsx";

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
                <Route path="/order" element={<OrderScreen/>}/>

                <Route path="/admin" element={
                    <AdminLayout/>
                }>
                    <Route path="orders" element={<OrderReceiveScreen/>}/>
                    <Route path="orders/:orderId" element={<OrderDetailScreen/>}/>
                    <Route path="ingredients" element={<IngredientListScreen/>}/>
                    <Route path="warehouse" element={<StockScreen/>}/>
                    <Route path="recipes" element={<RecipeScreen/>}/>
                    <Route path="users" element={<UserList/>}/>
                    <Route path="dishes" element={<DishScreen/>}/>
                    <Route path="invoices" element={<InvoiceScreen/>}/>
                </Route>
            </Routes>
        </>
    )
}

export default App
