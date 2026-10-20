const socket = io();
const view = document.body.dataset.view;

const removeById = (id) => document.getElementById(id)?.remove();

const replaceOrAppend = (parent, node) => {
    const existing = document.getElementById(node.id);
    if (existing) existing.replaceWith(node);
    else parent.appendChild(node);
};

const cell = (text) => {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
};

const buildRow = (service) => {
    const tr = document.createElement("tr");
    tr.id = `service-${service.id}`;
    tr.dataset.id = service.id;
    tr.dataset.available = service.available;

    tr.append(
        cell(service.name),
        cell(service.description),
        cell(`${service.duration} min`),
        cell(`$${service.price}`),
        cell(service.category),
        cell(service.available ? "Disponible" : "No disponible")
    );

    const actions = document.createElement("td");
    actions.innerHTML =
        '<button class="btn-toggle">Cambiar disponibilidad</button> ' +
        '<button class="btn-delete">Eliminar</button>';
    tr.appendChild(actions);
    return tr;
};

const buildItem = (service) => {
    const li = document.createElement("li");
    li.id = `available-${service.id}`;
    const strong = document.createElement("strong");
    strong.textContent = service.name;
    li.append(
        strong,
        ` · ${service.category} · ${service.duration} min · $${service.price}`
    );
    return li;
};

const upsertInServicesView = (service) => {
    removeById("empty-row");
    replaceOrAppend(document.getElementById("services-body"), buildRow(service));
};

const upsertInAvailabilityView = (service) => {
    if (!service.available) return removeById(`available-${service.id}`);
    removeById("empty-item");
    replaceOrAppend(document.getElementById("availability-list"), buildItem(service));
};

// ---- Eventos desde el servidor (se disparan al usar la API REST) ----
socket.on("service:created", (service) => {
    if (view === "services") upsertInServicesView(service);
    if (view === "availability") upsertInAvailabilityView(service);
});

socket.on("service:updated", (service) => {
    if (view === "services") upsertInServicesView(service);
    if (view === "availability") upsertInAvailabilityView(service);
});

socket.on("service:deleted", ({ id }) => {
    removeById(`service-${id}`);
    removeById(`available-${id}`);
});

// ---- Acciones del usuario en la vista de servicios ----
if (view === "services") {
    const form = document.getElementById("service-form");
    const errorBox = document.getElementById("form-error");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorBox.textContent = "";
        const data = new FormData(form);

        const response = await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: data.get("name"),
                description: data.get("description"),
                duration: Number(data.get("duration")),
                price: Number(data.get("price")),
                category: data.get("category"),
                available: data.get("available") === "on",
            }),
        });

        if (!response.ok) {
            const body = await response.json();
            errorBox.textContent = (body.errors || [body.error]).join(" | ");
            return;
        }
        form.reset();
    });

    document.getElementById("services-body").addEventListener("click", async (event) => {
        const row = event.target.closest("tr");
        if (!row?.dataset.id) return;

        if (event.target.classList.contains("btn-toggle")) {
            await fetch(`/api/services/${row.dataset.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ available: row.dataset.available !== "true" }),
            });
        }

        if (event.target.classList.contains("btn-delete")) {
            await fetch(`/api/services/${row.dataset.id}`, { method: "DELETE" });
        }
    });
}