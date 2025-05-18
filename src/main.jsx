import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {UserProvider} from "./contexts/UserContext.jsx";
import {NotificationProvider} from "./contexts/NotificationContext.jsx";

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <UserProvider>
            <NotificationProvider>
                <App/>
            </NotificationProvider>
        </UserProvider>
    </BrowserRouter>
)
