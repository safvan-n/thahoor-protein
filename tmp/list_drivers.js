import { db } from './frontend/src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function listDrivers() {
    try {
        const querySnapshot = await getDocs(collection(db, "drivers"));
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} =>`, doc.data());
        });
    } catch (e) {
        console.error("Error reading drivers: ", e);
    }
}

listDrivers();
