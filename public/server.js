const express = require('express');

class Server {

  // start a server, store logging block for later
  // - parameter logBlock lambda (String)=>Void

  constructor(port, logBlock) {
    this.logger = logBlock;

    this.app = express();
    this.app.set('json spaces', 2);
    this.app.listen(port);
  }

  // add a mocked json response under a given path
  // if response is an array, add dynamic path to fetch single objects by id
  // - parameter path url API path like 'users' or 'dogs'
  // - parameter json array or object to respond to requests

  addPath(path, json) {
    this.app.get('/'+path, (request, response) => {
      this.logger({time: (new Date()).toUTCString(), status: 200, url: request.originalUrl});
      response.json(json);
    });
    
    if (!Array.isArray(json)) return;
    
    this.app.get('/'+path+'/:id', (request, response) => {
      const found = json.filter((item) => item.id == request.params.id)
      
      if(found.length < 1) {
        this.logger({time: (new Date()).toUTCString(), status: 404, url: request.originalUrl});
        response.status(404).send('Sorry, we cannot find that!');
      } else {
        this.logger({time: (new Date()).toUTCString(), status: 200, url: request.originalUrl});
        response.json(found[0]);
      }
      
    });
  }
}

module.exports.Server = Server;
