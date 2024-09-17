const app = require("./app");

const startApp = () => {
  app.listen(3000, () => {
    console.log(`App running on port ${process.env.PORT}`);
  });
};

startApp();
