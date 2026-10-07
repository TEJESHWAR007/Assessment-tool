import './style.css';
const API_BASE_URL = 'http://localhost:8080';
const originalFetch = window.fetch;
window.fetch = async function() {
    let resource = arguments[0];
    let config = arguments[1] || {};
    
    if (typeof resource === 'string' && resource.startsWith(API_BASE_URL + '')) {
        config.headers = config.headers || {};
        const role = sessionStorage.getItem('user_role');
        if (role) {
            config.headers['X-User-Role'] = role;
        }
    }
    return originalFetch(resource, config);
};


// --- Types & Interfaces ---
interface User {
    
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

interface ScoreData {
    subject: string;
    score: number; // 0 to 100
}

interface CompletionRate {
    level: string;
    percentage: number;
    colorClass: string;
}

interface Activity {
    user: string;
    action: string;
    assessment: string;
    time: string;
    status: 'passed' | 'in-progress' | 'failed';
    score?: number;
}

interface AssessmentReport {
    id: string;
    name: string;
    date: string;
    type: string;
    status: 'Ready' | 'Generating';
}

interface Question {
    id: string;
    text: string;
    type: string;
}

interface Assessment {
    id: string;
    title: string;
    category: string;
    questions: number;
    timeLimit: number;
    status: 'Published' | 'Draft';
}

interface Assignment {
    id: string;
    assessmentId: string;
    group: string;
    dueDate: string;
    completed: number;
    total: number;
}

interface Submission {
    id: string;
    assignmentId: string;
    userId: string;
    userName: string;
    assessmentTitle: string;
    score: number;
    submittedAt: string;
    status: string;
    feedback: string;
}

// --- Mock Data & Initialization ---
const initialUsers: User[] = [
    { id: 'usr_1', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
    { id: 'usr_2', name: 'Bob Jones', email: 'bob@example.com', role: 'Reviewer', status: 'Active' },
    { id: 'usr_3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'student', status: 'Inactive' },
    { id: 'usr_4', name: 'Diana Prince', email: 'diana@example.com', role: 'student', status: 'Active' },
];

if (!localStorage.getItem('assess_users')) {
    localStorage.setItem('assess_users', JSON.stringify(initialUsers));
}

const mockScores: ScoreData[] = [
    { subject: 'Math', score: 68 },
    { subject: 'Science', score: 85 },
    { subject: 'History', score: 55 },
    { subject: 'English', score: 78 },
    { subject: 'IT', score: 92 },
];

const mockCompletionRates: CompletionRate[] = [
    { level: 'Beginner Level', percentage: 95, colorClass: 'fill-success' },
    { level: 'Intermediate Level', percentage: 68, colorClass: 'fill-primary' },
    { level: 'Advanced Level', percentage: 32, colorClass: 'fill-warning' },
];

const mockActivities: Activity[] = [
    { user: 'Jane Doe', action: 'passed', assessment: 'React Basics', time: '2 hours ago', status: 'passed', score: 92 },
    { user: 'John Smith', action: 'started', assessment: 'Data Structures', time: '5 hours ago', status: 'in-progress' },
    { user: 'Alice Johnson', action: 'failed', assessment: 'Cloud Computing', time: '1 day ago', status: 'failed', score: 45 },
];

let mockReports: AssessmentReport[] = [
    { id: 'rep_1', name: 'Q1 Performance Summary', date: 'Oct 12, 2026', type: 'Performance', status: 'Ready' },
    { id: 'rep_2', name: 'Cloud Computing Drop-off Analysis', date: 'Oct 10, 2026', type: 'Completion Rate', status: 'Ready' },
    { id: 'rep_3', name: 'Java Bootcamp Completion', date: 'Oct 15, 2026', type: 'Certificate', status: 'Ready' },
    { id: 'rep_4', name: 'React Excellence Award', date: 'Oct 16, 2026', type: 'Certificate', status: 'Ready' }
];

let isAuthenticated: boolean = sessionStorage.getItem('is_auth') === 'true';

// --- DOM Elements ---
// Helper for safely getting elements
const getEl = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const loginView = getEl<HTMLDivElement>('login-view');
const appView = getEl<HTMLDivElement>('app-view');
const loginForm = getEl<HTMLFormElement>('login-form');
const logoutBtn = getEl<HTMLButtonElement>('logout-btn');

const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const pageTitle = getEl<HTMLHeadingElement>('page-title');

const userModal = getEl<HTMLDivElement>('user-modal');
const userForm = getEl<HTMLFormElement>('user-form');
const usersTableBody = getEl<HTMLTableSectionElement>('users-table-body');
const emptyState = getEl<HTMLDivElement>('empty-state');
const dataTableContainer = getEl<HTMLTableElement>('data-table-container');

const totalUsersStat = getEl<HTMLHeadingElement>('total-users-stat');
const activeUsersStat = getEl<HTMLHeadingElement>('active-users-stat');
const adminsStat = getEl<HTMLHeadingElement>('admins-stat');

const assessmentChart = getEl<HTMLDivElement>('assessment-chart');
const completionRatesList = getEl<HTMLDivElement>('completion-rates-list');
const recentActivityList = getEl<HTMLUListElement>('recent-activity-list');

const btnGenerateReport = getEl<HTMLButtonElement>('btn-generate-report');
const reportsTableContainer = getEl<HTMLTableElement>('reports-table-container');
const reportsTableBody = getEl<HTMLTableSectionElement>('reports-table-body');
const reportsEmptyState = getEl<HTMLDivElement>('reports-empty-state');

// Extra specific bindings added for TypeScript safety (avoiding inline onclick attributes)
const btnAddUser = getEl<HTMLButtonElement>('btn-add-user');
const btnCloseModal = getEl<HTMLButtonElement>('btn-close-modal');
const btnCancelModal = getEl<HTMLButtonElement>('btn-cancel-modal');

// Educator Elements
const adminSidebar = getEl<HTMLElement>('admin-sidebar');
const educatorSidebar = getEl<HTMLElement>('educator-sidebar');
const educatorLogoutBtn = getEl<HTMLButtonElement>('educator-logout-btn');
const assessmentsTableBody = getEl<HTMLTableSectionElement>('assessments-table-body');
const assignmentsTableBody = getEl<HTMLTableSectionElement>('assignments-table-body');
const btnCreateAssessmentNav = getEl<HTMLButtonElement>('btn-create-assessment-nav');
const btnAddQuestion = getEl<HTMLButtonElement>('btn-add-question');
const assessmentForm = getEl<HTMLFormElement>('assessment-form');
const questionsList = getEl<HTMLDivElement>('questions-list');
const btnNewAssignment = getEl<HTMLButtonElement>('btn-new-assignment');
const groupCompletionList = getEl<HTMLDivElement>('group-completion-list');
const educatorActivityList = getEl<HTMLUListElement>('educator-activity-list');

// Review Elements
const submissionsTableBody = getEl<HTMLTableSectionElement>('submissions-table-body');
const reviewModal = getEl<HTMLDivElement>('review-modal');
const feedbackForm = getEl<HTMLFormElement>('feedback-form');
const btnCloseReviewModal = getEl<HTMLButtonElement>('btn-close-review-modal');
const btnCancelReview = getEl<HTMLButtonElement>('btn-cancel-review');

// Student Elements
const studentSidebar = getEl<HTMLElement>('student-sidebar');
const studentLogoutBtn = getEl<HTMLButtonElement>('student-logout-btn');
const availableAssessmentsBody = getEl<HTMLTableSectionElement>('available-assessments-body');
const studentResultsBody = getEl<HTMLTableSectionElement>('student-results-body');

const quizTimerEl = getEl<HTMLSpanElement>('quiz-timer');
const quizTitleEl = getEl<HTMLHeadingElement>('quiz-title');
const quizProgressInner = getEl<HTMLDivElement>('quiz-progress-inner');
const questionTextEl = getEl<HTMLDivElement>('question-text');
const optionsContainer = getEl<HTMLDivElement>('options-container');
const btnPrevQuestion = getEl<HTMLButtonElement>('btn-prev-question');
const btnNextQuestion = getEl<HTMLButtonElement>('btn-next-question');
const btnSubmitQuiz = getEl<HTMLButtonElement>('btn-submit-quiz');
const questionCounterEl = getEl<HTMLSpanElement>('question-counter');

// Detail Elements
const btnBeginAssessment = getEl<HTMLButtonElement>('btn-begin-assessment');
let selectedAssessmentId: string | null = null;

// --- Core Initialization ---
function startApp() {
    checkAuth();
    if (isAuthenticated) {
        initDashboard();
    }
    
    // Global Event Listeners
    const btnCloseCert = document.getElementById('btn-close-cert');
    if (btnCloseCert) {
        btnCloseCert.addEventListener('click', () => {
            const certModal = document.getElementById('certificate-modal');
            if (certModal) {
                certModal.classList.add('hidden');
                certModal.style.removeProperty('display');
                certModal.style.removeProperty('opacity');
                certModal.style.removeProperty('visibility');
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    // If HMR reloaded the module after DOMContentLoaded has already fired
    startApp();
}

// --- Authentication Logic ---
function checkAuth(): void {
    const forgotView = document.getElementById('forgot-password-view');
    const signupV = document.getElementById('signup-view');
    const homeView = document.getElementById('home-view');
    const userRole = sessionStorage.getItem('user_role');

    if (isAuthenticated) {
        loginView.classList.add('hidden');
        if (forgotView) forgotView.classList.add('hidden');
        if (signupV) signupV.classList.add('hidden');
        if (homeView) homeView.classList.add('hidden');
        appView.classList.remove('hidden');

        // Toggle Sidebar based on role
        if (userRole === 'Admin') {
            adminSidebar.classList.remove('hidden');
            educatorSidebar.classList.add('hidden');
            studentSidebar.classList.add('hidden');
        } else if (userRole === 'Educator') {
            adminSidebar.classList.add('hidden');
            educatorSidebar.classList.remove('hidden');
            studentSidebar.classList.add('hidden');
            getEl<HTMLDivElement>('educator-user-name').textContent = sessionStorage.getItem('user_name') || 'Instructor';
        } else if (userRole === 'student' || userRole === 'Taker') {
            adminSidebar.classList.add('hidden');
            educatorSidebar.classList.add('hidden');
            studentSidebar.classList.remove('hidden');
            getEl<HTMLDivElement>('student-user-name').textContent = sessionStorage.getItem('user_name') || 'Student';
        }
    } else {
        appView.classList.add('hidden');
        if (loginView && !loginView.classList.contains('hidden')) return;
        if (forgotView && !forgotView.classList.contains('hidden')) return;
        if (signupV && !signupV.classList.contains('hidden')) return;
        
        if (homeView) {
            homeView.classList.remove('hidden');
            loginView.classList.add('hidden');
        } else {
            loginView.classList.remove('hidden');
        }
    }
}

loginForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    const usernameInput = getEl<HTMLInputElement>('login-username').value;
    const pwdInput = getEl<HTMLInputElement>('login-password').value;

    try {
        const response = await fetch(API_BASE_URL + '/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: pwdInput })
        });
        
        if (!response.ok) {
            showToast('Invalid credentials. Please try again.', 'danger');
            return;
        }
        
        const user = await response.json();

        if (user) {
            isAuthenticated = true;
            sessionStorage.setItem('is_auth', 'true');
            sessionStorage.setItem('user_role', user.role || 'Admin');
            sessionStorage.setItem('user_name', user.username || 'User');
            showToast('Login successful!', 'success');
            
            setTimeout(() => {
                checkAuth();
                initDashboard();
            }, 500);
        }
    } catch (err) {
        console.error('Login error:', err);
        showToast('Invalid credentials. Please try again.', 'danger');
    }
});

logoutBtn.addEventListener('click', () => {
    performLogout();
});

educatorLogoutBtn.addEventListener('click', () => {
    performLogout();
});

studentLogoutBtn.addEventListener('click', () => {
    performLogout();
});

function performLogout(): void {
    isAuthenticated = false;
    sessionStorage.removeItem('is_auth');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('user_name');
    
    // Clear the forms so they don't persist after logging out
    loginForm.reset();
    const signupForm = document.getElementById('signup-form') as HTMLFormElement;
    if (signupForm) signupForm.reset();
    
    showToast('Logged out successfully', 'success');
    checkAuth();
}

const getStartedBtn = document.getElementById('get-started-btn');
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
        const homeView = document.getElementById('home-view');
        if (homeView) homeView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const forgotPasswordView = document.getElementById('forgot-password-view');
const forgotPasswordForm = document.getElementById('forgot-password-form');

if (forgotPasswordLink && backToLoginLink && forgotPasswordView) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        forgotPasswordView.classList.remove('hidden');
    });

    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = (document.getElementById('forgot-email') as HTMLInputElement).value;
        const newPass = (document.getElementById('reset-password') as HTMLInputElement).value;
        const confirmPass = (document.getElementById('confirm-reset-password') as HTMLInputElement).value;
        
        if (newPass !== confirmPass) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        try {
            // Find user by email
            const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
            const users = await response.json();
            
            if (users.length === 0) {
                showToast('Email not found.', 'error');
                return;
            }

            const user = users[0];
            
            // Update password
            const patchResponse = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPass })
            });

            if (patchResponse.ok) {
                showToast('Password updated successfully! Please login.', 'success');
                setTimeout(() => {
                    forgotPasswordView!.classList.add('hidden');
                    loginView.classList.remove('hidden');
                    (forgotPasswordForm as HTMLFormElement).reset();
                }, 1500);
            } else {
                showToast('Failed to update password.', 'error');
            }
        } catch (err) {
            console.error('Password reset error:', err);
            showToast('Error connecting to the database.', 'error');
        }
    });
}

const signUpLink = document.getElementById('sign-up-link');
const signupView = document.getElementById('signup-view');
const signupLoginLink = document.getElementById('signup-login-link');
const signupForm = document.getElementById('signup-form');

if (signUpLink && signupView) {
    signUpLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
    });
}

if (signupLoginLink && signupView) {
    signupLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = (document.getElementById('signup-name') as HTMLInputElement).value;
        const email = (document.getElementById('signup-email') as HTMLInputElement).value;
        const password = (document.getElementById('signup-password') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('signup-confirm-password') as HTMLInputElement).value;
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'danger');
            return;
        }
        
        try {
            const response = await fetch(API_BASE_URL + '/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: String(Date.now()),
                    username: name,
                    email: email,
                    password: password
                }),
            });

            if (response.ok) {
                const newUser = await response.json();
                showToast('Registration successful!', 'success');
                
                // Auto-login logic
                isAuthenticated = true;
                sessionStorage.setItem('is_auth', 'true');
                sessionStorage.setItem('user_role', newUser.role || 'student');
                sessionStorage.setItem('user_name', newUser.username);
                
                setTimeout(() => {
                    checkAuth();
                    initDashboard();
                }, 1000);
            } else {
                showToast('Failed to save to database.', 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('DEBUG: ' + error); showToast('Network error or server is not running.', 'error');
        }
    });
}

// --- Dashboard Logic ---
function initDashboard(): void {
    setupNavigation();
    const userRole = sessionStorage.getItem('user_role');

    if (userRole === 'Admin') {
        document.title = 'Admin Dashboard';
        fetchAndRenderUserTable();
        
        renderAnalytics(mockScores, mockCompletionRates, mockActivities);
        renderReports();
        
        // Default to users page
        switchPage('users');
    } else if (userRole === 'Educator') {
        document.title = 'Educator Console';
        initEducatorModule();
        // Default to assessments page
        switchPage('assessments');
    } else if (userRole === 'student' || userRole === 'Taker') {
        document.title = 'Student Dashboard';
        initStudentModule();
        // Default to available assessments page
        switchPage('available-assessments');
    }
}

function switchPage(targetId: string): void {
    const allPages = document.querySelectorAll('.page');
    const allNavBtns = document.querySelectorAll('.nav-btn');
    
    allPages.forEach(p => p.classList.remove('active'));
    allNavBtns.forEach(b => b.classList.remove('active'));
    
    const targetPage = getEl<HTMLDivElement>(`${targetId}-page`);
    if (targetPage) targetPage.classList.add('active');
    
    const activeBtn = Array.from(allNavBtns).find(b => b.getAttribute('data-target') === targetId);
    if (activeBtn) activeBtn.classList.add('active');

    // Update Title
    const titles: Record<string, string> = {
        'users': 'User Management',
        'analytics': 'Assessment Analytics',
        'assessments': 'Assessment Management',
        'create-assessment': 'Create New Assessment',
        'assignments': 'Assignment Delivery',
        'monitor': 'Progress Monitoring',
        'review': 'Review Results',
        'available-assessments': 'Available Assessments',
        'assessment-details': 'Assessment Instructions',
        'student-results': 'My Performance',
        'take-quiz': 'Assessment Session'
    };
    pageTitle.textContent = titles[targetId] || 'Dashboard';
}

function setupNavigation(): void {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = (e.currentTarget as HTMLElement).getAttribute('data-target');
            if (targetId) switchPage(targetId);
        });
    });
}

// --- User Management Logic ---
function getUsers(): User[] {
    const data = localStorage.getItem('assess_users');
    return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]): void {
    localStorage.setItem('assess_users', JSON.stringify(users));
    fetchAndRenderUserTable();
    
}

async function fetchAndRenderUserTable(): Promise<void> {
    try {
        const response = await fetch(API_BASE_URL + "/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const users = await response.json();
        
        usersTableBody.innerHTML = "";
        
        if (users.length === 0) {
            emptyState.classList.remove("hidden");
            dataTableContainer.classList.add("hidden");
            return;
        }
        
        emptyState.classList.add("hidden");
        dataTableContainer.classList.remove("hidden");
        
        users.forEach((user: any) => {
            const tr = document.createElement("tr");
            const statusClass = "status-active"; // mock
            const initial = user.username.charAt(0).toUpperCase();

            tr.innerHTML = `
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar">${initial}</div>
                        <span>${user.username}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <select class="role-select form-control" data-id="${user.id}" style="padding: 4px; border-radius: 4px; border: 1px solid #4f5366; background: #2f3349; color: #cfd3ec;">
                        <option value="student" ${user.role === "student" || user.role === "Taker" ? "selected" : ""}>Student</option>
                        <option value="Educator" ${user.role === "Educator" ? "selected" : ""}>Educator</option>
                        <option value="Admin" ${user.role === "Admin" ? "selected" : ""}>Administrator</option>
                    </select>
                </td>
                <td>
                    <select class="status-select form-control status-badge" data-id="${user.id}" style="padding: 4px; border-radius: 4px; border: 1px solid #4f5366; background: #2f3349; color: ${user.status === 'Inactive' ? '#ea5455' : '#28c76f'}; font-weight: bold; font-size: 0.8rem;">
                        <option value="Active" ${user.status !== "Inactive" ? "selected" : ""} style="color: #28c76f">ACTIVE</option>
                        <option value="Inactive" ${user.status === "Inactive" ? "selected" : ""} style="color: #ea5455">INACTIVE</option>
                    </select>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="icon-btn tooltip-host delete-user-btn" data-id="${user.id}" title="Delete">
                            <i class="fa-solid fa-trash text-danger"></i>
                        </button>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });

        document.querySelectorAll(".role-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const selectEl = e.currentTarget as HTMLSelectElement;
                const id = selectEl.getAttribute("data-id");
                const newRole = selectEl.value;
                try {
                    const patchRes = await fetch(`${API_BASE_URL}/users/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role: newRole })
                    });
                    if (patchRes.ok) {
                        showToast("Role updated successfully!", "success");
                    } else {
                        showToast("Failed to update role", "danger");
                    }
                } catch(err) {
                    showToast("Error updating role", "danger");
                }
            });
        });

        document.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const selectEl = e.currentTarget as HTMLSelectElement;
                const id = selectEl.getAttribute("data-id");
                const newStatus = selectEl.value;
                
                if (newStatus === 'Inactive') {
                    selectEl.style.color = '#ea5455';
                } else {
                    selectEl.style.color = '#28c76f';
                }

                try {
                    const patchRes = await fetch(`${API_BASE_URL}/users/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus })
                    });
                    if (patchRes.ok) {
                        showToast("Status updated successfully!", "success");
                    } else {
                        showToast("Failed to update status", "danger");
                    }
                } catch(err) {
                    showToast("Error updating status", "danger");
                }
            });
        });

        document.querySelectorAll(".delete-user-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                if(confirm("Are you sure you want to delete this user?")) {
                    const btnEl = e.currentTarget as HTMLButtonElement;
                    const id = btnEl.getAttribute("data-id");
                    try {
                        const delRes = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
                        if(delRes.ok) {
                            showToast("User deleted successfully!", "success");
                            await fetchAndRenderUserTable();
                        } else {
                            showToast("Failed to delete user", "danger");
                        }
                    } catch(err) {
                        showToast("Error deleting user", "danger");
                    }
                }
            });
        });

        // Update stats
        totalUsersStat.textContent = users.length.toString();
        activeUsersStat.textContent = users.length.toString();
        adminsStat.textContent = users.filter((u: any) => u.role === "Admin").length.toString();

    } catch (error) {
        console.error(error);
        showToast("Error loading users", "danger");
    }
}

function editUser(id: string): void {
    const users = getUsers();
    const user = users.find((u: User) => u.id === id);
    if (!user) return;
    
    getEl<HTMLInputElement>('user-id').value = user.id;
    getEl<HTMLInputElement>('user-name').value = user.name;
    getEl<HTMLInputElement>('user-email').value = user.email;
    getEl<HTMLSelectElement>('user-role').value = user.role;
    getEl<HTMLSelectElement>('user-status').value = user.status;
    
    openUserModal(true);
}

function deleteUser(id: string): void {
    if(confirm('Are you sure you want to delete this user?')) {
        let users = getUsers();
        users = users.filter((u: User) => u.id !== id);
        saveUsers(users);
        showToast('User deleted successfully', 'success');
    }
}

// --- Analytics Rendering Logic ---
function renderAnalytics(scores: ScoreData[], rates: CompletionRate[], activities: Activity[]): void {
    if (assessmentChart) {
        assessmentChart.innerHTML = '';
        scores.forEach(data => {
            const container = document.createElement('div');
            container.className = 'bar-container';
            container.innerHTML = `
                <div class="bar tooltip-host" style="height: ${data.score}%;">
                    <span class="tooltip">${data.subject}: ${data.score}%</span>
                </div>
                <div class="bar label">${data.subject}</div>
            `;
            assessmentChart.appendChild(container);
        });
    }

    if (completionRatesList) {
        completionRatesList.innerHTML = '';
        rates.forEach(rate => {
            const container = document.createElement('div');
            container.className = 'progress-item';
            container.innerHTML = `
                <div class="progress-info">
                    <span>${rate.level}</span>
                    <span>${rate.percentage}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar ${rate.colorClass}" style="width: ${rate.percentage}%;"></div>
                </div>
            `;
            completionRatesList.appendChild(container);
        });
    }

    if (recentActivityList) {
        recentActivityList.innerHTML = '';
        activities.forEach(activity => {
            const li = document.createElement('li');
            
            let iconClass = '';
            let iconCode = '';
            
            if (activity.status === 'passed') {
                iconClass = 'bg-success-light text-success';
                iconCode = '<i class="fa-solid fa-check"></i>';
            } else if (activity.status === 'in-progress') {
                iconClass = 'bg-warning-light text-warning';
                iconCode = '<i class="fa-solid fa-clock"></i>';
            } else {
                iconClass = 'bg-danger-light text-danger';
                iconCode = '<i class="fa-solid fa-xmark"></i>';
            }
            
            li.innerHTML = `
                <div class="activity-icon ${iconClass}">
                    ${iconCode}
                </div>
                <div class="activity-content">
                    <p><strong>${activity.user}</strong> ${activity.action} <em>${activity.assessment}</em></p>
                    <small>${activity.time} ${activity.score ? 'Ã¢â‚¬Â¢ Score: ' + activity.score + '%' : 'Ã¢â‚¬Â¢ In Progress'}</small>
                </div>
            `;
            recentActivityList.appendChild(li);
        });
    }

    if (btnGenerateReport && !btnGenerateReport.hasAttribute('data-bound')) {
        btnGenerateReport.setAttribute('data-bound', 'true');
        btnGenerateReport.addEventListener('click', () => {
            const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const newReport: AssessmentReport = {
                id: 'rep_' + Date.now(),
                name: 'Generated Report ' + (mockReports.length + 1),
                date: date,
                type: 'Custom Analysis',
                status: 'Generating' // Simulate generating
            };
            mockReports.unshift(newReport);
            renderReports();
            showToast('Generating new performance report...', 'success');

            setTimeout(() => {
                newReport.status = 'Ready';
                renderReports();
                showToast('Report generated successfully!', 'success');
            }, 2000);
        });
    }
}

function renderReports(): void {
    if (!reportsTableBody) return;
    
    reportsTableBody.innerHTML = '';
    
    if (mockReports.length === 0) {
        reportsEmptyState.classList.remove('hidden');
        reportsTableContainer.classList.add('hidden');
    } else {
        reportsEmptyState.classList.add('hidden');
        reportsTableContainer.classList.remove('hidden');
        
        mockReports.forEach(report => {
            const tr = document.createElement('tr');
            
            let statusBadge = report.status === 'Ready' ? 
                '<span class="status-badge status-active">Ready <i class="fa-solid fa-check ml-1"></i></span>' : 
                '<span class="status-badge status-inactive">Generating <i class="fa-solid fa-spinner fa-spin ml-1"></i></span>';

            tr.innerHTML = `
                <td><strong>${report.name}</strong></td>
                <td>${report.date}</td>
                <td><span class="role-badge">${report.type}</span></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-outline btn-sm view-report-btn" data-id="${report.id}" ${report.status !== 'Ready' ? 'disabled' : ''} style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-eye"></i> View details
                        </button>
                    </div>
                </td>
            `;
            reportsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = (e.currentTarget as HTMLElement).closest('.view-report-btn') as HTMLButtonElement;
                if (!target) return;
                
                const reportId = target.getAttribute('data-id');
                const report = mockReports.find(r => r.id === reportId);
                
                if (report) {
                    if (report.type.toUpperCase() === 'CERTIFICATE') {
                        const certModal = document.getElementById('certificate-modal');
                        const certName = document.getElementById('cert-assessment-name');
                        const certDate = document.getElementById('cert-date');
                        const certUser = document.getElementById('cert-user-name');
                        
                        const certHtmlContent = document.getElementById('cert-html-content');
                        const certImageContent = document.getElementById('cert-image-content');
                        const certImage = document.getElementById('cert-image') as HTMLImageElement;

                        if (certModal && certName && certDate && certUser) {
                            if (report.name === 'Java Bootcamp Completion' && certImageContent && certHtmlContent && certImage) {
                                certImage.src = '/java-cert.png';
                                certHtmlContent.style.display = 'none';
                                certImageContent.style.display = 'block';
                                certImageContent.classList.remove('hidden');
                            } else if (report.name === 'React Excellence Award' && certImageContent && certHtmlContent && certImage) {
                                certImage.src = '/react-cert.png';
                                certHtmlContent.style.display = 'none';
                                certImageContent.style.display = 'block';
                                certImageContent.classList.remove('hidden');
                            } else {
                                if (certHtmlContent && certImageContent) {
                                    certHtmlContent.style.display = 'block';
                                    certImageContent.style.display = 'none';
                                    certImageContent.classList.add('hidden');
                                }
                                certName.textContent = report.name;
                                certDate.textContent = report.date;
                                certUser.textContent = sessionStorage.getItem('user_name') || 'Student Name';
                            }

                            certModal.classList.remove('hidden');
                            certModal.style.setProperty('display', 'flex', 'important');
                            certModal.style.setProperty('opacity', '1', 'important');
                            certModal.style.setProperty('visibility', 'visible', 'important');
                        } else {
                            showToast('Certificate template not found.', 'error');
                        }
                    } else {
                        showToast(`Opening report analytics for: ${report.name}`, 'success');
                    }
                }
            });
        });
    }
}

// --- Educator/Instructor Module Logic ---
async function initEducatorModule() {
    await fetchAndRenderAssessments();
    await fetchAndRenderAssignments();
    renderEducatorMonitor();
    initReviewModule();
    setupEducatorEvents();
}

function setupEducatorEvents() {
    btnCreateAssessmentNav.addEventListener('click', () => switchPage('create-assessment'));
    btnAddQuestion.addEventListener('click', () => addQuestionToForm());
    
    assessmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAssessment();
    });

    btnNewAssignment.addEventListener('click', async () => {
        const modal = getEl<HTMLDivElement>('assign-modal');
        const select = getEl<HTMLSelectElement>('assign-assessment-select');
        
        try {
            const resp = await fetch(API_BASE_URL + '/assessments');
            const assessments = await resp.json();
            select.innerHTML = '<option value="">Select an assessment...</option>' + 
                assessments.map((a: any) => `<option value="${a.id}">${a.title}</option>`).join('');
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } catch(e) {
            console.error('Error loading assessments', e);
        }
    });

    getEl<HTMLButtonElement>('btn-close-assign-modal')?.addEventListener('click', () => {
        const modal = getEl<HTMLDivElement>('assign-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });
    getEl<HTMLButtonElement>('btn-cancel-assign')?.addEventListener('click', () => {
        const modal = getEl<HTMLDivElement>('assign-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });

    getEl<HTMLFormElement>('assign-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const assessmentId = getEl<HTMLSelectElement>('assign-assessment-select').value;
        const group = getEl<HTMLInputElement>('assign-group').value;
        const dueDate = getEl<HTMLInputElement>('assign-due-date').value;
        const total = parseInt(getEl<HTMLInputElement>('assign-total').value);

        if (!assessmentId || !group || !dueDate || total < 1) return;

        const newAgn = {
            id: 'agn_' + Date.now(),
            assessmentId,
            group,
            dueDate,
            completed: 0,
            total
        };

        try {
            await fetch(API_BASE_URL + '/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAgn)
            });
            const modal = getEl<HTMLDivElement>('assign-modal');
            modal.classList.add('hidden');
            modal.style.display = 'none';
            (e.target as HTMLFormElement).reset();
            showToast('Assignment created successfully!', 'success');
            await fetchAndRenderAssignments();
        } catch(err) {
            console.error('Error assigning assessment', err);
        }
    });

    // Edit Progress Modal Setup
    getEl<HTMLButtonElement>('btn-close-progress-modal')?.addEventListener('click', () => {
        const modal = getEl<HTMLDivElement>('edit-progress-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });
    getEl<HTMLButtonElement>('btn-cancel-progress')?.addEventListener('click', () => {
        const modal = getEl<HTMLDivElement>('edit-progress-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });

    getEl<HTMLFormElement>('edit-progress-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = getEl<HTMLInputElement>('edit-progress-id').value;
        const completed = parseInt(getEl<HTMLInputElement>('edit-progress-completed').value);
        const total = parseInt(getEl<HTMLInputElement>('edit-progress-total').value);

        if (completed < 0 || total < 1) return;

        try {
            await fetch(API_BASE_URL + '/assignments/' + id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed, total })
            });
            const modal = getEl<HTMLDivElement>('edit-progress-modal');
            modal.classList.add('hidden');
            modal.style.display = 'none';
            showToast('Progress updated!', 'success');
            await fetchAndRenderAssignments();
        } catch(err) {
            console.error('Error updating progress', err);
        }
    });
}

async function fetchAndRenderAssessments() {
    try {
        const response = await fetch(API_BASE_URL + '/assessments');
        const assessments: Assessment[] = await response.json();
        
        assessmentsTableBody.innerHTML = '';
        assessments.forEach(ass => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ass.title}</strong></td>
                <td>${ass.category}</td>
                <td>${ass.questions}</td>
                <td>${ass.timeLimit}</td>
                <td><span class="status-badge ${ass.status === 'Published' ? 'status-active' : 'status-inactive'}">${ass.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="icon-btn edit-ass-btn" data-id="${ass.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn text-danger delete-ass-btn" data-id="${ass.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            assessmentsTableBody.appendChild(tr);
        });

        // Attach listeners
        document.querySelectorAll('.edit-ass-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
                if (id) editAssessment(id);
            });
        });
        document.querySelectorAll('.delete-ass-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
                if (id) deleteAssessment(id);
            });
        });
    } catch (err) {
        console.error('Error fetching assessments:', err);
    }
}

async function deleteAssessment(id: string) {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showToast('Assessment deleted.', 'success');
            fetchAndRenderAssessments();
        }
    } catch (err) {
        showToast('Error deleting assessment.', 'error');
    }
}

async function editAssessment(id: string) {
    showToast('Editing assessment... (Loading template)', 'success');
    // For this mock, we just scroll to form and prep with ID
    switchPage('create-assessment');
    // Normally load details into form here...
}

function addQuestionToForm() {
    const qId = 'q_' + Date.now();
    const div = document.createElement('div');
    div.className = 'question-card mt-3';
    div.id = qId;
    div.innerHTML = `
        <button type="button" class="btn-remove" onclick="document.getElementById('${qId}').remove()"><i class="fa-solid fa-trash"></i></button>
        <span class="question-type-label">Multiple Choice</span>
        <input type="text" class="question-input q-text" placeholder="Enter your question here..." required>
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap:0.5rem">
            <input type="text" class="form-control" placeholder="Option A">
            <input type="text" class="form-control" placeholder="Option B">
        </div>
    `;
    
    // Remove empty state if present
    const empty = questionsList.querySelector('.empty-state');
    if (empty) empty.remove();
    
    questionsList.appendChild(div);
}

async function saveAssessment() {
    const title = (getEl<HTMLInputElement>('assessment-title')).value;
    const category = (getEl<HTMLSelectElement>('assessment-category')).value;
    const timeLimit = parseInt((getEl<HTMLInputElement>('assessment-time')).value);
    
    const questionCards = questionsList.querySelectorAll('.question-card');
    const qCount = questionCards.length;

    if (qCount === 0) {
        showToast('Please add at least one question.', 'error');
        return;
    }

    const qData: any[] = [];
    questionCards.forEach((card, idx) => {
        const text = (card.querySelector('.q-text') as HTMLInputElement).value;
        const options = Array.from(card.querySelectorAll('.form-control')).map(i => (i as HTMLInputElement).value);
        qData.push({
            id: 'q' + (idx + 1),
            text: text,
            options: options.filter(o => o.trim() !== ''),
            correct: options[0] // Default first option as correct for this simple mock
        });
    });

    const newAss: any = {
        id: 'as_' + Date.now().toString(36),
        title,
        category,
        questions: qCount,
        timeLimit,
        status: 'Published',
        questionsData: qData
    };

    try {
        const response = await fetch(API_BASE_URL + '/assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAss)
        });

        if (response.ok) {
            showToast('Assessment created and published!', 'success');
            assessmentForm.reset();
            questionsList.innerHTML = '<div class="empty-state">No questions added yet.</div>';
            switchPage('assessments');
            fetchAndRenderAssessments();
        }
    } catch (err) {
        showToast('Error saving assessment.', 'error');
    }
}

// --- Review Results Logic ---
async function initReviewModule() {
    await fetchAndRenderSubmissions();
    setupReviewEvents();
}

function setupReviewEvents() {
    btnCloseReviewModal.addEventListener('click', closeReviewModal);
    btnCancelReview.addEventListener('click', closeReviewModal);
    
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = getEl<HTMLInputElement>('submission-id').value;
        const feedback = getEl<HTMLTextAreaElement>('feedback-text').value;
        await saveFeedback(id, feedback);
    });
}

async function fetchAndRenderSubmissions() {
    try {
        const response = await fetch(API_BASE_URL + '/submissions');
        const submissions: Submission[] = await response.json();
        
        submissionsTableBody.innerHTML = '';
        if (submissions.length === 0) {
            submissionsTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No submissions yet.</td></tr>';
            return;
        }

        submissions.forEach(sub => {
            const tr = document.createElement('tr');
            const date = new Date(sub.submittedAt).toLocaleDateString();
            const feedbackText = sub.feedback ? 
                `<span class="text-success"><i class="fa-solid fa-check-circle"></i> Provided</span>` : 
                `<span class="text-muted">Pending</span>`;

            tr.innerHTML = `
                <td><strong>${sub.userName}</strong></td>
                <td>${sub.assessmentTitle}</td>
                <td>${date}</td>
                <td><span class="status-badge ${sub.score >= 50 ? 'status-active' : 'status-inactive'}">${sub.score}%</span></td>
                <td>${feedbackText}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-sm review-btn" data-id="${sub.id}">
                        Review & Feedback
                    </button>
                </td>
            `;
            submissionsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = (e.target as HTMLElement).closest('.review-btn') as HTMLButtonElement;
                if (!target) return;
                const id = target.getAttribute('data-id');
                if (id) openReviewDetails(id);
            });
        });
    } catch (err) {
        console.error('Error fetching submissions:', err);
    }
}

async function openReviewDetails(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions`);
        const submissions: Submission[] = await response.json();
        const submission = submissions.find(s => s.id === id);
        if (!submission) throw new Error('Submission not found');
        
        getEl<HTMLInputElement>('submission-id').value = submission.id;
        
        const textarea = getEl<HTMLTextAreaElement>('feedback-text');
        textarea.value = submission.feedback || '';
        textarea.disabled = false; // Ensure it's not disabled from student view
        
        const form = getEl<HTMLFormElement>('feedback-form');
        const footer = form.querySelector('.flex-end') as HTMLElement;
        if (footer) footer.classList.remove('hidden'); // Ensure buttons are visible
        
        getEl<HTMLHeadingElement>('review-modal-title').textContent = 'Review Submission';

        const detailsContainer = getEl<HTMLDivElement>('submission-details');
        detailsContainer.innerHTML = `
            <div class="submission-detail-row">
                <span class="submission-label">Student:</span>
                <span class="submission-value">${submission.userName}</span>
            </div>
            <div class="submission-detail-row">
                <span class="submission-label">Assessment:</span>
                <span class="submission-value">${submission.assessmentTitle}</span>
            </div>
            <div class="submission-detail-row">
                <span class="submission-label">Score:</span>
                <span class="submission-value">${submission.score}%</span>
            </div>
            <div class="submission-detail-row">
                <span class="submission-label">Submitted:</span>
                <span class="submission-value">${new Date(submission.submittedAt).toLocaleString()}</span>
            </div>
        `;
        
        reviewModal.classList.remove('hidden');
        reviewModal.style.display = 'flex';
    } catch (err) {
        console.error('Error in openReviewDetails:', err);
        showToast('Error loading submission details.', 'error');
    }
}

function closeReviewModal() {
    reviewModal.classList.add('hidden');
    reviewModal.style.display = 'none';
    feedbackForm.reset();
}

async function saveFeedback(id: string, feedback: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback })
        });

        if (response.ok) {
            showToast('Feedback saved successfully!', 'success');
            closeReviewModal();
            await fetchAndRenderSubmissions();
        } else {
            showToast('Failed to save feedback.', 'error');
        }
    } catch (err) {
        showToast('Error connecting to the database.', 'error');
    }
}

// --- Student Module Logic ---
let currentQuiz: {
    assessment: any;
    questions: any[];
    currentIndex: number;
    answers: Record<string, string>;
    timerInterval: any;
    secondsLeft: number;
} | null = null;

async function initStudentModule() {
    await fetchAvailableAssessments();
    await fetchStudentResults();
    setupStudentEvents();
}

function setupStudentEvents() {
    btnPrevQuestion.addEventListener('click', () => navigateQuiz(-1));
    btnNextQuestion.addEventListener('click', () => navigateQuiz(1));
    btnSubmitQuiz.addEventListener('click', () => submitQuiz());
    
    btnBeginAssessment.addEventListener('click', () => {
        if (selectedAssessmentId) startQuiz(selectedAssessmentId);
    });
}

async function fetchAvailableAssessments() {
    try {
        const response = await fetch(API_BASE_URL + '/assignments');
        const assignments: Assignment[] = await response.json();
        
        const assResp = await fetch(API_BASE_URL + '/assessments');
        const assessments: any[] = await assResp.json();
        
        availableAssessmentsBody.innerHTML = '';
        
        // In this demo, Taker sees all assignments for "Class 10A"
        const myAssignments = assignments; // show all
        getEl<HTMLHeadingElement>('assigned-count').textContent = myAssignments.length.toString();
        getEl<HTMLHeadingElement>('due-soon-count').textContent = myAssignments.length.toString(); // Simple mock

        myAssignments.forEach(agn => {
            const ass = assessments.find(a => a.id === agn.assessmentId);
            if (!ass) return;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ass.title}</strong></td>
                <td>${agn.dueDate}</td>
                <td>${ass.timeLimit} mins</td>
                <td>
                    <button class="btn btn-primary btn-sm view-ass-details-btn" data-id="${ass.id}">
                        View Details
                    </button>
                </td>
            `;
            availableAssessmentsBody.appendChild(tr);
        });

        document.querySelectorAll('.view-ass-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
                if (id) showAssessmentDetails(id);
            });
        });
    } catch (err) {
        console.error('Error fetching available assessments:', err);
    }
}

async function showAssessmentDetails(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/${id}`);
        const assessment = await response.json();
        
        selectedAssessmentId = id;
        
        getEl<HTMLHeadingElement>('detail-ass-title').textContent = assessment.title;
        getEl<HTMLSpanElement>('detail-ass-category').textContent = assessment.category;
        getEl<HTMLSpanElement>('detail-ass-time').textContent = assessment.timeLimit + ' Minutes';
        getEl<HTMLSpanElement>('detail-ass-questions').textContent = assessment.questions + ' Questions';
        
        switchPage('assessment-details');
    } catch (err) {
        showToast('Error loading assessment details.', 'error');
    }
}

async function fetchStudentResults() {
    try {
        const userName = sessionStorage.getItem('user_name');
        const response = await fetch(`${API_BASE_URL}/submissions`);
        const submissions: Submission[] = await response.json();
        
        // Filter by user name for this mock
        const mySubmissions = submissions.filter(s => s.userName === userName);
        
        studentResultsBody.innerHTML = '';
        if (mySubmissions.length === 0) {
            studentResultsBody.innerHTML = '<tr><td colspan="5" class="empty-state">No results found.</td></tr>';
            return;
        }

        mySubmissions.forEach(sub => {
            const tr = document.createElement('tr');
            const date = new Date(sub.submittedAt).toLocaleDateString();
            
            tr.innerHTML = `
                <td><strong>${sub.assessmentTitle}</strong></td>
                <td>${date}</td>
                <td><span class="status-badge ${sub.score >= 50 ? 'status-active' : 'status-inactive'}">${sub.score}%</span></td>
                <td>${sub.feedback ? sub.feedback : '<span class="text-muted">No feedback yet</span>'}</td>
                <td>
                    <button class="btn btn-outline btn-sm view-feedback-btn" data-id="${sub.id}">
                        View Details
                    </button>
                </td>
            `;
            studentResultsBody.appendChild(tr);
        });

        document.querySelectorAll('.view-feedback-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
                if (id) viewResultDetails(id);
            });
        });
    } catch (err) {
        console.error('Error fetching student results:', err);
    }
}

async function startQuiz(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments/${id}`);
        const assessment = await response.json();
        
        if (!assessment.questionsData || assessment.questionsData.length === 0) {
            showToast('This assessment has no questions.', 'error');
            return;
        }

        currentQuiz = {
            assessment,
            questions: assessment.questionsData,
            currentIndex: 0,
            answers: {},
            timerInterval: null,
            secondsLeft: assessment.timeLimit * 60
        };

        switchPage('take-quiz');
        renderQuestion();
        startTimer();
        
    } catch (err) {
        showToast('Error starting assessment.', 'error');
    }
}

function renderQuestion() {
    if (!currentQuiz) return;
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    
    quizTitleEl.textContent = currentQuiz.assessment.title;
    questionCounterEl.textContent = `Question ${currentQuiz.currentIndex + 1} of ${currentQuiz.questions.length}`;
    questionTextEl.innerHTML = `<h4>${q.text}</h4>`;
    
    const progress = ((currentQuiz.currentIndex + 1) / currentQuiz.questions.length) * 100;
    quizProgressInner.style.width = `${progress}%`;

    optionsContainer.innerHTML = '';
    q.options.forEach((opt: string) => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${currentQuiz?.answers[q.id] === opt ? 'selected' : ''}`;
        btn.textContent = opt;
        btn.addEventListener('click', () => {
            if (!currentQuiz) return;
            currentQuiz.answers[q.id] = opt;
            renderQuestion(); // Re-render to show selection
        });
        optionsContainer.appendChild(btn);
    });

    btnPrevQuestion.disabled = currentQuiz.currentIndex === 0;
    if (currentQuiz.currentIndex === currentQuiz.questions.length - 1) {
        btnNextQuestion.classList.add('hidden');
        btnSubmitQuiz.classList.remove('hidden');
    } else {
        btnNextQuestion.classList.remove('hidden');
        btnSubmitQuiz.classList.add('hidden');
    }
}

function navigateQuiz(direction: number) {
    if (!currentQuiz) return;
    currentQuiz.currentIndex += direction;
    renderQuestion();
}

function startTimer() {
    if (!currentQuiz) return;
    
    updateTimerDisplay();
    currentQuiz.timerInterval = setInterval(() => {
        if (!currentQuiz) return;
        currentQuiz.secondsLeft--;
        updateTimerDisplay();
        
        if (currentQuiz.secondsLeft <= 0) {
            clearInterval(currentQuiz.timerInterval);
            showToast('Time is up! Submitting your answers...', 'error');
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    if (!currentQuiz) return;
    const mins = Math.floor(currentQuiz.secondsLeft / 60);
    const secs = currentQuiz.secondsLeft % 60;
    quizTimerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    if (currentQuiz.secondsLeft < 60) {
        quizTimerEl.style.color = 'var(--danger)';
    } else {
        quizTimerEl.style.color = 'var(--warning)';
    }
}

async function submitQuiz() {
    if (!currentQuiz) return;
    clearInterval(currentQuiz.timerInterval);
    
    const answers = currentQuiz.answers;
    const questions = currentQuiz.questions;
    let correctCount = 0;
    
    const processedAnswers = questions.map(q => {
        const isCorrect = answers[q.id] === q.correct;
        if (isCorrect) correctCount++;
        return {
            questionId: q.id,
            answer: answers[q.id] || '(No Answer)',
            correct: isCorrect
        };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const userName = sessionStorage.getItem('user_name') || 'Student';
    
    const submission = {
        id: 'sub_' + Date.now(),
        assignmentId: 'agn_1', // Simplified
        userId: sessionStorage.getItem('user_id') || 'usr_' + Date.now(),
        userName: userName,
        assessmentTitle: currentQuiz.assessment.title,
        score: score,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
        feedback: '',
        answers: processedAnswers
    };

    try {
        const response = await fetch(API_BASE_URL + '/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission)
        });

        if (response.ok) {
            showToast(`Assessment submitted! Your score: ${score}%`, 'success');
            currentQuiz = null;
            await fetchStudentResults();
            switchPage('student-results');
        } else {
            showToast('Error submitting assessment.', 'error');
        }
    } catch (err) {
        showToast('Connection error during submission.', 'error');
    }
}

async function viewResultDetails(id: string) {
    // We can reuse the educator review modal for students to see their results
    openReviewDetails(id);
    getEl<HTMLHeadingElement>('review-modal-title').textContent = 'Your Performance Summary';
    // Hide the feedback form for students, they can only view it
    const form = getEl<HTMLFormElement>('feedback-form');
    // For student view, we'll hide the save buttons
    const footer = form.querySelector('.flex-end') as HTMLElement;
    const textarea = getEl<HTMLTextAreaElement>('feedback-text');
    
    textarea.disabled = true;
    if (footer) footer.classList.add('hidden');
    
    // Add a simple logic to show buttons again if it's an educator (though unlikely they share the same call without check)
}


async function fetchAndRenderAssignments() {
    try {
        const response = await fetch(API_BASE_URL + '/assignments?_expand=assessment');
        // Note: json-server _expand works if you have assessmentId. 
        // But for simplicity if the relationship isn't perfect in our mock, we'll just fetch assignments.
        const assignments: Assignment[] = await response.json();
        
        // We'll also need assessments to get titles
        const assResp = await fetch(API_BASE_URL + '/assessments');
        const assessments: Assessment[] = await assResp.json();

        assignmentsTableBody.innerHTML = '';
        assignments.forEach(agn => {
            const ass = assessments.find(a => a.id === agn.assessmentId);
            const tr = document.createElement('tr');
            const progress = Math.round((agn.completed / agn.total) * 100);
            
            tr.innerHTML = `
                <td><strong>${ass ? ass.title : 'Unknown Assessment'}</strong></td>
                <td>${agn.group}</td>
                <td>${agn.dueDate}</td>
                <td>
                    <div class="progress-info" style="font-size:0.75rem">
                        <span>${agn.completed}/${agn.total} students</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar-bg"><div class="progress-bar fill-primary" style="width:${progress}%"></div></div>
                </td>
                <td>
                    <div class="action-btns" style="display: flex; gap: 5px;">
                        <button class="btn btn-outline btn-sm manage-agn-btn" data-id="${agn.id}" data-completed="${agn.completed}" data-total="${agn.total}">Manage</button>
                    </div>
                </td>
            `;
            assignmentsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.manage-agn-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = (e.currentTarget as HTMLElement).closest('.manage-agn-btn') as HTMLButtonElement;
                if (!target) return;
                const id = target.getAttribute('data-id') || '';
                const completed = target.getAttribute('data-completed') || '0';
                const total = target.getAttribute('data-total') || '1';
                
                getEl<HTMLInputElement>('edit-progress-id').value = id;
                getEl<HTMLInputElement>('edit-progress-completed').value = completed;
                getEl<HTMLInputElement>('edit-progress-total').value = total;
                const modal = getEl<HTMLDivElement>('edit-progress-modal');
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            });
        });
    } catch (err) {
        console.error('Error fetching assignments:', err);
    }
}

function renderEducatorMonitor() {
    // Mock Monitor Data
    const participationIdx = getEl<HTMLDivElement>('participation-chart');
    if (participationIdx) {
        participationIdx.innerHTML = `
            <div class="bar-container" style="flex:1"><div class="bar" style="height:80%; width:40px"></div><div class="bar label">Mon</div></div>
            <div class="bar-container" style="flex:1"><div class="bar" style="height:60%; width:40px"></div><div class="bar label">Tue</div></div>
            <div class="bar-container" style="flex:1"><div class="bar" style="height:95%; width:40px"></div><div class="bar label">Wed</div></div>
            <div class="bar-container" style="flex:1"><div class="bar" style="height:40%; width:40px"></div><div class="bar label">Thu</div></div>
            <div class="bar-container" style="flex:1"><div class="bar" style="height:85%; width:40px"></div><div class="bar label">Fri</div></div>
        `;
    }

    groupCompletionList.innerHTML = `
        <div class="progress-item">
            <div class="progress-info"><span>Class 10A - Math</span><span>92%</span></div>
            <div class="progress-bar-bg"><div class="progress-bar fill-success" style="width:92%"></div></div>
        </div>
        <div class="progress-item">
            <div class="progress-info"><span>Class 9B - Physics</span><span>45%</span></div>
            <div class="progress-bar-bg"><div class="progress-bar fill-warning" style="width:45%"></div></div>
        </div>
    `;

    educatorActivityList.innerHTML = `
        <li>
            <div class="activity-icon bg-success-light text-success"><i class="fa-solid fa-check"></i></div>
            <div class="activity-content">
                <p><strong>Maria Garcia</strong> submitted <em>Math Quiz</em></p>
                <small>10 mins ago Ã¢â‚¬Â¢ Score: 88%</small>
            </div>
        </li>
        <li>
            <div class="activity-icon bg-warning-light text-warning"><i class="fa-solid fa-clock"></i></div>
            <div class="activity-content">
                <p><strong>Kevin Lee</strong> started <em>Chemistry Lab</em></p>
                <small>25 mins ago Ã¢â‚¬Â¢ In Progress</small>
            </div>
        </li>
    `;
}

// --- Utility Functions ---
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const container = getEl<HTMLDivElement>('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div>${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
















// Password Toggle Logic
document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('toggle-password')) {
        const inputId = target.getAttribute('data-target');
        if (inputId) {
            const input = document.getElementById(inputId) as HTMLInputElement;
            if (input.type === 'password') {
                input.type = 'text';
                target.classList.remove('fa-eye');
                target.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                target.classList.remove('fa-eye-slash');
                target.classList.add('fa-eye');
            }
        }
    }
});
