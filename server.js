const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const employeeRouter = require('./employeeApi');
const menuApiRouter = require('./menuApi');
const createTablesRouter = require('./createTablesRouter');

const PORT = process.env.PORT || 4000;
/*********Middlewares******************/
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());


/**************************************
* SERVING STATIC FILES and index.html *
* *************************************/
app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname+'/index.html'));
    next();
});
app.use('/public', express.static('public'));

/******* End of Serving Static Data ****/

/**************API Middlewares**********/
app.use('/', createTablesRouter);
app.use('/api/employees/', employeeRouter);
app.use('/api/menus/', menuApiRouter);

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});
module.exports = app;