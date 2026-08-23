const Event = require('../models/Event');

exports.getEvents = async(req,res) =>{
    try{

        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

        const events = await Event.find(filters);
        res.json(events);
    }catch(error){
        res.status(500).json({error:error.message});
    }
};


exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice: ticketPrice || 0,
            image: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (title !== undefined) event.title = title;
        if (description !== undefined) event.description = description;
        if (date !== undefined) event.date = date;
        if (location !== undefined) event.location = location;
        if (category !== undefined) event.category = category;
        if (ticketPrice !== undefined) event.ticketPrice = ticketPrice;
        if (image !== undefined) event.image = image;

        // totalSeats changes shift availableSeats by the same delta, so seats
        // already booked/confirmed against this event stay accounted for.
        if (totalSeats !== undefined && Number(totalSeats) !== event.totalSeats) {
            const delta = Number(totalSeats) - event.totalSeats;
            event.totalSeats = Number(totalSeats);
            event.availableSeats = Math.max(0, event.availableSeats + delta);
        }

        await event.save();
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
