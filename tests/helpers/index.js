import { it, beforeEach, afterEach } from 'vitest';
import * as ReactDOMClient from 'react-dom/client';


export function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);

  return { container, root };
}


export async function renderWithVitest(component, { root }) {
  root.render(component);
  await waitForComponentToRender();
}


export function cleanup({ container }) {
  document.body.removeChild(container);
}


function waitForComponentToRender() {
  return new Promise(resolve => setTimeout(resolve, 0));
}


export async function renderReact(description, component, assertions) {
  let testState = {};

  beforeEach(() => {
    const { container, root } = setup()
    testState.container = container;
    testState.root = root;
  });

  it(description, async () => {
    await renderWithVitest(component, testState);
    assertions(testState);
  });

  afterEach(() => {
    cleanup(testState);
  });
}
