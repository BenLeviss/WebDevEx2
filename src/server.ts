import initApp from "./app";

const port = process.env.PORT || 3000;

initApp().then((app) => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

