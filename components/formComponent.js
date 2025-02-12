class FormComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <form class="form">
            <h2>Simulación de Préstamo</h2>
            <label>Nombre del Cliente:</label>
            <input type="text" id="nombreCliente" placeholder="Ingrese su nombre">
    
            <label>Documento de Identidad:</label>
            <input type="text" id="documento" placeholder="Ingrese su documento">
            
            <label>Monto del Préstamo:</label>
            <input type="number" id="monto" placeholder="Ingrese el monto">
            
            <label>Tasa de Interés Anual (%):</label>
            <input type="number" id="tasa" step="0.01" placeholder="Ingrese la tasa de interés">
            
            <label>Plazo (Meses):</label>
            <input type="number" id="plazo" placeholder="Ingrese el plazo en meses">
            
            <label>Tipo de Amortización:</label>
            <select id="tipoAmortizacion">
                <option>Francés</option>
                <option>Alemán</option>
            </select>
            
            <button type="submit">Calcular</button>
        </form>
        `;

        this.querySelector('.form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarCliente();
        });
    }

    async registrarCliente() {
        const nombre = document.getElementById("nombreCliente").value;
        const documento = document.getElementById("documento").value;
        const nuevoPrestamo = {
            id: Date.now(), // Generar un ID único para el préstamo
            monto: Number(document.getElementById("monto").value),
            tasaInteres: Number(document.getElementById("tasa").value),
            plazoMeses: Number(document.getElementById("plazo").value),
            tipoAmortizacion: document.getElementById("tipoAmortizacion").value
        };

        try {
            // Buscar si el cliente ya existe
            const response = await fetch(`http://localhost:3000/clientes?documento=${documento}`);
            const clientes = await response.json();

            let cliente;

            if (clientes.length > 0) {
                // ✅ Si existe, agregarle el préstamo
                cliente = clientes[0];
                cliente.prestamos = cliente.prestamos || [];
                cliente.prestamos.push(nuevoPrestamo);

                const updateResponse = await fetch(`http://localhost:3000/clientes/${cliente.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cliente)
                });

                if (!updateResponse.ok) {
                    throw new Error("Error al actualizar el cliente.");
                }

            } else {
                // ✅ Si no existe, crearlo con un ID único
                const allClientsResponse = await fetch(`http://localhost:3000/clientes`);
                const allClients = await allClientsResponse.json();
                const newId = allClients.length > 0 ? Math.max(...allClients.map(c => Number(c.id))) + 1 : 1;

                cliente = {
                    id: newId.toString(),
                    nombre: nombre,
                    documento: documento,
                    prestamos: [nuevoPrestamo]
                };

                const createResponse = await fetch(`http://localhost:3000/clientes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cliente)
                });

                if (!createResponse.ok) {
                    throw new Error("Error al crear el cliente.");
                }
            }

            alert("Préstamo registrado con éxito.");
        } catch (error) {
            alert("Error al registrar el préstamo.");
            console.error(error);
        }
    }
}

customElements.define('form-component', FormComponent);
