const http = require('http');

const data = JSON.stringify({
    level: 1,
    date: 1,
    para: "Reading is a fundamental skill that opens doors to knowledge and imagination. When we read, we expose ourselves to new ideas, cultures, and perspectives. It improves our vocabulary, concentration, and critical thinking abilities. Daily reading habits can significantly enhance our communication skills and overall cognitive development.",
    questions: [
        {
            question: "What is one main benefit of reading mentioned in the text?",
            options: ["It helps us sleep better", "It opens doors to knowledge", "It requires expensive books", "It is only for students"],
            correctAnswer: 1
        },
        {
            question: "According to the passage, reading improves:",
            options: ["Physical strength", "Cooking skills", "Vocabulary and concentration", "Musical ability"],
            correctAnswer: 2
        },
        {
            question: "What can daily reading habits enhance?",
            options: ["Communication skills", " athletic performance", "Video game skills", "None of the above"],
            correctAnswer: 0
        }
    ]
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`StatusCode: ${res.statusCode}`);
        console.log('Response:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Error seeding test:', error);
});

req.write(data);
req.end();
