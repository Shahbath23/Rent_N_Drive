import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function PrivateRoute({ children, permittedRoles }) {
    const { userState } = useContext(AuthContext);

    console.log("PrivateRoute User State:", userState);
    console.log("Role Check:", userState.user?.role);

    if (!userState.isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (!permittedRoles.includes(userState.user?.role)) {
        console.log(userState.role)
        return <p>Unauthorized Access</p>; // Replace with custom unauthorized message or redirection
    }

    return children;
}
