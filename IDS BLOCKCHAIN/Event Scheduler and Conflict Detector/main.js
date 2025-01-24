class ScheduleEvent {
    constructor(title, start, end) {
        this.title = title;
        this.startTime = start;
        this.endTime = end;
        this.duration = this.computeDuration();
    }

    computeDuration() {
        const startTime = new Date(`2000-01-01T${this.startTime}`);
        const endTime = new Date(`2000-01-01T${this.endTime}`);
        return (endTime - startTime) / (60 * 1000); // Duration in minutes
    }
}

// Scheduler class to manage events and handle conflicts
class Scheduler {
    constructor() {
        this.scheduledEvents = [];
        this.officeHoursStart = "08:00";
        this.officeHoursEnd = "18:00";
    }

    addNewEvent(event) {
        this.scheduledEvents.push(event);
        this.scheduledEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
        return this.detectConflicts();
    }

    detectConflicts() {
        const overlappingEvents = [];

        for (let i = 0; i < this.scheduledEvents.length - 1; i++) {
            const current = this.scheduledEvents[i];
            const next = this.scheduledEvents[i + 1];

            if (current.endTime > next.startTime) {
                const alternateSlots = this.suggestNewSlots(next);
                overlappingEvents.push({
                    firstEvent: current,
                    secondEvent: next,
                    suggestions: alternateSlots
                });
            }
        }
        return overlappingEvents;
    }

    suggestNewSlots(event) {
        const possibleSlots = [];
        const officeStart = new Date(`2000-01-01T${this.officeHoursStart}`);
        const officeEnd = new Date(`2000-01-01T${this.officeHoursEnd}`);
        const requiredDuration = event.duration;

        const busyIntervals = this.scheduledEvents.map(e => ({
            start: new Date(`2000-01-01T${e.startTime}`),
            end: new Date(`2000-01-01T${e.endTime}`)
        }));

        for (let time = officeStart; time < officeEnd; time = new Date(time.getTime() + 30 * 60000)) {
            const slotEnd = new Date(time.getTime() + requiredDuration * 60000);

            if (slotEnd > officeEnd) break;

            const isAvailable = !busyIntervals.some(interval => time < interval.end && slotEnd > interval.start);

            if (isAvailable) {
                possibleSlots.push({
                    start: time.toTimeString().substring(0, 5),
                    end: slotEnd.toTimeString().substring(0, 5)
                });
                if (possibleSlots.length >= 3) break;
            }
        }
        return possibleSlots;
    }
}

// UI Interaction and DOM Handling
const scheduler = new Scheduler();
const formElement = document.getElementById('eventForm');
const eventsContainer = document.getElementById('eventsList');
const conflictsContainer = document.getElementById('conflictsList');

formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const eventName = document.getElementById('eventName').value;
    const eventStart = document.getElementById('startTime').value;
    const eventEnd = document.getElementById('endTime').value;

    if (eventStart >= eventEnd) {
        alert('The end time must be later than the start time.');
        return;
    }

    const newEvent = new ScheduleEvent(eventName, eventStart, eventEnd);
    const conflicts = scheduler.addNewEvent(newEvent);

    renderScheduledEvents();
    renderConflictDetails(conflicts);

    formElement.reset();
});

function renderScheduledEvents() {
    eventsContainer.innerHTML = '';
    scheduler.scheduledEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-entry';
        eventCard.innerHTML = `
            <strong>${event.title}</strong><br>
            From: ${formatClockTime(event.startTime)} To: ${formatClockTime(event.endTime)}
        `;
        eventsContainer.appendChild(eventCard);
    });
}

function renderConflictDetails(conflicts) {
    conflictsContainer.innerHTML = '';

    if (!conflicts.length) {
        conflictsContainer.innerHTML = '<p>No scheduling conflicts detected.</p>';
        return;
    }

    conflicts.forEach(conflict => {
        const conflictCard = document.createElement('div');
        conflictCard.className = 'conflict-entry';

        let suggestedSlots = '';
        if (conflict.suggestions.length) {
            suggestedSlots = `
                <p><strong>Suggested times for "${conflict.secondEvent.title}":</strong></p>
                <ul>
                    ${conflict.suggestions.map(slot => 
                        `<li>From: ${slot.start} To: ${slot.end}</li>`
                    ).join('')}
                </ul>
            `;
        }

        conflictCard.innerHTML = `
            <p>Conflict between:</p>
            <p>"${conflict.firstEvent.title}" (${formatClockTime(conflict.firstEvent.startTime)} - ${formatClockTime(conflict.firstEvent.endTime)})</p>
            <p>"${conflict.secondEvent.title}" (${formatClockTime(conflict.secondEvent.startTime)} - ${formatClockTime(conflict.secondEvent.endTime)})</p>
            ${suggestedSlots}
        `;
        conflictsContainer.appendChild(conflictCard);
    });
}

function formatClockTime(time) {
    return time;
}
