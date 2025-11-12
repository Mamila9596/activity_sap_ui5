sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    return BaseObject.extend("activity.service.TaskService", {

        constructor: function() {
            // Configurazione Supabase
            this.SUPABASE_URL = "https://eujuxuafjeybfrbvbmmb.supabase.co";
            this.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1anV4dWFmamV5YmZyYnZibW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzU5OTUsImV4cCI6MjA2OTcxMTk5NX0.0CbQekQf1s40PmA3TjVbgGO699G1A-J63pnBXINvfEo";
            this.API_URL = this.SUPABASE_URL + "/rest/v1";
            
            this.headers = {
                "apikey": this.SUPABASE_ANON_KEY,
                "Authorization": "Bearer " + this.SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            };
        },

        // Recupera tutte le attività con filtri opzionali
        getTasks: function(status = null, categoryId = null, searchText = null) {
            let url = this.API_URL + "/tasks?select=*,categories(name,color)&order=created_at.desc";
            
            // Applica filtri
            if (status) {
                url += `&status=eq.${status.status}`;
            }
            if (categoryId) {
                url += `&category_id=eq.${categoryId.categoryId}`;
            }
            if (searchText) {
                url += `&or=(title.ilike.*${searchText}*,description.ilike.*${searchText}*)`;
            }

            return fetch(url, {
                method: 'GET',
                headers: this.headers
            }).then(async response => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error("Errore nella chiamata Supabase");
                }
                const data = await response.json();
                return data;
            });
         },

    getTaskById: function(id){
	        let url = this.API_URL + "/tasks?select=*,categories(name,color)&order=created_at.desc";
            // Applica filtri
            if (id) {
                url += `&id=eq.${id.id}`;
            }

            return fetch(url, {
                method: 'GET',
                headers: this.headers
            }).then(async response => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error("Errore nella chiamata Supabase");
                }
                const data = await response.json();
                return data;
            });
         },  
         getCategoryById: function(id){
            debugger;
            let url = this.API_URL + "/categories?order=name"
            if (id) {
                url += `&id=eq.${id}`;
            }
            return fetch(url, {
                    method: 'GET',
                    headers: this.headers
                        }).then(async response => {
                            if (!response.ok) {
                                const text = await response.text();
                                throw new Error("Errore nella chiamata Supabase");
                            }
                            const data = await response.json();
                            return data;
                        });;
            },                   
        // Crea una nuova attività
        createTask: function(taskData) {
            return fetch(this.API_URL + "/tasks", {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(taskData)
            }).then(response => response.json());
        },

        // Aggiorna un'attività esistente
        updateTask: function(taskId, taskData) {
            return fetch(this.API_URL + "/tasks?id=eq." + taskId, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(taskData)
            }).then(response => response.json());
        },

        // Segna un'attività come completata
        completeTask: function(taskId) {
            return this.updateTask(taskId, {
                status: 'completed',
                completed_at: new Date().toISOString()
            });
        },

        // Riattiva un'attività completata
        reactivateTask: function(taskId) {
            return this.updateTask(taskId, {
                status: 'active',
                completed_at: null
            });
        },

        // Elimina un'attività
        deleteTask: function(taskId) {
            return fetch(this.API_URL + "/tasks?id=eq." + taskId, {
                method: 'DELETE',
                headers: this.headers
            });
        },

        // Recupera le categorie
        getCategories: function() {
            return fetch(this.API_URL + "/categories?order=name", {
                method: 'GET',
                headers: this.headers
            }).then(async response => {
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error("Errore nella chiamata Supabase");
                }
                const data = await response.json();
                return data;
            });;
        },

        // Recupera le note di un'attività
        getTaskNotes: function(taskId) {
            return fetch(this.API_URL + "/task_notes?task_id=eq." + taskId + "&order=created_at.desc", {
                method: 'GET',
                headers: this.headers
            }).then(response => response.json());
        },

        // Aggiunge una nota a un'attività
        addTaskNote: function(taskId, content) {
            return fetch(this.API_URL + "/task_notes", {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    task_id: taskId,
                    content: content
                })
            }).then(response => response.json());
        },

        // Aggiorna una nota
        updateTaskNote: function(noteId, content) {
            return fetch(this.API_URL + "/task_notes?id=eq." + noteId, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify({
                    content: content
                })
            }).then(response => response.json());
        },

        // Elimina una nota
        deleteTaskNote: function(noteId) {
            return fetch(this.API_URL + "/task_notes?id=eq." + noteId, {
                method: 'DELETE',
                headers: this.headers
            });
        },

        // Cerca attività per testo
        searchTasks: function(searchText) {
            return this.getTasks(null, null, searchText);
        },

        // Statistiche attività
        getTaskStats: function() {
            return Promise.all([
                this.getTasks('active'),
                this.getTasks('completed')
            ]).then(([activeTasks, completedTasks]) => {
                return {
                    total: activeTasks.length + completedTasks.length,
                    active: activeTasks.length,
                    completed: completedTasks.length,
                    completionRate: completedTasks.length > 0 ? 
                        Math.round((completedTasks.length / (activeTasks.length + completedTasks.length)) * 100) : 0
                };
            });
        },
    uploadAttachmentFile: function(taskId, file) {
        debugger;
        const timestamp = Date.now();
        const fileName = `${taskId}/${timestamp}_${file.name}`;
        
        // Crea FormData per l'upload
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadUrl = this.SUPABASE_URL + `/storage/v1/object/task-attachments/${fileName}`;
        
        return fetch(uploadUrl, {
            method: 'POST',
            headers: {
                "apikey": this.SUPABASE_ANON_KEY,
                "Authorization": "Bearer " + this.SUPABASE_ANON_KEY
            },
            body: formData
        }).then(async response => {
            if (!response.ok) {
                const text = await response.text();
                throw new Error("Errore durante l'upload del file");
            }
            const data = await response.json();
            
            // Genera URL pubblico del file
            const publicUrl = this.SUPABASE_URL + `/storage/v1/object/public/task-attachments/${fileName}`;
            
            return {
                fileName: fileName,
                publicUrl: publicUrl
            };
        });
    },

    // Crea un nuovo allegato (metadata nel database)
    createAttachment: function(taskId, fileName, fileSize, fileType, fileUrl, description, uploadedBy) {
        debugger;
        const attachmentData = {
            task_id: taskId,
            file_name: fileName,
            file_size: fileSize,
            file_type: fileType,
            file_url: fileUrl,
            description: description,
            uploaded_by: uploadedBy
        };
        
        return fetch(this.API_URL + "/task_attachments", {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(attachmentData)
        }).then(async response => {
            if (!response.ok) {
                debugger;
                const text = await response.text();
                throw new Error("Errore nella creazione dell'allegato");
            }
            debugger;
            const data = await response.json();
            return data;
        });
    },

        // Metodo combinato: upload file + salva metadata
        uploadAttachment: function(taskId, file, description, uploadedBy) {
            // Prima carica il file su Storage
            return this.uploadAttachmentFile(taskId, file).then(uploadResult => {
                // Poi salva i metadata nel database
                return this.createAttachment(
                    taskId,
                    file.name,
                    file.size,
                    file.type,
                    uploadResult.publicUrl,
                    description,
                    uploadedBy
                );
            });
        },
       
        // recupera gli allegati di un'attività
        getTaskAtt: function(taskId) {
            return fetch(this.API_URL + "/task_attachments?task_id=eq." + taskId + "&order=created_at.desc", {
                method: 'GET',
                headers: this.headers
            }).then(response => response.json());
        },

        //Elimina un allegato
         // Elimina una nota
        deleteTaskAtt: function(attId) {
            return fetch(this.API_URL + "/task_attachments?id=eq." + attId, {
                method: 'DELETE',
                headers: this.headers
            });
        },       
// Metodo per validare il login
validateLogin: function(username, password) {
    let url = this.API_URL + `/users?username=eq.${username}&password_hash=eq.${password}&is_active=eq.true`;
    
    return fetch(url, {
        method: 'GET',
        headers: this.headers
    }).then(async response => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error("Errore nella validazione login");
        }
        const data = await response.json();
        
        if (data.length > 0) {
            // Utente trovato e credenziali corrette
            const user = data[0];
           return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name
                }
            };            
        } else {
            // Credenziali non valide
            return {
                success: false,
                message: "Username o password non corretti"
            };
        }
    }).catch(error => {
        return {
            success: false,
            message: "Errore durante il login: " + error.message
        };
    });
    }       
    });
});