import { Link } from 'react-router-dom';
import './style.css'; // Import the CSS file

const NotFound = () => {
    return (
        <div className="not-found-container">
            <img src="https://via.placeholder.com/400" alt="Not Found" />
            <h1>404</h1>
            <p>Oops! The page you're looking for doesn't exist.</p>
            <Link className="btn" to="/">Go Back Home</Link>
        </div>
    );
};

export default NotFound;