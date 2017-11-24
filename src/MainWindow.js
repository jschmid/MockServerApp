// react
import React, { Component } from 'react';

// bootstrap
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

// additional imports
import './MainWindow.css';

// electron
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

class MainWindow extends Component {
  constructor(props) {
    super(props)
    
    // set the initial component state
    this.state = {
      url: '',
      log: []
    }

    // listen for 'log' events from main process
    ipcRenderer.on('log', (event, entry) => {
      const newLog = this.state.log.slice(0);
      newLog.unshift(entry);
      this.setState(Object.assign({}, this.state, {
        log: newLog
      }))
    });
  }

  render() {
    return (
    <div className="main">
      <header className="mw-header">{this.state.log.length} requests</header>
      <div className="mw-table-container">
      <Table className="mw-log-table" responsive striped hover bordered>
        <thead>
          <tr>
            <th className="mw-time-col">Time</th>
            <th className="mw-code-col">Code</th>
            <th>Url</th>
          </tr>
        </thead>
        <tbody>
          { this.state.log.map((row, index) => 
            <tr key={index} className={row.status >= 400 ? "redcol" : "normalcol"}>
              <td>{row.time}</td>
              <td>{row.status}</td>
              <td>{row.url}</td>
            </tr>
          )}
        </tbody>
      </Table>
      </div>
    </div>
    );
  }
}

export default MainWindow;
