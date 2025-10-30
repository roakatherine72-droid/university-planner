// Storage management for the planner
class StorageManager {
    constructor() {
        this.eventsKey = 'universityPlanner_events';
        this.shoppingKey = 'universityPlanner_shopping';
        this.scheduleKey = 'universityPlanner_schedule';
    }

    // Events management
    getEvents() {
        const events = localStorage.getItem(this.eventsKey);
        return events ? JSON.parse(events) : [];
    }

    saveEvents(events) {
        localStorage.setItem(this.eventsKey, JSON.stringify(events));
    }

    addEvent(event) {
        const events = this.getEvents();
        event.id = Date.now().toString();
        events.push(event);
        this.saveEvents(events);
        return event;
    }

    updateEvent(updatedEvent) {
        const events = this.getEvents();
        const index = events.findIndex(event => event.id === updatedEvent.id);
        if (index !== -1) {
            events[index] = updatedEvent;
            this.saveEvents(events);
            return true;
        }
        return false;
    }

    deleteEvent(eventId) {
        const events = this.getEvents();
        const filteredEvents = events.filter(event => event.id !== eventId);
        this.saveEvents(filteredEvents);
    }

    // Shopping list management
    getShoppingList() {
        const shopping = localStorage.getItem(this.shoppingKey);
        return shopping ? JSON.parse(shopping) : [];
    }

    saveShoppingList(shoppingList) {
        localStorage.setItem(this.shoppingKey, JSON.stringify(shoppingList));
    }

    addShoppingItem(item) {
        const shoppingList = this.getShoppingList();
        const shoppingItem = {
            id: Date.now().toString(),
            text: item,
            completed: false,
            createdAt: new Date().toISOString()
        };
        shoppingList.push(shoppingItem);
        this.saveShoppingList(shoppingList);
        return shoppingItem;
    }

    toggleShoppingItem(itemId) {
        const shoppingList = this.getShoppingList();
        const item = shoppingList.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            this.saveShoppingList(shoppingList);
        }
    }

    deleteShoppingItem(itemId) {
        const shoppingList = this.getShoppingList();
        const filteredList = shoppingList.filter(item => item.id !== itemId);
        this.saveShoppingList(filteredList);
    }

    clearCompletedShopping() {
        const shoppingList = this.getShoppingList();
        const activeItems = shoppingList.filter(item => !item.completed);
        this.saveShoppingList(activeItems);
    }

    // Schedule management
    getSchedule() {
        const schedule = localStorage.getItem(this.scheduleKey);
        if (schedule) {
            return JSON.parse(schedule);
        } else {
            // Default schedule based on the PDF
            const defaultSchedule = {
                "7:00-8:00": ["Algebra", "", "Algebra", "", "Algebra", "", ""],
                "8:00-9:00": ["", "", "", "", "", "", ""],
                "9:00-10:00": ["Medio Ambiente", "", "", "", "", "", ""],
                "10:00-11:00": ["", "", "", "", "", "", ""],
                "11:00-12:00": ["Nutricion", "", "", "", "", "", ""],
                "12:00-13:00": ["", "", "", "", "", "", ""],
                "13:00-14:00": ["", "", "", "", "", "", ""],
                "14:00-15:00": ["", "", "", "", "", "", ""],
                "15:00-16:00": ["", "", "", "", "", "", ""],
                "16:00-17:00": ["Sociedad", "", "Etica", "", "", "", ""],
                "17:00-18:00": ["", "", "", "", "", "", ""],
                "20:00-22:00": ["Redaccion", "", "Redaccion", "", "", "", ""]
            };
            this.saveSchedule(defaultSchedule);
            return defaultSchedule;
        }
    }

    saveSchedule(schedule) {
        localStorage.setItem(this.scheduleKey, JSON.stringify(schedule));
    }
}
