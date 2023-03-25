// Start listening on port 8002 of localhost.
const server = Deno.listen({ port: 8002 });
console.log("File server running on http://localhost:8002/");

for await (const conn of server) {
  handleHttp(conn).catch(console.error);
}

async function handleHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    // Use the request pathname as filepath
    const url = new URL(requestEvent.request.url);
    const filepath = decodeURIComponent(url.pathname);

    // Try opening the file
    let file;
    let folderName: string;
    let parentFolder: string;
    let fileName: string;

    if (filepath.includes("post-files")) {
      parentFolder = "post-files";
    } else if (filepath.includes("avatar")) {
      parentFolder = "avatar";
    } else {
      parentFolder = "other";
    }

    switch (filepath.split(".")[1]) {
      case "png":
        folderName = "image";
        break;
      case "jpg":
        folderName = "image";
        break;
      case "jpeg":
        folderName = "image";
        break;
      case "git":
        folderName = "image";
        break;
      case "x-ms-bmp":
        folderName = "image";
        break;
      case "webp":
        folderName = "image";
        break;
      case "aac":
        folderName = "audio";
        break;
      case "mpeg":
        folderName = "audio";
        break;
      case "mp4":
        folderName = "video";
        break;
      case "pdf":
        folderName = "application";
        break;
      default:
        folderName = "other";
        break;
    }

    fileName = filepath.split("/")[2];

    try {
      file = await Deno.open(
        `/projects/myapp-deno-api-v1/public/uploads/${parentFolder}/${folderName}/${fileName}`,
        { read: true }
      );
    } catch {
      // If the file cannot be opened, return a "404 Not Found" response
      const notFoundResponse = new Response("404 Not Found", { status: 404 });
      await requestEvent.respondWith(notFoundResponse);
      continue;
    }

    // Build a readable stream so the file doesn't have to be fully loaded into
    // memory while we send it
    const readableStream = file.readable;

    // Build and send the response
    const response = new Response(readableStream);
    await requestEvent.respondWith(response);
  }
}
