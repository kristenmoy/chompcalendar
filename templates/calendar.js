const calendarContainer = document.getElementById('calendar');
const viewSelect = document.getElementById('view-select');
let events = {};
let categories = []; // 🔧 Added

generateCalendar('monthly');
viewSelect.addEventListener('change', (event) =>{
    const selectedView = event.target.value;
    generateCalendar(selectedView);
});

function generateCalendar(view){
    calendarContainer.innerHTML = '';
    if(view === 'daily'){
        generateDailyView(new Date());
    }
    else if(view === 'weekly'){
        generateWeeklyView(new Date());
    }
    else if(view === 'monthly'){
        generateMonthlyView(new Date());
    }
}

function generateDailyView(date){
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = (date.getDay() + 6) % 7;
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-week');
    daysOfWeek.forEach((day, index) =>{
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day', 'calendar-header');
        dayHeader.innerText = day;
        if(index !== dayIndex){
            dayHeader.classList.add('empty');
        }
        headerRow.appendChild(dayHeader);
    });

    const dayRow = document.createElement('div');
    dayRow.classList.add('calendar-week');
    daysOfWeek.forEach((_, index) =>{
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        if(index === dayIndex){
            const dayNumber = document.createElement('span');
            dayNumber.classList.add('day-number');
            dayNumber.innerText = date.getDate();
            dayDiv.appendChild(dayNumber);
            const eventDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            displayEvents(eventDate, dayDiv);
        }
        else{
            dayDiv.classList.add('empty');
        }
        dayRow.appendChild(dayDiv);
    });
    calendarContainer.appendChild(headerRow);
    calendarContainer.appendChild(dayRow);
}

function generateWeeklyView(date){
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const firstDayOfWeek = date.getDate() - ((date.getDay() + 6) % 7);
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-week');
    daysOfWeek.forEach(day =>{
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day', 'calendar-header');
        dayHeader.innerText = day;
        headerRow.appendChild(dayHeader);
    });
    const weekRow = document.createElement('div');
    weekRow.classList.add('calendar-week');
    for(let i = 0; i < 7; i++){
        const day = new Date(date);
        day.setDate(firstDayOfWeek + i);
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.innerText = day.getDate();
        dayDiv.appendChild(dayNumber);
        const eventDate = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
        displayEvents(eventDate, dayDiv);
        weekRow.appendChild(dayDiv);
    }
    calendarContainer.appendChild(headerRow);
    calendarContainer.appendChild(weekRow);
}

function generateMonthlyView(date){
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-week');
    daysOfWeek.forEach(day =>{
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day', 'calendar-header');
        dayHeader.innerText = day;
        headerRow.appendChild(dayHeader);
    });
    calendarContainer.appendChild(headerRow);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const startDay = (monthStart.getDay() + 6) % 7;
    const monthGrid = document.createElement('div');
    monthGrid.classList.add('calendar-month');
    for(let i = 0; i < startDay; i++){
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'empty');
        monthGrid.appendChild(emptyDiv);
    }
    for(let i = 1; i <= daysInMonth; i++){
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.innerText = i;
        dayDiv.appendChild(dayNumber);
        const eventDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        displayEvents(eventDate, dayDiv);
        monthGrid.appendChild(dayDiv);
    }
    calendarContainer.appendChild(monthGrid);
}

function displayEvents(date, dayDiv){
    if(events[date]){
        events[date].forEach(event =>{
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.textContent = event.name;
            

            const categorySpan = document.createElement('span');
            categorySpan.classList.add('event-category');
            categorySpan.textContent = event.category ? ` [${event.category}]` : '';
            eventDiv.appendChild(categorySpan);

            if(event.description){
                const descrptionDiv = document.createElement('div');
                descriptionDiv.classList.add('event-description');
                descriptionDiv.textContent = event.description;
                eventDiv.appendChild(descriptionDiv);
            }

            dayDiv.appendChild(eventDiv);
            
        });
    }
}

function addEventToCalendar(name, date, category = '') {
    if (!events[date]) {
        events[date] = [];
    }
    events[date].push({ name, category });
    generateCalendar(viewSelect.value);
}

// 🔧 Added to refresh dropdown
function updateCategoryDropdown() {
    const dropdown = document.getElementById("event-category");
    dropdown.innerHTML = '<option value="">None</option>';
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        dropdown.appendChild(option);
    });
}
