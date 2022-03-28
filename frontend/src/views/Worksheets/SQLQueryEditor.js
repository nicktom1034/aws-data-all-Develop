import PropTypes from 'prop-types';
import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import useSettings from '../../hooks/useSettings';
import { THEMES } from '../../constants';

const SQLQueryEditor = ({ sql, setSqlBody }) => {
  const { settings } = useSettings();
  const valueGetter = useRef();
  function handleEditorDidMount(_valueGetter) {
    valueGetter.current = _valueGetter;
  }
  return (
    <div
      style={{
        width: '100%',
        border: settings.theme === THEMES.LIGHT ? '1px solid #eee' : ''
      }}
    >
      <Editor
        value={sql}
        onChange={setSqlBody}
        options={{ minimap: { enabled: false } }}
        theme={settings.theme === THEMES.LIGHT ? 'light' : 'vs-dark'}
        inDiffEditor={false}
        height="19rem"
        editorDidMount={() => handleEditorDidMount()}
        language="sql"
        showPrintMargin
        showGutter
        highlightActiveLine
        editorProps={{
          $blockScrolling: Infinity
        }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2
        }}
      />
    </div>
  );
};
SQLQueryEditor.propTypes = {
  sql: PropTypes.any.isRequired,
  setSqlBody: PropTypes.func.isRequired
};
export default SQLQueryEditor;
