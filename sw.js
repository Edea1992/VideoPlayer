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
            const url = `https://gist.githubusercontent.com/Edea1992/${matches[1]}`

            if (url.endsWith("m3u8")) {
                const m3u8 = await (await fetch(url)).text()
                
                const range = event.request.headers.get("Content-Range")
                if (range) {
                    const parts = range.replace("bytes=", "").split("-")
                    const start = parseInt(parts[0], 10)
                    const end = parts[1] ? parseInt(parts[1], 10) : m3u8.length - 1
                    const chunkSize = end - start + 1
                    const chunk = m3u8.slice(start, end + 1)
                    return new Response(
                        new ReadableStream({
                            start(controller) {
                                controller.enqueue(chunk)
                                controller.close()
                            }
                        }),
                        {
                            headers: {
                                "Accept-Ranges":  "bytes",
                                "Content-Length": chunkSize,
                                "Content-Range":  `bytes ${start}-${end}/${m3u8.length}`,
                                "Content-Type":  "application/x-mpegURL"
                            },
                            status: 206
                        }
                    )
                }

                return new Response(
                    new ReadableStream({
                        start(controller) {
                            controller.enqueue(m3u8)
                            controller.close()
                        }
                    }),
                    {
                        headers: {
                            "Accept-Ranges":  "bytes",
                            "Content-Length": m3u8.length,
                            "Content-Type":  "application/x-mpegURL"
                        }
                    }
                )
            }

            const data = new Uint8Array([...atob(await (await fetch(url)).text())].map(char => char.charCodeAt(0)))
            
            const range = event.request.headers.get("Content-Range")
            if (range) {
                const parts = range.replace("bytes=", "").split("-")
                const start = parseInt(parts[0], 10)
                const end = parts[1] ? parseInt(parts[1], 10) : data.length - 1
                const chunkSize = end - start + 1
                const chunk = data.slice(start, end + 1)
                return new Response(
                    new ReadableStream({
                        start(controller) {
                            controller.enqueue(chunk)
                            controller.close()
                        }
                    }),
                    {
                        headers: {
                            "Accept-Ranges":  "bytes",
                            "Content-Length": chunkSize,
                            "Content-Range":  `bytes ${start}-${end}/${data.length}`,
                            "Content-Type":  "video/mp2t"
                        },
                        status: 206
                    }
                )
            }

            return new Response(
                new ReadableStream({
                    start(controller) {
                        controller.enqueue(data)
                        controller.close()
                    }
                }),
                {
                    headers: {
                        "Accept-Ranges":  "bytes",
                        "Content-Length": data.length,
                        "Content-Type":  "video/mp2t"
                    }
                }
            )
        })())
    } else {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request)
            })
        )
    }
})