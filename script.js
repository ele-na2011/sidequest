const ADMIN_PASSWORD = "sidequest";
const STORAGE_KEY = "sidequest-opportunities";

const defaultOpportunities = [
    { id: "oakville-cleanup", title: "Oakville Waterfront Cleanup", organisation: "Town of Oakville", category: "Volunteer", location: "Oakville", deadline: "2025-05-18", link: "https://www.oakville.ca" },
    { id: "future-founders", title: "Future Founders Scholarship", organisation: "Future Leaders Canada", category: "Scholarship", location: "Online", deadline: "2025-06-01", link: "https://www.futureleaderscanada.ca" },
    { id: "creative-internship", title: "Creative Studio Internship", organisation: "The Local Edit", category: "Work", location: "Toronto", deadline: "2025-06-15", link: "https://example.com" },
    { id: "summer-design-lab", title: "Summer Design Lab", organisation: "Sheridan College", category: "Learning", location: "Oakville", deadline: "2025-07-04", link: "https://www.sheridancollege.ca" },
    { id: "youth-forum", title: "GTA Youth Climate Forum", organisation: "Youth Climate Network", category: "Event", location: "Mississauga", deadline: "2025-07-20", link: "https://example.com" },
    { id: "community-tutors", title: "Community Tutors Wanted", organisation: "Oakville Public Library", category: "Volunteer", location: "Oakville", deadline: "2025-08-01", link: "https://www.opl.on.ca" }
];

let opportunities = loadOpportunities();
let activeCategory = "All";

function loadOpportunities() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultOpportunities;
    } catch (error) {
        console.error("Could not load opportunities:", error);
        return defaultOpportunities;
    }
}

function saveOpportunities() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
}

function formatDeadline(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function renderFilters() {
    const categories = ["All", ...new Set(opportunities.map((item) => item.category))];
    document.querySelector("#categoryFilters").innerHTML = categories.map((category) =>
        `<button class="filter-button ${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">${category}</button>`
    ).join("");
}

function renderOpportunities() {
    const query = document.querySelector("#opportunitySearch").value.trim().toLowerCase();
    const sort = document.querySelector("#sortOpportunities").value;
    const filtered = opportunities.filter((item) => {
        const searchable = `${item.title} ${item.organisation} ${item.category} ${item.location}`.toLowerCase();
        return (activeCategory === "All" || item.category === activeCategory) && searchable.includes(query);
    }).sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        const direction = sort === "latest" ? -1 : 1;
        return direction * (new Date(a.deadline) - new Date(b.deadline));
    });

    document.querySelector("#resultCount").textContent = `${filtered.length} result${filtered.length === 1 ? "" : "s"}`;
    document.querySelector("#emptyState").hidden = filtered.length > 0;
    document.querySelector("#opportunityGrid").innerHTML = filtered.map((item) => `
        <article class="opportunity-card">
            <span class="opportunity-tag">${item.category}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <span class="opportunity-org">${escapeHtml(item.organisation)}</span>
            <span class="opportunity-location">${escapeHtml(item.location)}</span>
            <div class="opportunity-footer">
                <span class="deadline">Apply by ${formatDeadline(item.deadline)}</span>
                <a class="opportunity-link" href="${escapeAttribute(item.link)}" target="_blank" rel="noopener">View ↗</a>
            </div>
        </article>
    `).join("");
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function escapeAttribute(value) {
    try {
        const url = new URL(value);
        return /^https?:$/.test(url.protocol) ? escapeHtml(url.href) : "#";
    } catch (error) {
        return "#";
    }
}

function renderAdminList() {
    document.querySelector("#adminList").innerHTML = opportunities.map((item) => `
        <div class="admin-item">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="admin-actions">
                <button type="button" data-edit="${item.id}">Edit</button>
                <button type="button" data-delete="${item.id}">Delete</button>
            </span>
        </div>
    `).join("");
}

function resetForm() {
    document.querySelector("#opportunityForm").reset();
    document.querySelector("#opportunityId").value = "";
    document.querySelector("#saveOpportunity").textContent = "Add opportunity";
    document.querySelector("#cancelEdit").hidden = true;
}

function editOpportunity(id) {
    const item = opportunities.find((opportunity) => opportunity.id === id);
    if (!item) return;
    document.querySelector("#opportunityId").value = item.id;
    document.querySelector("#opportunityTitle").value = item.title;
    document.querySelector("#opportunityOrganisation").value = item.organisation;
    document.querySelector("#opportunityCategory").value = item.category;
    document.querySelector("#opportunityLocation").value = item.location;
    document.querySelector("#opportunityDeadline").value = item.deadline;
    document.querySelector("#opportunityLink").value = item.link;
    document.querySelector("#saveOpportunity").textContent = "Save changes";
    document.querySelector("#cancelEdit").hidden = false;
    document.querySelector("#opportunityTitle").focus();
}

function setupCarousel() {
    const track = document.querySelector("#issueTrack");
    const cards = [...track.children];
    const dots = document.querySelector("#carouselDots");
    let current = 0;
    dots.innerHTML = cards.map((_, index) => `<button type="button" aria-label="Show issue ${index + 1}" class="${index === 0 ? "active" : ""}"></button>`).join("");
    const goTo = (index) => {
        current = (index + cards.length) % cards.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        document.querySelector("#issueCount").textContent = `0${current + 1} / 0${cards.length}`;
        [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === current));
    };
    document.querySelector("#previousIssue").addEventListener("click", () => goTo(current - 1));
    document.querySelector("#nextIssue").addEventListener("click", () => goTo(current + 1));
    dots.addEventListener("click", (event) => {
        if (event.target.matches("button")) goTo([...dots.children].indexOf(event.target));
    });
    setInterval(() => goTo(current + 1), 7000);
}

document.addEventListener("DOMContentLoaded", () => {
    renderFilters();
    renderOpportunities();
    setupCarousel();
    document.querySelector("#opportunitySearch").addEventListener("input", renderOpportunities);
    document.querySelector("#sortOpportunities").addEventListener("change", renderOpportunities);
    document.querySelector("#categoryFilters").addEventListener("click", (event) => {
        if (!event.target.matches("button")) return;
        activeCategory = event.target.dataset.category;
        renderFilters();
        renderOpportunities();
    });

    const dialog = document.querySelector("#passwordDialog");
    document.querySelector("#adminOpen").addEventListener("click", () => {
        document.querySelector("#passwordError").hidden = true;
        document.querySelector("#adminPassword").value = "";
        dialog.showModal();
    });
    document.querySelector("#passwordForm").addEventListener("submit", (event) => {
        event.preventDefault();
        if (document.querySelector("#adminPassword").value !== ADMIN_PASSWORD) {
            document.querySelector("#passwordError").hidden = false;
            return;
        }
        dialog.close();
        document.querySelector("#adminPanel").hidden = false;
        renderAdminList();
        document.querySelector("#adminPanel").scrollIntoView({ behavior: "smooth" });
    });
    document.querySelector("#adminClose").addEventListener("click", () => {
        document.querySelector("#adminPanel").hidden = true;
        resetForm();
    });
    document.querySelector("#cancelEdit").addEventListener("click", resetForm);
    document.querySelector("#opportunityForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const id = document.querySelector("#opportunityId").value || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const item = {
            id,
            title: document.querySelector("#opportunityTitle").value.trim(),
            organisation: document.querySelector("#opportunityOrganisation").value.trim(),
            category: document.querySelector("#opportunityCategory").value,
            location: document.querySelector("#opportunityLocation").value.trim(),
            deadline: document.querySelector("#opportunityDeadline").value,
            link: document.querySelector("#opportunityLink").value.trim()
        };
        const existingIndex = opportunities.findIndex((opportunity) => opportunity.id === id);
        if (existingIndex >= 0) opportunities[existingIndex] = item;
        else opportunities.push(item);
        saveOpportunities();
        renderFilters();
        renderOpportunities();
        renderAdminList();
        resetForm();
    });
    document.querySelector("#adminList").addEventListener("click", (event) => {
        const { edit, delete: deleteId } = event.target.dataset;
        if (edit) editOpportunity(edit);
        if (deleteId && window.confirm("Remove this opportunity?")) {
            opportunities = opportunities.filter((item) => item.id !== deleteId);
            saveOpportunities();
            renderFilters();
            renderOpportunities();
            renderAdminList();
        }
    });
});