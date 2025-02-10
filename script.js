let db;

document.addEventListener("DOMContentLoaded", () => {
    let request = indexedDB.open("fileDB", 1);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        let objectStore = db.createObjectStore("files", { keyPath: "name" });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        displayFiles();
    };

    request.onerror = (event) => {
        console.log("Erro ao abrir o banco de dados: ", event.target.errorCode);
    };

    document.getElementById("fileForm").addEventListener("submit", addFile);
});

function addFile(event) {
    event.preventDefault();
    let fileName = document.getElementById("fileName").value;
    let fileContent = document.getElementById("fileContent").value;
    let fileUpload = document.getElementById("fileUpload").files[0];

    if (fileUpload) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let fileData = e.target.result;
            saveFile(fileName, fileContent, fileData);
        };
        reader.readAsDataURL(fileUpload);
    } else {
        saveFile(fileName, fileContent, null);
    }

    event.target.reset();
}

function saveFile(name, content, fileData) {
    let transaction = db.transaction(["files"], "readwrite");
    let objectStore = transaction.objectStore("files");
    let request = objectStore.add({ name: name, content: content, fileData: fileData });

    request.onsuccess = () => {
        displayFiles();
    };

    request.onerror = () => {
        console.log("Erro ao adicionar o arquivo: ", request.error);
    };
}

function displayFiles() {
    let fileList = document.getElementById("fileList");
    fileList.innerHTML = "";

    let transaction = db.transaction(["files"], "readonly");
    let objectStore = transaction.objectStore("files");
    let request = objectStore.getAll();

    request.onsuccess = () => {
        request.result.forEach((file) => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `${file.name}: ${file.content}`;
            if (file.fileData) {
                let fileLink = document.createElement("a");
                fileLink.href = file.fileData;
                fileLink.textContent = "Download";
                fileLink.download = file.name;
                listItem.appendChild(fileLink);
            }
            fileList.appendChild(listItem);
        });
    };
}
