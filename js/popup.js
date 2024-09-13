// Hide 'Exclude current site' button if the page wasn't opened from the browser action button
if (!document.location.href.includes('source=action')) {
    document.getElementById('exclude-button').style.display = 'none'
}

// Save settings
document.querySelector('#music-picker').addEventListener('change', function () {
    chrome.storage.sync.set({
        music: document.querySelector('#music-picker').value
    })
})

// Save volume
function updateVolume() {
    chrome.storage.sync.set({
        volume: document.querySelector('#music-volume').value / 100
    })
}
document.querySelector('#music-volume').addEventListener('change', updateVolume)
document.querySelector('#music-volume').addEventListener('input', updateVolume)

// Get stored settings
chrome.storage.sync.get({
    music: 'wii-shop-theme',
    musicEnabled: 'true',
    volume: 0.5,
    excludedSites: ''
}, function (data) {
    document.querySelector('#music-volume').value = (data.volume * 100)
    document.querySelector('#music-picker').value = data.music
    if (data.musicEnabled) {
        document.getElementById('music-toggle').innerText = 'Turn off background music'
    } else {
        document.getElementById('music-toggle').innerText = 'Turn on background music'
    }
})

// Music on/off button
document.getElementById('music-toggle').addEventListener('click', function () {
    chrome.storage.sync.get({
        musicEnabled: true
    }, function (data) {
        console.log(data)
        if (data.musicEnabled) {
            // Turn off music
            document.getElementById('music-toggle').innerText = 'Turn on background music'
            chrome.storage.sync.set({
                musicEnabled: false
            })
        } else {
            // Turn on music
            document.getElementById('music-toggle').innerText = 'Turn off background music'
            chrome.storage.sync.set({
                musicEnabled: true
            })
        }
    })
})

// Exclude button
document.getElementById('include-button').addEventListener('click', function () {
    chrome.storage.sync.get({
        includedSites: ''
    }, function (data) {
        var splitData = data.includedSites.split('\n');
        var cleanedList = splitData.map(s => s.trim().toLowerCase());
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var url = tabs[0].url;
            if (!url.startsWith('http')) {
                document.getElementById('include-button').innerText = "Invalid site."
                return;
            }
            var url = new URL(url)
            var domainToAdd = url.hostname.toString().replace('www.', '')
            if (cleanedList.includes(domainToAdd)) {
                document.getElementById('include-button').innerText = 'Site already included!'
                return;
            }

            var updatedIncludedSites = (data.includedSites.trim().length > 0 ? data.includedSites + '\n' : '') + domainToAdd;
            chrome.storage.sync.set({
                includedSites: updatedIncludedSites
            })
            document.getElementById('include-button').innerText = "Included " + domainToAdd + "!"
        })
    })
})

// Exclude button
document.getElementById('exclude-button').addEventListener('click', function () {
    chrome.storage.sync.get({
        excludedSites: ''
    }, function (data) {
        var splitData = data.excludedSites.split('\n');
        var cleanedList = splitData.map(s => s.trim().toLowerCase());
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var url = tabs[0].url;
            if (!url.startsWith('http')) {
                document.getElementById('exclude-button').innerText = "Invalid site."
                return;
            }
            var url = new URL(url)
            var domainToAdd = url.hostname.toString().replace('www.', '')
            if (cleanedList.includes(domainToAdd)) {
                document.getElementById('exclude-button').innerText = 'Site already excluded!'
                return;
            }

            var updatedExcludedSites = (data.excludedSites.trim().length > 0 ? data.excludedSites + '\n' : '') + domainToAdd;
            chrome.storage.sync.set({
                excludedSites: updatedExcludedSites
            })
            document.getElementById('exclude-button').innerText = "Excluded " + domainToAdd + "!"
        })
    })
})

// Update list button
document.getElementById('update-button').addEventListener('click', function () {
    chrome.runtime.sendMessage('updateList')
    document.getElementById('update-button').innerText = "Updated!"
})

// Pause music when page closes
// This only works on the popup opened from the notification, not the browserAction button
window.addEventListener("beforeunload", function (e) {
    chrome.runtime.sendMessage('pause')
}, false)
