const firebaseConfig = {
  apiKey: "AIzaSyCkbSf9Q_Frgbv-4Q6PqasrThDXBl1IJEY",
  authDomain: "volunteer-management-systems.firebaseapp.com",
  databaseURL: "https://volunteer-management-systems-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "volunteer-management-systems",
  storageBucket: "volunteer-management-systems.firebasestorage.app",
  messagingSenderId: "731686702642",
  appId: "1:731686702642:web:f3e76639c1cd35c35e762b"
};

firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();

auth.onAuthStateChanged(user => {
    if (user) {
        firebase.database().ref('users/' + user.uid).once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.role === 'admin') {
                    document.getElementById('userName').textContent = userData.name;
                    loadDashboardData();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Welcome back, ' + userData.name + '!',
                        text: 'You have successfully logged in to admin panel',
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end',
                        background: '#2c3e50',
                        color: '#fff',
                        iconColor: '#48bb78'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'You do not have admin privileges',
                        confirmButtonColor: '#e74c3c'
                    }).then(() => {
                        window.location.href = 'home.html';
                    });
                }
            });
    } else {
        window.location.href = 'index.html';
    }
});

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section + 'Section').style.display = 'block';
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    
    const activeLink = document.querySelector(`.sidebar-menu a[onclick*="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'manageEvents':
            loadEvents();
            break;
        case 'logHours':
            loadEventsForDropdown();
            loadVolunteersForDropdown();
            loadRecentHours();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function loadDashboardData() {
    Swal.fire({
        title: 'Loading Dashboard',
        html: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    Promise.all([
        firebase.firestore().collection('events').get(),
        firebase.database().ref('users').once('value'),
        firebase.firestore().collection('hours').get()
    ]).then(([eventsSnapshot, usersSnapshot, hoursSnapshot]) => {
        // Total events
        document.getElementById('totalEvents').textContent = eventsSnapshot.size;
        
        // Count upcoming events (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        let upcoming = 0;
        eventsSnapshot.forEach(doc => {
            const eventDate = new Date(doc.data().date);
            if (eventDate <= nextWeek && eventDate >= new Date()) {
                upcoming++;
            }
        });
        document.getElementById('upcomingEvents').textContent = upcoming;
        
        let volunteerCount = 0;
        usersSnapshot.forEach(child => {
            if (child.val().role === 'volunteer') {
                volunteerCount++;
            }
        });
        document.getElementById('totalVolunteers').textContent = volunteerCount;
        
        let total = 0;
        hoursSnapshot.forEach(doc => {
            total += doc.data().hours || 0;
        });
        document.getElementById('totalHours').textContent = total;
        
        loadRecentEvents();
        
        Swal.close();
    }).catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error Loading Data',
            text: error.message,
            confirmButtonColor: '#3498db'
        });
    });
}

function loadRecentEvents() {
    const tbody = document.getElementById('recentEventsBody');
    
    firebase.firestore().collection('events')
        .orderBy('date', 'desc')
        .limit(5)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No events found</td></tr>';
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const event = doc.data();
                const eventDate = new Date(event.date).toLocaleDateString();
                const isUpcoming = new Date(event.date) > new Date();
                const status = isUpcoming ? 'Upcoming' : 'Past';
                const statusClass = isUpcoming ? 'status-upcoming' : 'status-completed';
                
                html += `
                    <tr>
                        <td>${event.title}</td>
                        <td>${eventDate}</td>
                        <td>${event.location}</td>
                        <td>${event.registeredCount || 0}/${event.requiredVolunteers}</td>
                        <td><span class="status-badge ${statusClass}">${status}</span></td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        });
}

document.getElementById('createEventForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    document.querySelectorAll('#createEventForm .error').forEach(el => el.textContent = '');
    
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const requiredVolunteers = parseInt(document.getElementById('requiredVolunteers').value);
    
    let isValid = true;
    
    if (!title) {
        document.getElementById('titleError').textContent = 'Title is required';
        isValid = false;
    }
    
    if (!description) {
        document.getElementById('descError').textContent = 'Description is required';
        isValid = false;
    }
    
    if (!date) {
        document.getElementById('dateError').textContent = 'Date is required';
        isValid = false;
    }
    
    if (!location) {
        document.getElementById('locationError').textContent = 'Location is required';
        isValid = false;
    }
    
    if (!requiredVolunteers || requiredVolunteers < 1) {
        document.getElementById('volunteersError').textContent = 'Valid number required';
        isValid = false;
    }
    
    if (!isValid) return;
    
    Swal.fire({
        title: 'Creating Event',
        html: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    firebase.firestore().collection('events').add({
        title: title,
        description: description,
        date: date,
        location: location,
        requiredVolunteers: requiredVolunteers,
        registeredCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser.uid
    })
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Event created successfully!',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#fff',
            iconColor: '#48bb78'
        });
        
        document.getElementById('createEventForm').reset();
        showSection('manageEvents');
        loadEvents();
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Try Again'
        });
    });
});

function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    eventsGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
            <p>Loading events...</p>
        </div>
    `;
    
    firebase.firestore().collection('events')
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                eventsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <h3>No Events Found</h3>
                        <p>Create your first event to get started</p>
                        <button onclick="showSection('createEvent')" class="btn">
                            <i class="fas fa-plus-circle"></i> Create Event
                        </button>
                    </div>
                `;
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const event = doc.data();
                const eventId = doc.id;
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const now = new Date();
                const isUpcoming = eventDate > now;
                const isOngoing = eventDate.toDateString() === now.toDateString() && eventDate > now;
                const isPast = eventDate < now;
                
                let statusClass = '';
                let statusText = '';
                
                if (isUpcoming) {
                    statusClass = 'status-upcoming';
                    statusText = 'Upcoming';
                } else if (isOngoing) {
                    statusClass = 'status-ongoing';
                    statusText = 'Ongoing';
                } else if (isPast) {
                    statusClass = 'status-completed';
                    statusText = 'Completed';
                }
                
                const registeredCount = event.registeredCount || 0;
                const requiredCount = event.requiredVolunteers || 0;
                const progressPercentage = requiredCount > 0 ? Math.min(100, (registeredCount / requiredCount) * 100) : 0;
                
                html += `
                    <div class="event-card">
                        <div class="event-card-header">
                            <h4>${event.title}</h4>
                            <span class="event-status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="event-card-body">
                            <div class="event-detail">
                                <i class="fas fa-calendar-alt"></i>
                                <span><strong>Date:</strong> ${formattedDate}</span>
                            </div>
                            <div class="event-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span><strong>Location:</strong> ${event.location}</span>
                            </div>
                            <div class="event-description-preview">
                                ${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}
                            </div>
                            
                            <div class="event-progress">
                                <div class="progress-label">
                                    <span>Volunteers Registered</span>
                                    <span>${registeredCount}/${requiredCount}</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progressPercentage}%;"></div>
                                </div>
                            </div>
                            
                            <div class="event-meta-stats">
                                <div class="meta-item">
                                    <div class="meta-label">Registered</div>
                                    <div class="meta-value">${registeredCount}</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">Needed</div>
                                    <div class="meta-value">${requiredCount}</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">Available</div>
                                    <div class="meta-value">${Math.max(0, requiredCount - registeredCount)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="event-actions">
                            <button onclick="editEvent('${eventId}')" class="btn-edit">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deleteEvent('${eventId}')" class="btn-delete">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                            <button onclick="viewEventDetails('${eventId}')" class="btn-view">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            eventsGrid.innerHTML = html;
        })
        .catch(error => {
            eventsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                    <h3>Error Loading Events</h3>
                    <p>${error.message}</p>
                    <button onclick="loadEvents()" class="btn">
                        <i class="fas fa-sync"></i> Try Again
                    </button>
                </div>
            `;
        });
}

function viewEventDetails(eventId) {
    Swal.fire({
        title: 'Loading Details',
        html: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    firebase.firestore().collection('events').doc(eventId).get()
        .then(doc => {
            if (doc.exists) {
                const event = doc.data();
                const eventDate = new Date(event.date);
                
                Swal.fire({
                    title: event.title,
                    html: `
                        <div style="text-align: left;">
                            <p><i class="fas fa-calendar" style="color: #3498db; width: 20px;"></i> 
                               <strong>Date:</strong> ${eventDate.toLocaleString()}</p>
                            <p><i class="fas fa-map-marker-alt" style="color: #e74c3c; width: 20px;"></i> 
                               <strong>Location:</strong> ${event.location}</p>
                            <p><i class="fas fa-users" style="color: #48bb78; width: 20px;"></i> 
                               <strong>Volunteers:</strong> ${event.registeredCount || 0}/${event.requiredVolunteers}</p>
                            <hr>
                            <p><strong>Description:</strong></p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                                ${event.description}
                            </div>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonColor: '#3498db',
                    confirmButtonText: 'Close',
                    showCancelButton: true,
                    cancelButtonColor: '#95a5a6',
                    cancelButtonText: 'Edit Event',
                    reverseButtons: true
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.cancel) {
                        editEvent(eventId);
                    }
                });
            }
        });
}

function loadEventsForDropdown() {
    const select = document.getElementById('selectEvent');
    
    firebase.firestore().collection('events')
        .orderBy('date', 'desc')
        .get()
        .then(snapshot => {
            let options = '<option value="">Choose an event</option>';
            snapshot.forEach(doc => {
                options += `<option value="${doc.id}">${doc.data().title} (${new Date(doc.data().date).toLocaleDateString()})</option>`;
            });
            select.innerHTML = options;
        });
}

function loadVolunteersForDropdown() {
    const select = document.getElementById('selectVolunteer');
    
    firebase.database().ref('users').once('value')
        .then(snapshot => {
            let options = '<option value="">Choose a volunteer</option>';
            snapshot.forEach(child => {
                const user = child.val();
                if (user.role === 'volunteer') {
                    options += `<option value="${child.key}">${user.name} (${user.email})</option>`;
                }
            });
            select.innerHTML = options;
        });
}

function logHours() {
    const eventId = document.getElementById('selectEvent').value;
    const volunteerId = document.getElementById('selectVolunteer').value;
    const hours = parseFloat(document.getElementById('hoursWorked').value);
    const messageDiv = document.getElementById('hoursMessage');
    
    if (!eventId || !volunteerId || !hours) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Form',
            text: 'Please fill all fields',
            confirmButtonColor: '#f39c12'
        });
        return;
    }
    
    Swal.fire({
        title: 'Confirm Hours',
        html: `
            <p>Are you sure you want to log <strong>${hours} hours</strong> for this volunteer?</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#48bb78',
        cancelButtonColor: '#e74c3c',
        confirmButtonText: 'Yes, Log Hours',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Logging Hours',
                html: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            firebase.firestore().collection('hours').add({
                eventId: eventId,
                volunteerId: volunteerId,
                hours: hours,
                date: new Date().toISOString(),
                loggedBy: auth.currentUser.uid
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Hours logged successfully!',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                
                document.getElementById('hoursWorked').value = '';
                loadRecentHours();
                
                updateEventStats(eventId);
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: error.message,
                    confirmButtonColor: '#e74c3c'
                });
            });
        }
    });
}

function showMessage(msg, type) {
    const messageDiv = document.getElementById('hoursMessage');
    messageDiv.textContent = msg;
    messageDiv.className = 'alert ' + (type === 'success' ? 'success' : 'error');
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function updateEventStats(eventId) {
    firebase.firestore().collection('events').doc(eventId).get()
        .then(doc => {
            if (doc.exists) {
                const currentCount = doc.data().registeredCount || 0;
                return firebase.firestore().collection('events').doc(eventId).update({
                    registeredCount: currentCount + 1
                });
            }
        })
        .catch(error => console.log('Error updating stats:', error));
}

function loadRecentHours() {
    const tbody = document.getElementById('recentHoursBody');
    
    firebase.firestore().collection('hours')
        .orderBy('date', 'desc')
        .limit(10)
        .get()
        .then(async snapshot => {
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hours logged yet</td></tr>';
                return;
            }
            
            let html = '';
            for (const doc of snapshot.docs) {
                const hour = doc.data();
                
                const eventDoc = await firebase.firestore().collection('events').doc(hour.eventId).get();
                const eventTitle = eventDoc.exists ? eventDoc.data().title : 'Unknown Event';
                
                const volunteerSnapshot = await firebase.database().ref('users/' + hour.volunteerId).once('value');
                const volunteerName = volunteerSnapshot.val() ? volunteerSnapshot.val().name : 'Unknown';
                
                html += `
                    <tr>
                        <td>${eventTitle}</td>
                        <td>${volunteerName}</td>
                        <td>${hour.hours}</td>
                        <td>${new Date(hour.date).toLocaleDateString()}</td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
        });
}

function loadReports() {
    Swal.fire({
        title: 'Loading Reports',
        html: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    Promise.all([
        loadHoursByEvent(),
        loadTopVolunteers(),
        loadDailySummary(),
        createHoursChart()
    ]).then(() => {
        Swal.close();
    }).catch(error => {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error Loading Reports',
            text: error.message,
            confirmButtonColor: '#e74c3c'
        });
    });
}

function loadHoursByEvent() {
    const list = document.getElementById('hoursByEventList');
    
    return firebase.firestore().collection('hours').get()
        .then(async snapshot => {
            const eventHours = {};
            
            for (const doc of snapshot.docs) {
                const hour = doc.data();
                eventHours[hour.eventId] = (eventHours[hour.eventId] || 0) + hour.hours;
            }
            
            let html = '';
            for (const [eventId, total] of Object.entries(eventHours)) {
                const eventDoc = await firebase.firestore().collection('events').doc(eventId).get();
                const eventTitle = eventDoc.exists ? eventDoc.data().title : 'Unknown';
                html += `<li><span>${eventTitle}</span> <span>${total} hours</span></li>`;
            }
            
            list.innerHTML = html || '<li class="text-center">No data available</li>';
        });
}

function loadTopVolunteers() {
    const list = document.getElementById('topVolunteersList');
    
    return firebase.firestore().collection('hours').get()
        .then(async snapshot => {
            const volunteerHours = {};
            
            for (const doc of snapshot.docs) {
                const hour = doc.data();
                volunteerHours[hour.volunteerId] = (volunteerHours[hour.volunteerId] || 0) + hour.hours;
            }
            
            const sorted = Object.entries(volunteerHours)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            let html = '';
            for (const [volunteerId, total] of sorted) {
                const volunteerSnapshot = await firebase.database().ref('users/' + volunteerId).once('value');
                const volunteerName = volunteerSnapshot.val() ? volunteerSnapshot.val().name : 'Unknown';
                html += `<li><span>${volunteerName}</span> <span>${total} hours</span></li>`;
            }
            
            list.innerHTML = html || '<li class="text-center">No data available</li>';
        });
}

function loadDailySummary() {
    const tbody = document.getElementById('dailyHoursBody');
    
    return firebase.firestore().collection('hours').get()
        .then(snapshot => {
            const dailyHours = {};
            const dailyEvents = {};
            
            snapshot.forEach(doc => {
                const hour = doc.data();
                const date = new Date(hour.date).toLocaleDateString();
                
                dailyHours[date] = (dailyHours[date] || 0) + hour.hours;
                dailyEvents[date] = (dailyEvents[date] || 0) + 1;
            });
            
            let html = '';
            Object.entries(dailyHours)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .slice(0, 10)
                .forEach(([date, hours]) => {
                    html += `
                        <tr>
                            <td>${date}</td>
                            <td>${hours}</td>
                            <td>${dailyEvents[date] || 0}</td>
                        </tr>
                    `;
                });
            
            tbody.innerHTML = html || '<tr><td colspan="3" class="text-center">No data available</td></tr>';
        });
}

function createHoursChart() {
    const ctx = document.getElementById('hoursChart').getContext('2d');
    
    if (window.hoursChart instanceof Chart) {
        window.hoursChart.destroy();
    }
    
    return firebase.firestore().collection('hours').get()
        .then(snapshot => {
            const last7Days = {};
            const today = new Date();
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                last7Days[dateStr] = 0;
            }
            
            snapshot.forEach(doc => {
                const hour = doc.data();
                const date = new Date(hour.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (last7Days.hasOwnProperty(date)) {
                    last7Days[date] += hour.hours;
                }
            });
            
            window.hoursChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(last7Days),
                    datasets: [{
                        label: 'Hours Volunteered',
                        data: Object.values(last7Days),
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: '#2980b9',
                        borderWidth: 2,
                        borderRadius: 6,
                        barPercentage: 0.7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#2c3e50',
                            titleColor: '#ecf0f1',
                            bodyColor: '#ecf0f1'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        });
}

function editEvent(eventId) {
    firebase.firestore().collection('events').doc(eventId).get()
        .then(doc => {
            if (doc.exists) {
                const event = doc.data();
                
                Swal.fire({
                    title: 'Edit Event',
                    html: `
                        <form id="editEventForm" style="text-align: left;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Title</label>
                                <input type="text" id="editTitle" value="${event.title}" style="width: 100%; padding: 10px; border: 2px solid #e0e7ef; border-radius: 8px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Description</label>
                                <textarea id="editDesc" rows="3" style="width: 100%; padding: 10px; border: 2px solid #e0e7ef; border-radius: 8px;">${event.description}</textarea>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Date</label>
                                <input type="datetime-local" id="editDate" value="${event.date}" style="width: 100%; padding: 10px; border: 2px solid #e0e7ef; border-radius: 8px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Location</label>
                                <input type="text" id="editLocation" value="${event.location}" style="width: 100%; padding: 10px; border: 2px solid #e0e7ef; border-radius: 8px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2c3e50;">Required Volunteers</label>
                                <input type="number" id="editRequired" min="1" value="${event.requiredVolunteers}" style="width: 100%; padding: 10px; border: 2px solid #e0e7ef; border-radius: 8px;">
                            </div>
                        </form>
                    `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#48bb78',
                    cancelButtonColor: '#e74c3c',
                    confirmButtonText: 'Update Event',
                    cancelButtonText: 'Cancel',
                    preConfirm: () => {
                        const title = document.getElementById('editTitle').value;
                        const desc = document.getElementById('editDesc').value;
                        const date = document.getElementById('editDate').value;
                        const location = document.getElementById('editLocation').value;
                        const required = parseInt(document.getElementById('editRequired').value);
                        
                        if (!title || !desc || !date || !location || !required) {
                            Swal.showValidationMessage('All fields are required');
                            return false;
                        }
                        
                        return { title, desc, date, location, required };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Updating Event',
                            html: 'Please wait...',
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });
                        
                        firebase.firestore().collection('events').doc(eventId).update({
                            title: result.value.title,
                            description: result.value.desc,
                            date: result.value.date,
                            location: result.value.location,
                            requiredVolunteers: result.value.required
                        })
                        .then(() => {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: 'Event updated successfully!',
                                timer: 2000,
                                timerProgressBar: true,
                                showConfirmButton: false
                            });
                            loadEvents();
                        })
                        .catch(error => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error!',
                                text: error.message,
                                confirmButtonColor: '#e74c3c'
                            });
                        });
                    }
                });
            }
        });
}

function deleteEvent(eventId) {
    Swal.fire({
        title: 'Are you sure?',
        html: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3498db',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        background: '#fff',
        backdrop: 'rgba(0,0,0,0.4)',
        showCloseButton: true,
        iconColor: '#e74c3c'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Deleting Event',
                html: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            firebase.firestore().collection('events').doc(eventId).delete()
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Event has been deleted.',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                    loadEvents();
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.message,
                        confirmButtonColor: '#e74c3c'
                    });
                });
        }
    });
}

document.querySelector('.close')?.addEventListener('click', function() {
    document.getElementById('editEventModal').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('editEventModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    Swal.fire({
        title: 'Logging out',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3498db',
        cancelButtonColor: '#e74c3c',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel',
        background: '#fff',
        backdrop: 'rgba(0,0,0,0.4)',
        showCloseButton: true,
        iconColor: '#3498db'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Logging out',
                html: 'Please wait...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard initialized');
});