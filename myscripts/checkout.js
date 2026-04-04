async function checkout(items) {
    try {
        const res = await fetch("https://gamestore-backend-dke0.onrender.com/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items })
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Error al iniciar el pago");
            console.error(data);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión con el servidor");
    }
}