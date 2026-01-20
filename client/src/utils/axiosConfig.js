import axios from 'axios';

const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 400)) {
                // Clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                
                // Redirect to login page
                // Using window.location to ensure a full refresh/redirect outside of React Router context if needed,
                // though React Router's navigate is preferred if inside a component. 
                // Since this is a global utility, window.location is safer to guarantee redirect.
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;
