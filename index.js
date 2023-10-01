alert("Hello")
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
    alert("Service Worker Registered")
}
