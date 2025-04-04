'use strict';

const { addReply, reportReply, deleteReply, getReply } = require("../controllers/replies.controller");
const { addThread, reportThread, deleteThread, getThread } = require("../controllers/threads.controller");

module.exports = function (app) {
  
  app.route('/api/threads/:board').get(getThread);
  app.route('/api/threads/:board').post(addThread);
  app.route('/api/threads/:board').put(reportThread);
  app.route('/api/threads/:board').delete(deleteThread);
  
  app.route('/api/replies/:board').get(getReply);
  app.route('/api/replies/:board').post(addReply);
  app.route('/api/replies/:board').put(reportReply);
  app.route('/api/replies/:board').delete(deleteReply);

};
