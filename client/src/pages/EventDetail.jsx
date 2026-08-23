import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaPen } from 'react-icons/fa';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please verify to confirm booking.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp });
                setSuccessMsg('Booking requested! Awaiting admin confirmation.');
                setShowOTP(false);
                // Update local seats count dynamically after booking
                setEvent({ ...event, availableSeats: event.availableSeats - 1 });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-semibold">Loading...</div>;
    if (error && !event) return <div className="text-center py-20 text-xl text-red-500">{error || 'Event not found'}</div>;

    const isSoldOut = event.availableSeats <= 0;

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
            <div className="relative">
                {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-80 object-cover" />
                ) : (
                    <div className="w-full h-64 bg-brand-ink flex items-center justify-center text-brand-gold/40 text-6xl font-display tracking-widest">
                        {event.category}
                    </div>
                )}
                {user?.role === 'admin' && (
                    <button
                        onClick={() => navigate('/admin', { state: { editEventId: event._id } })}
                        className="absolute top-4 right-4 bg-white/95 hover:bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg shadow-md transition flex items-center gap-1.5"
                    >
                        <FaPen className="text-xs" /> Edit Event
                    </button>
                )}
            </div>

            <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                    <div>
                        <div className="inline-block bg-brand-gold-soft text-brand-gold-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                            {event.category}
                        </div>
                        <h1 className="font-display text-5xl tracking-wide text-gray-900 mb-4">{event.title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">{event.description}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl border border-gray-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold-soft flex items-center justify-center text-brand-gold-dark shrink-0">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 uppercase">Ticket Price</p>
                                        <p className="font-bold text-gray-800 text-lg">{event.ticketPrice === 0 ? <span className="text-green-500">Free</span> : `₹${event.ticketPrice}`}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold-soft flex items-center justify-center text-brand-gold-dark shrink-0">
                                        <FaChair />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 uppercase">Availability</p>
                                        <p className="font-bold text-gray-800">
                                            <span className={event.availableSeats < 10 ? 'text-orange-500' : ''}>{event.availableSeats}</span> / {event.totalSeats}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold-soft flex items-center justify-center text-brand-gold-dark shrink-0">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 uppercase">Date</p>
                                        <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-600">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold-soft flex items-center justify-center text-brand-gold-dark shrink-0">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400 uppercase">Location</p>
                                        <p className="font-bold text-gray-800">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-divider mx-6" style={{ '--notch-bg': '#ffffff' }}></div>

                        <div className="p-6 pt-8">
                            {showOTP && (
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP to Confirm</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="6-digit code"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-gold transition shadow-sm font-bold tracking-widest text-center text-lg"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg active:scale-[0.98] ${isSoldOut || (successMsg && !showOTP)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-brand-gold hover:bg-brand-gold-dark text-brand-ink hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                {bookingLoading ? 'Processing...' : (showOTP ? 'Verify OTP & Confirm' : (successMsg && !showOTP ? 'Request Sent' : (isSoldOut ? 'Sold Out' : 'Confirm Registration')))}
                            </button>
                            {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
                            {successMsg && <p className="text-green-600 mt-4 text-center font-medium bg-green-50 p-2 rounded">{successMsg}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;