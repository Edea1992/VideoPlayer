const regex = /^https:\/\/pilipili\.com\/video\/(.*)/

// self.addEventListener("fetch", function(event) {
//     if (event.request.url.match(regex)) {
//         event.respondWith((async () => {
//             const response = await fetch("http://f0.0sm.com/node0/2023/09/8651804F35D8D4E5-b95b76e27b2bc797.bmp")
//             const reader = response.body.getReader()
            
//             const bytes = new Uint8Array(1024 * 1024 * 5)
//             let loadedBytes = 0
//             while (true) {
//                 const {done, value} = await reader.read()
//                 if (done) {
//                     break
//                 }
//                 bytes.set(value, loadedBytes)
//                 loadedBytes += value.length
//             }

//             const size = new DataView(bytes.buffer).getBigUint64(54, true)

//             return new Response(
//                 new ReadableStream({
//                     start(controller) {
//                         controller.enqueue(bytes.slice(62, 62 + Number(size)))
//                         controller.close()
//                     }
//                 }),
//                 {
//                     headers: {
//                         "Accept-Ranges":  "bytes",
//                         "Content-Length": size,
//                         "Content-Type":  "video/mp2t"
//                     }
//                 }
//             )
//         })())
//     } else {
//         event.respondWith(
//             caches.match(event.request).then(function(response) {
//                 return response || fetch(event.request)
//             })
//         )
//     }
// })

self.addEventListener("fetch", (event) => {
    const matches = event.request.url.match(regex)
    if (matches) {
        event.respondWith((async () => {
            const response = await fetch(`https://gist.githubusercontent.com/Edea1992/${matches[1]}`)
            const bytes = new Uint8Array([...atob(await response.text())].map(char => char.charCodeAt(0)))

            return new Response(
                new ReadableStream({
                    start(controller) {
                        controller.enqueue(bytes)
                        controller.close()
                    }
                }),
                {
                    headers: {
                        "Accept-Ranges":  "bytes",
                        "Content-Length": bytes.length,
                        "Content-Type":  "video/mp2t"
                    }
                }
            )
        })())
    } else {
        event.respondWith(fetch(event.request))
        // event.respondWith(
        //     caches.match(event.request).then(function(response) {
        //         return response || fetch(event.request)
        //     })
        // )
    }
})
