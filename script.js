let notes = [];

document.getElementById('add-note').addEventListener('click', () => {
    const titleText = document.getElementById("noteTitle").value;
    const noteText = document.getElementById("noteText").value;
    
    if (titleText.trim() !== '' && noteText.trim() !== '') {
        const note = {
            id: Date.now(), // Add unique ID for each note
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

    const notesJson = JSON.stringify(notes, null, 2);
    
    const blob = new Blob([notesJson], { type: 'application/json' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `notes-${date}.json`;
    
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
                const importedNotes = JSON.parse(e.target.result);
                
                if (Array.isArray(importedNotes) && importedNotes.every(note => note.title && note.text)) {
                    importedNotes.forEach(note => {
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
