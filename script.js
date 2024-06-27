document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');

    container.innerHTML = `
        <div class="left">
            <img src="./sidepht.jpeg" alt="Placeholder image" class="main-photo">
            <div class="overlay">
                <img src="https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png" alt="GitLab Logo" class="gitlab-logo">
                <h1>GitLab Repo Creator</h1>
                <h2>by Emin Gambarli</h2>
            </div>
        </div>
        <div class="right">
            <form id="repoForm" class="form-container">
                <h3>Create GitLab Repository</h3>
                <div class="input-group">
                    <label for="repoName">Repository Name</label>
                    <input type="text" id="repoName" required>
                </div>
                <div class="input-group">
                    <label for="template">Template Repository</label>
                    <select id="template" required>
                        <option value="" disabled selected>Select a template...</option>
                    </select>
                </div>
                <div id="variablesContainer">
                    <h4>Variables</h4>
                    <div id="variableInputs">
                        <div class="variable-group">
                            <span class="variable-key">Variable 1:</span>
                            <input type="text" class="variable-value" placeholder="Value for Variable 1">
                        </div>
                    </div>
                    <button id="addVariableBtn" type="button">Add Variable</button>
                </div>
                <button type="submit">Create Repository</button>
                <div id="output"></div>
            </form>
        </div>
    `;
    const apiToken = 'glpat-tKpKnxk8vtsCbf4CF9-H';
    const apiUrl = 'https://gitlab.com/api/v4';
    fetchTemplates();
    
    let variableCount = 1;
    const addVariableBtn = document.getElementById('addVariableBtn');
    const variableInputs = document.getElementById('variableInputs');

    addVariableBtn.addEventListener('click', () => {
        variableCount++;
        const newVariableGroup = document.createElement('div');
        newVariableGroup.classList.add('variable-group');
        newVariableGroup.innerHTML = `
            <input type="text" class="variable-key" placeholder="Variable ${variableCount}:">
            <input type="text" class="variable-value" placeholder="Value for Variable ${variableCount}">
        `;
        variableInputs.appendChild(newVariableGroup);
    });

    document.getElementById('repoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const repoName = document.getElementById('repoName').value;
        const template = document.getElementById('template').value;

        const variables = Array.from(document.querySelectorAll('.variable-group')).map((variableGroup, index) => ({
            key: variableGroup.querySelector('.variable-key').innerHTML,
            value: variableGroup.querySelector('.variable-value').value
        }));

        try {
            const createRepoResponse = await fetch(`${apiUrl}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}`
                },
                body: JSON.stringify({
                    name: repoName,
                    template_project_id: template
                })
            });
            
            if (!createRepoResponse.ok) throw new Error('Failed to create repository');
            const repoData = await createRepoResponse.json();
            
            for (const variable of variables) {
                const createVariableResponse = await fetch(`${apiUrl}/projects/${repoData.id}/variables`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    },
                    body: JSON.stringify({
                        key: variable.key,
                        value: variable.value
                    })
                });
                if (!createVariableResponse.ok) throw new Error('Failed to add variable');
            }

            document.getElementById('output').innerText = 'Repository and variables created successfully';
            document.getElementById('output').style.color = '#28a745';
        } catch (error) {
            document.getElementById('output').innerText = `Error: ${error.message}`;
            document.getElementById('output').style.color = '#dc3545';
        }
    });
});

const apiToken = 'glpat-tKpKnxk8vtsCbf4CF9-H';
const apiUrl = 'https://gitlab.com/api/v4';

const fetchTemplates = async () => {
    try {
        const response = await fetch(`${apiUrl}/projects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch templates');
        const repos = await response.json();

        const templateSelect = document.getElementById('template');
        repos.forEach(repo => {
            const option = document.createElement('option');
            option.value = repo.id;
            option.text = repo.name;
            templateSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
    }
};
