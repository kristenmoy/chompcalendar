const calendarContainer = document.getElementById('calendar');
const viewSelect = document.getElementById('view-select');
let events = {};
let categories = [];

generateCalendar('monthly');
viewSelect.addEventListener('change', (event) => {
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
    else {
        generateMonthlyView(new Date());
    }
}

function generateDailyView(date){
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = (date.getDay() + 6) % 7;
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-week');
    daysOfWeek.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-day', 'calendar-header');
        dayHeader.innerText = day;
        if(index !== dayIndex) dayHeader.classList.add('empty');
        headerRow.appendChild(dayHeader);
    });
    const dayRow = document.createElement('div');
    dayRow.classList.add('calendar-week');
    daysOfWeek.forEach((_, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        if(index === dayIndex){
            const dayNumber = document.createElement('span');
            dayNumber.classList.add('day-number');
            dayNumber.innerText = date.getDate();
            dayDiv.appendChild(dayNumber);
            const eventDate = formatDate(date);
            displayEvents(eventDate, dayDiv);
            dayDiv.addEventListener('click', () => openEventsModal(eventDate));
        } else {
            dayDiv.classList.add('empty');
        }
        dayRow.appendChild(dayDiv);
    });
    calendarContainer.appendChild(headerRow);
    calendarContainer.appendChild(dayRow);
}

function generateWeeklyView(date){
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const firstDay = date.getDate() - ((date.getDay() + 6) % 7);
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-week');
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day', 'calendar-header');
        header.innerText = day;
        headerRow.appendChild(header);
    });
    const weekRow = document.createElement('div');
    weekRow.classList.add('calendar-week');

    for(let i = 0; i < 7; i++){
        const day = new Date(date);
        day.setDate(firstDay + i);
        const eventDate = formatDate(day);
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.innerHTML = `<span class="day-number">${day.getDate()}</span>`;
        displayEvents(eventDate, dayDiv);
        dayDiv.addEventListener('click', () => openEventsModal(eventDate));
        weekRow.appendChild(dayDiv);
    }
    calendarContainer.appendChild(headerRow);
    calendarContainer.appendChild(weekRow);
}

function generateMonthlyView(date){
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-week');
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.classList.add('calendar-day', 'calendar-header');
        header.innerText = day;
        headerRow.appendChild(header);
    });
    calendarContainer.appendChild(headerRow);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const monthGrid = document.createElement('div');
    monthGrid.classList.add('calendar-month');
    for(let i = 0; i < startDay; i++){
        const empty = document.createElement('div');
        empty.classList.add('calendar-day', 'empty');
        monthGrid.appendChild(empty);
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
        dayDiv.addEventListener('click', () => openEventsModal(eventDate));
        monthGrid.appendChild(dayDiv);
    }
    calendarContainer.appendChild(monthGrid);
}

function displayEvents(date, dayDiv){
    const countDiv = dayDiv.querySelector(".event-count") || document.createElement("div");
    countDiv.classList.add("event-count");
    if(events[date] && events[date].length > 0){
        countDiv.textContent = `${events[date].length} Item${events[date].length > 1 ? 's' : ''}`;
    } else {
        countDiv.textContent = '';
    }
    dayDiv.appendChild(countDiv);
}

function addEventToCalendar(name, date, category = '', description = '', time = '') {
    if (!events[date]) events[date] = [];
    events[date].push({ name, category, description, time });
    generateCalendar(viewSelect.value);
}

function formatDate(date){
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
}

function updateCategoryDropdown(){
    const dropdown = document.getElementById("event-category");
    dropdown.innerHTML = '<option value="">None</option>';
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        dropdown.appendChild(option);
    });
}

const viewEventsModal = document.getElementById("view-events-modal");
const closeEventsButton = document.getElementById("close-events-button");
const viewEventsDateSpan = document.getElementById("view-events-date");
const eventsListDiv = document.getElementById("events-list");

function openEventsModal(date){
    const [year, month, day] = date.split("-");
    const formattedDate = new Date(+year, +month - 1, +day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
      viewEventsDateSpan.textContent = formattedDate;
    eventsListDiv.innerHTML = '';
    if(events[date] && events[date].length > 0){
        events[date].forEach(event => {
            const div = document.createElement('div');
            div.classList.add('view-event-entry');
            let formattedTime = event.time;
            if(event.time){
              const dateObj = new Date(`1970-01-01T${event.time}`);
              formattedTime = dateObj.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit"
              });
            }
            div.innerHTML = `<strong>${event.name}</strong><br>
                             Time: ${formattedTime || '—'}<br>
                             Category: ${event.category || 'None'}<br>
                             Description: ${event.description || ''}<hr>`;
            eventsListDiv.appendChild(div);
        });
    }
    else{
        eventsListDiv.innerHTML = '<p>No events for this day.</p>';
    }

    viewEventsModal.style.display = 'flex';
}

closeEventsButton.addEventListener("click", () => {
    viewEventsModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === viewEventsModal) {
        viewEventsModal.style.display = "none";
    }
});

const createEventButton = document.getElementById("create-event-button");
const createCategoryButton = document.getElementById("create-category-button");
const eventModal = document.getElementById("event-modal");
const categoryModal = document.getElementById("category-modal");

createEventButton.addEventListener("click", () => {
    eventModal.style.display = "flex";
});

createCategoryButton.addEventListener("click", () => {
    categoryModal.style.display = "flex";
});

const cancelEventButton = document.getElementById("cancel-event-button");
const cancelCategoryButton = document.getElementById("cancel-category-button");

cancelEventButton.addEventListener("click", () => {
    eventModal.style.display = "none";
});

cancelCategoryButton.addEventListener("click", () => {
    categoryModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === eventModal) {
        eventModal.style.display = "none";
    }
    if (event.target === categoryModal) {
        categoryModal.style.display = "none";
    }
});

const addEventButton = document.getElementById("add-event-button");

addEventButton.addEventListener("click", () => {
    const name = document.getElementById("event-name").value.trim();
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const description = document.getElementById("event-description").value.trim();
    const category = document.getElementById("event-category").value;
    if(!name || !date){
        alert("Event name and date are required.");
        return;
    }
    addEventToCalendar(name, date, category, description, time);
    document.getElementById("event-name").value = '';
    document.getElementById("event-date").value = '';
    document.getElementById("event-time").value = '';
    document.getElementById("event-description").value = '';
    document.getElementById("event-category").value = '';
    eventModal.style.display = "none";
});

const addCategoryButton = document.getElementById("add-category-button");

addCategoryButton.addEventListener("click", () => {
    const newCategoryName = document.getElementById("new-category-name").value.trim();
    if(!newCategoryName){
        alert("Category name cannot be empty.");
        return;
    }
    if(categories.includes(newCategoryName)){
        alert("Category already exists.");
        return;
    }
    categories.push(newCategoryName);
    updateCategoryDropdown();
    document.getElementById("new-category-name").value = '';
    categoryModal.style.display = "none";
});