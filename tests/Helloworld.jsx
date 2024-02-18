// tests/HelloWorld.test.js
import {describe, expect} from 'vitest';
import React from 'react';
import {renderReact} from "./helpers/index.js";

describe('HelloWorld', () => {

  // Replace the first "if" with this "renderReact" function
  renderReact('Renders the component', <HelloWorld/>, ({ container }) => {
    // Check if the component rendered correctly
    expect(container.textContent).toContain('Hello World');
  })
});

function HelloWorld() {
  return <h1>Hello World</h1>;
}