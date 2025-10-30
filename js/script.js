// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    const storage = new StorageManager();
    const scheduleManager = new ScheduleManager(storage);
    
    let currentWeekStart = scheduleManager.getWeekRange().start;
    
    // Initialize the application
    init();

    function init() {
        updateCurrentDate();
        initializeTabs();
        initializeWeekNavigation();
        initializeModal();
        renderPlanner();
        renderSchedule();
        renderShoppingList();
    }

    function updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('es-ES', options);
    }

    function initializeTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                
                // Update buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    function initializeWeekNavigation() {
        document.getElementById('prev-week').addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            renderPlanner();
        });

        document.getElementById('next-week').addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            renderPlanner();
        });
    }

    function initializeModal() {
        const modal = document.getElementById('event-modal');
        const addBtn = document.getElementById('add-event-btn');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.querySelector('.btn-cancel');
        const form = document.getElementById('event-form');

        // Open modal
        addBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            document.getElementById('event-date').valueAsDate = new Date();
        });

        // Close modal
        function closeModal() {
            modal.style.display = 'none';
            form.reset();
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEvent();
            closeModal();
        });

        // Intelligent category detection on title input
        document.getElementById('event-title').addEventListener('input', function() {
            const title = this.value;
            const detectedCategory = scheduleManager.detectCategory(title);
            document.getElementById('event-category').value = detectedCategory;

            // Auto-process shopping items
            if (detectedCategory === 'shopping') {
                const processedTitle = scheduleManager.processShoppingItem(title);
                if (processedTitle !== title) {
                    this.value = processedTitle;
                }
            }
        });
    }

    function saveEvent() {
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const category = document.getElementById('event-category').value;
        const description = document.getElementById('event-description').value;

        const event = {
            title,
            date,
            time,
            category,
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // If it's a shopping item, add to shopping list
        if (category === 'shopping') {
            storage.addShoppingItem(title);
            renderShoppingList();
        } else {
            storage.addEvent(event);
        }

        renderPlanner();
        renderSchedule();
    }

    function renderPlanner() {
        const weekRange = scheduleManager.getWeekRange(currentWeekStart);
        const days = scheduleManager.generateWeekDays(weekRange.start);
        const events = scheduleManager.getEventsForWeek(weekRange.start, weekRange.end);
        
        // Update week range display
        document.getElementById('week-range').textContent = 
            `Semana del ${weekRange.start.toLocaleDateString('es-ES')} al ${weekRange.end.toLocaleDateString('es-ES')}`;
        
        const plannerGrid = document.querySelector('.planner-grid');
        plannerGrid.innerHTML = '';

        days.forEach(day => {
            const dayElement = createDayElement(day, events);
            plannerGrid.appendChild(dayElement);
        });
    }

    function createDayElement(day, events) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-column';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = scheduleManager.formatDate(day);
        
        const dayTasks = document.createElement('div');
        dayTasks.className = 'day-tasks';
        
        const dayString = day.toISOString().split('T')[0];
        const dayEvents = events.filter(event => event.date === dayString);
        
        dayEvents.forEach(event => {
            const taskElement = createTaskElement(event);
            dayTasks.appendChild(taskElement);
        });
        
        dayDiv.appendChild(dayHeader);
        dayDiv.appendChild(dayTasks);
        
        return dayDiv;
    }

    function createTaskElement(event) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item task-${event.category} ${event.completed ? 'completed' : ''}`;
        taskDiv.setAttribute('data-event-id', event.id);
        
        let timeHtml = '';
        if (event.time) {
            timeHtml = `<small>${event.time}</small><br>`;
        }
        
        taskDiv.innerHTML = `
            ${timeHtml}
            <strong>${event.title}</strong>
            ${event.description ? `<br><small>${event.description}</small>` : ''}
            <div class="task-actions">
                <button class="btn-edit" onclick="editEvent('${event.id}')">✏️</button>
                <button class="btn-delete" onclick="deleteEvent('${event.id}')">🗑️</button>
            </div>
        `;
        
        taskDiv.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-edit') && !e.target.classList.contains('btn-delete')) {
                toggleEventCompletion(event.id);
            }
        });
        
        return taskDiv;
    }

    function renderSchedule() {
        const schedule = storage.getSchedule();
        const tbody = document.querySelector('.schedule-table tbody');
        tbody.innerHTML = '';

        for (const [timeSlot, classes] of Object.entries(schedule)) {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            timeCell.textContent = timeSlot;
            row.appendChild(timeCell);
            
            classes.forEach((className, index) => {
                const classCell = document.createElement('td');
                if (className) {
                    const classDiv = document.createElement('div');
                    classDiv.className = 'schedule-class';
                    classDiv.textContent = className;
                    
                    // Add color based on class
                    const classColor = getClassColor(className);
                    classDiv.style.backgroundColor = classColor;
                    classDiv.style.color = 'white';
                    
                    classCell.appendChild(classDiv);
                }
                row.appendChild(classCell);
            });
            
            tbody.appendChild(row);
        }
    }

    function getClassColor(className) {
        const colorMap = {
            'Algebra': '#590D22',
            'Medio Ambiente': '#A4133C',
            'Nutricion': '#C9184A',
            'Sociedad': '#FF4D6D',
            'Etica': '#FF758F',
            'Redaccion': '#FF8FA3'
        };
        return colorMap[className] || '#800F2F';
    }

    function renderShoppingList() {
        const shoppingList = storage.getShoppingList();
        const shoppingContainer = document.querySelector('.shopping-list');
        shoppingContainer.innerHTML = '';

        if (shoppingList.length === 0) {
            shoppingContainer.innerHTML = '<p style="text-align: center; color: var(--wine-medium);">No hay items en la lista de compras</p>';
            return;
        }

        shoppingList.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `shopping-item ${item.completed ? 'completed' : ''}`;
            itemElement.setAttribute('data-item-id', item.id);
            
            itemElement.innerHTML = `
                <span>${item.text}</span>
                <div>
                    <button onclick="toggleShoppingItem('${item.id}')" style="margin-right: 10px;">
                        ${item.completed ? '↶' : '✓'}
                    </button>
                    <button onclick="deleteShoppingItem('${item.id}')">🗑️</button>
                </div>
            `;
            
            shoppingContainer.appendChild(itemElement);
        });

        // Clear completed button
        document.getElementById('clear-shopping').addEventListener('click', () => {
            storage.clearCompletedShopping();
            renderShoppingList();
        });
    }

    // Global functions for event handling
    window.toggleEventCompletion = function(eventId) {
        const events = storage.getEvents();
        const event = events.find(e => e.id === eventId);
        if (event) {
            event.completed = !event.completed;
            storage.saveEvents(events);
            renderPlanner();
        }
    };

    window.editEvent = function(eventId) {
        // Implementation for editing events
        console.log('Edit event:', eventId);
    };

    window.deleteEvent = function(eventId) {
        if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            storage.deleteEvent(eventId);
            renderPlanner();
            renderSchedule();
        }
    };

    window.toggleShoppingItem = function(itemId) {
        storage.toggleShoppingItem(itemId);
        renderShoppingList();
    };

    window.deleteShoppingItem = function(itemId) {
        if (confirm('¿Eliminar este item de la lista de compras?')) {
            storage.deleteShoppingItem(itemId);
            renderShoppingList();
        }
    };
});
