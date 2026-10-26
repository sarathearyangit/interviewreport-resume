import { createBrowserRouter } from "react-router-dom"
import Login from "./features/auth/pages/Login"
import Regsiter from "./features/auth/pages/Regsiter"
import App from "./App"
import Protected from "./features/auth/component/Protected"
import Home from "./features/ai/pages/Home"
import Interview from "./features/ai/pages/Interview"

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Regsiter />
    },
    {
        path: '/',
        element: <Protected><Home /></Protected>
    },
    {
        path: '/interview/:interviewId',
        element: <Protected><Interview /></Protected>
    }
])