const { io } = require("socket.io-client");
// Assuming global fetch is available (Node 18+)

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api/orders";

async function verify() {
    console.log("Starting verification...");

    // 1. Create a dummy order to update
    const newOrder = {
        items: [{ name: "Test Item", qty: 1, price: 100 }],
        totalAmount: 100,
        status: "Placed",
        customer: { email: "test@example.com", name: "Test User" }
    };

    console.log("Creating test order...");
    const createRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
    });
    const order = await createRes.json();
    console.log("Order created:", order._id);

    // 2. Connect to socket
    console.log("Connecting to socket...");
    const socket = io(SOCKET_URL);

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Timeout waiting for orderUpdated event"));
            socket.disconnect();
        }, 5000);

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);

            // 3. Trigger update via API
            console.log("Triggering update via API...");
            fetch(`${API_URL}/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "On the Way" })
            });
        });

        socket.on("orderUpdated", (updatedOrder) => {
            console.log("Received orderUpdated event:", updatedOrder._id, updatedOrder.status);
            if (updatedOrder._id === order._id && updatedOrder.status === "On the Way") {
                console.log("✅ Verification SUCCESS!");
                clearTimeout(timeout);
                socket.disconnect();
                resolve();
            }
        });
    });
}

verify().catch(err => {
    console.error("❌ Verification FAILED:", err);
    process.exit(1);
});
