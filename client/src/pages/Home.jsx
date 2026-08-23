import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaRegClock, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const formatEventDate = (date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

const Home = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // One-time, unfiltered fetch so the category chips reflect every category
        // that exists, not just whatever the current search/filter happens to return.
        api.get('/events')
            .then(({ data }) => setCategories([...new Set(data.map(e => e.category).filter(Boolean))].sort()))
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 400); // 400ms debounce
        return () => clearTimeout(timeoutId);
    }, [search, category]);

    const fetchEvents = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (category) params.set('category', category);
            const { data } = await api.get(`/events?${params.toString()}`);
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-brand-ink text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-linear-to-t from-brand-ink via-brand-ink/80 to-transparent"></div>
                <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
                    <span className="animate-fade-in-up bg-white/10 text-brand-gold backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-brand-gold/30">Welcome to Eventora</span>
                    <h1 className="animate-fade-in-up [animation-delay:100ms] font-display text-6xl md:text-8xl mb-6 leading-[0.95] tracking-wide drop-shadow-lg">
                        Find Your Next <br /><span className="text-brand-gold">Unforgettable</span> Experience
                    </h1>
                    <p className="animate-fade-in-up [animation-delay:200ms] text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the best tech conferences, late-night music festivals, and hands-on workshops happening directly in your area. Secure your spot today.
                    </p>

                    <div className="animate-fade-in-up [animation-delay:300ms] w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-6 text-gray-500 text-xl group-focus-within:text-brand-gold-dark transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-black bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-brand-gold focus:outline-none transition-all placeholder-gray-400 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Why Choose Us / Features row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition duration-300">
                    <div className="w-16 h-16 bg-brand-ink text-brand-gold rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaRegClock />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Booking</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition duration-300">
                    <div className="w-16 h-16 bg-brand-ink text-brand-gold rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaTicketAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Access</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Download tickets instantly or manage them right from your personal dashboard with easily.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition duration-300">
                    <div className="w-16 h-16 bg-brand-ink text-brand-gold rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-gray-200/50">
                        <FaShieldAlt />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Platform</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.</p>
                </div>
            </div>

            {categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 px-2">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition active:scale-95 ${category === '' ? 'bg-brand-ink text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition active:scale-95 ${category === cat ? 'bg-brand-ink text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-200 pb-4">
                <h2 className="font-display text-4xl tracking-wide text-gray-900">Upcoming Events</h2>
                <div className="text-gray-500 font-medium">{events.length} results found</div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-gray-600">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-gray-500">No events found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, i) => {
                        const isSoldOut = event.availableSeats <= 0;
                        const seatsPct = event.totalSeats > 0 ? Math.min(100, (event.availableSeats / event.totalSeats) * 100) : 0;
                        return (
                            <div
                                key={event._id}
                                className="animate-fade-in-up bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col group"
                                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                            >
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl">
                                            {event.category || 'Event'}
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                        {event.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : <span className="text-brand-gold-dark">₹{event.ticketPrice}</span>}
                                    </div>
                                    {isSoldOut && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-white text-gray-900 text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Sold Out</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="text-xs font-bold text-brand-gold-dark uppercase tracking-wider mb-2">{event.category}</div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2" title={event.title}>{event.title}</h2>
                                    <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400 shrink-0" />
                                            <span>{formatEventDate(event.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-gray-400 shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div className={`h-2 rounded-full transition-all duration-500 ${isSoldOut ? 'bg-red-400' : 'bg-brand-gold'}`} style={{ width: `${seatsPct}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">
                                            {isSoldOut ? 'No seats remaining' : `${event.availableSeats} of ${event.totalSeats} seats remaining`}
                                        </p>
                                        <Link to={`/events/${event._id}`} className="block w-full text-center bg-brand-ink hover:bg-black text-white font-semibold py-2 rounded-lg transition active:scale-[0.98]">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Section */}
            <footer className="mt-auto pt-16 pb-8 border-t border-gray-200 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <FaTicketAlt className="text-brand-gold-dark text-2xl" />
                    <span className="font-display text-2xl tracking-wide text-gray-900">Eventora</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                    The simplest, most dynamic way to manage, discover, and host world-class events in your local city. Let's make memories together.
                </p>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} Eventora Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;