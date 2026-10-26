import { useContext, useEffect } from "react";
import { AuthContext } from "../authContext";
import { login, register, logout, getme } from "../services/authApi";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true);

        try {
            const data = await login({ email, password });

            if (!data?.user) {
                throw new Error("Login response does not contain user data");
            }

            setUser(data.user);
            return data;

        } catch (err) {
            console.error(
                "Login failed:",
                err.response?.data || err.message
            );
            throw err;

        } finally {
            setLoading(false);
        }
    };



    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)

        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data
        } catch (err) {
            console.error("Login failed:", err);
            throw err;
        } finally {
            setLoading(false)
        }

    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getme();
                setUser(data.user);
            } catch (err) {
                console.error("Failed to fetch current user:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, [setUser, setLoading]);

    return { user, loading, handleLogin, handleRegister, handleLogout }
}