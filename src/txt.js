import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Quill from 'quill';

import { variableType } from 'enums/variablesTypes';
import { getBrowserStatus } from 'reducers/browser';
import { BROWSER_TEXT_READY } from 'actions/browser';

import 'quill/dist/quill.bubble.css';
import './TextItem.scss';

import { html } from 'components/HtmlComponent';
const bem = html.bem('TextItem');
const gridBem = html.bem('EditorGrid');

var Size = Quill.import('attributors/style/size');
Size.whitelist = ['1em', '1.25em', '1.5em', '2em', '3em', '4em'];
Quill.register(Size, true);

var FontAttributor = Quill.import('formats/font');
FontAttributor.whitelist = ['open-sans', 'roboto', 'proza-libre'];
Quill.register(FontAttributor, true);

Quill.debug(false);

@connect(state => ({
  textReady: getBrowserStatus(state).code === BROWSER_TEXT_READY
}))
export default class TextItem extends React.PureComponent {
  static propTypes = {
    isEditable: PropTypes.bool,
    selected: PropTypes.bool,
    config: PropTypes.object,
    textUpdateHandler: PropTypes.func,
    variables: PropTypes.arrayOf(variableType)
  };

  static defaultProps = {
    variables: []
  };

  static textItemProperties = ['text', 'position'];

  static getText(props) {
    return props.config.text;
  }

  onChangeTimeout = null;
  editorRef = React.createRef();
  editor = null;
  html = null;
  userUpdate = false;

  options = {
    readOnly: !this.props.selected,
    bounds: '.' + gridBem.block(),
    theme: 'bubble',
    modules: {
      toolbar: [
        [
          { header: '1' },
          { header: '2' },
          { font: ['', 'open-sans', 'roboto', 'proza-libre'] },
          { size: ['1em', '1.25em', '1.5em', '2em', '3em', '4em'] }
        ],
        ['bold', 'italic', 'underline'],
        [{ color: [] }, { background: [] }],
        [{ align: ['', 'center', 'right'] }],
        [{ list: 'ordered' }, { list: 'bullet' }]
      ]
    },
    formats: [
      'align',
      'background',
      'header',
      'font',
      'size',
      'align',
      'bold',
      'italic',
      'underline',
      'strike',
      'script',
      'list',
      'bullet',
      'indent',
      'link',
      'color',
      'clean'
    ]
  };

  componentDidMount() {
    this.editor = new Quill(this.editorRef.current, this.options);
    this.editor.root.innerHTML = TextItem.getText(this.props);
    this.editor.update();
    this.editor.on('text-change', this.onChange);
  }
  componentDidUpdate() {
    if (this.props.textReady) {
      this.editor.root.innerHTML = TextItem.getText(this.props);
      this.editor.update();
    }
  }

  onChange = (value, delta, source) => {
    /* source === api | user */
    if (source === 'api') {
      return;
    }

    this.html = this.editor.root.innerHTML;

    if (this.onChangeTimeout) {
      clearTimeout(this.onChangeTimeout);
      this.onChangeTimeout = null;
    }

    this.onChangeTimeout = setTimeout(() => this.commitValue(), 300);
  };

  commitValue() {
    clearTimeout(this.onChangeTimeout);
    this.onChangeTimeout = null;

    if (this.props.isEditable) {
      this.userUpdate = true;
      this.props.textUpdateHandler(this.html);
    }
  }

  render() {
    const isReadOnly =
      !this.props.isEditable || (this.props.isEditable && !this.props.selected);

    return (
      <div className={bem.block()}>
        <div
          className={bem.element('positioner', {
            position: this.props.config.position
          })}
        >
          <div
            ref={this.editorRef}
            className={bem.element('editor', {
              readonly: isReadOnly
            })}
          ></div>
        </div>
      </div>
    );
  }
}
