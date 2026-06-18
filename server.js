const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const DB_FILE = path.join(__dirname, 'database.json');

// Helper function to safely load existing data from our database file
function loadDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const fileData = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileData || '[]');
    } catch (error) {
        console.error("Error reading database file:", error);
        return [];
    }
}

// Helper function to save new data into our database file permanently
function saveToDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to database file:", error);
    }
}

const server = http.createServer((req, res) => {
    // --- 1. HANDLE API REQUESTS FIRST ---
    
    // GET API: Send current data to Admin Panel/Registry
    if (req.method === 'GET' && (req.url === '/api/get-certs' || req.url === '/api/get-bookings')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(loadDatabase()));
    }

    // POST API: Admin uploading new data manually
    if (req.method === 'POST' && req.url === '/api/upload-cert') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { student, course, url } = JSON.parse(body);
                const currentDatabase = loadDatabase();
                
                const newEntry = {
                    id: currentDatabase.length + 1,
                    student: student || "Unnamed Customer",
                    course: course || "General Service",
                    url: url || "",
                    date: new Date().toISOString()
                };

                currentDatabase.push(newEntry);
                saveToDatabase(currentDatabase);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Data logged successfully!" }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid structural data input." }));
            }
        });
        return;
    }

    // POST API: Public User Custom Inquiry Booking Form 
    if (req.method === 'POST' && req.url === '/api/book') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { name, phone, interest } = JSON.parse(body);
                if (!name || !phone || !interest) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: "All fields are required." }));
                }

                const currentDatabase = loadDatabase();
                const newBooking = { 
                    id: currentDatabase.length + 1, 
                    student: name,       // mapped to student for shared log consistency
                    course: interest,    // mapped to course
                    url: phone,          // preserves data properties
                    date: new Date().toISOString() 
                };

                currentDatabase.push(newBooking);
                saveToDatabase(currentDatabase);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: `Thank you! Data saved permanently.` }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Server error handling storage." }));
            }
        });
        return;
    }

    // --- 2. SERVE STATIC FRONTEND FILES (HTML, CSS, IMAGES) ---
    if (req.method === 'GET') {
        let cleanUrl = req.url.split('?')[0]; // Strip off cache queries like ?v=2
        let filePath = path.join(__dirname, 'public', cleanUrl === '/' ? 'index.html' : cleanUrl);
        let extname = path.extname(filePath);
        
        // Match specific content MIME types so assets display correctly
        let contentType = 'text/html';
        if (extname === '.css') contentType = 'text/css';
        if (extname === '.js') contentType = 'text/javascript';
        if (extname === '.jpeg' || extname === '.jpg') contentType = 'image/jpeg';
        if (extname === '.png') contentType = 'image/png';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Asset Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 ===================================================`);
    console.log(`   SERVER RUNNING WITH FULL ENGINE AND IMAGES ROOTED!`);
    console.log(`   Open your browser to: http://localhost:${PORT}`);
    console.log(`=======================================================\n`);
});