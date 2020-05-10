async function callGoogleDriveApi() {
    throw new Error("it failed");
}
async function getSingleFile() {
    await callGoogleDriveApi();
}
async function main() {
    await getSingleFile();
}
main()
    .catch(console.error);
//# sourceMappingURL=test.js.map