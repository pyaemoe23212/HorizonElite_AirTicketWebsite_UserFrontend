import { Link } from 'react-router';

function Navbar() {
    return (
        <nav className="navbar bg-blue-600 text-white p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">
                <Link to="/">Air Ticket Booking</Link>
            </h1>
            <ul className="flex gap-6">
                <li>
                    <Link to="/" className="hover:text-blue-200">Home</Link>
                </li>
                <li>
                    <Link to="/flights/search" className="hover:text-blue-200">Search Flights</Link>
                </li>
                <li>
                    <Link to="/signin" className="hover:text-blue-200">Sign In</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;