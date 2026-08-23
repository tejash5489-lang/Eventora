import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useUI } from '../context/UIContext';
import { FaPlus, FaTrash, FaTimes, FaRupeeSign, FaUserCheck, FaHourglassHalf, FaPen } from 'react-icons/fa';

const emptyForm = {
    title: '', description: '', date: '', location: '', category: '',
    totalSeats: '', ticketPrice: '', image: ''
};

const fieldClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none';

const FormField = ({ label, hint, children }) => (
    <label className="block">
        <span className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</span>
        {children}
        {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
);

const StatCard = ({ label, value, valueClass, icon, iconClass }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-3xl font-black ${valueClass}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${iconClass}`}>
            {icon}
        </div>
    </div>
);

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast, confirm } = useUI();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [actioningId, setActioningId] = useState(null);
    const [editingEventId, setEditingEventId] = useState(null);
    const [eventSearch, setEventSearch] = useState('');
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

    const fetchData = async () => {
        const [eventsRes, bookingsRes] = await Promise.allSettled([
            api.get('/events'),
            api.get('/bookings/my'),
        ]);
        if (eventsRes.status === 'fulfilled') {
            setEvents(eventsRes.value.data);
        } else {
            console.error('Error loading events:', eventsRes.reason);
        }
        if (bookingsRes.status === 'fulfilled') {
            setBookings(bookingsRes.value.data);
        } else {
            console.error('Error loading bookings:', bookingsRes.reason);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (!showModal) return;
        const onKeyDown = (e) => { if (e.key === 'Escape') setShowModal(false); };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showModal]);

    useEffect(() => {
        const editEventId = location.state?.editEventId;
        if (!editEventId || events.length === 0) return;
        const event = events.find(e => e._id === editEventId);
        if (event) openEditModal(event);
        navigate(location.pathname, { replace: true, state: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events, location.state]);

    const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0);

    const paidClients = new Set(
        bookings.filter(b => b.paymentStatus === 'paid').map(b => b.userId?._id)
    ).size;

    const pendingRequests = bookings.filter(b => b.status === 'pending').length;

    const filteredEvents = events.filter(event => {
        const q = eventSearch.trim().toLowerCase();
        if (!q) return true;
        return event.title.toLowerCase().includes(q) || event.category?.toLowerCase().includes(q);
    });

    const filteredBookings = bookings.filter(booking => {
        if (bookingStatusFilter !== 'all' && booking.status !== bookingStatusFilter) return false;
        const q = bookingSearch.trim().toLowerCase();
        if (!q) return true;
        return (
            booking.eventId?.title?.toLowerCase().includes(q) ||
            booking.userId?.name?.toLowerCase().includes(q) ||
            booking.userId?.email?.toLowerCase().includes(q)
        );
    });

    const openCreateModal = () => {
        setEditingEventId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (event) => {
        setEditingEventId(event._id);
        setForm({
            title: event.title,
            description: event.description,
            date: event.date ? event.date.slice(0, 10) : '',
            location: event.location,
            category: event.category,
            totalSeats: event.totalSeats,
            ticketPrice: event.ticketPrice,
            image: event.image || '',
        });
        setShowModal(true);
    };

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                totalSeats: Number(form.totalSeats),
                ticketPrice: Number(form.ticketPrice) || 0,
            };
            if (editingEventId) {
                await api.put(`/events/${editingEventId}`, payload);
                showToast('Event updated.');
            } else {
                await api.post('/events', payload);
                showToast('Event created.');
            }
            setShowModal(false);
            setEditingEventId(null);
            setForm(emptyForm);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || `Failed to ${editingEventId ? 'update' : 'create'} event`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        const ok = await confirm('This cannot be undone.', { title: 'Delete this event?', confirmText: 'Delete', danger: true });
        if (!ok) return;
        try {
            await api.delete(`/events/${id}`);
            showToast('Event deleted.');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete event', 'error');
        }
    };

    const handleConfirmBooking = async (id) => {
        setActioningId(id);
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus: 'paid' });
            showToast('Booking confirmed.');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to confirm booking', 'error');
        } finally {
            setActioningId(null);
        }
    };

    const handleCancelBooking = async (id) => {
        setActioningId(id);
        try {
            await api.delete(`/bookings/${id}`);
            showToast('Booking rejected.');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to reject booking', 'error');
        } finally {
            setActioningId(null);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading admin dashboard...</div>;
    }

    return (
        <section>
            <div className="animate-fade-in-up bg-brand-ink text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="font-display text-5xl tracking-wide mb-2">Admin Dashboard</h1>
                    <p className="text-gray-300">Manage events and manually confirm bookings.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-brand-gold hover:bg-brand-gold-dark text-brand-ink font-bold px-6 py-3 rounded-xl transition whitespace-nowrap flex items-center gap-2 justify-center active:scale-[0.98]"
                >
                    <FaPlus /> Create New Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard label="Total Revenue" value={`₹${totalRevenue}`} valueClass="text-green-600" icon={<FaRupeeSign />} iconClass="bg-green-100 text-green-600" />
                <StatCard label="Paid Clients" value={paidClients} valueClass="text-blue-600" icon={<FaUserCheck />} iconClass="bg-blue-100 text-blue-600" />
                <StatCard label="Pending Requests" value={pendingRequests} valueClass="text-amber-600" icon={<FaHourglassHalf />} iconClass="bg-amber-100 text-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-brand-ink text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{filteredEvents.length}</span>
                        All Events
                    </h2>
                    <input
                        type="text"
                        placeholder="Search events by title or category..."
                        value={eventSearch}
                        onChange={e => setEventSearch(e.target.value)}
                        className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-700 focus:outline-none"
                    />
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 max-h-150 overflow-y-auto">
                        {filteredEvents.length === 0 ? (
                            <p className="text-center text-gray-400 py-10">{events.length === 0 ? 'No events yet.' : 'No events match your search.'}</p>
                        ) : filteredEvents.map(event => (
                            <div key={event._id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
                                                {event.category?.slice(0, 3) || 'EVT'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 truncate">{event.title}</h3>
                                            {event.category && (
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{event.category}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                                {new Date(event.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${event.availableSeats > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {event.availableSeats}/{event.totalSeats} seats
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => openEditModal(event)}
                                        className="border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                                    >
                                        <FaPen className="text-xs" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEvent(event._id)}
                                        className="border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                                    >
                                        <FaTrash className="text-xs" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-brand-ink text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{filteredBookings.length}</span>
                        Booking Requests
                    </h2>
                    <input
                        type="text"
                        placeholder="Search by event, name, or email..."
                        value={bookingSearch}
                        onChange={e => setBookingSearch(e.target.value)}
                        className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-700 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2 mb-3">
                        {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setBookingStatusFilter(status)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition active:scale-95 ${bookingStatusFilter === status ? 'bg-brand-ink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 max-h-150 overflow-y-auto">
                        {filteredBookings.length === 0 ? (
                            <p className="text-center text-gray-400 py-10">{bookings.length === 0 ? 'No booking requests yet.' : 'No bookings match your filters.'}</p>
                        ) : filteredBookings.map(booking => (
                            <div
                                key={booking._id}
                                className={`p-5 border-l-4 ${booking.status === 'pending' ? 'border-amber-400' :
                                        booking.status === 'confirmed' ? 'border-green-400' : 'border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h3 className="font-bold text-gray-900 truncate min-w-0" title={booking.eventId?.title}>{booking.eventId?.title || 'Deleted event'}</h3>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {booking.paymentStatus === 'paid' ? 'PAID' : 'NOT PAID'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1 mb-3">
                                    <p><span className="font-semibold text-gray-800">User:</span> {booking.userId?.name} <span className="text-gray-400">({booking.userId?.email})</span></p>
                                    <p><span className="font-semibold text-gray-800">Amount:</span> {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</p>
                                    <p><span className="font-semibold text-gray-800">Date:</span> {new Date(booking.createdAt).toLocaleString()}</p>
                                </div>
                                {booking.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            disabled={actioningId === booking._id}
                                            onClick={() => handleConfirmBooking(booking._id)}
                                            className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-ink text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50 active:scale-[0.98]"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            disabled={actioningId === booking._id}
                                            onClick={() => handleCancelBooking(booking._id)}
                                            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
                    <div className="animate-scale-in bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-3xl tracking-wide text-gray-900">{editingEventId ? 'Edit Event' : 'Create New Event'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEvent} className="space-y-4">
                            <FormField label="Title">
                                <input required placeholder="e.g. React & Node.js Developer Retreat" className={fieldClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </FormField>
                            <FormField label="Description">
                                <textarea required placeholder="What's this event about?" rows={3} className={fieldClass} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Date">
                                    <input required type="date" className={fieldClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </FormField>
                                <FormField label="Category">
                                    <input required placeholder="e.g. Music, Tech" className={fieldClass} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                                </FormField>
                            </div>
                            <FormField label="Location">
                                <input required placeholder="Venue, city" className={fieldClass} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Total Seats">
                                    <input required type="number" min="1" placeholder="150" className={fieldClass} value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })} />
                                </FormField>
                                <FormField label="Ticket Price">
                                    <input type="number" min="0" placeholder="0 = free" className={fieldClass} value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: e.target.value })} />
                                </FormField>
                            </div>
                            <FormField label="Image URL" hint="Paste a link to a hosted image (e.g. Unsplash).">
                                <input placeholder="https://..." className={fieldClass} value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                            </FormField>
                            <div className="w-full h-40 rounded-lg border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                                {form.image ? (
                                    <img
                                        key={form.image}
                                        src={form.image}
                                        alt="Event preview"
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.style.visibility = 'hidden'; }}
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm">Image preview will appear here</span>
                                )}
                            </div>
                            <button type="submit" disabled={saving} className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-ink font-bold py-3 rounded-lg transition disabled:opacity-50 active:scale-[0.98]">
                                {saving ? (editingEventId ? 'Saving...' : 'Creating...') : (editingEventId ? 'Save Changes' : 'Create Event')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminDashboard;
