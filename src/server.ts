import initApp from "./app";

const port = process.env.PORT || 3000;

export const startServer = async () => {
    const app = await initApp();
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    return server;
};

// Start the server when run directly (preserve existing behavior)
if (require.main === module) {
    startServer();
}

