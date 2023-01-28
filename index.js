const fetch = require('node-fetch');
const fs = require("fs");

const executeCode = async (code, { input, output }) => {
    const executionId = `e_${Date.now()}`;

    fs.writeFileSync(`code/${executionId}.py`, code);
    
    const body = {
        variables: input,
        timeout: 15,
        cpus: 1,
        memory: 128,
    
        commands: [
            'sh', '-c',
            'mv /tmp/code.tar.gz /tmp/index.py && python /tmp/index.py'
        ],
    
        image: 'python:3.10-alpine3.15',
        source: `/code/${executionId}.py`,
        remove: true,
        runtimeId: executionId,
        workdir: '/tmp',
        entrypoint: '_',
    };
    
    const res = await fetch('http://localhost:8080/v1/runtimes', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-secret'
        }
    });

    const json = await res.json();

    fs.unlinkSync(`code/${executionId}.py`);

    return json.stdout == output
}

(async () => {
    const code = `
import os

a = int(os.getenv('A'))
b = int(os.getenv('B'))

print(a + b)
    `;

    const didPass = await executeCode(code, {
        input: {
            A: 4,
            B: 6
        },
        output: 10
    });

    console.log("Did pass?", didPass);
})();