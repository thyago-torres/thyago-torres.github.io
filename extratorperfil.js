const COLUMNS = [
    "Tenet",
    "Worker (Full Name)",
    "Employee ID",
    "Enterprise ID",
    "Hire Date",
    "Enterprise ID Status",
    "Maquina",
    "Chamado",
    "Serial bipado",
    "SERIAL",
    "Nota Fiscal / Declaração",
    "Chamado NF (Solicitação)",
    "ID",
    "Analista",
    "Location",
    "PC Configuration Location",
    "Status Equipamento",
    "Refletiu no FNMS?",
    "Entrega",
    "Horario Agendamento",
    "DATA Agendamento",
    "Absorção de contractor",
    "Home Office",
    "Transporte",
    "CPF",
    "Cargo Folha",
    "E-mail pessoal",
    "Mobile Phone",
    "Cost Center Code",
    "Address 1",
    "City of residence",
    "State/Province of residence",
    "CEP"
];

document.addEventListener('DOMContentLoaded', () => {
    const emptyState = document.getElementById('empty-state');
    const resultsContainer = document.getElementById('results');
    const actionBar = document.getElementById('action-bar');
    const clearBtn = document.getElementById('clear-btn');
    const resultsCount = document.getElementById('results-count');

    // Botão Limpar
    clearBtn.addEventListener('click', () => {
        resultsContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        actionBar.classList.add('hidden');
    });

    // Escuta o evento de 'paste' (Ctrl+V) em qualquer lugar do documento
    document.addEventListener('paste', (event) => {
        // Previne qualquer comportamento padrão indesejado (como colar numa caixa de texto inexistente)
        event.preventDefault();

        // Pega os dados do clipboard como texto
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');

        if (!pastedText) return;

        processPastedData(pastedText);
    });

    function processPastedData(text) {
        // Divide o texto por quebras de linha para pegar todas as linhas copiadas
        // Remove linhas vazias
        const rows = text.trim().split(/\r?\n/).filter(row => row.trim() !== '');

        if (rows.length === 0) return;

        // Esconde o card de aviso inicial e mostra a barra de ação
        emptyState.classList.add('hidden');
        actionBar.classList.remove('hidden');

        // Limpa a tela para os novos resultados
        resultsContainer.innerHTML = '';

        // Filtra apenas as linhas onde a coluna 19 (Entrega, índice 18) é "Transporte"
        const filteredRows = rows.filter(row => {
            const cells = row.split('\t');
            return cells[18] && cells[18].trim().toLowerCase() === 'transporte';
        });

        // Atualiza contador
        resultsCount.textContent = `${filteredRows.length} ${filteredRows.length === 1 ? 'registro carregado' : 'registros carregados'}`;

        // Processa cada linha
        filteredRows.forEach((row, index) => {
            // O excel separa as colunas por tabulação (\t)
            const cells = row.split('\t');

            createRowCard(cells, index);
        });
    }

    function createRowCard(cells, index) {
        const card = document.createElement('div');
        card.className = 'row-card';
        card.style.animationDelay = `${index * 0.15}s`;

        // Cria um dicionário com todos os dados mapeados NO INÍCIO para ser modificado
        const dataObj = {};
        COLUMNS.forEach((col, i) => {
            dataObj[col] = cells[i] ? cells[i].trim() : '';
        });

        // Cabeçalho do Card
        const header = document.createElement('div');
        header.className = 'row-header';

        const title = document.createElement('h3');
        // Usa a primeira coluna (Worker) como título do card, se existir
        const name = dataObj["Worker (Full Name)"] ? dataObj["Worker (Full Name)"] : `Colaborador ${index + 1}`;
        title.textContent = name;

        const actions = document.createElement('div');
        actions.className = 'row-actions';

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copiar Dados';
        copyBtn.onclick = () => {
            let textToCopy = `Dados de ${name}:\n\n`;
            COLUMNS.forEach((col) => {
                const val = dataObj[col] ? dataObj[col] : 'N/A';
                textToCopy += `${col}: ${val}\n`;
            });
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copiado! ✓';
                    setTimeout(() => copyBtn.textContent = originalText, 2000);
                });
        };
        actions.appendChild(copyBtn);

        const generateBtn = document.createElement('button');
        generateBtn.textContent = 'Gerar Solicitação';
        generateBtn.className = 'generate-btn';
        
        // Container do Excel que aparecerá após clicar em "Gerar Solicitação"
        const excelContainer = document.createElement('div');
        excelContainer.className = 'excel-container hidden';
        
        const excelInput = document.createElement('input');
        excelInput.type = 'text';
        excelInput.className = 'excel-input';
        excelInput.readOnly = true;
        
        const excelCopyBtn = document.createElement('button');
        excelCopyBtn.textContent = 'Copiar Linha Excel';
        excelCopyBtn.className = 'excel-copy-btn';
        excelCopyBtn.onclick = () => {
            navigator.clipboard.writeText(excelInput.value).then(() => {
                const original = excelCopyBtn.textContent;
                excelCopyBtn.textContent = 'Copiado! ✓';
                setTimeout(() => excelCopyBtn.textContent = original, 2000);
            });
        };
        
        excelContainer.appendChild(excelInput);
        excelContainer.appendChild(excelCopyBtn);

        generateBtn.onclick = () => {
            // Template com a substituição das variáveis
            const template = `Item: Laptop
Description: Boa tarde, tudo bem? Precisamos da NF desta maquina para transporte de PE para ${dataObj['State/Province of residence'] || ''}, ${dataObj['Worker (Full Name)'] || ''}
 
Solicitação de nota fiscal para New Hire
 
Nome Completo: ${dataObj['Worker (Full Name)'] || ''}
EID: ${dataObj['Enterprise ID'] || ''}
CPF: ${dataObj['CPF'] || ''}
TELEFONE: ${dataObj['Mobile Phone'] || ''}
 
New Asset
Modelo: Lenovo Thinkpad T14 
S/N: ${dataObj['SERIAL'] || ''}
Asset tag:
 
De: Recife - PE (Armazém 9)
CEP: 50.030-150
Endereço: Av. Alfredo Lisboa , S/N Armazém 9- Bairro Recife_ PE
 
Para: ${dataObj['City of residence'] || ''}-${dataObj['State/Province of residence'] || ''}
Endereço: ${dataObj['Address 1'] || ''}
CEP: ${dataObj['CEP'] || ''}
 
Dados da Transportadora
CNPJ: 55.175.638/0001-55 
Razão Social: INTERNACIONAL TRANSPORTES E SUPPLY CHAIN LTDA
Fantasia: Urus Logistics`;

            // Copia o template preenchido
            navigator.clipboard.writeText(template)
                .then(() => {
                    const originalText = generateBtn.textContent;
                    generateBtn.textContent = 'Solicitação Copiada! ✓';
                    setTimeout(() => generateBtn.textContent = originalText, 2000);
                    
                    // Formata a data atual
                    const today = new Date();
                    const dataStr = today.toLocaleDateString('pt-BR');
                    
                    // Monta a string do Excel e mostra o campo
                    const excelStr = `INC\t${dataObj['Worker (Full Name)'] || ''}\t${dataObj['Enterprise ID'] || ''}\tSem ID\t${dataObj['PC Configuration Location'] || ''}\t${dataStr}\t${dataObj['Tenet'] || ''}`;
                    excelInput.value = excelStr;
                    excelContainer.classList.remove('hidden');
                });
        };
        actions.appendChild(generateBtn);

        header.appendChild(title);
        header.appendChild(actions);
        card.appendChild(header);
        
        // Adiciona o container do Excel logo após o header
        card.appendChild(excelContainer);

        const IMPORTANT_COLUMNS = [
            "Tenet", "Worker (Full Name)", "Enterprise ID", "Maquina", "SERIAL",
            "Location", "PC Configuration Location", "Entrega", "Transporte", "CPF",
            "Cargo Folha", "E-mail pessoal", "Mobile Phone", "Cost Center Code",
            "Address 1", "City of residence", "State/Province of residence", "CEP"
        ];

        // Grid principal (apenas importantes)
        const importantGrid = document.createElement('div');
        importantGrid.className = 'fields-grid important-grid';

        // Grid secundária (outras informações)
        const otherGrid = document.createElement('div');
        otherGrid.className = 'fields-grid other-grid';
        otherGrid.style.display = 'none';

        // Objeto para guardar as referências dos valores no DOM, permitindo atualizações
        const fieldElements = {};

        COLUMNS.forEach((colName) => {
            const value = dataObj[colName];

            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            fieldItem.title = 'Clique para copiar';

            // Alerta se for a coluna de Transporte e estiver como No/Não/Vazio/etc
            if (colName === 'Transporte') {
                const lowerVal = (value || '').trim().toLowerCase();
                if (!lowerVal || lowerVal === 'no' || lowerVal === 'não' || lowerVal === 'nao' || lowerVal === 'vazio') {
                    fieldItem.classList.add('alert-field');
                }
            }

            const label = document.createElement('span');
            label.className = 'field-label';
            label.textContent = colName;

            const valSpan = document.createElement('span');
            valSpan.className = `field-value ${!value ? 'empty' : ''}`;
            valSpan.textContent = value || 'Vazio';
            
            fieldElements[colName] = valSpan;

            fieldItem.appendChild(label);
            fieldItem.appendChild(valSpan);

            // Funcionalidade de copiar ao clicar no item
            fieldItem.onclick = (e) => {
                e.stopPropagation();
                // pega o valor atualizado do DOM e não o inicial
                const currentVal = valSpan.textContent !== 'Vazio' ? valSpan.textContent : '';
                if (!currentVal) return;

                navigator.clipboard.writeText(currentVal).then(() => {
                    // Feedback visual temporário
                    const originalBg = fieldItem.style.background;
                    fieldItem.classList.add('copied-flash');
                    setTimeout(() => {
                        fieldItem.classList.remove('copied-flash');
                    }, 500);
                });
            };

            if (IMPORTANT_COLUMNS.includes(colName)) {
                fieldItem.classList.add('important-field');
                importantGrid.appendChild(fieldItem);
            } else {
                otherGrid.appendChild(fieldItem);
            }
        });

        card.appendChild(importantGrid);

        // Divisor e Botão para mostrar os ocultos
        const divider = document.createElement('div');
        divider.className = 'card-divider';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.textContent = 'Ver outras informações ▼';
        toggleBtn.onclick = () => {
            if (otherGrid.style.display === 'none') {
                otherGrid.style.display = 'grid';
                toggleBtn.textContent = 'Ocultar outras informações ▲';
                divider.classList.add('open');
            } else {
                otherGrid.style.display = 'none';
                toggleBtn.textContent = 'Ver outras informações ▼';
                divider.classList.remove('open');
            }
        };

        divider.appendChild(toggleBtn);
        card.appendChild(divider);
        card.appendChild(otherGrid);

        resultsContainer.appendChild(card);
        
        // Dispara a busca do CEP de forma assíncrona
        fetchCepAndUpdate(dataObj, fieldElements, importantGrid);
    }

    async function fetchCepAndUpdate(dataObj, fieldElements, importantGrid) {
        const cepStr = dataObj['CEP'];
        if (!cepStr) return;
        
        const cep = cepStr.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            if (!response.ok) {
                if (response.status === 404) {
                    addInfoField(importantGrid, 'Aviso de CEP', 'CEP não tem bairro', 'warning-field');
                }
                return;
            }
            
            const data = await response.json();
            const bairro = data.neighborhood;
            
            if (!bairro) {
                addInfoField(importantGrid, 'Aviso de CEP', 'CEP não tem bairro', 'warning-field');
                return;
            }
            
            const address1 = dataObj['Address 1'] || '';
            // Ignora se o bairro já está contido no Address 1 (case insensitive)
            if (address1.toLowerCase().includes(bairro.toLowerCase())) {
                addInfoField(importantGrid, 'Aviso de CEP', 'Bairro já descrito no endereço', 'info-field');
            } else {
                // Adiciona o bairro ao endereço
                const novoEndereco = address1 ? `${address1}, ${bairro}` : bairro;
                dataObj['Address 1'] = novoEndereco;
                
                // Atualiza o valor visualmente
                if (fieldElements['Address 1']) {
                    fieldElements['Address 1'].textContent = novoEndereco;
                    fieldElements['Address 1'].classList.remove('empty');
                    // Efeito de destaque no item
                    fieldElements['Address 1'].parentElement.classList.add('copied-flash');
                    setTimeout(() => {
                        fieldElements['Address 1'].parentElement.classList.remove('copied-flash');
                    }, 1000);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar CEP:', err);
        }
    }

    function addInfoField(grid, labelText, valueText, className) {
        const fieldItem = document.createElement('div');
        fieldItem.className = `field-item ${className}`;
        
        const label = document.createElement('span');
        label.className = 'field-label';
        label.textContent = labelText;
        
        const valSpan = document.createElement('span');
        valSpan.className = 'field-value';
        valSpan.textContent = valueText;
        
        fieldItem.appendChild(label);
        fieldItem.appendChild(valSpan);
        
        // Insere o campo no começo do grid importante
        if (grid.firstChild) {
            grid.insertBefore(fieldItem, grid.firstChild);
        } else {
            grid.appendChild(fieldItem);
        }
    }
});
