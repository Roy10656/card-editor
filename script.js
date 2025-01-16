document.addEventListener('DOMContentLoaded', () => {
    const insertTextBtn = document.getElementById('insertTextBtn');
    const inputText = document.getElementById('inputText');
    const rectangle = document.getElementById('rectangle');
    const fontStyleSelect = document.getElementById('fontStyle');
    const decreaseSizeBtn = document.getElementById('decreaseSize');
    const increaseSizeBtn = document.getElementById('increaseSize');
    const fontSizeInput = document.getElementById('fontSize');
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const paraBtn = document.getElementById('paraBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const delTextBtn = document.getElementById('delText');

    let textHistory = [];
    let historyIndex = -1;
    let selectedElement = null;

    function saveState() {
        textHistory = textHistory.slice(0, historyIndex + 1);
        const currentState = rectangle.innerHTML;
        textHistory.push(currentState);
        historyIndex++;
    }

    function restoreState(index) {
        rectangle.innerHTML = textHistory[index];
        addDraggableListeners();
    }

    function updateFunctionInputs() {
        if (selectedElement) {
            const fontFamily = selectedElement.style.fontFamily.replace(/['"]/g, '');
            fontStyleSelect.value = fontFamily || 'Arial';
            fontSizeInput.value = parseInt(selectedElement.style.fontSize, 10) || 16;
            boldBtn.classList.toggle('enabled', selectedElement.style.fontWeight === 'bold');
            italicBtn.classList.toggle('enabled', selectedElement.style.fontStyle === 'italic');
            underlineBtn.classList.toggle('enabled', selectedElement.style.textDecoration === 'underline');
            paraBtn.classList.toggle('enabled', selectedElement.style.textAlign === 'center');
        } else {
            fontStyleSelect.value = 'Arial';
            fontSizeInput.value = 16;
            boldBtn.classList.remove('enabled');
            italicBtn.classList.remove('enabled');
            underlineBtn.classList.remove('enabled');
            paraBtn.classList.remove('enabled');
        }
    }

    function addDraggableListeners() {
        const elements = rectangle.querySelectorAll('div');
        elements.forEach(element => {
            let isDragging = false;
            let startX, startY;

            element.addEventListener('mousedown', (e) => {
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                selectedElement = element;
                selectedElement.classList.add('selected');
                isDragging = true;
                startX = e.clientX - element.getBoundingClientRect().left;
                startY = e.clientY - element.getBoundingClientRect().top;
                element.style.zIndex = 1000;
                e.stopPropagation();

                // update function inputs based on the selected element's attributes
                updateFunctionInputs();
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;

                    const newLeft = mouseX - startX - rectangle.getBoundingClientRect().left;
                    const newTop = mouseY - startY - rectangle.getBoundingClientRect().top;

                    // ensure the text stays within the rectangle
                    if (newLeft >= 0 && newLeft <= rectangle.clientWidth - element.clientWidth) {
                        element.style.left = `${newLeft}px`;
                    } else if (newLeft < 0) {
                        element.style.left = '0';
                    } else {
                        element.style.left = `${rectangle.clientWidth - element.clientWidth}px`;
                    }

                    if (newTop >= 0 && newTop <= rectangle.clientHeight - element.clientHeight) {
                        element.style.top = `${newTop}px`;
                    } else if (newTop < 0) {
                        element.style.top = '0';
                    } else {
                        element.style.top = `${rectangle.clientHeight - element.clientHeight}px`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    element.style.zIndex = 1;
                }
            });
        });
    }

    rectangle.addEventListener('click', (e) => {
        if (!e.target.classList.contains('selected')) {
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
                updateFunctionInputs();
            }
        }
    });

    insertTextBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (text !== '') {
            const newTextElement = document.createElement('div');
            newTextElement.innerText = text;
            newTextElement.style.position = 'absolute';
            newTextElement.style.cursor = 'move';
            newTextElement.style.fontFamily = fontStyleSelect.value;
            newTextElement.style.fontSize = `${fontSizeInput.value}px`;
            newTextElement.style.whiteSpace = 'pre-wrap';

            // randomize the position within the rectangle
            const rect = rectangle.getBoundingClientRect();
            const randomX = Math.floor(Math.random() * (rect.width - 50));
            const randomY = Math.floor(Math.random() * (rect.height - 20));

            newTextElement.style.left = `${randomX}px`;
            newTextElement.style.top = `${randomY}px`;

            rectangle.appendChild(newTextElement);
            inputText.value = '';
            saveState();
            addDraggableListeners();
        }
    });

    function applyToAllOrSelected(action) {
        const elements = rectangle.querySelectorAll('div');
        if (selectedElement) {
            action(selectedElement);
        } else {
            elements.forEach(element => {
                action(element);
            });
        }
        saveState();
    }

    // font style change listener
    fontStyleSelect.addEventListener('change', () => {
        applyToAllOrSelected(element => {
            element.style.fontFamily = fontStyleSelect.value;
        });
    });

    // font size change listeners
    decreaseSizeBtn.addEventListener('click', () => {
        let size = parseInt(fontSizeInput.value, 10);
        if (size > 10) size -= 1;
        fontSizeInput.value = size;
        applyToAllOrSelected(element => {
            element.style.fontSize = `${size}px`;
        });
    });

    increaseSizeBtn.addEventListener('click', () => {
        let size = parseInt(fontSizeInput.value, 10);
        if (size < 72) size += 1;
        fontSizeInput.value = size;
        applyToAllOrSelected(element => {
            element.style.fontSize = `${size}px`;
        });
    });

    // font edit functions
    boldBtn.addEventListener('click', () => {
        applyToAllOrSelected(element => {
            element.style.fontWeight = element.style.fontWeight === 'bold' ? 'normal' : 'bold';
        });
        boldBtn.classList.toggle('enabled');
    });

    italicBtn.addEventListener('click', () => {
        applyToAllOrSelected(element => {
            element.style.fontStyle = element.style.fontStyle === 'italic' ? 'normal' : 'italic';
        });
        italicBtn.classList.toggle('enabled');
    });

    underlineBtn.addEventListener('click', () => {
        applyToAllOrSelected(element => {
            element.style.textDecoration = element.style.textDecoration === 'underline' ? 'none' : 'underline';
        });
        underlineBtn.classList.toggle('enabled');
    });

    paraBtn.addEventListener('click', () => {
        applyToAllOrSelected(element => {
            element.style.textAlign = element.style.textAlign === 'center' ? 'left' : 'center';
        });
        paraBtn.classList.toggle('enabled');
    });

    // undo and redo functions
    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            restoreState(historyIndex);
        }
    });

    redoBtn.addEventListener('click', () => {
        if (historyIndex < textHistory.length - 1) {
            historyIndex++;
            restoreState(historyIndex);
        }
    });

    // delete selected text
    delTextBtn.addEventListener('click', () => {
        if (selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            saveState();
            updateFunctionInputs();
        }
    });

    // initialize by saving the initial state
    saveState();
    addDraggableListeners();
});
