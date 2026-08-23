import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import api from '../utils/axios';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const statusStyles = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
};

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const { showToast, confirm } = useUI();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState(null);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleCancel = async (id) => {
        const ok = await confirm('You can rebook later if seats are still available.', { title: 'Cancel this booking?', confirmText: 'Cancel Booking', danger: true });
        if (!ok) return;
        setCancelingId(id);
        try {
            await api.delete(`/bookings/${id}`);
            showToast('Booking cancelled.');
            fetchBookings();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to cancel booking', 'error');
        } finally {
            setCancelingId(null);
        }
    };

    return (
        <section className="flex flex-col gap-8">
            <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-gold-soft flex items-center justify-center text-2xl font-bold text-brand-gold-dark">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                    <h1 className="font-display text-3xl tracking-wide text-gray-900">Welcome, {user?.name}!</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> User Dashboard
                    </p>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <FaTicketAlt className="text-brand-gold-dark" /> My Bookings requests
                </h2>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                        <p className="text-center text-gray-500">Loading your bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-300">
                                <FaTicketAlt />
                            </div>
                            <p className="text-gray-500">You haven't booked any events yet.</p>
                            <Link
                                to="/"
                                className="bg-brand-ink hover:bg-black text-white font-semibold px-6 py-2.5 rounded-lg transition active:scale-[0.98]"
                            >
                                Browse Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.map((booking, i) => {
                            const event = booking.eventId;
                            const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
                            return (
                                <div
                                    key={booking._id}
                                    className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex"
                                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                                >
                                    <div className="w-28 shrink-0 bg-gray-100">
                                        {event?.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase p-2 text-center">
                                                {event?.category || 'Event'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-gray-900 truncate min-w-0" title={event?.title}>
                                                {event?.title || 'Deleted event'}
                                            </h3>
                                            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusStyles[booking.status]}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {event && (
                                            <div className="flex flex-col gap-1 text-sm text-gray-500 mb-3">
                                                <span className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-gray-400 shrink-0" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                                                    <span className="truncate">{event.location}</span>
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm">
                                                <span className="font-semibold text-gray-800">{booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</span>
                                                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {booking.paymentStatus === 'paid' ? 'PAID' : 'NOT PAID'}
                                                </span>
                                            </div>
                                            {canCancel && (
                                                <button
                                                    disabled={cancelingId === booking._id}
                                                    onClick={() => handleCancel(booking._id)}
                                                    className="text-red-600 hover:bg-red-50 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                                >
                                                    {cancelingId === booking._id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default UserDashboard;
