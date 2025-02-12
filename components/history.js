class History extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <h3>Historial de Préstamos</h3>
        <input type="text" id="buscarCliente" placeholder="Ingrese documento para buscar">
        <button class="btnConsultar">Consultar</button>
        <button class="btnEliminar">Eliminar Simulaciones</button>
        <div class="table-container" id="historialTable">
            <table>
                <tr>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Tasa (%)</th>
                    <th>Plazo (meses)</th>
                    <th>Amortización</th>
                    <th>Acción</th>
                </tr>
            </table>
        </div>
        `;

        this.querySelector('.btnConsultar').addEventListener('click', () => {
            this.consultarHistorial();
        });

        this.querySelector('.btnEliminar').addEventListener('click', () => {
            this.eliminarTodasSimulaciones();
        });
    }

    async consultarHistorial() {
        const documento = this.querySelector("#buscarCliente").value;
    
        try {
            const response = await fetch(`http://localhost:3000/clientes?documento=${documento}`);
            const clientes = await response.json();
    
            if (clientes.length === 0) {
                alert("Cliente no encontrado.");
                return;
            }
    
            const cliente = clientes[0];
            const prestamos = cliente.prestamos || [];
    
            const table = this.querySelector("#historialTable table");
            table.innerHTML = `
                <tr>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Tasa (%)</th>
                    <th>Plazo (meses)</th>
                    <th>Amortización</th>
                    <th>Acción</th>
                </tr>
            `;
    
            prestamos.forEach(p => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${cliente.nombre}</td>
                    <td>${p.monto}</td>
                    <td>${p.tasaInteres}</td>
                    <td>${p.plazoMeses}</td>
                    <td>${p.tipoAmortizacion}</td>
                    <td><button class="btnEliminarPrestamo" data-id="${p.id}">🗑️ Eliminar</button></td>
                `;
                table.appendChild(row);
            });

            // 🔹 Agregar eventos a los botones de eliminación
            table.querySelectorAll('.btnEliminarPrestamo').forEach(button => {
                button.addEventListener('click', (event) => {
                    const idPrestamo = event.target.dataset.id;
                    this.eliminarSimulacion(cliente.documento, idPrestamo);
                });
            });

        } catch (error) {
            alert("Error al consultar el historial.");
            console.error(error);
        }
    }

    async eliminarSimulacion(documento, idPrestamo) {
        try {
            const response = await fetch(`http://localhost:3000/clientes?documento=${documento}`);
            const clientes = await response.json();
    
            if (clientes.length === 0) {
                alert("Cliente no encontrado.");
                return;
            }
    
            let cliente = clientes[0];
            let clienteId = cliente.id;
            let prestamos = cliente.prestamos || [];
    
            // 🔹 Eliminar solo el préstamo específico
            cliente.prestamos = prestamos.filter(p => p.id !== parseInt(idPrestamo));
    
            const updateResponse = await fetch(`http://localhost:3000/clientes/${clienteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            });
    
            if (!updateResponse.ok) {
                throw new Error("Error al actualizar el cliente");
            }
    
            alert("Préstamo eliminado correctamente.");
            this.consultarHistorial(); // 🔄 Recargar la tabla después de eliminar
    
        } catch (error) {
            alert("Error al eliminar la simulación.");
            console.error(error);
        }
    }

    async eliminarTodasSimulaciones() {
        const documento = this.querySelector("#buscarCliente").value;

        try {
            const response = await fetch(`http://localhost:3000/clientes?documento=${documento}`);
            const clientes = await response.json();

            if (clientes.length === 0) {
                alert("Cliente no encontrado.");
                return;
            }

            let cliente = clientes[0];
            let clienteId = cliente.id;
            cliente.prestamos = []; // 🔹 Vaciar todos los préstamos

            const updateResponse = await fetch(`http://localhost:3000/clientes/${clienteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            });

            if (!updateResponse.ok) {
                throw new Error("Error al actualizar el cliente");
            }

            alert("Todas las simulaciones han sido eliminadas.");
            this.consultarHistorial();

        } catch (error) {
            alert("Error al eliminar todas las simulaciones.");
            console.error(error);
        }
    }
}

customElements.define('history-component', History);
