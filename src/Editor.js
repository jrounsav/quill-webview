import React from 'react';
import { sizeEditor } from './utils';
import Quill from 'quill';

import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

class Editor extends React.Component {
  editorRef = React.createRef();
  editor = null;

  options = {
    theme: 'snow',
    modules: {
      toolbar: false
    }
  };

  componentDidMount() {
    document.addEventListener('message', this.handleIncomingMessage);
    window.addEventListener('message', this.handleIncomingMessage);
    this.editor = new Quill(this.editorRef.current, this.options);
    sizeEditor();
    this.editor.on('text-change', this.emit);
  }

  emit = (delta, oldDelta, source) => {
    this.handleEmitMessage({ type: 'emitTextChange', payload: delta });
  };

  emitConsole = data => {
    this.handleEmitMessage({ type: 'console', payload: data });
  };

  handleIncomingMessage = (message = {}) => {
    try {
      const data = message.data ? JSON.parse(message.data) : {};
      console.log(data);
      if (data.type) {
        switch (data.type) {
          case 'setContents':
            const html = data.payload;
            var editor = document.getElementsByClassName('ql-editor');
            editor[0].innerHTML = html;
            break;
          default:
            console.error('Improper Incoming');
            break;
        }
      }
    } catch (e) {
      this.emitConsole(e);
    }
  };

  handleEmitMessage = (message = {}) => {
    if (message.type) {
      switch (message.type) {
        case 'emitTextChange':
          var editor = document.getElementsByClassName('ql-editor')[0];
          const message = {
            type: 'emitTextChange',
            payload: editor.innerHTML
          };
          window.postMessage(JSON.stringify(message), '*');
          break;
        default:
          console.error('Improper Emission');
          break;
      }
    }
  };

  render() {
    return (
      <>
        <div id='editor'>
          <div ref={this.editorRef}></div>
        </div>
      </>
    );
  }
}

export default Editor;
