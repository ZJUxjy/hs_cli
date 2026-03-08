import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../../src/ui/app/App';

describe('Web UI App', () => {
  test('renders a shell for the browser UI', () => {
    const html = renderToString(React.createElement(App));

    expect(html).toContain('Loading game');
  });
});
