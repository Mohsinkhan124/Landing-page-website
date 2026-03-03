const firebaseConfig = {
    apiKey: "AIzaSyCkbSf9Q_Frgbv-4Q6PqasrThDXBl1IJEY",
    authDomain: "volunteer-management-systems.firebaseapp.com",
    databaseURL: "https://volunteer-management-systems-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "volunteer-management-systems",
    storageBucket: "volunteer-management-systems.firebasestorage.app",
    messagingSenderId: "731686702642",
    appId: "1:731686702642:web:f3e76639c1cd35c35e762b"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();

let currentUser = null;
let currentEventId = null;

function initializeMobileMenu() {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const overlay = document.getElementById('mobileMenuOverlay');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (!mobileToggle || !overlay || !sidebar) {
        console.log('Mobile menu elements not found');
        return;
    }

    function toggleMenu(show) {
        if (show) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.style.overflow = '';
        }
    }

    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleMenu(!sidebar.classList.contains('active'));
    });

    
    overlay.addEventListener('click', () => {
        toggleMenu(false);
    });

    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                toggleMenu(false);
            }
        });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                document.body.style.overflow = '';
                mobileToggle.style.display = 'none';
            } else {
                mobileToggle.style.display = 'flex';
            }
        }, 250);
    });

    
    if (window.innerWidth <= 1024) {
        mobileToggle.style.display = 'flex';
    } else {
        mobileToggle.style.display = 'none';
    }

    let touchStartX = 0;
    let touchEndX = 0;

    sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            toggleMenu(false);
        }
    }, { passive: true });

    mainContent.addEventListener('touchstart', (e) => {
        if (!sidebar.classList.contains('active')) {
            touchStartX = e.changedTouches[0].screenX;
        }
    }, { passive: true });

    mainContent.addEventListener('touchend', (e) => {
        if (!sidebar.classList.contains('active') && touchStartX <= 30) {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 50) {
                toggleMenu(true);
            }
        }
    }, { passive: true });

    console.log('Mobile menu initialized');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeMobileMenu();
    }, 200);
});

auth.onAuthStateChanged(user => {
    if (user) {
        
        Swal.fire({
            title: 'Loading...',
            text: 'Please wait while we fetch your data',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        
        rtdb.ref('users/' + user.uid).once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.role === 'volunteer') {
                    currentUser = {
                        uid: user.uid,
                        ...userData
                    };
                    document.getElementById('userName').textContent = userData.name;
                    document.getElementById('welcomeName').textContent = userData.name.split(' ')[0];
                    
                   
                    Swal.close();
                    
                    loadDashboardData();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'You are not authorized to access this page',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'admin.html';
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Authentication Error',
                    text: error.message
                });
            });
    } else {
        window.location.href = 'index.html';
    }
});

function showSection(section) {
   
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(section + 'Section').style.display = 'block';
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    
    if (section !== 'dashboard') {
        Swal.fire({
            title: 'Loading...',
            text: `Loading ${section} data`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
    
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'availableEvents':
            loadAvailableEvents();
            break;
        case 'myEvents':
            loadMyEvents();
            break;
        case 'myHours':
            loadMyHours();
            break;
        case 'reports':
            loadMyReports();
            break;
    }
}

function loadDashboardData() {
    if (!currentUser) return;
    
    db.collection('registrations')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            document.getElementById('totalRegistered').textContent = snapshot.size;
            
            const now = new Date();
            let upcoming = 0;
            let recentActivities = [];
            
            const promises = [];
            snapshot.forEach(doc => {
                const registration = doc.data();
                promises.push(
                    db.collection('events').doc(registration.eventId).get()
                        .then(eventDoc => {
                            if (eventDoc.exists) {
                                const eventDate = new Date(eventDoc.data().date);
                                if (eventDate > now) {
                                    upcoming++;
                                }
                                
                                recentActivities.push({
                                    type: 'registration',
                                    eventName: eventDoc.data().title,
                                    date: registration.registeredAt,
                                    eventDate: eventDate
                                });
                            }
                        })
                );
            });
            
            Promise.all(promises).then(() => {
                document.getElementById('upcomingEvents').textContent = upcoming;
                
                recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
                displayRecentActivities(recentActivities.slice(0, 5));
            });
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Dashboard',
                text: error.message
            });
        });
    
    db.collection('hours')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            let total = 0;
            snapshot.forEach(doc => {
                total += doc.data().hours || 0;
            });
            document.getElementById('totalHours').textContent = total;
            
            document.getElementById('impactPoints').textContent = total * 10;
        })
        .catch(error => {
            console.error('Error loading hours:', error);
        });
}

function displayRecentActivities(activities) {
    const container = document.getElementById('recentActivity');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="text-center">No recent activity</p>';
        return;
    }
    
    let html = '';
    activities.forEach(activity => {
        const date = new Date(activity.date).toLocaleDateString();
        const eventDate = activity.eventDate.toLocaleDateString();
        
        html += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Registered for ${activity.eventName}</div>
                    <div class="activity-time">${date} • Event on ${eventDate}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function loadAvailableEvents() {
    const grid = document.getElementById('availableEventsGrid');
    
    db.collection('events')
        .where('date', '>=', new Date().toISOString())
        .orderBy('date', 'asc')
        .get()
        .then(async snapshot => {
            Swal.close();
            
            if (snapshot.empty) {
                grid.innerHTML = '<p class="text-center">No events available</p>';
                return;
            }
            
            const registrations = await db.collection('registrations')
                .where('volunteerId', '==', currentUser.uid)
                .get();
            
            const registeredEvents = new Set();
            registrations.forEach(doc => {
                registeredEvents.add(doc.data().eventId);
            });
            
            let html = '';
            snapshot.forEach(doc => {
                const event = doc.data();
                const eventId = doc.id;
                const eventDate = new Date(event.date).toLocaleString();
                const isRegistered = registeredEvents.has(eventId);
                const isFull = (event.registeredCount || 0) >= event.requiredVolunteers;
                
                html += `
                    <div class="event-card ${isRegistered ? 'registered' : 'available'}">
                        <span class="event-badge ${isRegistered ? 'badge-registered' : (isFull ? 'badge-full' : 'badge-available')}">
                            ${isRegistered ? '✓ Registered' : (isFull ? 'Full' : 'Available')}
                        </span>
                        <h3>${event.title}</h3>
                        <div class="event-date"><i class="fas fa-calendar"></i> ${eventDate}</div>
                        <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                        <p class="event-description">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
                        <div class="event-meta">
                            <span><i class="fas fa-users"></i> ${event.registeredCount || 0}/${event.requiredVolunteers}</span>
                            <button onclick="showEventDetails('${eventId}')" class="btn-small">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                        </div>
                    </div>
                `;
            });
            
            grid.innerHTML = html;
        })
        .catch(error => {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Events',
                text: error.message
            });
            grid.innerHTML = `<p class="text-center text-danger">Error: ${error.message}</p>`;
        });
}

function filterEvents() {
    const searchTerm = document.getElementById('searchEvent').value.toLowerCase();
    const filterValue = document.getElementById('filterDate').value;
    
    const events = document.querySelectorAll('.event-card');
    const now = new Date();
    
    events.forEach(event => {
        let show = true;
        
        // Search filter
        if (searchTerm) {
            const title = event.querySelector('h3').textContent.toLowerCase();
            const desc = event.querySelector('.event-description').textContent.toLowerCase();
            if (!title.includes(searchTerm) && !desc.includes(searchTerm)) {
                show = false;
            }
        }
        
        if (filterValue !== 'all') {
        }
        
        event.style.display = show ? 'block' : 'none';
    });
}

function showEventDetails(eventId) {
    currentEventId = eventId;
    
    Swal.fire({
        title: 'Loading Event Details...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    db.collection('events').doc(eventId).get()
        .then(async (doc) => {
            if (doc.exists) {
                const event = doc.data();
                
                const registration = await db.collection('registrations')
                    .where('eventId', '==', eventId)
                    .where('volunteerId', '==', currentUser.uid)
                    .get();
                
                const isRegistered = !registration.empty;
                const isFull = (event.registeredCount || 0) >= event.requiredVolunteers;
                
                let buttons = {};
                
                if (isRegistered) {
                    buttons = {
                        confirm: {
                            text: 'Cancel Registration',
                            color: '#f56565',
                            action: unregisterFromEvent
                        },
                        cancel: {
                            text: 'Close',
                            color: '#718096'
                        }
                    };
                } else if (isFull) {
                    buttons = {
                        cancel: {
                            text: 'Close',
                            color: '#718096'
                        }
                    };
                } else {
                    buttons = {
                        confirm: {
                            text: 'Register Now',
                            color: '#48bb78',
                            action: registerForEvent
                        },
                        cancel: {
                            text: 'Close',
                            color: '#718096'
                        }
                    };
                }
                
                const eventDate = new Date(event.date).toLocaleString();
                const volunteersStatus = `${event.registeredCount || 0}/${event.requiredVolunteers} volunteers`;
                
                let statusHtml = '';
                if (isRegistered) {
                    statusHtml = '<span style="color: #9f7aea; font-weight: bold;">✓ You are registered for this event</span>';
                } else if (isFull) {
                    statusHtml = '<span style="color: #f56565; font-weight: bold;"> This event is full</span>';
                }
                
                Swal.fire({
                    title: event.title,
                    html: `
                        <div style="text-align: left;">
                            <p><i class="fas fa-calendar" style="color: #48bb78; width: 25px;"></i> <strong>Date:</strong> ${eventDate}</p>
                            <p><i class="fas fa-map-marker-alt" style="color: #48bb78; width: 25px;"></i> <strong>Location:</strong> ${event.location}</p>
                            <p><i class="fas fa-users" style="color: #48bb78; width: 25px;"></i> <strong>Volunteers:</strong> ${volunteersStatus}</p>
                            <p><i class="fas fa-align-left" style="color: #48bb78; width: 25px;"></i> <strong>Description:</strong></p>
                            <p style="background: #f7fafc; padding: 10px; border-radius: 8px;">${event.description}</p>
                            ${statusHtml}
                        </div>
                    `,
                    icon: isRegistered ? 'success' : (isFull ? 'warning' : 'info'),
                    showCancelButton: true,
                    showConfirmButton: !isFull,
                    confirmButtonText: isRegistered ? 'Cancel Registration' : 'Register Now',
                    confirmButtonColor: isRegistered ? '#f56565' : '#48bb78',
                    cancelButtonText: 'Close',
                    cancelButtonColor: '#718096',
                    preConfirm: () => {
                        if (isRegistered) {
                            return unregisterFromEvent();
                        } else if (!isFull) {
                            return registerForEvent();
                        }
                    }
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        });
}

function registerForEvent() {
    if (!currentEventId || !currentUser) return;
    
    Swal.fire({
        title: 'Register for Event?',
        text: 'Are you sure you want to register for this event?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#48bb78',
        cancelButtonColor: '#f56565',
        confirmButtonText: 'Yes, register me!',
        cancelButtonText: 'No, cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Processing...',
                text: 'Please wait while we register you',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            db.collection('registrations').add({
                eventId: currentEventId,
                volunteerId: currentUser.uid,
                volunteerName: currentUser.name,
                registeredAt: new Date().toISOString(),
                status: 'registered'
            })
            .then(() => {
                const eventRef = db.collection('events').doc(currentEventId);
                return db.runTransaction((transaction) => {
                    return transaction.get(eventRef).then((doc) => {
                        const newCount = (doc.data().registeredCount || 0) + 1;
                        transaction.update(eventRef, { registeredCount: newCount });
                    });
                });
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully Registered!',
                    text: 'You have been registered for the event',
                    timer: 2000,
                    showConfirmButton: false
                });
                loadAvailableEvents();
                loadMyEvents();
                loadDashboardData();
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: error.message
                });
            });
        }
    });
}

function unregisterFromEvent() {
    if (!currentEventId || !currentUser) return;
    
    Swal.fire({
        title: 'Cancel Registration?',
        text: 'Are you sure you want to cancel your registration?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f56565',
        cancelButtonColor: '#48bb78',
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Processing...',
                text: 'Please wait while we cancel your registration',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            db.collection('registrations')
                .where('eventId', '==', currentEventId)
                .where('volunteerId', '==', currentUser.uid)
                .get()
                .then(snapshot => {
                    const promises = [];
                    snapshot.forEach(doc => {
                        promises.push(doc.ref.delete());
                    });
                    return Promise.all(promises);
                })
                .then(() => {
                    const eventRef = db.collection('events').doc(currentEventId);
                    return db.runTransaction((transaction) => {
                        return transaction.get(eventRef).then((doc) => {
                            const newCount = Math.max(0, (doc.data().registeredCount || 0) - 1);
                            transaction.update(eventRef, { registeredCount: newCount });
                        });
                    });
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registration Cancelled!',
                        text: 'You have been unregistered from the event',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    loadAvailableEvents();
                    loadMyEvents();
                    loadDashboardData();
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message
                    });
                });
        }
    });
}

function loadMyEvents() {
    const upcomingGrid = document.getElementById('upcomingEventsGrid');
    const pastGrid = document.getElementById('pastEventsGrid');
    
    db.collection('registrations')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(async snapshot => {
            Swal.close();
            
            if (snapshot.empty) {
                upcomingGrid.innerHTML = '<p class="text-center">No registered events</p>';
                pastGrid.innerHTML = '<p class="text-center">No past events</p>';
                return;
            }
            
            let upcomingHtml = '';
            let pastHtml = '';
            const now = new Date();
            
            for (const doc of snapshot.docs) {
                const registration = doc.data();
                const eventDoc = await db.collection('events').doc(registration.eventId).get();
                
                if (eventDoc.exists) {
                    const event = eventDoc.data();
                    const eventDate = new Date(event.date);
                    
                    const eventCard = `
                        <div class="event-card ${eventDate > now ? 'registered' : 'past'}">
                            <h3>${event.title}</h3>
                            <div class="event-date"><i class="fas fa-calendar"></i> ${eventDate.toLocaleString()}</div>
                            <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                            <div class="event-meta">
                                <span><i class="fas fa-clock"></i> Registered: ${new Date(registration.registeredAt).toLocaleDateString()}</span>
                                <button onclick="showEventDetails('${eventDoc.id}')" class="btn-small">
                                    <i class="fas fa-info-circle"></i> Details
                                </button>
                            </div>
                        </div>
                    `;
                    
                    if (eventDate > now) {
                        upcomingHtml += eventCard;
                    } else {
                        pastHtml += eventCard;
                    }
                }
            }
            
            upcomingGrid.innerHTML = upcomingHtml || '<p class="text-center">No upcoming events</p>';
            pastGrid.innerHTML = pastHtml || '<p class="text-center">No past events</p>';
        })
        .catch(error => {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        });
}

function showEventTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('upcomingEventsTab').style.display = tab === 'upcoming' ? 'block' : 'none';
    document.getElementById('pastEventsTab').style.display = tab === 'past' ? 'block' : 'none';
}

function loadMyHours() {
    const totalDisplay = document.getElementById('totalHoursDisplay');
    const hoursList = document.getElementById('hoursByEventList');
    const historyBody = document.getElementById('hoursHistoryBody');
    
    db.collection('hours')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(async snapshot => {
            Swal.close();
            
            let total = 0;
            const eventHours = {};
            const hoursHistory = [];
            
            for (const doc of snapshot.docs) {
                const hour = doc.data();
                total += hour.hours;
                
                if (!eventHours[hour.eventId]) {
                    eventHours[hour.eventId] = 0;
                }
                eventHours[hour.eventId] += hour.hours;
                
                hoursHistory.push(hour);
            }
            
            totalDisplay.textContent = total;
            
            let hoursHtml = '';
            for (const [eventId, hours] of Object.entries(eventHours)) {
                const eventDoc = await db.collection('events').doc(eventId).get();
                const eventName = eventDoc.exists ? eventDoc.data().title : 'Unknown Event';
                hoursHtml += `
                    <li>
                        <span class="event-name">${eventName}</span>
                        <span class="event-hours">${hours} hrs</span>
                    </li>
                `;
            }
            hoursList.innerHTML = hoursHtml || '<p>No hours logged yet</p>';
            
            // Display hours history
            hoursHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            let historyHtml = '';
            for (const hour of hoursHistory.slice(0, 10)) {
                const eventDoc = await db.collection('events').doc(hour.eventId).get();
                const eventName = eventDoc.exists ? eventDoc.data().title : 'Unknown Event';
                
                historyHtml += `
                    <tr>
                        <td>${eventName}</td>
                        <td>${new Date(hour.date).toLocaleDateString()}</td>
                        <td>${hour.hours}</td>
                        <td><span class="badge badge-success">Completed</span></td>
                    </tr>
                `;
            }
            historyBody.innerHTML = historyHtml || '<tr><td colspan="4">No hours history</td></tr>';
        })
        .catch(error => {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        });
}

// Load My Reports
function loadMyReports() {
    // Close loading from section switch
    Swal.close();
    
    loadMonthlyChart();
    loadPieChart();
    loadWeeklyChart();
    loadDetailedReport();
}

function loadMonthlyChart() {
    db.collection('hours')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            const monthlyData = {};
            
            snapshot.forEach(doc => {
                const hour = doc.data();
                const month = new Date(hour.date).toLocaleString('default', { month: 'short' });
                monthlyData[month] = (monthlyData[month] || 0) + hour.hours;
            });
            
            const ctx = document.getElementById('monthlyChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Object.keys(monthlyData),
                    datasets: [{
                        label: 'Hours',
                        data: Object.values(monthlyData),
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => {
            console.error('Error loading monthly chart:', error);
        });
}

function loadPieChart() {
    db.collection('hours')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(async snapshot => {
            const eventTypes = {};
            
            for (const doc of snapshot.docs) {
                const hour = doc.data();
                const eventDoc = await db.collection('events').doc(hour.eventId).get();
                if (eventDoc.exists) {
                    const type = eventDoc.data().type || 'General';
                    eventTypes[type] = (eventTypes[type] || 0) + hour.hours;
                }
            }
            
            const ctx = document.getElementById('eventsPieChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(eventTypes),
                    datasets: [{
                        data: Object.values(eventTypes),
                        backgroundColor: ['#48bb78', '#4299e1', '#ed8936', '#9f7aea', '#f56565']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => {
            console.error('Error loading pie chart:', error);
        });
}

function loadWeeklyChart() {
    db.collection('hours')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            const weeklyData = {
                'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
            };
            
            snapshot.forEach(doc => {
                const hour = doc.data();
                const day = new Date(hour.date).toLocaleString('default', { weekday: 'short' });
                weeklyData[day] = (weeklyData[day] || 0) + hour.hours;
            });
            
            const ctx = document.getElementById('weeklyChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(weeklyData),
                    datasets: [{
                        label: 'Hours',
                        data: Object.values(weeklyData),
                        backgroundColor: '#48bb78'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        })
        .catch(error => {
            console.error('Error loading weekly chart:', error);
        });
}

function loadDetailedReport() {
    const tbody = document.getElementById('detailedReportBody');
    
    db.collection('hours')
        .where('volunteerId', '==', currentUser.uid)
        .get()
        .then(snapshot => {
            const monthlyReport = {};
            
            snapshot.forEach(doc => {
                const hour = doc.data();
                const month = new Date(hour.date).toLocaleString('default', { month: 'long', year: 'numeric' });
                
                if (!monthlyReport[month]) {
                    monthlyReport[month] = {
                        events: new Set(),
                        hours: 0
                    };
                }
                
                monthlyReport[month].events.add(hour.eventId);
                monthlyReport[month].hours += hour.hours;
            });
            
            let html = '';
            Object.entries(monthlyReport).forEach(([month, data]) => {
                const impact = data.hours * 10;
                const impactClass = impact > 50 ? 'impact-high' : (impact > 20 ? 'impact-medium' : 'impact-low');
                
                html += `
                    <tr>
                        <td>${month}</td>
                        <td>${data.events.size}</td>
                        <td>${data.hours}</td>
                        <td><span class="impact-badge ${impactClass}">${impact} pts</span></td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html || '<tr><td colspan="4">No data available</td></tr>';
        })
        .catch(error => {
            console.error('Error loading detailed report:', error);
        });
}

// Remove old modal functions - they're no longer needed
// function showSuccessMessage(message) { ... }
// function closeModal() { ... }
// function closeSuccessModal() { ... }

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    Swal.fire({
        title: 'Logging Out...',
        text: 'Please wait while we sign you out',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    auth.signOut()
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Logged Out Successfully',
                text: 'See you soon!',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'index.html';
            });
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Logout Failed',
                text: error.message
            });
        });
});
