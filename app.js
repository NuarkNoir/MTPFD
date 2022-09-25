document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("file").addEventListener('change', loadFile);
    logInfo("Ready");
});

const logInfo = function(message) {
    document.getElementById("log").textContent += message + "\n";
    console.log(message);
}

const unprotectFile = function(stringContent) {
    /** @type {Array<String>} */
    const content = stringContent.split("\n");
    const result = [];
    for (let i = 0; i < content.length; i++) {
        const line = content[i];
        if (line.includes("protection")) {
            logInfo(`Found protection at line ${i+1}, stripping...`);
            continue;
        }
        result.push(line);
    }
    return result.join("\n");
}

const downloadFile = function(content) {
    const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    document.body.appendChild(downloadLink);
    if (!window.externalHost && "download" in document.createElement("a")) {
        downloadLink.download = "unprotected.xmcd";
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        logInfo("Download attribute is not supported, using fallback...");
        downloadLink.innerText = "Right click and 'save as...' to download";
    }
    logInfo("Done");
}

const loadFile = function(event) {
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const data = fileReader.result;
        try {
            const result = pako.inflate(data, {to: "string"});
            const unprotected = unprotectFile(result);
            downloadFile(unprotected);
        } catch (e) {
            logInfo(e);
        }
    };
    fileReader.readAsArrayBuffer(event.target.files[0]);
}