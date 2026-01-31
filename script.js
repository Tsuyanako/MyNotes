let notes = [];

document.getElementById('add-note').addEventListener('click', () => {
    const titleText = document.getElementById("noteTitle").value;
    const noteText = document.getElementById("noteText").value;
    
    if (titleText.trim() !== '' && noteText.trim() !== '') {
        const note = {
            id: Date.now(),
            title: titleText,
            text: noteText
        };
        
        notes.push(note);
        
        document.getElementById("noteTitle").value = '';
        document.getElementById("noteText").value = '';
        
        const notesContainer = document.getElementById('notes-container');
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.dataset.id = note.id;
        noteElement.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <button class="delete-btn" onclick="deleteNote(${note.id})">×</button>
            </div>
            <p>${note.text}</p>
        `;
        notesContainer.appendChild(noteElement);
    }
});

function deleteNote(id) {
    const noteElement = document.querySelector(`.note[data-id="${id}"]`);
    if (noteElement) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== id);
            noteElement.remove();
        }
    }
}

document.getElementById('download-notes').addEventListener('click', () => {
    if (notes.length === 0) {
        alert('No notes to download!');
        return;
    }

    const notesTxt = notes.map(note => `Title: ${note.title}\n${note.text}`).join('\n\n---\n\n');

    const blob = new Blob([notesTxt], { type: 'text/plain' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `notes-${date}.txt`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

document.getElementById('import-notes').addEventListener('click', () => {
    document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                let importedNotes = [];

                const name = (file.name || '').toLowerCase();
                const isJson = name.endsWith('.json') || content.trim().startsWith('[');

                if (isJson) {
                    importedNotes = JSON.parse(content);
                } else {
                    const blocks = content.split(/\r?\n-{3,}\r?\n/);
                    blocks.forEach((block, index) => {
                        const lines = block.split(/\r?\n/).filter(l => l.trim() !== '');
                        if (lines.length === 0) return;

                        let title = 'Untitled';
                        let bodyLines = [];

                        if (lines[0].startsWith('Title:')) {
                            title = lines[0].replace(/^Title:\s*/, '').trim();
                            bodyLines = lines.slice(1);
                        } else {
                            title = lines[0].trim();
                            bodyLines = lines.slice(1);
                        }

                        const textBody = bodyLines.join('\n').trim();
                        importedNotes.push({
                            id: Date.now() + index,
                            title,
                            text: textBody
                        });
                    });
                }

                if (Array.isArray(importedNotes) && importedNotes.every(note => note.title !== undefined && note.text !== undefined)) {
                    importedNotes.forEach(note => {
                        if (!note.id) note.id = Date.now() + Math.floor(Math.random() * 1000);

                        notes.push(note);

                        const notesContainer = document.getElementById('notes-container');
                        const noteElement = document.createElement('div');
                        noteElement.className = 'note';
                        noteElement.dataset.id = note.id;
                        noteElement.innerHTML = `
                            <div class="note-header">
                                <h3>${note.title}</h3>
                                <button class="delete-btn" onclick="deleteNote(${note.id})">×</button>
                            </div>
                            <p>${note.text}</p>
                        `;
                        notesContainer.appendChild(noteElement);
                    });

                    alert(`${importedNotes.length} notes imported successfully!`);
                } else {
                    throw new Error('File format is invalid.');
                }
            } catch (error) {
                alert('Error during import : ' + error.message);
            }
        };
        reader.readAsText(file);
    }
});
