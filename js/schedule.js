// Schedule management and intelligent categorization
class ScheduleManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.categories = {
            'domestic': {
                name: '🏠 Doméstico',
                color: 'domestic',
                keywords: ['lavar ropa', 'limpieza general', 'barrer', 'limpiar suelo', 'despolvar', 'limpiar sala', 'limpiar baño', 'lavar trastes', 'organizar ropa']
            },
            'algebra': {
                name: '🎓 Álgebra y Geometría Analítica',
                color: 'algebra',
                keywords: ['algebra', 'geometria', 'matematica', 'ejercicios algebra']
            },
            'medio_ambiente': {
                name: '🎓 Ser Humano y Medio Ambiente',
                color: 'medio_ambiente',
                keywords: ['medio ambiente', 'ecologia', 'naturaleza', 'sostenibilidad']
            },
            'nutricion': {
                name: '🎓 Nutrición Saludable',
                color: 'nutricion',
                keywords: ['nutricion', 'alimentacion', 'dieta', 'saludable', 'comida saludable']
            },
            'sociedad': {
                name: '🎓 Ser Humano y Sociedad',
                color: 'sociedad',
                keywords: ['sociedad', 'social', 'contemporaneo', 'temas sociales']
            },
            'etica': {
                name: '🎓 Ciudadanía y Ética',
                color: 'etica',
                keywords: ['etica', 'ciudadania', 'moral', 'valores']
            },
            'redaccion': {
                name: '🎓 Redacción',
                color: 'redaccion',
                keywords: ['redaccion', 'escribir', 'ensayo', 'composicion']
            },
            'reminder': {
                name: '⏰ Recordatorio',
                color: 'reminder',
                keywords: ['llamar', 'mandar', 'enviar', 'contactar', 'recordar']
            },
            'shopping': {
                name: '🛒 Lista de Compras',
                color: 'shopping',
                keywords: ['comprar', 'mercado', 'supermercado']
            },
            'other': {
                name: '✨ Otros',
                color: 'other',
                keywords: []
            }
        };
    }

    // Intelligent category detection
    detectCategory(title, description = '') {
        const text = (title + ' ' + description).toLowerCase();
        
        // Check for shopping patterns
        if (title.startsWith('-no hay') || title.startsWith('-falta')) {
            return 'shopping';
        }

        // Check all categories
        for (const [categoryId, category] of Object.entries(this.categories)) {
            if (category.keywords.some(keyword => text.includes(keyword))) {
                return categoryId;
            }
        }

        return 'other';
    }

    // Process shopping item (convert "-no hay X" to "comprar X")
    processShoppingItem(title) {
        if (title.startsWith('-no hay ')) {
            return 'comprar ' + title.substring(8);
        } else if (title.startsWith('-falta ')) {
            return 'comprar ' + title.substring(7);
        }
        return title;
    }

    // Get events for a specific date
    getEventsForDate(date) {
        const events = this.storage.getEvents();
        return events.filter(event => event.date === date);
    }

    // Get events for a date range
    getEventsForWeek(startDate, endDate) {
        const events = this.storage.getEvents();
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= startDate && eventDate <= endDate;
        });
    }

    // Format date for display
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }

    // Get week range
    getWeekRange(date = new Date()) {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Start on Monday
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        return { start, end };
    }

    // Generate days for the week
    generateWeekDays(startDate) {
        const days = [];
        const current = new Date(startDate);
        
        for (let i = 0; i < 7; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return days;
    }
}
