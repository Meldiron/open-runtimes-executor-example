const fetch = require('node-fetch');
const fs = require("fs");
const {json} = require('micro');

const executeCode = async (code, { input }) => {
    const executionId = `e_${Date.now()}`;

    fs.writeFileSync(`code/${executionId}.py`, code);

    try {
        const body = {
            variables: input,
            timeout: 5,
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
        
        const res = await fetch('http://runtimes-executor/v1/runtimes', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer my-secret'
            }
        });
    
        const json = await res.json();
    
        return json.stdout;
    } catch(err) {
        return "";
    } finally {
        fs.unlinkSync(`code/${executionId}.py`);
    }
}

module.exports = async (req, res) => {
    const data = await json(req);

    const code = data.code;

    const output = await executeCode(code, {
        input: {
            A: 4,
            B: 6
        }
    });

    const response = { output: output };

    res.end(JSON.stringify(response));
};