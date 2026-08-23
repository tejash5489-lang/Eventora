import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-brand-ink shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    <Link to="/" className="text-white text-3xl font-display tracking-wide flex items-center gap-2 hover:text-brand-gold transition-colors">
                        <FaTicketAlt className="text-2xl text-brand-gold" /> Eventora
                    </Link>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <Link to="/" className="text-gray-200 hover:text-brand-gold transition-colors cursor-pointer">Events</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-200 hover:text-brand-gold transition-colors">Dashboard</Link>
                                <button onClick={handleLogout} className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-md transition active:scale-95">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-200 hover:text-brand-gold transition-colors">Login</Link>
                                <Link to="/register" className="bg-brand-gold hover:bg-brand-gold-dark text-brand-ink px-4 py-2 rounded-md font-bold transition active:scale-95">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;